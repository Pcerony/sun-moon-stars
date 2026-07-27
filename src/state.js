import { TASKS } from './tasks.js';

export function createInitialState() {
  return {
    selectedTaskId: null,
    language: 'zh',
    devMode: false,
    paired: false,
    moonProfile: null,
    regionUnlocked: false,
    activeTaskId: null,
    completedTaskIds: [],
    score: 0,
    screen: 'welcome'
  };
}

export function startActivity(state) {
  return { ...state, screen: 'pairing' };
}

export function setLanguage(state, language) {
  return language === 'en' || language === 'zh' ? { ...state, language } : state;
}

export function toggleDevMode(state) {
  return { ...state, devMode: !state.devMode };
}

export function pairWithMoon(state, moonProfile) {
  return { ...state, moonProfile, screen: 'introduction' };
}

export function confirmPair(state) {
  if (!state.moonProfile) return state;
  return { ...state, paired: true, screen: 'home' };
}

export function beginRegionScan(state) {
  if (!state.paired || state.regionUnlocked) return state;
  return { ...state, screen: 'region-scan' };
}

export function unlockRegion(state) {
  if (!state.paired || state.screen !== 'region-scan') return state;
  return { ...state, regionUnlocked: true, screen: 'home' };
}

export function openNearbyTask(state, taskId) {
  if (
    !state.paired ||
    !state.regionUnlocked ||
    !TASKS[taskId] ||
    state.completedTaskIds.includes(taskId)
  ) {
    return state;
  }

  if (state.activeTaskId === taskId) return { ...state, screen: 'task' };
  if (state.activeTaskId) return state;

  return {
    ...state,
    selectedTaskId: taskId,
    screen: 'detector'
  };
}

export function completeDetector(state) {
  if (!state.selectedTaskId || state.screen !== 'detector') return state;
  return { ...state, screen: 'task-scan' };
}

export function unlockTask(state) {
  if (!state.selectedTaskId || state.screen !== 'task-scan') return state;
  return {
    ...state,
    activeTaskId: state.selectedTaskId,
    screen: 'task'
  };
}

export function completeWithStar(state) {
  if (!state.activeTaskId) return state;
  const task = TASKS[state.activeTaskId];
  return {
    ...state,
    selectedTaskId: null,
    activeTaskId: null,
    completedTaskIds: [...state.completedTaskIds, task.id],
    score: state.score + task.points,
    screen: 'home'
  };
}

export function openMapBackup(state) {
  return state.paired ? { ...state, screen: 'map-view' } : state;
}

export function goHome(state) {
  return state.paired ? { ...state, screen: 'home' } : state;
}

export function showSky(state) {
  return { ...state, screen: 'sky' };
}
