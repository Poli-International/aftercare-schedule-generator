'use strict';

/* Personalised Aftercare Schedule Generator.
 *
 * The clinical model here is unchanged from V1 and must stay that way: the three
 * phases, the per-placement healing durations and the rinse frequencies are the
 * substance of the tool. V2 adds only the things that let someone act on it away
 * from the screen: a real date instead of a day count, a printable sheet, a
 * calendar file, and the downsizing milestone.
 */

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** Translate, falling back to the key so a missing string is obvious, not blank. */
function t(key, params) {
  var s = (window.AftercareI18N && window.AftercareI18N.t) ? window.AftercareI18N.t(key) : key;
  if (params) Object.keys(params).forEach(function (p) {
    s = s.split('{' + p + '}').join(params[p]);
  });
  return s;
}

// healDays: [acuteEnd, prolifEnd, totalDays] in days
const PIERCING_DATA = {
  earlobe:    { name:'Earlobe',                   healDays:[21,  90,  180], freq:2, oral:false },
  cartilage:  { name:'Ear cartilage (helix / flat)', healDays:[42, 180, 365], freq:2, oral:false },
  daith:      { name:'Daith / rook / snug / tragus', healDays:[42, 180, 365], freq:2, oral:false },
  nostril:    { name:'Nostril',                   healDays:[42, 120, 180], freq:2, oral:false },
  septum:     { name:'Septum',                    healDays:[42,  90, 180], freq:2, oral:false },
  labret:     { name:'Labret / lip / monroe',     healDays:[42,  90, 180], freq:2, oral:true  },
  tongue:     { name:'Tongue',                    healDays:[21,  56, 120], freq:3, oral:true  },
  navel:      { name:'Navel',                     healDays:[56, 180, 365], freq:2, oral:false },
  surface:    { name:'Surface / dermal',          healDays:[56, 180, 365], freq:1, oral:false },
  nipple:     { name:'Nipple',                    healDays:[90, 180, 365], freq:2, oral:false },
  genital:    { name:'Genital (general)',          healDays:[42, 120, 365], freq:2, oral:false },
};

/* Downsizing is DERIVED from the existing model rather than given its own table.
 * The initial bar is fitted long for swelling, so the moment to shorten it is
 * when swelling has settled: the end of the acute phase. That yields 21 days for
 * a tongue and 90 for a nipple, which matches how those placements actually
 * behave, and it cannot drift out of step with healDays the way a parallel table
 * would. */
function downsizeDay(d) { return d.healDays[0]; }

const CONDITION_KEYS = ['bump', 'irritation', 'discharge'];

/* ---------------------------------------------------------------- dates --- */

function parseDateInput(value) {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return isNaN(d.getTime()) ? null : d;
}

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function addDays(date, n) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

/** Locale-aware long date, e.g. "Saturday 14 March 2026". */
function formatDate(date) {
  const lang = (window.AftercareI18N && window.AftercareI18N.lang) || 'en';
  try {
    return date.toLocaleDateString(lang, { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  } catch (e) {
    return date.toISOString().slice(0, 10);
  }
}

/* ------------------------------------------------------------------ ics --- */

/* RFC 5545 wants COMMA, SEMICOLON and BACKSLASH escaped inside a text value, and
 * newlines written as \n. Skipping this is why calendar files import as one
 * mangled event, or fail silently. */
function icsEscape(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/* Content lines must not exceed 75 octets; continuations start with one space.
 * Fold on the octet count, not the character count, or a multi-byte character
 * lands across the split and the line is corrupt. */
function icsFold(line) {
  const bytes = [];
  let out = '', len = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (len + n > 73) { bytes.push(out); out = ' '; len = 1; }
    out += ch; len += n;
  }
  bytes.push(out);
  return bytes.join('\r\n');
}

function icsStamp(date) {
  const p = n => String(n).padStart(2, '0');
  return date.getUTCFullYear() + p(date.getUTCMonth() + 1) + p(date.getUTCDate()) + 'T' +
         p(date.getUTCHours()) + p(date.getUTCMinutes()) + p(date.getUTCSeconds()) + 'Z';
}

/** All-day events use a local DATE value, not a UTC timestamp, or they land on
 *  the wrong day for anyone west of Greenwich. */
function icsDate(date) {
  const p = n => String(n).padStart(2, '0');
  return date.getFullYear() + p(date.getMonth() + 1) + p(date.getDate());
}

function buildICS(ctx) {
  const now = new Date();
  const uid = n => 'poli-aftercare-' + n + '-' + now.getTime() + '@poliinternational.com';
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0',
             'PRODID:-//Poli International//Aftercare Schedule Generator//EN',
             'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
             'X-WR-CALNAME:' + icsEscape(t('ics.calname', { piercing: ctx.name }))];

  // The daily cleaning routine, as a recurring timed event with an alarm.
  const rinseStart = new Date(ctx.today.getFullYear(), ctx.today.getMonth(), ctx.today.getDate(), 9, 0, 0);
  const remaining = Math.max(1, ctx.totalDays - ctx.days);
  L.push('BEGIN:VEVENT',
    'UID:' + uid('clean'),
    'DTSTAMP:' + icsStamp(now),
    'DTSTART:' + icsStamp(rinseStart),
    'DTEND:' + icsStamp(new Date(rinseStart.getTime() + 10 * 60000)),
    'RRULE:FREQ=DAILY;COUNT=' + remaining,
    'SUMMARY:' + icsEscape(t('ics.clean.summary', { piercing: ctx.name })),
    'DESCRIPTION:' + icsEscape(t('ics.clean.desc', { freq: ctx.freqText })),
    'BEGIN:VALARM', 'TRIGGER:-PT0M', 'ACTION:DISPLAY',
    'DESCRIPTION:' + icsEscape(t('ics.clean.summary', { piercing: ctx.name })),
    'END:VALARM', 'END:VEVENT');

  // Milestones, as all-day events on the dates they actually fall.
  const milestones = [
    ['downsize', ctx.downsizeDate, t('ics.downsize.summary'), t('ics.downsize.desc')],
    ['phase2',   ctx.phase2Date,   t('ics.phase2.summary'),   t('ics.phase2.desc')],
    ['phase3',   ctx.phase3Date,   t('ics.phase3.summary'),   t('ics.phase3.desc')],
    ['healed',   ctx.healedDate,   t('ics.healed.summary', { piercing: ctx.name }), t('ics.healed.desc')],
  ];
  for (const [key, date, summary, desc] of milestones) {
    if (!date || date < ctx.today) continue;   // no reminders for milestones already passed
    L.push('BEGIN:VEVENT',
      'UID:' + uid(key),
      'DTSTAMP:' + icsStamp(now),
      'DTSTART;VALUE=DATE:' + icsDate(date),
      'DTEND;VALUE=DATE:' + icsDate(addDays(date, 1)),
      'SUMMARY:' + icsEscape(summary),
      'DESCRIPTION:' + icsEscape(desc),
      'END:VEVENT');
  }

  L.push('END:VCALENDAR');
  return L.map(icsFold).join('\r\n') + '\r\n';
}

function downloadICS() {
  if (!window.__aftercareCtx) return;
  const text = buildICS(window.__aftercareCtx);
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aftercare-schedule.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

/* -------------------------------------------------------------- generate --- */

function generate() {
  const type = document.getElementById('piercing-type').value;
  const dateVal = document.getElementById('pierce-date').value;
  const cond = document.getElementById('condition').value;
  const errEl = document.getElementById('form-error');

  const showError = function (msg) {
    errEl.textContent = msg;
    errEl.hidden = false;
  };
  errEl.hidden = true;

  if (!type) { showError(t('err.selectType')); return; }
  const pierceDate = parseDateInput(dateVal);
  if (!pierceDate) { showError(t('err.selectDate')); return; }

  const today = startOfToday();
  const rawDays = daysBetween(pierceDate, today);
  // A future date is legitimate: someone booked for next week wants the plan.
  const days = Math.max(0, Math.min(rawDays, 730));
  const notYet = rawDays < 0;

  const d = PIERCING_DATA[type];
  const [acuteEnd, prolifEnd, totalDays] = d.healDays;

  let phaseNum, phaseName, phaseClass;
  if (days <= acuteEnd)        { phaseNum = 1; phaseName = t('phase.1'); phaseClass = 'phase-1'; }
  else if (days <= prolifEnd)  { phaseNum = 2; phaseName = t('phase.2'); phaseClass = 'phase-2'; }
  else if (days <= totalDays)  { phaseNum = 3; phaseName = t('phase.3'); phaseClass = 'phase-3'; }
  else                         { phaseNum = 3; phaseName = t('phase.healed'); phaseClass = 'phase-3'; }

  const progressPct = Math.min(100, Math.round(days / totalDays * 100));
  const freqText = d.freq === 3 ? t('freq.3') : d.freq === 2 ? t('freq.2') : t('freq.1');
  const dsDay = downsizeDay(d);

  const ctx = {
    key: type,
    name: t('type.' + type),
    days: days,
    totalDays: totalDays,
    freqText: freqText,
    today: today,
    pierceDate: pierceDate,
    downsizeDate: addDays(pierceDate, dsDay),
    phase2Date: addDays(pierceDate, acuteEnd + 1),
    phase3Date: addDays(pierceDate, prolifEnd + 1),
    healedDate: addDays(pierceDate, totalDays),
  };
  window.__aftercareCtx = ctx;

  const stepKeys = { 1: ['s1','s2','s3','s4','s5','s6'], 2: ['s1','s2','s3','s4','s5','s6'], 3: ['s1','s2','s3','s4'] };
  const steps = stepKeys[phaseNum]
    .map(k => t('steps.p' + phaseNum + '.' + k, { freq: freqText }))
    .filter(s => s.indexOf('steps.p') !== 0);
  if (d.oral) steps.splice(3, 0, t('steps.oral.p' + phaseNum));

  const avoidKeys = { 1: ['a1','a2','a3','a4','a5','a6'], 2: ['a1','a2','a3','a4'], 3: ['a1','a2'] };
  const avoids = avoidKeys[phaseNum]
    .map(k => t('avoids.p' + phaseNum + '.' + k))
    .filter(s => s.indexOf('avoids.p') !== 0);

  const condBox = (cond !== 'normal' && CONDITION_KEYS.indexOf(cond) !== -1)
    ? '<div class="condition-box"><div class="condition-box-title">' +
      escHtml(t('cond.' + cond + '.title')) + '</div><p>' + escHtml(t('cond.' + cond + '.text')) + '</p></div>'
    : '';

  const weeksLeft = Math.max(0, Math.ceil((totalDays - days) / 7));
  const timeMsg = notYet ? t('time.notYet', { date: formatDate(pierceDate) })
    : days > totalDays ? t('time.done')
    : t('time.remaining', { weeks: weeksLeft, date: formatDate(ctx.healedDate) });

  // Downsizing gets its own block, dated, because it is the milestone most often
  // missed and the one with a real consequence when it is.
  const dsPassed = days >= dsDay;
  const downsizeHtml =
    '<div class="schedule-section downsize-block">' +
      '<div class="schedule-section-title">' + escHtml(t('section.downsize')) + '</div>' +
      '<p class="downsize-date">' + escHtml(dsPassed ? t('downsize.due') : t('downsize.on', { date: formatDate(ctx.downsizeDate) })) + '</p>' +
      '<p>' + escHtml(t('downsize.why')) + '</p>' +
    '</div>';

  const redFlagsHtml =
    '<div class="schedule-section redflag-block">' +
      '<div class="schedule-section-title">' + escHtml(t('section.redflags')) + '</div>' +
      '<p class="redflag-normal"><strong>' + escHtml(t('redflags.normalTitle')) + '</strong> ' + escHtml(t('redflags.normal')) + '</p>' +
      '<p class="redflag-urgent"><strong>' + escHtml(t('redflags.urgentTitle')) + '</strong> ' + escHtml(t('redflags.urgent')) + '</p>' +
    '</div>';

  const brandName = (document.getElementById('studio-name').value || '').trim();
  const brandContact = (document.getElementById('studio-contact').value || '').trim();
  const brandHtml = brandName
    ? '<div class="studio-brand"><div class="studio-brand-name">' + escHtml(brandName) + '</div>' +
      (brandContact ? '<div class="studio-brand-contact">' + escHtml(brandContact) + '</div>' : '') + '</div>'
    : '';

  const li = s => '<li>' + escHtml(s) + '</li>';

  document.getElementById('result').innerHTML =
    brandHtml + condBox +
    '<div class="schedule-card">' +
      '<div class="schedule-header">' +
        '<div class="phase-badge ' + escHtml(phaseClass) + '">' + escHtml(t('phase.label', { n: phaseNum })) + ': ' + escHtml(phaseName) + '</div>' +
        '<div class="schedule-title">' + escHtml(ctx.name) + ', ' + escHtml(t('day.n', { n: days })) + '</div>' +
        '<div class="schedule-meta">' + escHtml(t('meta.pierced', { date: formatDate(pierceDate) })) + ' · ' + escHtml(timeMsg) + '</div>' +
      '</div>' +
      '<div class="progress-section">' +
        '<div class="progress-label"><span>' + escHtml(t('day.n', { n: 0 })) + '</span>' +
        '<span>' + progressPct + '% ' + escHtml(t('progress.of')) + '</span>' +
        '<span>' + escHtml(t('day.n', { n: totalDays })) + '</span></div>' +
        '<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>' +
      '<div class="schedule-section">' +
        '<div class="schedule-section-title">' + escHtml(t('section.routine')) + '</div>' +
        '<ul class="step-list">' + steps.map(li).join('') + '</ul>' +
      '</div>' +
      '<div class="schedule-section">' +
        '<div class="schedule-section-title">' + escHtml(t('section.avoid')) + '</div>' +
        '<ul class="avoid-list">' + avoids.map(li).join('') + '</ul>' +
      '</div>' +
      downsizeHtml +
      redFlagsHtml +
      '<div class="schedule-section">' +
        '<div class="schedule-section-title">' + escHtml(t('section.jewellery')) + '</div>' +
        '<ul class="step-list">' +
          li(t('jewellery.materials')) +
          li(t('jewellery.bioflex')) +
          li(t('jewellery.steel')) +
          li(phaseNum >= 3 ? t('jewellery.change.ok') : t('jewellery.change.wait')) +
        '</ul>' +
      '</div>' +
    '</div>';

  document.getElementById('result-actions').hidden = false;
  document.getElementById('result').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

/* ------------------------------------------------------------------ boot --- */

document.addEventListener('DOMContentLoaded', function () {
  const dateEl = document.getElementById('pierce-date');
  if (dateEl && !dateEl.value) {
    const n = startOfToday();
    dateEl.value = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }
  document.getElementById('gen-btn').addEventListener('click', generate);
  document.getElementById('btn-print').addEventListener('click', function () { window.print(); });
  document.getElementById('btn-ics').addEventListener('click', downloadICS);

  const langSel = document.getElementById('lang-select');
  if (langSel && window.AftercareI18N) {
    // Offer only languages that have a dictionary. A picker listing seven and
    // silently falling back to English on six of them reads as a broken control.
    var NAMES = { en:'English', fr:'Francais', it:'Italiano', de:'Deutsch', es:'Espanol', nl:'Nederlands', pt:'Portugues' };
    langSel.innerHTML = '';
    window.AftercareI18N.languages().forEach(function (code) {
      var o = document.createElement('option');
      o.value = code; o.textContent = NAMES[code] || code;
      langSel.appendChild(o);
    });
    langSel.parentElement.hidden = window.AftercareI18N.languages().length < 2;
    langSel.value = window.AftercareI18N.lang;
    langSel.addEventListener('change', function () {
      window.AftercareI18N.setLang(this.value);
      if (window.__aftercareCtx) generate();   // re-render the schedule in the new language
    });
  }
});
