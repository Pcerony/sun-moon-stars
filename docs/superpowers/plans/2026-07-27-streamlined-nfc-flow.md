# Streamlined NFC Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Distinguish arrival from pairing, remove redundant confirmations, add the approved Sun-centered detector, and apply official role artwork throughout the participant flow.

**Architecture:** Keep persistent workflow transitions in `src/state.js`, NFC lifecycle in the existing ritual controller, and transient orientation/readiness state in `src/app.js`. Extend the current visual system in `styles.css` without changing its layout language or adding dependencies.

**Tech Stack:** Static HTML, CSS, browser ES modules, Web NFC, Device Orientation, Web Audio, Node test runner.

---

### Task 1: Make Star Completion Return Home

**Files:**
- Modify: `tests/state.test.js`
- Modify: `src/state.js`

- [ ] **Step 1: Write the failing test**

Change the Star completion expectation:

```js
assert.equal(complete.screen, 'home');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/state.test.js`

Expected: FAIL because the current transition returns `complete`.

- [ ] **Step 3: Write minimal implementation**

In `completeWithStar`, set:

```js
screen: 'home'
```

Remove `confirmStarKeeperFound` and `continueExploring`, which no longer represent participant actions.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/state.test.js`

Expected: all state tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/state.js tests/state.test.js
git commit -m "feat: streamline task completion state"
```

### Task 2: Add Detector Readiness Logic

**Files:**
- Create: `src/detector.js`
- Create: `tests/detector.test.js`

- [ ] **Step 1: Write the failing tests**

```js
test('signal strength rises toward the simulated target heading', () => {
  assert.equal(signalStrength(0, 0), 0.08);
  assert.equal(signalStrength(75, 0), 1);
});

test('readiness requires a sustained near signal', () => {
  let readiness = updateReadiness(createReadiness(), 0.92, 1000);
  readiness = updateReadiness(readiness, 0.92, 1800);
  assert.equal(readiness.ready, true);
});

test('a weak signal clears pending readiness', () => {
  const pending = updateReadiness(createReadiness(), 0.92, 1000);
  assert.deepEqual(updateReadiness(pending, 0.4, 1200), createReadiness());
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/detector.test.js`

Expected: FAIL because `src/detector.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

Export pure angle normalization, signal strength, and sustained-threshold helpers:

```js
export function signalStrength(heading, startHeading, target = 75) { /* deterministic calculation */ }
export function createReadiness() { return { nearSince: null, ready: false }; }
export function updateReadiness(state, strength, now, threshold = 0.88, holdMs = 700) { /* threshold state */ }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/detector.test.js`

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/detector.js tests/detector.test.js
git commit -m "feat: add detector readiness model"
```

### Task 3: Streamline Page Actions and Apply Role Artwork

**Files:**
- Modify: `src/app.js`
- Modify: `README.md`
- Modify: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Wire the simplified actions**

Update event behavior so:

```js
start -> startActivity + performScan('pair')
detector -> openDetector + render + startDetector
star -> performScan('star')
```

Remove participant actions `pair-moon`, `start-detector`, `found-keeper`, and `continue`. Retain retry scanning when a real NFC attempt fails.

- [ ] **Step 2: Add automatic detector readiness**

Import the detector helpers. Update orientation/manual heading events to calculate readiness, refresh the detector’s CSS variables, and reveal the Star scan button only after the near signal is sustained.

- [ ] **Step 3: Apply official artwork**

Use `ritualAsset` for semantic Sun, Moon, and Star locations:

```js
ritualAsset('sun', 'role-sun')
ritualAsset('moon', 'map-moon')
ritualAsset('star', 'semantic-star')
```

Keep generic sparkles only as decoration. Remove the completion screen and its renderer.

- [ ] **Step 4: Split arrival ritual markup**

Render `pair`, `moon`, and `star` as separate structures. The `moon` structure contains a Moon beacon, approaching Sun, map ripple, area stamp, and task sticker; it must not contain the partner sticker.

- [ ] **Step 5: Update workflow documentation**

Document:

```text
welcome -> pairing scan -> introduction -> home -> map -> task -> detector -> home
```

Note that detector entry auto-starts orientation and Star collection returns directly home.

- [ ] **Step 6: Run automated tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app.js README.md docs/ARCHITECTURE.md
git commit -m "feat: simplify NFC activity interactions"
```

### Task 4: Style Arrival, Detector, and Semantic Assets

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add semantic asset styles**

Define stable sizes for Dock Star, score Star, reward Star, home Sun, map Moon, and sky Stars. Do not allow assets to resize their button or status containers.

- [ ] **Step 2: Build the approved detector A**

Style a hand-drawn compass with the official Sun centered and the official Star placed on the rotating target track. Bind strength to ring opacity, Star scale, and glow. Keep the scan action below the compass and inside the safe scroll area.

- [ ] **Step 3: Build the arrival ritual**

Add independent `ritual-arrival` animation and keyframes for Moon beacon, approaching Sun, map ripple, area stamp, and task sticker. Ensure `prefers-reduced-motion` resolves to a short static confirmation.

- [ ] **Step 4: Remove obsolete styles**

Delete styles only used by the old detector arrow, completion page, or removed action layout.

- [ ] **Step 5: Verify syntax and tests**

Run:

```bash
git diff --check
npm test
```

Expected: no whitespace errors and all tests pass.

- [ ] **Step 6: Commit**

```bash
git add styles.css
git commit -m "feat: style arrival ritual and Sun compass"
```

### Task 5: Browser QA and Deployment

**Files:**
- Modify: `design-qa.md`

- [ ] **Step 1: Start the static server**

Run:

```bash
python3 -m http.server 62944
```

Expected: app available locally.

- [ ] **Step 2: Exercise the full simulated flow**

At 390 × 844, enable hidden test controls and verify:

```text
Start -> simulated Moon pair -> Ready -> task -> simulated arrival -> detector -> near threshold -> simulated Star -> home
```

Confirm the three rituals are distinct and the score updates once.

- [ ] **Step 3: Check responsive and accessibility variants**

Inspect 320 × 700, 390 × 844, and 460 × 900. Check hidden controls, safe-area/Dock overlap, console errors, English labels, and reduced motion.

- [ ] **Step 4: Record QA**

Add the exact viewport and flow results to `design-qa.md`, including the unverified physical NFC caveat.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm test
git diff --check
git status --short
```

Expected: all tests pass, no diff errors, and only intended files are changed.

- [ ] **Step 6: Commit and deploy**

```bash
git add design-qa.md
git commit -m "docs: verify streamlined NFC flow"
git push origin codex/visualize-app
git push origin HEAD:main
```

Verify the GitHub Pages workflow completes and the public site serves the new commit.
