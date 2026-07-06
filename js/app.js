'use strict';

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

const CONDITION_ADVICE = {
  bump:      { title:'Bump / raised tissue detected', text:'Irritation bumps (hypertrophic-type nodules) are common during healing and are usually caused by pressure, snagging, or poor-fitting jewellery. Do NOT use tea tree oil, hydrogen peroxide, or harsh soaps. Do NOT remove the jewellery. Increase saline rinses to 3× daily and apply a warm saline compress for 5 minutes twice a day. If the bump does not reduce within 2–3 weeks, have your jewellery length and gauge assessed by your piercer — undersized bars are a leading cause.' },
  irritation:{ title:'Redness or irritation', text:'Mild redness and tenderness during acute healing is normal. If it appears after initial healing, consider recent trauma, a new product applied near the site, or snagging. Revert to basic saline-only aftercare. If redness is spreading outward from the piercing, developing warmth, or accompanied by yellow or green discharge, see a healthcare professional — these are signs of infection, not irritation.' },
  discharge: { title:'Unusual discharge', text:'Clear or white lymph fluid ("crusties") is normal throughout healing and is not infection. Yellow, green, or foul-smelling discharge is a concern. If you are seeing unusual discharge, stop using any soap, spray, or ointment at the site and return to sterile saline only. If discharge is coloured or has an odour, seek assessment from a doctor — do not remove the jewellery without professional guidance, as this can trap the infection.' },
};

document.getElementById('gen-btn').addEventListener('click', generate);

function generate() {
  const type    = document.getElementById('piercing-type').value;
  const daysVal = parseInt(document.getElementById('days-since').value, 10);
  const cond    = document.getElementById('condition').value;

  if (!type || isNaN(daysVal) || daysVal < 0) {
    alert('Please select a piercing type and enter a valid number of days.');
    return;
  }

  const d = PIERCING_DATA[type];
  const days = Math.min(daysVal, 730);
  const [acuteEnd, prolifEnd, totalDays] = d.healDays;

  let phaseNum, phaseName, phaseClass;
  if (days <= acuteEnd) {
    phaseNum = 1; phaseName = 'Acute / Inflammatory phase'; phaseClass = 'phase-1';
  } else if (days <= prolifEnd) {
    phaseNum = 2; phaseName = 'Proliferative / Rebuilding phase'; phaseClass = 'phase-2';
  } else if (days <= totalDays) {
    phaseNum = 3; phaseName = 'Remodelling / Maturation phase'; phaseClass = 'phase-3';
  } else {
    phaseNum = 3; phaseName = 'Fully healed / Maintenance'; phaseClass = 'phase-3';
  }

  const progressPct = Math.min(100, Math.round(days / totalDays * 100));
  const freqText = d.freq === 3 ? 'three times daily' : d.freq === 2 ? 'twice daily' : 'once daily';

  // Phase-specific steps
  const steps = {
    1: [
      'Rinse with sterile saline wound wash (0.9% NaCl, no additives) — ' + freqText,
      'Spray directly onto front and back of the piercing — do not use cotton balls which can snag',
      'Let it air dry or pat gently with a clean paper towel — never rub',
      d.oral ? 'Rinse your mouth with alcohol-free saline or diluted sea salt solution after eating and drinking' : null,
      'Leave the jewellery completely still — do not rotate or move it',
      'Do not touch the piercing with unwashed hands for any reason',
      'Expect swelling, tenderness, and clear/white fluid (lymph crust) — this is normal',
    ].filter(Boolean),
    2: [
      'Continue saline rinses once or twice daily — healing tissue still benefits from regular cleaning',
      'The piercing channel is forming but is not yet stable — avoid changing jewellery',
      d.oral ? 'Oral rinses can be reduced to once daily if soreness has resolved' : null,
      'Visible crusting may reduce — do not pick at dried lymph fluid',
      'Redness and swelling should be largely resolved by now — persistent symptoms warrant a check',
      'Avoid submerging in pools, hot tubs, or open water',
      'Sleep on a travel pillow (ear piercings) to avoid pressure on the site',
    ].filter(Boolean),
    3: [
      'Once or twice weekly saline rinse to maintain fistula hygiene',
      'The channel is mature but tissue is still strengthening — downsizing is possible now if not already done',
      'Jewellery changes should use implant-grade material only — titanium or BioFlex®',
      'Continue to monitor for any signs of reaction to new jewellery materials',
      days > totalDays ? 'Your piercing is fully healed — standard cleaning when showering is sufficient' : 'Full healing is approaching — avoid trauma and maintain jewellery hygiene',
    ],
  };

  const avoids = {
    1: [
      'Rotating or moving the jewellery — this disrupts fistula formation and creates microtrauma',
      'Soap, antiseptic spray, hydrogen peroxide, tea tree oil, or alcohol on the piercing',
      'Swimming pools, hot tubs, lakes, or the sea',
      'Cosmetics, hair products, or sprays near the piercing site',
      'Tight clothing over navel, surface, or genital piercings',
      'Touching the piercing with unwashed hands',
    ],
    2: [
      'Changing jewellery — the fistula looks healed externally but is still forming internally',
      'Extended submersion in water',
      'Sleeping directly on cartilage or ear piercings without a travel pillow',
      'Heavy trauma, snagging, or pulling',
    ],
    3: [
      'Non-implant-grade jewellery materials (no surgical steel, acrylic, or mystery metal)',
      'Extended periods without any jewellery — healed fistulas can still close',
    ],
  };

  const condBox = cond !== 'normal' && CONDITION_ADVICE[cond]
    ? `<div class="condition-box">
        <div class="condition-box-title">⚠️ ${escHtml(CONDITION_ADVICE[cond].title)}</div>
        <p>${escHtml(CONDITION_ADVICE[cond].text)}</p>
      </div>`
    : '';

  const stepHtml  = steps[phaseNum].map(s => `<li>${escHtml(s)}</li>`).join('');
  const avoidHtml = avoids[phaseNum].map(s => `<li>${escHtml(s)}</li>`).join('');

  const weeksLeft = Math.max(0, Math.ceil((totalDays - days) / 7));
  const timeMsg   = days > totalDays
    ? 'Expected healing complete'
    : `Approx. ${weeksLeft} week${weeksLeft !== 1 ? 's' : ''} to expected full healing`;

  document.getElementById('result').innerHTML = `
    ${condBox}
    <div class="schedule-card">
      <div class="schedule-header">
        <div class="phase-badge ${escHtml(phaseClass)}">Phase ${phaseNum} — ${escHtml(phaseName)}</div>
        <div class="schedule-title">${escHtml(d.name)} — Day ${days}</div>
        <div class="schedule-meta">${escHtml(timeMsg)} · Expected total healing: ${Math.round(totalDays / 30)} months</div>
      </div>
      <div class="progress-section">
        <div class="progress-label">
          <span>Day 0</span>
          <span>${progressPct}% of expected healing</span>
          <span>Day ${totalDays}</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${progressPct}%"></div>
        </div>
      </div>
      <div class="schedule-section">
        <div class="schedule-section-title">Your current aftercare routine</div>
        <ul class="step-list">${stepHtml}</ul>
      </div>
      <div class="schedule-section">
        <div class="schedule-section-title">Avoid at this stage</div>
        <ul class="avoid-list">${avoidHtml}</ul>
      </div>
      <div class="schedule-section">
        <div class="schedule-section-title">Jewellery recommendation</div>
        <ul class="step-list">
          <li>Implant-grade titanium (ASTM F136) or <a href="https://poliinternational.com/bioflex/" target="_blank" rel="noopener noreferrer">BioFlex® polymer</a> are the safest choices throughout all healing phases</li>
          <li>BioFlex® is particularly beneficial for movement-stressed placements (navel, tongue, genital, surface) — flexibility reduces chronic trauma</li>
          <li>Avoid surgical steel if you have any nickel sensitivity — it is not a safe default</li>
          ${phaseNum >= 3 ? '<li>Downsizing to a shorter/smaller bar at this stage reduces snag risk and aids final fistula maturation</li>' : '<li>Do not change jewellery until healing is complete — internal tissue matures long after external appearance suggests healing</li>'}
        </ul>
      </div>
    </div>`;
  document.getElementById('result').scrollIntoView({ behavior:'smooth', block:'nearest' });
}
