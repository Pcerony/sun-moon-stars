# Agent Guide

## Project Purpose

Sun and Moon is a mobile web prototype for a Dahu Park activity. An older participant (Moon) and a younger participant (Sun) collaborate through a paper map, NFC necklace, NFC Star badges, and this phone app.

## Non-Negotiable Product Rules

- The Moon leads broad navigation using the physical paper map; do not replace it with turn-by-turn phone navigation.
- The Sun operates the phone and NFC scans.
- NFC is a real Android Chrome interaction. GPS, shared leaderboards, and task locations are deliberately simulated in this prototype.
- Normal participant screens must not reveal demo, test, or prototype controls.
- Test controls remain behind the hidden long-press on the app title.
- Keep the user-facing experience low-fidelity and calm. Do not introduce a visual redesign unless the project owner requests one.

## Repository Layout

- `index.html`, `styles.css`: static mobile shell and styling.
- `src/state.js`: pure workflow state and transitions.
- `src/nfc.js`: browser Web NFC adapter.
- `src/tasks.js`: task and mock community data.
- `src/app.js`: UI rendering, events, compass detector, and browser integration.
- `tests/`: Node built-in test coverage for state and NFC capability behavior.
- `docs/`: architecture, workflow, and design records.

## Working Rules

1. Read `README.md`, `docs/ARCHITECTURE.md`, and the relevant source module before editing.
2. Put workflow behavior in `src/state.js`; keep rendering in `src/app.js`.
3. Add or update a focused test whenever a state transition changes.
4. Run `npm test` before reporting completion.
5. Test real NFC only on Android Chrome over HTTPS. Do not claim hardware verification without a physical device and tags.
6. Do not commit generated browser artifacts, local tunnels, credentials, or user data.

## Collaboration

- Keep changes narrow and explain any behavior change in `README.md` or `docs/DECISIONS.md`.
- Do not overwrite active work from another agent. Inspect `git status` first.
- Use conventional, descriptive commits such as `feat: add backup park map` or `fix: stop detector feedback on completion`.
