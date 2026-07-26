import { TASKS } from './tasks.js';

export function createInitialState() {
  return {
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

export function selectDemoTask(state, taskId) {
  if (!TASKS[taskId] || state.activeTaskId) return state;
  return { ...state, selectedTaskId: taskId };
}

export function activateMoon(state) {
  if (!state.paired || state.activeTaskId || state.completedTaskIds.includes(state.selectedTaskId)) return state;
  return {
    ...state,
    moonScanned: true,
    activeTaskId: state.selectedTaskId,
    screen: 'task'
  };
}

export function openDetector(state) {
  return state.activeTaskId ? { ...state, screen: 'detector' } : state;
}

export function confirmStarKeeperFound(state) {
  return state.activeTaskId ? { ...state, screen: 'task' } : state;
}

export function pairWithMoon(state, moonProfile) {
  return { ...state, moonProfile, screen: 'introduction' };
}

export function confirmPair(state) {
  if (!state.moonProfile) return state;
  return { ...state, paired: true, screen: 'home' };
}

export function openMap(state) {
  return state.paired ? { ...state, screen: 'map' } : state;
}

export function openMapBackup(state) {
  return state.paired ? { ...state, screen: 'map-view' } : state;
}

export function goHome(state) {
  return state.paired ? { ...state, screen: 'home' } : state;
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

export function showSky(state) {
  return { ...state, screen: 'sky' };
}

export function continueExploring(state) {
  return { ...state, screen: 'home' };
}
