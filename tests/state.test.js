import test from 'node:test';
import assert from 'node:assert/strict';
import {
  beginRegionScan,
  completeDetector,
  completeWithStar,
  confirmPair,
  createInitialState,
  goHome,
  openMapBackup,
  openNearbyTask,
  pairWithMoon,
  setLanguage,
  setCurrentRegion,
  showSky,
  startActivity,
  toggleDevMode,
  unlockRegion,
  unlockTask
} from '../src/state.js';
import { ALL_TASKS, DEFAULT_REGION_ID, getTasksForRegion } from '../src/tasks.js';

const PROFILE = { name: 'Aki', callName: 'Aki', likes: 'dogs' };

function pairedState() {
  return confirmPair(pairWithMoon(startActivity(createInitialState()), PROFILE));
}

function regionState() {
  return unlockRegion(beginRegionScan(pairedState()));
}

test('starts with the activity region and tasks locked', () => {
  assert.deepEqual(createInitialState(), {
    selectedTaskId: null,
    language: 'zh',
    devMode: false,
    paired: false,
    moonProfile: null,
    currentRegionId: DEFAULT_REGION_ID,
    unlockedRegionIds: [],
    regionUnlocked: false,
    activeTaskId: null,
    completedTaskIds: [],
    score: 0,
    screen: 'welcome'
  });
});

test('starts pairing before accepting a Moon profile', () => {
  assert.equal(startActivity(createInitialState()).screen, 'pairing');
  const introduced = pairWithMoon(startActivity(createInitialState()), PROFILE);
  assert.equal(introduced.screen, 'introduction');
  assert.deepEqual(introduced.moonProfile, PROFILE);
  assert.equal(confirmPair(introduced).screen, 'home');
});

test('reveals test controls only when developer mode is toggled', () => {
  const state = toggleDevMode(createInitialState());
  assert.equal(state.devMode, true);
  assert.equal(toggleDevMode(state).devMode, false);
});

test('switches language without changing progress', () => {
  const state = setLanguage(regionState(), 'en');
  assert.equal(state.language, 'en');
  assert.equal(state.regionUnlocked, true);
});

test('a paired team can scan Moon to unlock the current region', () => {
  const scanning = beginRegionScan(pairedState());
  assert.equal(scanning.screen, 'region-scan');

  const unlocked = unlockRegion(scanning);
  assert.equal(unlocked.regionUnlocked, true);
  assert.deepEqual(unlocked.unlockedRegionIds, [DEFAULT_REGION_ID]);
  assert.equal(unlocked.screen, 'home');
});

test('the current region exposes the expanded regular task set and recurring eggs', () => {
  const tasks = getTasksForRegion(DEFAULT_REGION_ID);
  assert.ok(tasks.some(task => task.id === 'dog'));
  assert.ok(tasks.some(task => task.id === 'flowers'));
  assert.ok(tasks.some(task => task.kind === 'egg'));
  assert.ok(Object.values(ALL_TASKS).some(task => task.id === 'staff-hug'));
  assert.ok(Object.values(ALL_TASKS).some(task => task.id === 'tree-rest'));
});

test('each simulated map region carries at least one reusable hidden egg', () => {
  for (const regionId of ['lakeside', 'south', 'east']) {
    assert.ok(getTasksForRegion(regionId).some(task => task.kind === 'egg'));
  }
});

test('switching the simulated region preserves progress but requires a fresh Moon scan', () => {
  const switched = setCurrentRegion(regionState(), 'south');
  assert.equal(switched.currentRegionId, 'south');
  assert.equal(switched.regionUnlocked, false);
  assert.deepEqual(switched.unlockedRegionIds, [DEFAULT_REGION_ID]);
  assert.equal(switched.screen, 'home');
  assert.equal(beginRegionScan(switched).screen, 'region-scan');
});

test('tasks cannot open before the current region is unlocked', () => {
  const paired = pairedState();
  assert.deepEqual(openNearbyTask(paired, 'dog'), paired);
});

test('selecting a discovered task opens its detector', () => {
  const state = openNearbyTask(regionState(), 'flowers');
  assert.equal(state.selectedTaskId, 'flowers');
  assert.equal(state.screen, 'detector');
  assert.equal(state.activeTaskId, null);
});

test('finishing detection asks for Moon before revealing task details', () => {
  const detector = openNearbyTask(regionState(), 'dog');
  const scanning = completeDetector(detector);
  assert.equal(scanning.screen, 'task-scan');
  assert.equal(scanning.activeTaskId, null);

  const task = unlockTask(scanning);
  assert.equal(task.screen, 'task');
  assert.equal(task.activeTaskId, 'dog');
});

test('finding an Easter egg skips task details and goes straight to Star collection', () => {
  const egg = regionState();
  const eggId = getTasksForRegion(DEFAULT_REGION_ID).find(task => task.kind === 'egg').id;
  const detector = openNearbyTask(egg, eggId);
  const starScan = completeDetector(detector);
  assert.equal(starScan.screen, 'egg-scan');
  assert.equal(starScan.activeTaskId, null);
  const complete = completeWithStar(starScan);
  assert.equal(complete.screen, 'home');
  assert.deepEqual(complete.completedTaskIds, [eggId]);
  assert.equal(complete.score, ALL_TASKS[eggId].points);
});

test('a Star scan completes the active task exactly once and returns home', () => {
  const detector = openNearbyTask(regionState(), 'dog');
  const active = unlockTask(completeDetector(detector));
  const complete = completeWithStar(active);

  assert.deepEqual(complete.completedTaskIds, ['dog']);
  assert.equal(complete.score, 10);
  assert.equal(complete.screen, 'home');
  assert.equal(complete.activeTaskId, null);
  assert.equal(complete.selectedTaskId, null);
  assert.deepEqual(completeWithStar(complete), complete);
});

test('an unlocked task can resume its detail page after returning home', () => {
  const active = unlockTask(completeDetector(openNearbyTask(regionState(), 'dog')));
  const home = goHome(active);
  assert.equal(openNearbyTask(home, 'dog').screen, 'task');
});

test('a completed task cannot be reopened', () => {
  const active = unlockTask(completeDetector(openNearbyTask(regionState(), 'dog')));
  const complete = completeWithStar(active);
  assert.deepEqual(openNearbyTask(complete, 'dog'), complete);
});

test('invalid transitions do not unlock content or award points', () => {
  const initial = createInitialState();
  assert.deepEqual(beginRegionScan(initial), initial);
  assert.deepEqual(unlockRegion(initial), initial);
  assert.deepEqual(completeDetector(initial), initial);
  assert.deepEqual(unlockTask(initial), initial);
  assert.deepEqual(completeWithStar(initial), initial);
});

test('paired teams can open Home, the backup map, and the shared sky', () => {
  const paired = pairedState();
  assert.equal(goHome(paired).screen, 'home');
  assert.equal(openMapBackup(paired).screen, 'map-view');
  assert.equal(showSky(paired).screen, 'sky');
});
