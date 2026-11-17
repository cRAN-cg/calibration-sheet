# Calibration sheet

Static web pages for calibrating and testing devices driven by a real pointer
and keyboard (for example a phone driven by a Bluetooth HID board). Each page
reports what it sees, so a test rig can measure pointer gain, scroll steps,
tap accuracy and typing from the page itself instead of guessing from
screenshots.

Live copy: <https://cran-cg.github.io/calibration-sheet/>

| Page | What it is for |
|---|---|
| `calib.html` | a tall page: pointer moves and wheel scrolls are measured from the readings |
| `lab.html` | tap targets from 60 down to 8 px, a form, a sideways strip, a slider, a draggable knob, links and dialogs |
| `target.html` | a second page, to test navigation |

## Where readings go

`report.js` decides:

- `?report=https://host/base` on any page: readings go to `https://host/base/event`.
  The address is kept for the tab, so links between pages keep reporting.
- No `?report`, page served by the rig itself: readings go to `./event` on the same host.
- No `?report`, on GitHub Pages or from a file: nothing is sent; the pages only show their readings.

An HTTPS page can only report to an HTTPS address (browsers block plain HTTP
from it), so a rig on a local network needs an HTTPS tunnel. Expose only the
rig's `/event` endpoint through it, never its control API.

## Readings

One GET per reading (a beacon when the page goes away):

    <endpoint>?type=<kind>&<fields>&inst=<page load id>&seq=<n>

`inst` is random per page load: two tabs, or a reload, are never mixed up.
`seq` orders the readings of one load only. Coordinates are CSS pixels in the
viewport (`clientX/Y`).

| `type` | Fields | When |
|---|---|---|
| `hello` | `page`, `sw`, `sh` (screen), `vw`, `vh` (viewport), `dpr`; calib adds `touch`, `ua` | on load, then every 2 s while visible (a heartbeat) |
| `bye` | `page` | the page is hidden or left |
| `hover` | `x`, `y` | the pointer moved (throttled to 40 ms, the resting position always sent) |
| `click` | `x`, `y`; lab adds `id` | a click |
| `scroll` | `y` | the page scrolled (trailing) |
| `targets` | `sy`, `v` = `id:left,top,width,height …` | lab: every element a test may aim at |
| `focus`, `input`, `change` | `id`, `v` | lab: form fields |
| `submit` | `v` (form data), `cb` | lab: the form was submitted |
| `hscroll` | `x` | lab: the sideways strip's `scrollLeft` |
| `range` | `v` | lab: the slider's value |
| `drag_start`, `drag_end` | `x`, `y`; end adds `kx`, `ky` (knob offset) | lab: the knob |
| `hash`, `alert_closed`, `confirm` | `v` | lab: navigation and dialogs |
| `notfound` | `path`, `href` | a page that does not exist was asked for |

## Findings these pages turned up

- Two tabs of one page both reported: hence `inst`, and hidden pages stay silent.
- On iOS, Safari's native `<input type=range>` cannot be dragged reliably with
  a pointer: once the button is down, iOS turns the pointer into a touch and,
  after each touch move, sends a `mousemove` at (-1, -359), which puts the
  slider back to its minimum. Page-drawn controls (the knob) are not affected.
