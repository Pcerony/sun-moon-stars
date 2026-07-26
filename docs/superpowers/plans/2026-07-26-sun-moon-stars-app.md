# Sun, Moon, and Stars App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Android web application that reads real NFC tags to activate and complete two demonstration park tasks.

**Architecture:** A static HTML application uses a small state module for team progress and task transitions, an NFC adapter that wraps the browser Web NFC API, and a UI module that renders each screen from current state. The state module remains browser-independent and is covered by Node's built-in test runner; the NFC adapter exposes a simulation route when a scanner is unavailable.

**Tech Stack:** HTML, CSS, vanilla JavaScript modules, Web NFC (`NDEFReader`), Node built-in test runner.

---

## File Structure

- `index.html`: mobile application shell and accessible screen regions.
- `styles.css`: low-fidelity, mobile-first layout and interaction states.
- `src/tasks.js`: immutable task definitions and example social data.
- `src/state.js`: pure app state creation and transitions.
- `src/nfc.js`: Web NFC capability checks and one-shot scan requests.
- `src/app.js`: UI rendering, user actions, simulation controls, and error messages.
- `tests/state.test.js`: Node tests for task activation, completion, and invalid transitions.
- `package.json`: local test command only; no runtime dependencies.
- `README.md`: Android Chrome, HTTPS, tag formatting, and test instructions.

### Task 1: Establish the Static App and Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `styles.css`
- Create: `src/tasks.js`
- Create: `tests/state.test.js`

- [ ] **Step 1: Add the Node test command**

```json
{
  "name": "sun-moon-stars",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Add a failing state test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/state.js';

test('starts with no active task and no score', () => {
  assert.deepEqual(createInitialState(), {
    selectedTaskId: 'dog',
    moonScanned: false,
    activeTaskId: null,
    completedTaskIds: [],
    score: 0,
    screen: 'welcome'
  });
});
```

- [ ] **Step 3: Run the test to confirm it fails because the module does not exist**

Run: `npm test`

Expected: FAIL with a module-not-found error for `src/state.js`.

- [ ] **Step 4: Create task data and the mobile app shell**

```js
// src/tasks.js
export const TASKS = {
  dog: {
    id: 'dog',
    title: 'Meet a Friendly Dog',
    instruction: 'With your partner, say hello and gently pet the friendly dog.',
    points: 10,
    star: 'Kindness Star'
  },
  flowers: {
    id: 'flowers',
    title: 'Water the Flowers',
    instruction: 'With your partner, give the garden flowers a little water.',
    points: 10,
    star: 'Garden Star'
  }
};
```

```html
<!-- index.html body -->
<main class="app-shell">
  <header class="app-header"><p>Sun and Moon</p><h1>Collect the Stars</h1></header>
  <section id="app" aria-live="polite"></section>
</main>
<script type="module" src="./src/app.js"></script>
```

- [ ] **Step 5: Add the minimal state module**

```js
// src/state.js
export function createInitialState() {
  return {
    selectedTaskId: 'dog',
    moonScanned: false,
    activeTaskId: null,
    completedTaskIds: [],
    score: 0,
    screen: 'welcome'
  };
}
```

- [ ] **Step 6: Add low-fidelity mobile styles**

```css
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: #f7f7f5; color: #181818; font-family: system-ui, sans-serif; }
button { min-height: 48px; width: 100%; border: 2px solid #181818; background: #fff; color: inherit; font: inherit; font-weight: 700; }
.app-shell { width: min(100%, 460px); min-height: 100dvh; margin: 0 auto; padding: 24px 18px 40px; }
.app-header { border-bottom: 2px solid #181818; margin-bottom: 24px; }
.app-header p { margin: 0; font-size: 14px; }
.app-header h1 { margin: 6px 0 16px; font-size: 28px; }
```

- [ ] **Step 7: Run the test to confirm it passes**

Run: `npm test`

Expected: PASS for `starts with no active task and no score`.

### Task 2: Implement Task State Transitions

**Files:**
- Modify: `src/state.js`
- Modify: `tests/state.test.js`

- [ ] **Step 1: Add failing transition tests**

```js
import { activateMoon, completeWithStar } from '../src/state.js';

test('a Moon scan activates the selected task', () => {
  const state = activateMoon(createInitialState());
  assert.equal(state.activeTaskId, 'dog');
  assert.equal(state.screen, 'task');
});

test('a Star scan completes the active task exactly once', () => {
  const active = activateMoon(createInitialState());
  const complete = completeWithStar(active);
  assert.deepEqual(complete.completedTaskIds, ['dog']);
  assert.equal(complete.score, 10);
  assert.equal(complete.screen, 'complete');
  assert.deepEqual(completeWithStar(complete), complete);
});
```

- [ ] **Step 2: Run tests to verify the imports fail**

Run: `npm test`

Expected: FAIL because `activateMoon` and `completeWithStar` are not exported.

- [ ] **Step 3: Add pure transition functions**

```js
import { TASKS } from './tasks.js';

export function activateMoon(state) {
  if (state.activeTaskId || state.completedTaskIds.includes(state.selectedTaskId)) return state;
  return { ...state, moonScanned: true, activeTaskId: state.selectedTaskId, screen: 'task' };
}

export function completeWithStar(state) {
  if (!state.activeTaskId) return state;
  const task = TASKS[state.activeTaskId];
  return {
    ...state,
    activeTaskId: null,
    completedTaskIds: [...state.completedTaskIds, task.id],
    score: state.score + task.points,
    screen: 'complete'
  };
}
```

- [ ] **Step 4: Add test coverage for task switching and wrong-state completion**

```js
import { selectDemoTask } from '../src/state.js';

test('demo task selection changes the next task before Moon activation', () => {
  const state = selectDemoTask(createInitialState(), 'flowers');
  assert.equal(activateMoon(state).activeTaskId, 'flowers');
});

test('a Star scan without an active task changes nothing', () => {
  const state = createInitialState();
  assert.deepEqual(completeWithStar(state), state);
});
```

- [ ] **Step 5: Implement selection and run all state tests**

```js
export function selectDemoTask(state, taskId) {
  if (!TASKS[taskId] || state.activeTaskId) return state;
  return { ...state, selectedTaskId: taskId };
}
```

Run: `npm test`

Expected: PASS for all state transitions.

### Task 3: Add Web NFC and Simulated Scan Adapters

**Files:**
- Create: `src/nfc.js`
- Create: `tests/nfc.test.js`

- [ ] **Step 1: Write failing capability tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { canScanNfc } from '../src/nfc.js';

test('reports unsupported when NDEFReader is absent', () => {
  assert.equal(canScanNfc({}), false);
});

test('reports supported when NDEFReader exists', () => {
  assert.equal(canScanNfc({ NDEFReader: class {} }), true);
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npm test`

Expected: FAIL because `src/nfc.js` is missing.

- [ ] **Step 3: Implement one-shot scan support**

```js
export function canScanNfc(platform = window) {
  return typeof platform.NDEFReader === 'function';
}

export async function scanTag({ platform = window, signal } = {}) {
  if (!canScanNfc(platform)) throw new Error('NFC is not available in this browser.');
  const reader = new platform.NDEFReader();
  await reader.scan({ signal });
  return new Promise((resolve, reject) => {
    reader.addEventListener('reading', event => resolve(event.serialNumber || 'tag'), { once: true });
    reader.addEventListener('readingerror', () => reject(new Error('The tag could not be read.')), { once: true });
  });
}
```

- [ ] **Step 4: Run capability tests**

Run: `npm test`

Expected: PASS for both NFC capability tests.

### Task 4: Render the Full Activity Flow

**Files:**
- Create: `src/app.js`
- Modify: `styles.css`

- [ ] **Step 1: Render the welcome and map prompt states**

```js
import { TASKS } from './tasks.js';
import { createInitialState, selectDemoTask, activateMoon, completeWithStar } from './state.js';
import { canScanNfc, scanTag } from './nfc.js';

let state = createInitialState();
const root = document.querySelector('#app');

function render() {
  const task = TASKS[state.activeTaskId || state.selectedTaskId];
  root.innerHTML = state.screen === 'welcome'
    ? `<section><p>Sun and Moon explore together.</p><button data-action="start">Start the activity</button></section>`
    : `<section><p>Look at the paper map together.</p><p class="status">Demo location: ${task.title}</p><button data-action="moon">Scan Moon necklace</button><button data-action="simulate-moon">Simulate Moon scan</button></section>`;
}
```

- [ ] **Step 2: Add task, completion, and sky rendering branches**

```js
function taskMarkup(task) {
  return `<section><p class="eyebrow">Current star</p><h2>${task.title}</h2><p>${task.instruction}</p><button data-action="star">Scan Star badge</button><button data-action="simulate-star">Simulate Star scan</button></section>`;
}

function completeMarkup(task) {
  return `<section><p class="eyebrow">Star collected</p><h2>${task.star}</h2><p>+${task.points} points</p><button data-action="sky">View our sky</button><button data-action="continue">Find another star</button></section>`;
}
```

- [ ] **Step 3: Wire visible actions to state transitions and NFC scans**

```js
async function handleMoonScan() {
  try {
    await scanTag();
    state = activateMoon(state);
  } catch (error) {
    showNotice(error.message);
  }
  render();
}

async function handleStarScan() {
  try {
    await scanTag();
    state = completeWithStar(state);
  } catch (error) {
    showNotice(error.message);
  }
  render();
}
```

- [ ] **Step 4: Add the minimal social sky and reset flow**

```js
function skyMarkup() {
  const stars = state.completedTaskIds.map(id => `<li>${TASKS[id].star}</li>`).join('') || '<li>No stars collected yet</li>';
  return `<section><h2>Our sky</h2><p>${state.score} points</p><ul>${stars}</ul><h3>Park sky</h3><p>18 stars collected by 6 teams today.</p><button data-action="continue">Find another star</button><button data-action="reset">Reset demo</button></section>`;
}
```

- [ ] **Step 5: Add screen-focused styles and test the desktop simulation flow manually**

Run: `npm test`

Expected: PASS.

Manual check: open `index.html` through a local server, select each demo location, simulate a Moon scan, simulate a Star scan, and confirm the correct task name, 10-point award, and star appear.

### Task 5: Document HTTPS and Android Tag Testing

**Files:**
- Create: `README.md`

- [ ] **Step 1: Add setup and NFC test instructions**

```markdown
# Sun, Moon, and Stars

## Run locally

Run `python3 -m http.server 8080` and open the app for desktop simulation.

## Test real NFC

1. Use an Android phone with NFC enabled and current Chrome.
2. Serve this app over HTTPS; Web NFC is unavailable on ordinary HTTP pages.
3. Format the Moon necklace and both Star badges as NDEF-readable tags.
4. Tap **Scan Moon necklace**, touch the Moon tag, then touch a Star badge after the task is shown.

The demonstration accepts either Star badge for either active task. The browser never uploads tag contents.
```

- [ ] **Step 2: Run final automated checks**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run the mobile visual check**

Open the site in a narrow browser viewport and confirm all primary buttons remain visible without horizontal scrolling.

## Plan Review

- Spec coverage: Tasks 1-5 cover the static mobile app, two task states, Android Web NFC, simulated GPS/location selection, reusable Star badges, local score/social display, error recovery, desktop testing, and Android HTTPS verification.
- Placeholder scan: No incomplete requirements or deferred implementation steps remain.
- Type consistency: `selectedTaskId`, `activeTaskId`, `completedTaskIds`, `activateMoon`, `completeWithStar`, and `selectDemoTask` are used consistently throughout.
