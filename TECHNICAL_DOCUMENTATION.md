# Personalised Aftercare Schedule Generator - Technical Documentation

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Data Schemas](#data-schemas)
- [Calculation / Logic Algorithms](#calculation--logic-algorithms)
- [API Reference](#api-reference)
- [Integration Guide](#integration-guide)
- [Customization](#customization)
- [Performance](#performance)
- [Browser Compatibility](#browser-compatibility)
- [Security](#security)
- [Version History](#version-history)
- [Support / Contact](#support--contact)

## Architecture Overview

### Technology Stack

The tool is a dependency-free static HTML/CSS/JavaScript application. It requires no server-side processing, no database, and no external libraries or frameworks.

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (linked via `<link>`) |
| Logic | Vanilla JavaScript (ES6 `'use strict'`) |
| Embedding | Self-contained iframe-compatible widget |

### File Structure

```
/tools/aftercare-schedule-generator/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

### Component / Logic Breakdown

The tool consists of three logical layers:

1. **Input Layer** (HTML): A form with three fields, piercing type (select), days since piercing (number input), and current condition (select). A button triggers schedule generation.

2. **Data Layer** (JavaScript): Two constant objects (`PIERCING_DATA` and `CONDITION_ADVICE`) store healing timelines, cleaning frequencies, oral piercing flags, and condition-specific advice text.

3. **Presentation Layer** (JavaScript): The `generate()` function reads input values, calculates the current healing phase, builds phase-specific aftercare steps and avoidance lists, and renders the result as HTML into a `#result` container.

## Data Schemas

### `PIERCING_DATA` (constant object)

Defines healing parameters for each piercing type. Keyed by the `value` attribute of the piercing type `<select>` options.

```javascript
{
  earlobe:    { name: 'Earlobe',                          healDays: [21,  90,  180], freq: 2, oral: false },
  cartilage:  { name: 'Ear cartilage (helix / flat)',     healDays: [42, 180, 365], freq: 2, oral: false },
  daith:      { name: 'Daith / rook / snug / tragus',     healDays: [42, 180, 365], freq: 2, oral: false },
  nostril:    { name: 'Nostril',                          healDays: [42, 120, 180], freq: 2, oral: false },
  septum:     { name: 'Septum',                           healDays: [42,  90, 180], freq: 2, oral: false },
  labret:     { name: 'Labret / lip / monroe',            healDays: [42,  90, 180], freq: 2, oral: true  },
  tongue:     { name: 'Tongue',                           healDays: [21,  56, 120], freq: 3, oral: true  },
  navel:      { name: 'Navel',                            healDays: [56, 180, 365], freq: 2, oral: false },
  surface:    { name: 'Surface / dermal',                 healDays: [56, 180, 365], freq: 1, oral: false },
  nipple:     { name: 'Nipple',                           healDays: [90, 180, 365], freq: 2, oral: false },
  genital:    { name: 'Genital (general)',                healDays: [42, 120, 365], freq: 2, oral: false },
}
```

**Field descriptions:**

| Field | Type | Description |
|---|---|---|
| `name` | string | Human-readable piercing type name |
| `healDays` | array[3] | `[acuteEnd, prolifEnd, totalDays]` in days |
| `freq` | number | Saline rinse frequency per day (1, 2, or 3) |
| `oral` | boolean | Whether the piercing is oral (requires mouth rinse) |

### `CONDITION_ADVICE` (constant object)

Provides condition-specific warning text when the user selects a non-normal condition.

```javascript
{
  bump: {
    title: 'Bump / raised tissue detected',
    text: 'Irritation bumps (hypertrophic-type nodules) are common during healing...'
  },
  irritation: {
    title: 'Redness or irritation',
    text: 'Mild redness and tenderness during acute healing is normal...'
  },
  discharge: {
    title: 'Unusual discharge',
    text: 'Clear or white lymph fluid ("crusties") is normal throughout healing...'
  }
}
```

### Healing Phase Steps (local arrays in `generate()`)

Three phase objects (`steps[1]`, `steps[2]`, `steps[3]`) each contain an array of aftercare step strings. Steps with `null` values are filtered out via `.filter(Boolean)` (used for oral-specific steps that only apply when `d.oral` is true).

### Avoidance Lists (local arrays in `generate()`)

Three phase objects (`avoids[1]`, `avoids[2]`, `avoids[3]`) each contain an array of strings describing actions to avoid during that phase.

## Calculation / Logic Algorithms

### `generate()` function (main entry point)

Executed on button click. Follows this sequence:

#### Step 1: Input Validation
- Reads `piercing-type`, `days-since`, and `condition` from the DOM.
- If `type` is empty or `daysVal` is NaN or negative, shows an alert and exits.

#### Step 2: Data Lookup
- Retrieves the piercing data object: `const d = PIERCING_DATA[type]`.
- Clamps days to a maximum of 730: `const days = Math.min(daysVal, 730)`.
- Destructures healing thresholds: `const [acuteEnd, prolifEnd, totalDays] = d.healDays`.

#### Step 3: Phase Determination
- Compares `days` against the three thresholds:
  - `days <= acuteEnd` → Phase 1 (Acute / Inflammatory)
  - `days <= prolifEnd` → Phase 2 (Proliferative / Rebuilding)
  - `days <= totalDays` → Phase 3 (Remodelling / Maturation)
  - `days > totalDays` → Phase 3 with label "Fully healed / Maintenance"

#### Step 4: Progress Calculation
- `progressPct = Math.min(100, Math.round(days / totalDays * 100))`

#### Step 5: Frequency Text
- Maps `d.freq` to human-readable text:
  - `3` → "three times daily"
  - `2` → "twice daily"
  - `1` → "once daily"

#### Step 6: Weeks Remaining
- `weeksLeft = Math.max(0, Math.ceil((totalDays - days) / 7))`

#### Step 7: HTML Assembly
- Builds condition warning box (if applicable).
- Builds step list and avoidance list for the determined phase.
- Builds jewellery recommendation section with phase-conditional text.
- Inserts all HTML into `document.getElementById('result').innerHTML`.
- Scrolls the result into view using `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`.

### `escHtml()` utility function

Sanitizes user-facing strings before rendering to prevent XSS:

```javascript
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

## API Reference

The tool exposes no public API. All functions are scoped to the module or attached as event listeners.

| Function | Scope | Parameters | Returns | Description |
|---|---|---|---|---|
| `generate()` | Global (via `window`) | None (reads DOM directly) | `undefined` (renders HTML) | Main logic handler; validates input, calculates phase, renders schedule |
| `escHtml(s)` | Global | `s` (string) | Sanitized string | HTML-encodes special characters for safe rendering |

**Event binding:**

```javascript
document.getElementById('gen-btn').addEventListener('click', generate);
```

## Integration Guide

### Standalone Embedding

The tool is fully self-contained and can be embedded via iframe:

```html
<iframe
  src="https://poliinternational.com/tools/aftercare-schedule-generator/"
  width="100%"
  height="800"
  frameborder="0"
  title="Personalised Aftercare Schedule Generator"
></iframe>
```

### Iframe Theme Support

The tool detects if it is loaded in an iframe (`window.self !== window.top`) and listens for `postMessage` events to switch between light and dark themes:

```javascript
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'poli-theme') {
    document.documentElement.setAttribute('data-theme', e.data.light ? 'light' : 'dark');
  }
});
```

To set the theme from the parent page:

```javascript
// Light theme
document.querySelector('iframe').contentWindow.postMessage({ type: 'poli-theme', light: true }, '*');

// Dark theme
document.querySelector('iframe').contentWindow.postMessage({ type: 'poli-theme', light: false }, '*');
```

### Dependencies

None. The tool is dependency-free static HTML/CSS/JS.

## Customization

### Modifying Healing Timelines

Edit the `healDays` arrays in `PIERCING_DATA` within `js/app.js`. Each array is `[acuteEnd, prolifEnd, totalDays]` in days.

### Adding a New Piercing Type

1. Add a new `<option>` to the `<select id="piercing-type">` in `index.html`.
2. Add a corresponding entry to `PIERCING_DATA` in `js/app.js` with all required fields.

### Modifying Aftercare Steps

Edit the `steps` and `avoids` arrays inside the `generate()` function in `js/app.js`. Each phase (1, 2, 3) has its own array of step strings.

## Performance

- Total payload: approximately 8KB (HTML + CSS + JS combined).
- No network requests after initial page load.
- No DOM manipulation beyond rendering the result card.
- No animations or timers beyond the smooth scroll behavior.

## Browser Compatibility

The tool uses standard ES6 features (`const`, `let`, arrow functions, template literals, `Math.round`, `Math.min`, `Math.ceil`, `Array.filter`, `Array.map`, `Array.join`). It requires:

- Chrome 49+
- Firefox 44+
- Safari 10+
- Edge 14+
- Opera 36+

The `scrollIntoView({ behavior: 'smooth' })` call is supported in all modern browsers. In older browsers, it degrades to instant scroll.

## Security

### Input Handling

- User input is read directly from DOM element values and validated before processing.
- All user-facing strings are passed through `escHtml()` before rendering to prevent XSS attacks.
- The `days-since` input is clamped to a maximum of 730.
- The `piercing-type` and `condition` values are validated against known keys before use.

### Iframe Security

- The tool sets `<meta name="robots" content="noindex, nofollow">` to prevent search engine indexing of the iframe content.
- No sensitive data is stored or transmitted.
- No cookies, localStorage, or sessionStorage are used.

### External Links

The only external link is to `https://poliinternational.com/bioflex/` with `target="_blank"` and `rel="noopener noreferrer"` for security.

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2024-01 | Initial release |

## Support / Contact

For technical issues or integration questions, contact:

**Poli International**  
Email: support@poliinternational.com  
Website: https://poliinternational.com/
