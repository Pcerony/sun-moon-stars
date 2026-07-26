# Contributing

## Setup

This project has no runtime dependencies.

```sh
npm test
python3 -m http.server 8080
```

The local server is sufficient for desktop simulation. Real NFC requires Android Chrome and HTTPS.

## Change Workflow

1. Review `AGENTS.md` and the architecture notes.
2. Create or update focused tests in `tests/` for state changes.
3. Keep normal participant screens free of test controls.
4. Run `npm test`.
5. Test the affected UI flow in a browser.
6. Commit one coherent change with a descriptive message.

## Hardware Boundaries

The app reads NDEF NFC tags in Android Chrome. The Moon necklace and Star badges are intentionally generic in the prototype: a readable tag activates the expected stage. Compass feedback is an experience prototype rather than a verified spatial location system.
