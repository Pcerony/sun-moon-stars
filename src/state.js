import { ALL_TASKS, DEFAULT_REGION_ID, REGIONS, getTasksForRegion } from './tasks.js';

export function createInitialState() {
  return {
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
  if (!state.paired || state.unlockedRegionIds.includes(state.currentRegionId)) return state;
  return { ...state, screen: 'region-scan' };
}

export function unlockRegion(state) {
  if (!state.paired || state.screen !== 'region-scan') return state;
  const unlockedRegionIds = state.unlockedRegionIds.includes(state.currentRegionId)
    ? state.unlockedRegionIds
    : [...state.unlockedRegionIds, state.currentRegionId];
  return { ...state, unlockedRegionIds, regionUnlocked: true, screen: 'home' };
}

export function openNearbyTask(state, taskId) {
  const task = ALL_TASKS[taskId];
  if (
    !state.paired ||
    !state.unlockedRegionIds.includes(state.currentRegionId) ||
    !task ||
    task.regionId !== state.currentRegionId ||
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
  const task = ALL_TASKS[state.selectedTaskId];
  return { ...state, screen: task?.kind === 'egg' ? 'egg-scan' : 'task-scan' };
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
  const taskId = state.activeTaskId || (state.screen === 'egg-scan' ? state.selectedTaskId : null);
  if (!taskId || state.completedTaskIds.includes(taskId)) return state;
  const task = ALL_TASKS[taskId];
  if (!task) return state;
  return {
    ...state,
    selectedTaskId: null,
    activeTaskId: null,
    completedTaskIds: [...state.completedTaskIds, taskId],
    score: state.score + task.points,
    screen: 'home'
  };
}

export function setCurrentRegion(state, regionId) {
  if (!state.paired || !REGIONS[regionId] || regionId === state.currentRegionId) return state;
  return {
    ...state,
    currentRegionId: regionId,
    regionUnlocked: state.unlockedRegionIds.includes(regionId),
    selectedTaskId: null,
    activeTaskId: null,
    screen: 'home'
  };
}

export function currentRegionTasks(state) {
  return getTasksForRegion(state.currentRegionId);
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
