import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activateMoon,
  completeWithStar,
  confirmStarKeeperFound,
  confirmPair,
  createInitialState,
  pairWithMoon,
  openDetector,
  openMap,
  openMapBackup,
  goHome,
  openNearbyTask,
  selectDemoTask,
  setLanguage,
  toggleDevMode
} from '../src/state.js';

test('starts with no active task and no score', () => {
  assert.deepEqual(createInitialState(), {
    selectedTaskId: 'dog',
    language: 'en',
    devMode: false,
    paired: false,
    moonProfile: null,
    moonScanned: false,
    activeTaskId: null,
    completedTaskIds: [],
    score: 0,
    screen: 'welcome'
  });
});

test('reveals test controls only when developer mode is toggled', () => {
  const state = toggleDevMode(createInitialState());
  assert.equal(state.devMode, true);
  assert.equal(toggleDevMode(state).devMode, false);
});

test('switches between English and Chinese without changing activity progress', () => {
  const paired = confirmPair(pairWithMoon(createInitialState(), { name: 'Aki', callName: 'Aki', likes: 'dogs' }));
  const state = setLanguage(activateMoon(paired), 'zh');
  assert.equal(state.language, 'zh');
  assert.equal(state.activeTaskId, 'dog');
});

test('a Moon scan activates the selected task', () => {
  const initial = confirmPair(pairWithMoon(createInitialState(), { name: 'Aki', callName: 'Aki', likes: 'dogs' }));
  const state = activateMoon(initial);
  assert.equal(state.activeTaskId, 'dog');
  assert.equal(state.screen, 'task');
});

test('an active task can enter and leave the Star detector', () => {
  const paired = confirmPair(pairWithMoon(createInitialState(), { name: 'Aki', callName: 'Aki', likes: 'dogs' }));
  const detector = openDetector(activateMoon(paired));
  assert.equal(detector.screen, 'detector');
  assert.equal(confirmStarKeeperFound(detector).screen, 'task');
});

test('a paired team returns to the home screen and can open the map', () => {
  const paired = confirmPair(pairWithMoon(createInitialState(), { name: 'Aki', callName: 'Aki', likes: 'dogs' }));
  assert.equal(paired.screen, 'home');
  assert.equal(openMap(paired).screen, 'map');
  assert.equal(openMapBackup(paired).screen, 'map-view');
  assert.equal(goHome(openMap(paired)).screen, 'home');
});

test('a nearby task opens its paper-map prompt', () => {
  const paired = confirmPair(pairWithMoon(createInitialState(), {
    name: 'Aki',
    callName: 'Aki',
    likes: 'gardening'
  }));

  const next = openNearbyTask(paired, 'flowers');

  assert.equal(next.selectedTaskId, 'flowers');
  assert.equal(next.screen, 'map');
});

test('a completed nearby task cannot be reopened', () => {
  const paired = confirmPair(pairWithMoon(createInitialState(), {
    name: 'Aki',
    callName: 'Aki',
    likes: 'dogs'
  }));
  const complete = completeWithStar(activateMoon(paired));

  assert.deepEqual(openNearbyTask(complete, 'dog'), complete);
});

test('a Star scan completes the active task exactly once', () => {
  const initial = confirmPair(pairWithMoon(createInitialState(), { name: 'Aki', callName: 'Aki', likes: 'dogs' }));
  const active = activateMoon(initial);
  const complete = completeWithStar(active);
  assert.deepEqual(complete.completedTaskIds, ['dog']);
  assert.equal(complete.score, 10);
  assert.equal(complete.screen, 'complete');
  assert.deepEqual(completeWithStar(complete), complete);
});

test('demo task selection changes the next task before Moon activation', () => {
  const paired = confirmPair(pairWithMoon(createInitialState(), { name: 'Aki', callName: 'Aki', likes: 'dogs' }));
  const state = selectDemoTask(paired, 'flowers');
  assert.equal(activateMoon(state).activeTaskId, 'flowers');
});

test('a Star scan without an active task changes nothing', () => {
  const state = createInitialState();
  assert.deepEqual(completeWithStar(state), state);
});

test('a Moon profile must be confirmed before collecting a task', () => {
  const profile = { name: 'Aki', callName: 'Aki-san', likes: 'gardening' };
  const introduced = pairWithMoon(createInitialState(), profile);
  assert.deepEqual(introduced.moonProfile, profile);
  assert.equal(introduced.screen, 'introduction');
  assert.equal(activateMoon(introduced), introduced);
  assert.equal(confirmPair(introduced).screen, 'home');
});
