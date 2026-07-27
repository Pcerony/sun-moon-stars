import { COMMUNITY_TEAMS, MOCK_OUTDOOR_STATUS, TASKS } from './tasks.js';
import { icon } from './icons.js';
import {
  activateMoon, completeWithStar, confirmPair, confirmStarKeeperFound, continueExploring, createInitialState,
  goHome, openDetector, openMapBackup, openNearbyTask, pairWithMoon, selectDemoTask, setLanguage,
  showSky, startActivity, toggleDevMode
} from './state.js';
import { canScanNfc, scanTag } from './nfc.js';
import {
  beginRitual,
  failRitual,
  finishRitual,
  succeedRitual
} from './ritual.js';

const TEXT = {
  en: {
    activity: 'DAHU PARK', title: 'Sun & Moon', unavailable: 'NFC needs Android Chrome and an NFC-enabled phone.',
    nfcError: 'NFC is not available in this browser.', hello: 'Explore together', start: 'Start',
    pairing: 'Meet your Moon', scanMoon: 'Scan Moon', scanMoonHint: 'Hold the Moon necklace near the phone.',
    profile: 'Moon profile', callName: 'Call me', likes: 'Likes', introduce: 'Your turn',
    introHint: 'Say your name and one thing you like.', met: 'Ready',
    nearby: 'Nearby', lakeArea: 'Lakeside', updated: 'updated', temp: 'temperature', steps: 'steps', points: 'points',
    paperMap: "Moon's paper map", followMoon: 'Follow the Moon', mapHint: 'Find this place together.',
    scanToStart: 'Scan Moon', currentStar: 'Star task', detector: 'Detector', scanStar: 'Collect Star',
    scanStarHint: 'Hold the Star badge near the phone.', detectorStart: 'Listen', detectorFound: 'Found',
    signalNone: 'Listening…', signalFaint: 'Faint', signalNear: 'Nearby', signalFound: 'Here!',
    collected: 'Star collected', sky: 'Our sky', continue: 'Continue', parkMap: 'Backup map',
    community: 'Today', reset: 'Reset', demoTools: 'Test controls', demoScan: 'Simulate scan',
    demoLocation: 'Task', testHeading: 'Heading', scanningMoon: 'Listening for Moon…',
    scanningStar: 'Listening for a Star…', pairSuccess: 'Partners!', together: 'Let’s go together',
    starSuccess: 'Star collected!', intoSky: 'Added to our sky'
  },
  zh: {
    activity: '大濠公园', title: '太阳与月亮', unavailable: 'NFC 需要使用支持 NFC 的 Android Chrome 手机。',
    nfcError: '此浏览器暂时不能使用 NFC。', hello: '一起出发吧', start: '开始',
    pairing: '认识月亮', scanMoon: '扫描月亮', scanMoonHint: '把月亮项链贴近手机。',
    profile: '月亮名片', callName: '请叫我', likes: '我喜欢', introduce: '轮到太阳',
    introHint: '说出你的名字和一件喜欢的事。', met: '准备好了',
    nearby: '附近任务', lakeArea: '湖畔区', updated: '刚刚更新', temp: '温度', steps: '步数', points: '积分',
    paperMap: '月亮的纸地图', followMoon: '跟着月亮', mapHint: '一起找到这个地方。',
    scanToStart: '扫描月亮', currentStar: '星星任务', detector: '探测', scanStar: '收集星星',
    scanStarHint: '把星星勋章贴近手机。', detectorStart: '开始感应', detectorFound: '找到了',
    signalNone: '正在聆听…', signalFaint: '微弱', signalNear: '就在附近', signalFound: '就在这里！',
    collected: '收集成功', sky: '我们的星空', continue: '继续探索', parkMap: '备用地图',
    community: '今日星光', reset: '重置', demoTools: '测试控制', demoScan: '模拟扫描',
    demoLocation: '任务', testHeading: '测试方向', scanningMoon: '正在感应月亮…',
    scanningStar: '正在感应星星…', pairSuccess: '伙伴配对成功', together: '一起出发吧',
    starSuccess: '共同收藏成功', intoSky: '已放入我们的星空'
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
let orientationListening = false;
let audioContext = null;
let renderedScreen = null;
let ritual = null;
let ritualTimer = null;
let ritualToken = 0;
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
function starName(task) { return state.language === 'zh' ? task.starZh : task.star; }
function taskArea(task) { return state.language === 'zh' ? task.areaZh : task.area; }
function showNotice(message) { notice.textContent = message; notice.hidden = false; }
function clearNotice() { notice.hidden = true; notice.textContent = ''; }
function activeOrSelectedTask() { return TASKS[state.activeTaskId || state.selectedTaskId]; }
function devOnly(markup) { return state.devMode ? `<details class="demo-panel" open><summary>${words().demoTools}</summary>${markup}</details>` : ''; }
function logoMarkup(className = '') {
  return `<img class="brand-logo ${className}" src="./assets/branding/logo.png" alt="">`;
}
function ritualAsset(name, className = '') {
  return `<img class="ritual-asset ${className}" src="./assets/ritual/${name}.png" alt="">`;
}
function taskOptions() {
  return Object.values(TASKS).map(task => `<option value="${task.id}" ${task.id === state.selectedTaskId ? 'selected' : ''}>${taskTitle(task)}</option>`).join('');
}

function dockMarkup(active) {
  const t = words();
  return `<nav class="bottom-dock" aria-label="${t.title}">
    <button class="dock-button dock-home ${active === 'home' ? 'active' : ''}" data-action="home" aria-label="${t.nearby}" title="${t.nearby}">${logoMarkup('dock-logo')}</button>
    <button class="dock-button ${active === 'sky' ? 'active' : ''}" data-action="sky" aria-label="${t.sky}" title="${t.sky}">${icon('star')}</button>
    <button class="dock-button ${active === 'map' ? 'active' : ''}" data-action="view-map" aria-label="${t.parkMap}" title="${t.parkMap}">${icon('map')}</button>
  </nav>`;
}

function normalizeAngle(angle) { return ((angle % 360) + 360) % 360; }
function angleDistance(a, b) { return Math.abs(((a - b + 540) % 360) - 180); }
function signalStrength() {
  const heading = manualHeading ?? detectorHeading;
  if (heading === null || detectorStartHeading === null) return 0.08;
  const relativeHeading = normalizeAngle(heading - detectorStartHeading);
  return Math.max(0.08, 1 - angleDistance(relativeHeading, 75) / 145);
}
function signalMessage(strength) {
  const t = words();
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

function playTone(frequency, delay = 0, duration = 0.18) {
  if (!audioContext || audioContext.state !== 'running') return;
  const startsAt = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.055, startsAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(startsAt);
  oscillator.stop(startsAt + duration + 0.02);
}

function playRitualFeedback(kind) {
  prepareAudio();
  if (kind === 'star') {
    if (navigator.vibrate) navigator.vibrate([55, 70, 85]);
    playTone(620, 0, 0.2);
    playTone(880, 0.2, 0.24);
    return;
  }
  if (navigator.vibrate) navigator.vibrate(75);
  playTone(720, 0, 0.25);
}

function stopRitual() {
  ritualToken += 1;
  window.clearTimeout(ritualTimer);
  ritualTimer = null;
  ritual = null;
  scanning = false;
  if (navigator.vibrate) navigator.vibrate(0);
}

function applySuccessfulScan(kind) {
  if (kind === 'pair') state = pairWithMoon(state, DEMO_MOON);
  if (kind === 'moon') state = activateMoon(state);
  if (kind === 'star') state = completeWithStar(state);
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
    ritual = finishRitual(ritual);
    applySuccessfulScan(kind);
    ritual = null;
    ritualTimer = null;
    render();
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
  lastPulse = 0;
  if (navigator.vibrate) navigator.vibrate(0);
}
async function startDetector() {
  detectorListening = true;
  manualHeading = null;
  prepareAudio();
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') throw new Error('Compass access was not allowed.');
    }
    if (!orientationListening) {
      orientationListening = true;
      window.addEventListener('deviceorientation', event => {
        if (!detectorListening || state.screen !== 'detector') return;
        const heading = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading : event.alpha;
        if (!Number.isFinite(heading)) return;
        detectorHeading = heading;
        if (detectorStartHeading === null) detectorStartHeading = heading;
        pulse(signalStrength());
        render();
      }, { passive: true });
    }
  } catch (error) {
    showNotice(error.message);
  }
  render();
}

function welcomeMarkup() {
  const t = words();
  return `<section class="screen welcome-screen"><div class="content">
    ${logoMarkup('welcome-logo')}
    <p class="eyebrow">${t.activity}</p>
    <h2>${t.hello}</h2>
    <div class="image-sticker welcome-image"><img src="./assets/illustrations/welcome-pair.png" alt=""></div>
    <button class="primary-button" data-action="start">${icon('sparkle')}${t.start}${icon('arrow')}</button>
  </div></section>`;
}

function pairingMarkup() {
  const t = words();
  return `<section class="screen"><div class="content">
    <p class="eyebrow">${t.pairing}</p><h2>${t.scanMoon}</h2>
    <div class="nfc-orbit">${icon('nfc')}</div>
    <button class="primary-button" data-action="pair-moon">${icon('nfc')}${t.scanMoon}</button>
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
  const taskButtons = Object.values(TASKS).map((task, index) => {
    const done = state.completedTaskIds.includes(task.id);
    return `<button class="sticker-button task-${task.id}" data-action="nearby-task" data-task-id="${task.id}" ${done ? 'disabled' : ''}>
      ${icon(task.icon)}<strong>${taskTitle(task)}</strong><small>+${task.points} ${t.points}</small>
    </button>`;
  }).join('');
  return `<section class="home-screen">
    <section class="info-zone">
      <div class="area-line">${icon('locate')}<span>${t.activity}</span></div>
      <h2 class="area-title">${t.lakeArea}</h2>
      <span class="update-pill">${icon('check')} ${t.updated} · ${MOCK_OUTDOOR_STATUS.updatedAt}</span>
      <div class="status-row">
        <div class="status-blob">${icon('thermometer')}<span><strong>${MOCK_OUTDOOR_STATUS.temperatureCelsius}°</strong><small>${t.temp}</small></span></div>
        <div class="status-blob">${icon('footprints')}<span><strong>${MOCK_OUTDOOR_STATUS.steps}</strong><small>${t.steps}</small></span></div>
        <div class="status-blob">${icon('star')}<span><strong>${state.score}</strong><small>${t.points}</small></span></div>
      </div>
    </section>
    <section class="interaction-zone">
      <h3 class="nearby-title">${icon('locate')}${t.nearby}</h3>
      <div class="task-scatter">${taskButtons}</div>
    </section>
    ${dockMarkup('home')}
  </section>`;
}

function mapMarkup() {
  const t = words();
  const task = activeOrSelectedTask();
  return `<section class="screen"><div class="content">
    <p class="eyebrow">${t.paperMap}</p><h2>${t.followMoon}</h2>
    <div class="paper-prompt">
      ${icon('map')}
      <span class="task-chip">${icon(task.icon)}${taskArea(task)}</span>
      <p>${t.mapHint}</p>
    </div>
    <button class="primary-button" data-action="moon">${icon('nfc')}${t.scanToStart}</button>
    ${devOnly(`<label>${t.demoLocation}<select data-action="select-task">${taskOptions()}</select></label><button class="secondary-button" data-action="simulate-moon">${icon('nfc')}${t.demoScan}</button>`)}
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
    <div class="task-heading"><h2>${taskTitle(task)}</h2><span class="points-badge">${icon('star')}+${task.points}</span></div>
    <div class="image-sticker task-image"><img src="${task.illustration}" alt=""></div>
    <p>${taskInstruction(task)}</p>
    <div class="task-actions">
      <button class="icon-action" data-action="detector">${icon('detector')}<span>${t.detector}</span></button>
      <button class="icon-action" data-action="star">${icon('nfc')}<span>${t.scanStar}</span></button>
    </div>
    ${devOnly(`<button class="secondary-button" data-action="simulate-star">${icon('nfc')}${t.demoScan}</button>`)}
  </div>${dockMarkup('')}</section>`;
}

function detectorMarkup() {
  const t = words();
  const strength = signalStrength();
  const rotation = manualHeading ?? detectorHeading ?? 0;
  const task = activeOrSelectedTask();
  return `<section class="screen detector-screen"><div class="content">
    <p class="eyebrow">${t.detector}</p><h2>${taskTitle(task)}</h2>
    <div class="detector" style="--signal:${strength}; --rotation:${rotation}deg">
      <div class="signal-rings"><i></i><i></i><i></i></div>
      <div class="compass-arrow">${icon('locate')}</div>
      <strong>${signalMessage(strength)}</strong>
    </div>
    <div class="actions">
      <button class="primary-button" data-action="start-detector">${icon('detector')}${t.detectorStart}</button>
      <button class="secondary-button" data-action="found-keeper">${icon('check')}${t.detectorFound}</button>
    </div>
    ${devOnly(`<label>${t.testHeading}<input type="range" min="0" max="360" value="${manualHeading ?? 0}" data-action="test-heading"></label>`)}
  </div>${dockMarkup('')}</section>`;
}

function completeMarkup() {
  const t = words();
  const task = TASKS[state.completedTaskIds.at(-1)];
  return `<section class="screen completion-screen"><div class="content">
    <p class="eyebrow">${t.collected}</p>
    <div class="big-star">${icon('star')}</div>
    <h2>${starName(task)}</h2>
    <p class="score-pop">+${task.points}</p>
    <div class="actions">
      <button class="primary-button" data-action="sky">${icon('star')}${t.sky}</button>
      <button class="secondary-button" data-action="continue">${icon('walk')}${t.continue}</button>
    </div>
  </div>${dockMarkup('')}</section>`;
}

function skyMarkup() {
  const t = words();
  const collected = state.completedTaskIds.map(() => icon('star', 'collected')).join('');
  return `<section class="screen sky-screen"><div class="content">
    <p class="eyebrow">${t.sky}</p>
    <div class="sky-score"><h2>${t.sky}</h2><strong>${state.score}</strong></div>
    <div class="star-field">${collected}${icon('star')}${icon('star')}${icon('star')}${icon('star')}</div>
    <h3>${t.community}</h3>
    <div class="community-strip">${COMMUNITY_TEAMS.map(team => `<span>${team.name} · ${team.stars}${icon('star')}</span>`).join('')}</div>
    <button class="secondary-button" data-action="continue">${icon('walk')}${t.continue}</button>
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

function render() {
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
  const screens = {
    welcome: welcomeMarkup, pairing: pairingMarkup, introduction: introductionMarkup, home: homeMarkup,
    map: mapMarkup, 'map-view': mapViewMarkup, task: taskMarkup, detector: detectorMarkup,
    complete: completeMarkup, sky: skyMarkup
  };
  root.innerHTML = screens[state.screen]() + ritualMarkup();
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
  if (!control || control.dataset.action === 'select-task') return;
  const action = control.dataset.action;
  clearNotice();
  if (action === 'start') state = startActivity(state);
  if (action === 'pair-moon') performScan('pair');
  if (action === 'moon') performScan('moon');
  if (action === 'star') performScan('star');
  if (action === 'detector') { stopDetector(); state = openDetector(state); }
  if (action === 'start-detector') startDetector();
  if (action === 'found-keeper') { stopDetector(); state = confirmStarKeeperFound(state); }
  if (action === 'simulate-pair') performSimulatedScan('pair');
  if (action === 'confirm-pair') state = confirmPair(state);
  if (action === 'nearby-task') state = openNearbyTask(state, control.dataset.taskId);
  if (action === 'simulate-moon') performSimulatedScan('moon');
  if (action === 'simulate-star') performSimulatedScan('star');
  if (action === 'view-map') state = openMapBackup(state);
  if (action === 'sky') state = showSky(state);
  if (action === 'home' || action === 'continue') state = action === 'home' ? goHome(state) : continueExploring(state);
  if (action === 'reset') { stopRitual(); state = createInitialState(); }
  render();
});

root.addEventListener('change', event => {
  if (event.target.dataset.action === 'select-task') {
    state = selectDemoTask(state, event.target.value);
    render();
  }
  if (event.target.dataset.action === 'test-heading') {
    manualHeading = Number(event.target.value);
    detectorListening = true;
    detectorStartHeading = 0;
    pulse(signalStrength());
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
window.addEventListener('pagehide', stopRitual);

if (!canScanNfc()) showNotice(words().unavailable);
render();
