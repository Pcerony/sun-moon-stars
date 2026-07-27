import { ALL_TASKS, COMMUNITY_TEAMS, MOCK_OUTDOOR_STATUS, REGIONS, getTasksForRegion } from './tasks.js';
import { icon } from './icons.js';
import {
  beginRegionScan, completeDetector, completeWithStar, confirmPair, createInitialState,
  goHome, openMapBackup, openNearbyTask, pairWithMoon, setLanguage,
  setCurrentRegion, showSky, startActivity, toggleDevMode, unlockRegion, unlockTask
} from './state.js';
import {
  createReadiness,
  normalizeAngle,
  shouldUpdateDetector,
  signalStrength,
  updateReadiness
} from './detector.js';
import { canScanNfc, scanTag } from './nfc.js';
import {
  beginRitual,
  failRitual,
  finishRitual,
  ritualExitDuration,
  succeedRitual
} from './ritual.js';

const TEXT = {
  en: {
    activity: 'DAHU PARK', title: 'Moving Memories', unavailable: 'NFC needs Android Chrome and an NFC-enabled phone.',
    nfcError: 'NFC is not available in this browser.', hello: 'Explore together', start: 'Start',
    pairing: 'Meet your Moon', scanMoon: 'Scan Moon', scanMoonHint: 'Hold the Moon necklace near the phone.',
    profile: 'Moon profile', callName: 'Call me', likes: 'Likes', introduce: 'Your turn',
    introHint: 'Say your name and one thing you like.', met: 'Ready',
    nearby: 'Nearby', lakeArea: 'Lakeside', updated: 'updated', temp: 'temperature', steps: 'steps', points: 'points',
    unlockArea: 'Unlock nearby tasks', unlockAreaHint: 'Explore this area together',
    regionScan: 'Scan this area', taskScan: 'Unlock task',
    currentStar: 'Star task', egg: 'Hidden egg', eggTask: 'Hidden egg', eggHint: 'Found it? Bring the Star badge near the phone.', detector: 'Find task', detectorNext: 'Next', scanStar: 'Collect Star',
    scanStarHint: 'Hold the Star badge near the phone.',
    signalNone: 'Listening…', signalFaint: 'Faint', signalNear: 'Nearby', signalFound: 'Here!', signalReady: 'Ready',
    sensorFallback: 'Compass unavailable. Continue to the next step.',
    sky: 'Our sky', parkMap: 'Backup map',
    community: 'Today', reset: 'Reset', demoTools: 'Test controls', demoScan: 'Simulate scan',
    testHeading: 'Heading', scanningMoon: 'Listening for Moon…',
    scanningStar: 'Listening for a Star…', pairSuccess: 'Partners!', together: 'Let’s go together',
    regionSuccess: 'Tasks discovered!', regionReady: 'Back to the area',
    arrivalSuccess: 'Task unlocked!', taskReady: 'Details ready', starSuccess: 'Star collected!', intoSky: 'Added to our sky'
  },
  zh: {
    activity: '大濠公园', title: 'Moving Memories', unavailable: 'NFC 需要使用支持 NFC 的 Android Chrome 手机。',
    nfcError: '此浏览器暂时不能使用 NFC。', hello: '一起出发吧', start: '开始',
    pairing: '认识月亮', scanMoon: '扫描月亮', scanMoonHint: '把月亮项链贴近手机。',
    profile: '月亮名片', callName: '请叫我', likes: '我喜欢', introduce: '轮到太阳',
    introHint: '说出你的名字和一件喜欢的事。', met: '准备好了',
    nearby: '附近任务', lakeArea: '湖畔区', updated: '刚刚更新', temp: '温度', steps: '步数', points: '积分',
    unlockArea: '一起解锁附近任务', unlockAreaHint: '探索这个小区域',
    regionScan: '扫描当前区域', taskScan: '解锁任务',
    currentStar: '星星任务', egg: '隐藏彩蛋', eggTask: '寻找彩蛋', eggHint: '找到彩蛋后，把星星勋章贴近手机。', detector: '寻找任务', detectorNext: '下一步', scanStar: '收获星星',
    scanStarHint: '把星星勋章贴近手机。',
    signalNone: '正在聆听…', signalFaint: '微弱', signalNear: '就在附近', signalFound: '就在这里！', signalReady: '可以扫描',
    sensorFallback: '方向感应不可用，请直接进入下一步。',
    sky: '我们的星空', parkMap: '备用地图',
    community: '今日星光', reset: '重置', demoTools: '测试控制', demoScan: '模拟扫描',
    testHeading: '测试方向', scanningMoon: '正在感应月亮…',
    scanningStar: '正在感应星星…', pairSuccess: '伙伴配对成功', together: '一起出发吧',
    regionSuccess: '发现新任务！', regionReady: '回到当前区域',
    arrivalSuccess: '任务解锁！', taskReady: '查看任务详情', starSuccess: '共同收藏成功', intoSky: '已放入我们的星空'
  }
};

const DEMO_MOON = { name: 'Haruko Sato', callName: 'Haruko', likes: 'flowers and small dogs' };
let state = createInitialState();
let scanning = false;
let detectorHeading = null;
let detectorStartHeading = null;
let detectorListening = false;
let manualHeading = null;
let lastPulse = 0;
let detectorReadiness = createReadiness();
let detectorReadyTimer = null;
let detectorFallbackTimer = null;
let orientationListening = false;
let audioContext = null;
let renderedScreen = null;
let ritual = null;
let ritualTimer = null;
let ritualToken = 0;
let regionPickerOpen = false;
const root = document.querySelector('#app');
const notice = document.querySelector('#notice');
const languageSelect = document.querySelector('#language-select');
const homeButton = document.querySelector('#home-button');
const appTitle = document.querySelector('.brand-lockup');
const appShell = document.querySelector('.app-shell');
let devPressTimer;

function words() { return TEXT[state.language]; }
function taskTitle(task) { return state.language === 'zh' ? task.titleZh : task.title; }
function taskInstruction(task) { return state.language === 'zh' ? task.instructionZh : task.instruction; }
function taskArea(task) { return state.language === 'zh' ? task.areaZh : task.area; }
function showNotice(message) { notice.textContent = message; notice.hidden = false; }
function clearNotice() { notice.hidden = true; notice.textContent = ''; }
function activeOrSelectedTask() { return ALL_TASKS[state.activeTaskId || state.selectedTaskId]; }
function currentRegion() { return REGIONS[state.currentRegionId]; }
function currentRegionIsUnlocked() { return state.unlockedRegionIds.includes(state.currentRegionId); }
function taskLabel(task) { return task.kind === 'egg' ? words().eggTask : taskTitle(task); }
function regionName(region) { return state.language === 'zh' ? region.areaZh : region.area; }
function regionPickerMarkup() {
  if (!regionPickerOpen) return '';
  return `<div class="region-picker" role="list" aria-label="区域选择">${Object.values(REGIONS).map(region => `<button type="button" class="region-picker-button ${region.id === state.currentRegionId ? 'active' : ''}" data-action="change-region" data-region-id="${region.id}" role="listitem">${regionName(region)}</button>`).join('')}</div>`;
}
function devOnly(markup) { return state.devMode ? `<details class="demo-panel" open><summary>${words().demoTools}</summary>${markup}</details>` : ''; }
function logoMarkup(className = '') {
  return `<img class="brand-logo ${className}" src="./assets/branding/logo.png" alt="">`;
}
function ritualAsset(name, className = '') {
  return `<img class="ritual-asset ${className}" src="./assets/ritual/${name}.png" alt="">`;
}
function roleAsset(name, className = '') {
  return `<img class="role-asset ${className}" src="./assets/ritual/${name}.png" alt="">`;
}
function dockMarkup(active) {
  const t = words();
  return `<nav class="bottom-dock" aria-label="${t.title}">
    <button class="dock-button dock-home ${active === 'home' ? 'active' : ''}" data-action="home" aria-label="${t.nearby}" title="${t.nearby}">${logoMarkup('dock-logo')}</button>
    <button class="dock-button dock-sky ${active === 'sky' ? 'active' : ''}" data-action="sky" aria-label="${t.sky}" title="${t.sky}">${roleAsset('star', 'dock-star')}</button>
    <button class="dock-button ${active === 'map' ? 'active' : ''}" data-action="view-map" aria-label="${t.parkMap}" title="${t.parkMap}">${icon('map')}</button>
  </nav>`;
}

function currentSignalStrength() {
  const heading = manualHeading ?? detectorHeading;
  return signalStrength(heading, detectorStartHeading);
}
function signalMessage(strength) {
  const t = words();
  if (detectorReadiness.ready && !detectorListening) return t.signalReady;
  if (!detectorListening) return t.signalNone;
  if (strength > 0.88) return t.signalFound;
  if (strength > 0.62) return t.signalNear;
  return t.signalFaint;
}
function pulse(strength) {
  const interval = 1100 - strength * 820;
  const now = Date.now();
  if (strength < 0.18 || now - lastPulse < interval) return;
  if (navigator.vibrate) navigator.vibrate(Math.round(25 + strength * 85));
  playSignalTone(strength);
  lastPulse = now;
}
function clearDetectorReadyTimer() {
  window.clearTimeout(detectorReadyTimer);
  detectorReadyTimer = null;
}
function enableDetectorFallback(message) {
  detectorListening = false;
  detectorReadiness = { nearSince: null, ready: true };
  showNotice(message);
  render();
}
function updateDetectorSignal(now = Date.now()) {
  const strength = currentSignalStrength();
  const wasReady = detectorReadiness.ready;
  detectorReadiness = updateReadiness(detectorReadiness, strength, now);
  if (detectorReadiness.nearSince !== null && !detectorReadiness.ready && detectorReadyTimer === null) {
    const delay = Math.max(0, detectorReadiness.nearSince + 710 - now);
    detectorReadyTimer = window.setTimeout(() => {
      detectorReadyTimer = null;
      updateDetectorSignal();
      render();
    }, delay);
  }
  if (detectorReadiness.nearSince === null) clearDetectorReadyTimer();
  if (!wasReady && detectorReadiness.ready) {
    if (navigator.vibrate) navigator.vibrate([45, 45, 75]);
    playTone(840, 0, 0.2);
  }
  pulse(strength);
}
function prepareAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
}
function playSignalTone(strength) {
  if (!audioContext || audioContext.state !== 'running') return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 420 + strength * 420;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.035 + strength * 0.035, audioContext.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.13);
}

function playTone(frequency, delay = 0, duration = 0.18, volume = 0.055) {
  if (!audioContext || audioContext.state !== 'running') return;
  const startsAt = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(startsAt);
  oscillator.stop(startsAt + duration + 0.02);
}

function playRitualFeedback(kind) {
  prepareAudio();
  if (kind === 'star') {
    if (navigator.vibrate) navigator.vibrate([55, 70, 85]);
    playTone(620, 0, 0.22, 0.12);
    playTone(880, 0.18, 0.3, 0.14);
    return;
  }
  if (navigator.vibrate) navigator.vibrate(75);
  playTone(660, 0, 0.25, 0.14);
  playTone(880, 0.14, 0.3, 0.13);
}

function stopRitual() {
  ritualToken += 1;
  window.clearTimeout(ritualTimer);
  ritualTimer = null;
  ritual = null;
  scanning = false;
  root.querySelector('.ritual-overlay')?.remove();
  if (navigator.vibrate) navigator.vibrate(0);
}

function applySuccessfulScan(kind) {
  if (kind === 'pair') state = pairWithMoon(state, DEMO_MOON);
  if (kind === 'region') state = unlockRegion(state);
  if (kind === 'task') state = unlockTask(state);
  if (kind === 'star') {
    stopDetector();
    state = completeWithStar(state);
  }
}

function showSuccessfulRitual(kind) {
  const token = ++ritualToken;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ritual = succeedRitual(beginRitual(kind), reducedMotion);
  scanning = false;
  clearNotice();
  playRitualFeedback(kind);
  render();
  ritualTimer = window.setTimeout(() => {
    if (token !== ritualToken) return;
    const overlay = root.querySelector('.ritual-overlay');
    const exitDuration = ritualExitDuration(reducedMotion);
    ritual = finishRitual(ritual);
    applySuccessfulScan(kind);
    render({ preserveRitualOverlay: true });
    if (overlay) {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.setProperty('--ritual-exit-duration', `${exitDuration}ms`);
      requestAnimationFrame(() => overlay.classList.add('is-leaving'));
    }
    ritualTimer = window.setTimeout(() => {
      if (token !== ritualToken) return;
      overlay?.remove();
      ritual = null;
      ritualTimer = null;
    }, exitDuration);
  }, ritual.duration);
}

function performSimulatedScan(kind) {
  if (scanning || ritual) return;
  prepareAudio();
  showSuccessfulRitual(kind);
}
function stopDetector() {
  detectorListening = false;
  manualHeading = null;
  detectorHeading = null;
  detectorStartHeading = null;
  detectorReadiness = createReadiness();
  clearDetectorReadyTimer();
  window.clearTimeout(detectorFallbackTimer);
  detectorFallbackTimer = null;
  lastPulse = 0;
  if (navigator.vibrate) navigator.vibrate(0);
}
async function startDetector() {
  detectorListening = true;
  manualHeading = null;
  detectorReadiness = createReadiness();
  prepareAudio();
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') throw new Error('Compass access was not allowed.');
    }
    if (!orientationListening) {
      orientationListening = true;
      window.addEventListener('deviceorientation', event => {
        if (!shouldUpdateDetector({
          listening: detectorListening,
          screen: state.screen,
          scanning,
          ritualActive: Boolean(ritual)
        })) return;
        const heading = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading : event.alpha;
        if (!Number.isFinite(heading)) return;
        detectorHeading = heading;
        if (detectorStartHeading === null) detectorStartHeading = heading;
        updateDetectorSignal();
        render();
      }, { passive: true });
    }
    detectorFallbackTimer = window.setTimeout(() => {
      detectorFallbackTimer = null;
      if (state.screen === 'detector' && detectorHeading === null && manualHeading === null) {
        enableDetectorFallback(words().sensorFallback);
      }
    }, 2500);
  } catch (error) {
    enableDetectorFallback(words().sensorFallback);
  }
  render();
}

function welcomeMarkup() {
  const t = words();
  return `<section class="screen welcome-screen"><div class="content">
    ${logoMarkup('welcome-logo')}
    <h1 class="welcome-title">${t.title}</h1>
    <h2>${t.hello}</h2>
    <div class="welcome-sun">${roleAsset('sun', 'welcome-sun-art')}</div>
    <button class="primary-button" data-action="start">${icon('sparkle')}${t.start}${icon('arrow')}</button>
  </div></section>`;
}

function pairingMarkup() {
  const t = words();
  return `<section class="screen"><div class="content">
    <p class="eyebrow">${t.pairing}</p><h2>${t.scanMoon}</h2>
    <div class="nfc-orbit">${roleAsset('moon', 'pairing-moon')}<span>${icon('nfc')}</span></div>
    <button class="primary-button" data-action="retry-pair">${icon('nfc')}${t.scanMoon}</button>
    ${devOnly(`<button class="secondary-button" data-action="simulate-pair">${icon('nfc')}${t.demoScan}</button>`)}
  </div></section>`;
}

function introductionMarkup() {
  const t = words();
  const profile = state.moonProfile;
  return `<section class="screen"><div class="content">
    <p class="eyebrow">${t.profile}</p>
    <div class="image-sticker profile-image"><img src="./assets/illustrations/moon-profile.png" alt=""></div>
    <div class="profile-name"><h2>${profile.callName}</h2><span class="task-chip">${icon('pair')}${t.callName}</span></div>
    <div class="mini-facts"><span class="mini-fact">${icon('flower')}${state.language === 'zh' ? '花朵和小狗' : profile.likes}</span></div>
    <div class="speech-strip">${icon('pair')}<span><strong>${t.introduce}</strong><br><small>${t.introHint}</small></span></div>
    <button class="primary-button" data-action="confirm-pair">${icon('check')}${t.met}</button>
  </div></section>`;
}

function homeMarkup() {
  const t = words();
  const regionTasks = getTasksForRegion(state.currentRegionId);
  const taskButtons = regionTasks.map((task, index) => {
    const done = state.completedTaskIds.includes(task.id);
    return `<button class="sticker-button task-${task.kind} task-${task.id}" data-action="nearby-task" data-task-id="${task.id}" style="--task-index:${index}" ${done ? 'disabled' : ''}>
      <span class="task-card-icon">${icon(task.icon)}</span><strong>${taskLabel(task)}</strong><small>+${task.points} ${t.points}</small>
    </button>`;
  }).join('');
  const interaction = currentRegionIsUnlocked()
    ? `<h3 class="nearby-title">${icon('locate')}${t.nearby}</h3>
       <div class="task-scatter">${taskButtons}</div>`
    : `<button class="region-unlock" data-action="unlock-region">
         <span class="region-unlock-roles">${roleAsset('sun', 'unlock-sun')}${roleAsset('moon', 'unlock-moon')}</span>
         <strong>${t.unlockArea}</strong>
         <small>${t.unlockAreaHint}</small>
       </button>`;
  const region = currentRegion();
  return `<section class="home-screen">
    <section class="info-zone">
      <div class="area-line">${roleAsset('sun', 'home-sun')}<span>${t.activity}</span></div>
      <h2 class="area-title"><button type="button" class="area-title-button" data-action="toggle-region-picker" aria-expanded="${regionPickerOpen}"><span>${regionName(region)}</span>${icon('arrow', 'region-title-arrow')}</button></h2>
      ${regionPickerMarkup()}
      <span class="update-pill">${icon('check')} ${t.updated} · ${MOCK_OUTDOOR_STATUS.updatedAt}</span>
      <div class="status-row">
        <div class="status-blob">${icon('thermometer')}<span><strong>${MOCK_OUTDOOR_STATUS.temperatureCelsius}°</strong><small>${t.temp}</small></span></div>
        <div class="status-blob">${icon('footprints')}<span><strong>${MOCK_OUTDOOR_STATUS.steps}</strong><small>${t.steps}</small></span></div>
        <div class="status-blob">${roleAsset('star', 'status-star')}<span><strong>${state.score}</strong><small>${t.points}</small></span></div>
      </div>
    </section>
    <section class="interaction-zone">
      ${interaction}
    </section>
    ${dockMarkup('home')}
  </section>`;
}

function regionScanMarkup() {
  const t = words();
  const region = currentRegion();
  return `<section class="screen"><div class="content">
    <p class="eyebrow">${state.language === 'zh' ? region.areaZh : region.area}</p><h2>${t.regionScan}</h2>
    <div class="moon-scan-panel region-scan-panel">
      ${roleAsset('sun', 'scan-sun')}
      ${roleAsset('moon', 'scan-moon')}
      <span class="scan-link">${icon('nfc')}</span>
    </div>
    <button class="primary-button" data-action="scan-region">${icon('nfc')}${t.scanMoon}</button>
    ${devOnly(`<button class="secondary-button" data-action="simulate-region">${icon('nfc')}${t.demoScan}</button>`)}
  </div>${dockMarkup('')}</section>`;
}

function mapViewMarkup() {
  const t = words();
  return `<section class="screen"><div class="content">
    <p class="eyebrow">${t.parkMap}</p><h2>${t.parkMap}</h2>
    <div class="image-sticker map-image"><img src="./img/map/1120.jpg" alt="${t.parkMap}"></div>
  </div>${dockMarkup('map')}</section>`;
}

function taskMarkup() {
  const t = words();
  const task = activeOrSelectedTask();
  return `<section class="screen task-screen"><div class="content">
    <p class="eyebrow">${t.currentStar}</p>
    <div class="task-heading"><h2>${taskTitle(task)}</h2><span class="points-badge">${roleAsset('star', 'points-star')}+${task.points}</span></div>
    <div class="image-sticker task-image"><img src="${task.illustration}" alt=""></div>
    <p>${taskInstruction(task)}</p>
    <button class="primary-button star-collect-button" data-action="star">${roleAsset('star', 'button-star')}<span>${t.scanStar}</span></button>
    ${devOnly(`<button class="secondary-button" data-action="simulate-star">${icon('nfc')}${t.demoScan}</button>`)}
  </div>${dockMarkup('')}</section>`;
}

function eggScanMarkup() {
  const t = words();
  const task = activeOrSelectedTask();
  return `<section class="screen egg-scan-screen"><div class="content">
    <p class="eyebrow">${t.egg}</p><h2>${taskLabel(task)}</h2>
    <div class="egg-scan-panel moon-scan-panel">
      <div class="egg-art image-sticker"><img src="${task.illustration}" alt=""></div>
      <span class="scan-link">${roleAsset('star', 'egg-scan-star')}</span>
    </div>
    <p class="egg-hint">${t.eggHint}</p>
    <button class="primary-button star-collect-button" data-action="star">${roleAsset('star', 'button-star')}<span>${t.scanStar}</span></button>
    ${devOnly(`<button class="secondary-button" data-action="simulate-star">${icon('nfc')}${t.demoScan}</button>`)}
  </div>${dockMarkup('')}</section>`;
}

function taskScanMarkup() {
  const t = words();
  const task = activeOrSelectedTask();
  return `<section class="screen"><div class="content">
    <p class="eyebrow">${taskArea(task)}</p><h2>${t.taskScan}</h2>
    <div class="moon-scan-panel task-scan-panel">
      ${roleAsset('sun', 'scan-sun')}
      ${roleAsset('moon', 'scan-moon')}
      <span class="scan-link">${icon('nfc')}</span>
      <span class="task-chip">${icon(task.icon)}${taskTitle(task)}</span>
    </div>
    <button class="primary-button" data-action="scan-task">${icon('nfc')}${t.scanMoon}</button>
    ${devOnly(`<button class="secondary-button" data-action="simulate-task">${icon('nfc')}${t.demoScan}</button>`)}
  </div>${dockMarkup('')}</section>`;
}

function detectorMarkup() {
  const t = words();
  const strength = currentSignalStrength();
  const heading = manualHeading ?? detectorHeading;
  const rotation = detectorStartHeading === null || heading === null
    ? 75
    : normalizeAngle(75 - normalizeAngle(heading - detectorStartHeading));
  const task = activeOrSelectedTask();
  return `<section class="screen detector-screen"><div class="content">
    <p class="eyebrow">${t.detector}</p><h2>${taskLabel(task)}</h2>
    <div class="detector ${detectorReadiness.ready ? 'is-ready' : ''}" style="--signal:${strength}; --target-angle:${rotation}deg; --counter-angle:${-rotation}deg; --star-scale:${0.74 + strength * 0.34}">
      <div class="signal-rings"><i></i><i></i><i></i></div>
      <div class="target-track"><span class="detector-task-icon">${icon(task.icon)}</span></div>
      ${roleAsset('sun', 'detector-sun')}
      <strong class="detector-status">${signalMessage(strength)}</strong>
    </div>
    ${detectorReadiness.ready ? `<button class="primary-button detector-next-button" data-action="detector-next">${icon('arrow')}${t.detectorNext}</button>` : ''}
    ${devOnly(`<label>${t.testHeading}<input type="range" min="0" max="360" value="${manualHeading ?? 0}" data-action="test-heading"></label>`)}
  </div>${dockMarkup('')}</section>`;
}

function skyMarkup() {
  const t = words();
  const collected = state.completedTaskIds.map(() => roleAsset('star', 'collected-star')).join('');
  return `<section class="screen sky-screen"><div class="content">
    <p class="eyebrow">${t.sky}</p>
    <div class="sky-score"><h2>${t.sky}</h2><strong>${roleAsset('star', 'sky-score-star')}${state.score}</strong></div>
    <div class="star-field">${collected}<i>✦</i><i>✦</i><i>✦</i><i>✦</i></div>
    <h3>${t.community}</h3>
    <div class="community-strip">${COMMUNITY_TEAMS.map(team => `<span>${team.name} · ${team.stars}${roleAsset('star', 'community-star')}</span>`).join('')}</div>
    ${devOnly(`<button class="secondary-button" data-action="reset">${icon('reset')}${t.reset}</button>`)}
  </div>${dockMarkup('sky')}</section>`;
}

function ritualMarkup() {
  if (!ritual || ritual.phase === 'error' || ritual.phase === 'complete') return '';
  const t = words();
  const isStar = ritual.kind === 'star';
  if (ritual.phase === 'scanning') {
    return `<section class="ritual-overlay ritual-scanning" role="status" aria-live="assertive">
      <div class="ritual-stage">
        <div class="ritual-waves" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="ritual-reader">${icon('nfc')}</div>
        <strong>${isStar ? t.scanningStar : t.scanningMoon}</strong>
      </div>
    </section>`;
  }

  if (isStar) {
    return `<section class="ritual-overlay ritual-star is-success" role="status" aria-live="assertive">
      <div class="ritual-stage">
        <div class="ritual-sky">
          <strong>${t.sky}</strong>
          <i>✦</i><i>✦</i><i>✦</i>
          ${ritualAsset('star', 'ritual-star-collected')}
        </div>
        <div class="ritual-waves" aria-hidden="true"><i></i><i></i><i></i></div>
        ${ritualAsset('star', 'ritual-new-star')}
        <div class="ritual-partners">
          ${ritualAsset('sun', 'ritual-sun')}
          ${ritualAsset('moon', 'ritual-moon')}
        </div>
        <div class="ritual-sparks" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div>
        <div class="ritual-result"><strong>${t.starSuccess}</strong><small>${t.intoSky}</small></div>
      </div>
    </section>`;
  }

  if (ritual.kind === 'region' || ritual.kind === 'task') {
    const isRegion = ritual.kind === 'region';
    const task = isRegion ? null : activeOrSelectedTask();
    const region = currentRegion();
    const regionTasks = getTasksForRegion(state.currentRegionId);
    const stampLabel = isRegion
      ? (state.language === 'zh' ? region.areaZh : region.area)
      : taskArea(task);
    const discovery = isRegion
      ? `<span class="region-discovery-icons">${regionTasks.slice(0, 7).map(item => icon(item.icon)).join('')}</span><strong>${regionTasks.length} ${t.nearby}</strong>`
      : `${icon(task.icon)}<strong>${taskLabel(task)}</strong>`;
    return `<section class="ritual-overlay ritual-arrival is-success" role="status" aria-live="assertive">
      <div class="ritual-stage">
        <div class="arrival-sky" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="arrival-beacon">
          <div class="arrival-beacon-rings" aria-hidden="true"><i></i><i></i></div>
          ${ritualAsset('moon', 'arrival-moon')}
        </div>
        ${ritualAsset('sun', 'arrival-sun')}
        <div class="arrival-map-ripple" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="arrival-stamp"><span>${icon('locate')}</span><strong>${stampLabel}</strong></div>
        <div class="arrival-task ${isRegion ? 'arrival-region-tasks' : ''}">${discovery}</div>
        <div class="ritual-result"><strong>${isRegion ? t.regionSuccess : t.arrivalSuccess}</strong><small>${isRegion ? t.regionReady : t.taskReady}</small></div>
      </div>
    </section>`;
  }

  return `<section class="ritual-overlay ritual-pair is-success" role="status" aria-live="assertive">
    <div class="ritual-stage">
      <div class="ritual-waves" aria-hidden="true"><i></i><i></i><i></i></div>
      ${ritualAsset('sun', 'ritual-sun')}
      ${ritualAsset('moon', 'ritual-moon')}
      <i class="ritual-connection" aria-hidden="true"></i>
      <div class="ritual-partner-sticker">
        ${ritualAsset('sun', 'ritual-sticker-sun')}
        ${ritualAsset('moon', 'ritual-sticker-moon')}
      </div>
      <div class="ritual-sparks" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div>
      <div class="ritual-result"><strong>${t.pairSuccess}</strong><small>${t.together}</small></div>
    </div>
  </section>`;
}

function currentScreenMarkup() {
  const screens = {
    welcome: welcomeMarkup, pairing: pairingMarkup, introduction: introductionMarkup, home: homeMarkup,
    'region-scan': regionScanMarkup, 'task-scan': taskScanMarkup, 'map-view': mapViewMarkup,
    task: taskMarkup, 'egg-scan': eggScanMarkup, detector: detectorMarkup,
    sky: skyMarkup
  };
  return screens[state.screen]();
}

function render({ preserveRitualOverlay = false } = {}) {
  const t = words();
  const screenChanged = renderedScreen !== state.screen;
  renderedScreen = state.screen;
  document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : 'en';
  document.title = t.title;
  appShell.dataset.screen = state.screen;
  document.querySelector('.brand-lockup small').textContent = t.activity;
  document.querySelector('.brand-lockup strong').textContent = t.title;
  languageSelect.value = state.language;
  homeButton.innerHTML = icon('back');
  homeButton.setAttribute('aria-label', t.nearby);
  homeButton.title = t.nearby;
  homeButton.hidden = !state.paired || state.screen === 'home';
  if (preserveRitualOverlay) {
    const overlay = root.querySelector('.ritual-overlay');
    [...root.children].forEach(child => {
      if (child !== overlay) child.remove();
    });
    root.insertAdjacentHTML('afterbegin', currentScreenMarkup());
  } else {
    root.innerHTML = currentScreenMarkup() + ritualMarkup();
  }
  if (screenChanged) requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
}

async function performScan(kind) {
  if (scanning || ritual) return;
  scanning = true;
  prepareAudio();
  clearNotice();
  ritual = beginRitual(kind);
  render();
  try {
    await scanTag();
    showSuccessfulRitual(kind);
  } catch (error) {
    ritual = failRitual(ritual);
    scanning = false;
    render();
    ritual = null;
    showNotice(error.message === 'NFC is not available in this browser. Use Android Chrome or the demo button.' ? words().nfcError : error.message);
  }
}

root.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  clearNotice();
  if (action === 'toggle-region-picker') {
    regionPickerOpen = !regionPickerOpen;
    render();
    return;
  }
  if (action === 'change-region') {
    stopDetector();
    regionPickerOpen = false;
    state = setCurrentRegion(state, control.dataset.regionId);
    render();
    return;
  }
  if (action === 'start') {
    state = startActivity(state);
    render();
    performScan('pair');
    return;
  }
  if (action === 'retry-pair') performScan('pair');
  if (action === 'scan-region') performScan('region');
  if (action === 'scan-task') performScan('task');
  if (action === 'star') performScan('star');
  if (action === 'unlock-region') state = beginRegionScan(state);
  if (action === 'nearby-task') {
    stopDetector();
    state = openNearbyTask(state, control.dataset.taskId);
    render();
    if (state.screen === 'detector') startDetector();
    return;
  }
  if (action === 'detector-next') {
    stopDetector();
    state = completeDetector(state);
    render();
    return;
  }
  if (action === 'simulate-pair') performSimulatedScan('pair');
  if (action === 'confirm-pair') state = confirmPair(state);
  if (action === 'simulate-region') performSimulatedScan('region');
  if (action === 'simulate-task') performSimulatedScan('task');
  if (action === 'simulate-star') performSimulatedScan('star');
  if (action === 'view-map') { stopDetector(); regionPickerOpen = false; state = openMapBackup(state); }
  if (action === 'sky') { stopDetector(); regionPickerOpen = false; state = showSky(state); }
  if (action === 'home') { stopDetector(); regionPickerOpen = false; state = goHome(state); }
  if (action === 'reset') { stopRitual(); stopDetector(); state = createInitialState(); }
  render();
});

root.addEventListener('change', event => {
  if (event.target.dataset.action === 'set-region') {
    stopDetector();
    state = setCurrentRegion(state, event.target.value);
    clearNotice();
    render();
    return;
  }
  if (event.target.dataset.action === 'test-heading') {
    manualHeading = Number(event.target.value);
    detectorListening = true;
    detectorStartHeading = 0;
    updateDetectorSignal();
    render();
  }
});

languageSelect.addEventListener('change', event => {
  state = setLanguage(state, event.target.value);
  clearNotice();
  render();
});
homeButton.addEventListener('click', () => {
  stopRitual();
  stopDetector();
  state = goHome(state);
  regionPickerOpen = false;
  clearNotice();
  render();
});
appTitle.addEventListener('pointerdown', () => {
  devPressTimer = setTimeout(() => {
    state = toggleDevMode(state);
    clearNotice();
    render();
  }, 1200);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(type => appTitle.addEventListener(type, () => clearTimeout(devPressTimer)));
window.addEventListener('pagehide', () => {
  stopRitual();
  stopDetector();
});

if (!canScanNfc()) showNotice(words().unavailable);
render();
