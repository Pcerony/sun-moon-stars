# Architecture

## Runtime

The app is a dependency-free static site. It runs from `index.html` and ES modules, which keeps it easy to host over HTTPS and to open in Android Chrome.

## State Model

`src/state.js` owns the activity workflow:

```text
welcome -> pairing scan -> introduction -> locked home
  -> region Moon scan -> discovered home
  -> task detector -> task Moon scan -> task details -> Star scan -> discovered home
  -> egg detector -> Star scan -> discovered home

Any paired screen -> backup map
```

The home screen and header home button let a paired team leave any feature page without losing their accumulated score or collected Stars.

## Hardware Adapters

`src/nfc.js` isolates the Web NFC API. NFC scans begin from explicit user actions and fall back to hidden simulation controls for development. The app must be served over HTTPS for Web NFC on Android Chrome.

The detector's pure heading and sustained-readiness calculations live in `src/detector.js`. `src/app.js` owns the transient sensor listener, vibration, generated Web Audio tone, and rendering. Selecting a discovered task starts sensing immediately; a Next action appears only after a near signal is sustained. Leaving the detector always stops sensing, vibration, and future detector tones. It is not a real geospatial guidance system.

`src/ritual.js` distinguishes four NFC results: first partner pairing, region discovery, task-detail unlocking, and shared Star collection. Workflow state changes only after the matching success ritual finishes. Normal task Star collection starts from the task detail screen, when the detector is no longer active, and returns directly to Home. Egg collection uses the same Star ritual directly after detection and intentionally skips the task-detail screen.

## Content

`src/tasks.js` holds the map regions, regular tasks, recurring per-region egg instances, simulated outdoor status, and local mock community data. `assets/illustrations`, `assets/fonts`, and `assets/icons` contain the production visual assets used by the static interface. Add future tasks in `src/tasks.js` and extend state tests with any workflow change.

## Testing

Node's built-in test runner checks pure transitions, detector readiness, ritual phases, and NFC capability detection. Browser checks cover rendering and the simulated activity flow. Physical NFC and device orientation need manual Android testing.
