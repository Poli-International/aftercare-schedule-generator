'use strict';

/* Dictionary for the Aftercare Schedule Generator.
 *
 * Flat keys, one object per language, no build step. The English block is the
 * reference: every other language must carry exactly the same key set, and
 * `AftercareI18N.audit()` in the console reports any that drift.
 *
 * Clinical wording is translated by meaning rather than word by word. "Lymph
 * crust", "proliferative phase" and "fistula" have real equivalents in each of
 * these languages and a literal rendering of them reads as nonsense to a nurse.
 */

(function (global) {

  var T = {};

  T.en = {
    'app.title': 'Personalised Aftercare Schedule Generator',
    'app.subtitle': 'Enter your piercing date for a phase-appropriate plan with real dates you can print, save or add to your calendar.',
    'app.badge': 'Aftercare Schedule',

    'label.type': 'Piercing type',
    'label.date': 'Date of piercing',
    'label.condition': 'Current condition',
    'label.studio': 'Studio name (optional)',
    'label.studioContact': 'Contact line (optional)',
    'label.language': 'Language',
    'hint.date': 'Choose the day it was done. A future date is fine if you are booked in.',
    'hint.studio': 'Appears on the printed sheet. Nothing is sent anywhere.',

    'opt.select': 'Select...',
    'btn.generate': 'Generate my aftercare schedule',
    'btn.print': 'Print / Save as PDF',
    'btn.ics': 'Add to calendar',

    'err.selectType': 'Choose a piercing type first.',
    'err.selectDate': 'Enter the date the piercing was done.',

    'type.earlobe': 'Earlobe',
    'type.cartilage': 'Ear cartilage (helix / flat)',
    'type.daith': 'Daith / rook / snug / tragus',
    'type.nostril': 'Nostril',
    'type.septum': 'Septum',
    'type.labret': 'Labret / lip / monroe',
    'type.tongue': 'Tongue',
    'type.navel': 'Navel',
    'type.surface': 'Surface / dermal',
    'type.nipple': 'Nipple',
    'type.genital': 'Genital (general)',

    'cond.normal': 'Normal, no concerns',
    'cond.bump': 'Small bump or raised tissue at site',
    'cond.irritation': 'Redness, tenderness, or minor irritation',
    'cond.discharge': 'Unusual discharge (not normal lymph fluid)',

    'phase.1': 'Acute / inflammatory',
    'phase.2': 'Proliferative / rebuilding',
    'phase.3': 'Remodelling / maturation',
    'phase.healed': 'Fully healed / maintenance',
    'phase.label': 'Phase {n}',

    'day.n': 'Day {n}',
    'progress.of': 'of expected healing',
    'meta.pierced': 'Pierced {date}',
    'time.remaining': 'About {weeks} weeks to expected full healing, around {date}',
    'time.done': 'Expected healing complete',
    'time.notYet': 'Your piercing is booked for {date}. This is the plan from day one.',

    'freq.1': 'once daily',
    'freq.2': 'twice daily',
    'freq.3': 'three times daily',

    'section.routine': 'Your current aftercare routine',
    'section.avoid': 'Avoid at this stage',
    'section.downsize': 'Downsizing',
    'section.redflags': 'What is normal, and what is not',
    'section.jewellery': 'Jewellery',

    'steps.p1.s1': 'Rinse with sterile saline wound wash (0.9% sodium chloride, no additives), {freq}',
    'steps.p1.s2': 'Spray directly onto the front and back of the piercing. Do not use cotton balls, which snag',
    'steps.p1.s3': 'Let it air dry, or pat gently with a clean paper towel, never rub',
    'steps.p1.s4': 'Leave the jewellery completely still. Do not rotate or move it',
    'steps.p1.s5': 'Do not touch the piercing with unwashed hands, for any reason',
    'steps.p1.s6': 'Expect swelling, tenderness and clear or white fluid (lymph crust). This is normal',
    'steps.oral.p1': 'Rinse your mouth with alcohol-free saline or a diluted sea salt solution after eating and drinking',

    'steps.p2.s1': 'Continue saline rinses once or twice daily. Healing tissue still benefits from regular cleaning',
    'steps.p2.s2': 'The piercing channel is forming but is not yet stable, so avoid changing jewellery',
    'steps.p2.s3': 'Visible crusting may reduce. Do not pick at dried lymph fluid',
    'steps.p2.s4': 'Redness and swelling should be largely resolved by now. Persistent symptoms are worth a check',
    'steps.p2.s5': 'Avoid submerging in pools, hot tubs or open water',
    'steps.p2.s6': 'Sleep on a travel pillow for ear piercings, to keep pressure off the site',
    'steps.oral.p2': 'Oral rinses can drop to once daily once soreness has resolved',

    'steps.p3.s1': 'A saline rinse once or twice a week is enough to maintain hygiene',
    'steps.p3.s2': 'The channel is mature but the tissue is still strengthening',
    'steps.p3.s3': 'Keep watching for any reaction when you change to new jewellery',
    'steps.p3.s4': 'Normal washing in the shower is sufficient from here',
    'steps.oral.p3': 'No specific oral routine is needed now beyond normal oral hygiene',

    'avoids.p1.a1': 'Rotating or moving the jewellery, which disrupts the forming channel and causes microtrauma',
    'avoids.p1.a2': 'Soap, antiseptic spray, hydrogen peroxide, tea tree oil or alcohol on the piercing',
    'avoids.p1.a3': 'Swimming pools, hot tubs, lakes and the sea',
    'avoids.p1.a4': 'Cosmetics, hair products and sprays near the site',
    'avoids.p1.a5': 'Tight clothing over navel, surface or genital piercings',
    'avoids.p1.a6': 'Touching the piercing with unwashed hands',

    'avoids.p2.a1': 'Changing jewellery. The channel looks healed from outside while it is still forming inside',
    'avoids.p2.a2': 'Extended submersion in water',
    'avoids.p2.a3': 'Sleeping directly on an ear or cartilage piercing without a travel pillow',
    'avoids.p2.a4': 'Snagging, pulling and knocks',

    'avoids.p3.a1': 'Non-implant-grade materials, so no mystery metal and no acrylic',
    'avoids.p3.a2': 'Long periods with no jewellery at all, because a healed channel can still close',

    'downsize.on': 'Book your downsize for around {date}.',
    'downsize.due': 'Your downsize is due. If it has not been done, arrange it now.',
    'downsize.why': 'Your first bar was fitted long on purpose, to leave room for swelling. Once the swelling settles, that extra length lets the jewellery move, catch on clothing and drag on the healing channel, which is a common cause of irritation bumps and of a piercing that migrates. Shortening it is a quick appointment and it is the single most missed step in aftercare.',

    'redflags.normalTitle': 'Normal:',
    'redflags.normal': 'Swelling, tenderness, mild redness close to the jewellery, and clear or whitish fluid that dries into crust. This is lymph, not pus, and it is a sign the piercing is healing.',
    'redflags.urgentTitle': 'See a piercer or a doctor:',
    'redflags.urgent': 'Redness spreading outward from the site, heat, throbbing pain, thick yellow or green discharge, a bad smell, fever, or a red streak running away from the piercing. Do not remove the jewellery first. Taking it out can close the surface and trap an infection underneath. Get it looked at.',

    'cond.bump.title': 'Bump or raised tissue',
    'cond.bump.text': 'Irritation bumps are common during healing and are usually caused by pressure, snagging or badly fitting jewellery. Do not use tea tree oil, hydrogen peroxide or harsh soaps, and do not remove the jewellery. Increase saline rinses to three times daily and apply a warm saline compress for five minutes twice a day. If the bump has not reduced within two to three weeks, have the length and gauge of your bar assessed, because an undersized bar is a leading cause.',
    'cond.irritation.title': 'Redness or irritation',
    'cond.irritation.text': 'Mild redness and tenderness during acute healing is normal. Appearing later, it usually points to recent trauma, a new product used near the site, or snagging. Go back to saline only. If the redness is spreading outward, feels warm, or comes with yellow or green discharge, that is not irritation and needs a professional opinion.',
    'cond.discharge.title': 'Unusual discharge',
    'cond.discharge.text': 'Clear or white lymph fluid, which dries as crust, is normal throughout healing and is not infection. Yellow, green or foul-smelling discharge is not. Stop using any soap, spray or ointment on the site and return to sterile saline only. If the discharge is coloured or smells, see a doctor, and do not remove the jewellery without advice.',

    'jewellery.materials': 'Implant-grade titanium (ASTM F136) and BioFlex(R) polymer are both appropriate throughout healing.',
    'jewellery.bioflex': 'BioFlex(R) is particularly useful where the piercing is under constant movement (navel, tongue, genital and surface placements), because it flexes instead of levering on the channel.',
    'jewellery.steel': 'Avoid surgical steel if you have any nickel sensitivity. It is not a safe default.',
    'jewellery.change.wait': 'Do not change jewellery yet. The tissue inside matures long after the outside looks healed.',
    'jewellery.change.ok': 'Jewellery can be changed now. Use implant-grade material, and have the fit checked if you are unsure.',

    'ics.calname': 'Aftercare: {piercing}',
    'ics.clean.summary': 'Clean your {piercing} piercing',
    'ics.clean.desc': 'Sterile saline rinse, {freq}. Spray front and back, let it air dry, do not rotate the jewellery.',
    'ics.downsize.summary': 'Downsize your jewellery',
    'ics.downsize.desc': 'Swelling should have settled. Book a downsize so the bar is no longer over-long, which prevents snagging and migration.',
    'ics.phase2.summary': 'Healing phase 2 begins',
    'ics.phase2.desc': 'The rebuilding phase. Saline rinses can reduce to once or twice daily. Still do not change the jewellery.',
    'ics.phase3.summary': 'Healing phase 3 begins',
    'ics.phase3.desc': 'The maturation phase. A weekly rinse is enough. The channel is mature but still strengthening.',
    'ics.healed.summary': 'Your {piercing} should be fully healed',
    'ics.healed.desc': 'Expected full healing. If anything is still sore, weeping or lumpy, have it checked rather than assuming it is done.',

    'disclaimer': 'This tool gives general aftercare guidance and is not a diagnosis. Healing varies between people. If you have signs of infection, such as spreading redness, fever, pus or severe swelling, see a doctor promptly, and remove jewellery only on professional advice.',
    'privacy': 'Everything is worked out in your browser. Nothing you enter is sent anywhere, and nothing is stored.',
  };

  /* ---------------------------------------------------------------------- */

  var DEFAULT = 'en';
  var current = DEFAULT;

  function detect() {
    try {
      var url = new URLSearchParams(global.location.search).get('lang');
      if (url && T[url]) return url;
      var nav = (global.navigator.language || 'en').slice(0, 2).toLowerCase();
      if (T[nav]) return nav;
    } catch (e) { /* fall through to the default */ }
    return DEFAULT;
  }

  function translate(key) {
    var dict = T[current] || T[DEFAULT];
    if (dict && dict[key] !== undefined) return dict[key];
    if (T[DEFAULT][key] !== undefined) return T[DEFAULT][key];   // fall back to English, never blank
    return key;
  }

  /** Apply to every element carrying data-i18n / data-i18n-placeholder. */
  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = translate(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', translate(el.getAttribute('data-i18n-placeholder')));
    });
    document.documentElement.setAttribute('lang', current);
  }

  /** Report keys that exist in English but are missing elsewhere, and vice versa. */
  function audit() {
    var ref = Object.keys(T[DEFAULT]).sort();
    var out = {};
    Object.keys(T).forEach(function (lang) {
      var keys = Object.keys(T[lang]);
      out[lang] = {
        count: keys.length,
        missing: ref.filter(function (k) { return T[lang][k] === undefined; }),
        extra: keys.filter(function (k) { return T[DEFAULT][k] === undefined; }),
      };
    });
    return out;
  }

  global.AftercareI18N = {
    get lang() { return current; },
    /** Register a dictionary. Each js/i18n/<code>.js file calls this. */
    add: function (code, dict) { T[code] = dict; },
    setLang: function (l) { if (T[l]) { current = l; apply(); } },
    languages: function () { return Object.keys(T); },
    t: translate,
    apply: apply,
    audit: audit,
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Detect here, not at parse time: the per-language files load after this
    // one, so at parse time only English exists and a French browser would
    // still be given English.
    current = detect();
    apply();
  });

})(window);
