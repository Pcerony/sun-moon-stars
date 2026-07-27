# Architecture

## Runtime

The app is a dependency-free static site. It runs from `index.html` and ES modules, which keeps it easy to host over HTTPS and to open in Android Chrome.

## State Model

`src/state.js` owns the activity workflow:

```text
welcome -> pairing -> introduction -> home -> map -> task -> detector -> task -> complete -> home
                                      |                         |
                                      +-------- map backup -----+
```

The home screen and header home button let a paired team leave any feature page without losing their accumulated score or collected Stars.

## Hardware Adapters

`src/nfc.js` isolates the Web NFC API. NFC scans begin from explicit user actions and fall back to hidden simulation controls for development. The app must be served over HTTPS for Web NFC on Android Chrome.

The detector in `src/app.js` uses device orientation when available. It produces a compass-like signal, a short vibration, and a generated Web Audio tone. It is not a real geospatial guidance system yet.

## Content

`src/tasks.js` holds the two demonstration tasks, simulated outdoor status, and local mock community data. `assets/illustrations`, `assets/fonts`, and `assets/icons` contain the production visual assets used by the static interface. Add future tasks in `src/tasks.js` and extend state tests with any workflow change.

## Testing

Node's built-in test runner checks pure transitions and NFC capability detection. Browser checks cover rendering and the simulated activity flow. Physical NFC and device orientation need manual Android testing.
