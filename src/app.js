import { COMMUNITY_TEAMS, TASKS } from './tasks.js';
import {
  activateMoon, completeWithStar, confirmPair, confirmStarKeeperFound, continueExploring, createInitialState,
  goHome, openDetector, openMap, openMapBackup, pairWithMoon, selectDemoTask, setLanguage, showSky, startActivity, toggleDevMode
} from './state.js';
import { canScanNfc, scanTag } from './nfc.js';

const TEXT = {
  en: {
    activity: 'DAHU PARK ACTIVITY', title: 'Sun and Moon', unavailable: 'NFC is not available here. Please use Android Chrome on an NFC-enabled phone.',
    nfcError: 'NFC is not available in this browser. Please use Android Chrome.', shared: 'A shared park activity', collect: 'Collect stars together.',
    intro: 'The Moon carries the paper map. The Sun uses this phone to scan the Moon necklace and Star badges.', start: 'Start activity', scanMoonHint: 'Hold the Moon necklace against the phone.', scanStarHint: 'Hold the Star badge against the phone.',
    pairing: 'Meet your Moon', pairingText: 'Scan the Moon necklace to begin getting to know each other.', pairingScan: 'Scan Moon necklace', profile: 'Moon profile', callName: 'Please call me', likes: 'I like',
    sunPrompt: 'Now, please introduce yourself: your name, how you like to be addressed, and something you enjoy.', mapPrompt: 'Moon, please write the Sun’s information in the partner space on your paper map.', met: 'We have met', home: 'Our journey', homeWelcome: 'The Sun and Moon are ready to explore.', findNext: 'Find a Star', map: 'View Moon’s map', scoreboard: 'View the sky', backupMap: 'Park map', lake: 'Lake', dogZone: 'Friendly dog', flowerZone: 'Flower garden', youAreHere: 'You are here',
    follow: "Follow the Moon's map.", route: 'Find a Star keeper together. This phone does not show the route.', ready: 'Ready at:', scanMoon: 'Scan Moon necklace', demoMoon: 'Demo: Moon scan',
    demoLocation: 'Demo location', currentStar: 'Current Star', taskReady: 'When you are ready, ask the Star keeper for their badge.', scanStar: 'Scan Star badge', demoStar: 'Demo: Star scan', demoTools: 'Testing without NFC',
    findStar: 'Find the Star keeper', detector: 'Star detector', detectorStart: 'Start sensing', detectorFound: 'We found the Star keeper', signalNone: 'Listening for a Star...', signalFaint: 'A faint signal', signalNear: 'The Star is nearby', signalFound: 'The Star is right here', testHeading: 'Test heading',
    collected: 'Star collected', completed: 'You completed {task} together.', seeSky: 'See our sky', another: 'Find another Star', ourSky: 'Our sky', teamPoints: 'team points', stars: 'Stars collected', none: 'No Stars collected yet.',
    parkSky: 'Park sky', parkText: '18 Stars have been collected by 6 teams today.', reset: 'Reset demo', teamSuffix: 'Stars'
  },
  zh: {
    activity: '大濠公园活动', title: '太阳与月亮', unavailable: '此设备暂时不能使用 NFC，请用已开启 NFC 的 Android Chrome。', nfcError: '此浏览器不能使用 NFC。请用 Android Chrome。', shared: '一场共同探索的公园活动', collect: '一起收集星星。',
    intro: '月亮拿着纸质地图，太阳用手机扫描月亮项链和星星勋章。', start: '开始活动', scanMoonHint: '请把月亮项链贴近手机。', scanStarHint: '请把星星勋章贴近手机。',
    pairing: '认识你的月亮', pairingText: '扫描月亮项链，开始认识彼此。', pairingScan: '扫描月亮项链', profile: '月亮名片', callName: '希望别人称呼我', likes: '我喜欢',
    sunPrompt: '现在请太阳口述：你的名字、希望别人怎样称呼你，以及一件你喜欢的东西。', mapPrompt: '请月亮把太阳的信息写在纸质地图的“伙伴栏”里。', met: '我们认识了', home: '我们的旅程', homeWelcome: '太阳和月亮已经准备好一起探索。', findNext: '寻找一颗星星', map: '查看月亮的地图', scoreboard: '查看星空', backupMap: '公园地图', lake: '湖', dogZone: '友善的小狗', flowerZone: '花园', youAreHere: '你在这里',
    follow: '跟着月亮的地图前进。', route: '一起找到星星守护者。这部手机不显示路线。', ready: '当前演示地点：', scanMoon: '扫描月亮项链', demoMoon: '演示：扫描月亮',
    demoLocation: '演示地点', currentStar: '当前星星任务', taskReady: '完成后，请向星星守护者领取勋章。', scanStar: '扫描星星勋章', demoStar: '演示：扫描星星', demoTools: '无 NFC 时的演示工具',
    findStar: '寻找星星守护者', detector: '星星探测器', detectorStart: '开始感应', detectorFound: '我们找到星星守护者了', signalNone: '正在聆听星星的信号……', signalFaint: '有微弱的信号', signalNear: '星星就在附近', signalFound: '星星就在这里', testHeading: '测试方向',
    collected: '已收集星星', completed: '你们一起完成了“{task}”。', seeSky: '查看我们的星空', another: '寻找另一颗星星', ourSky: '我们的星空', teamPoints: '队伍积分', stars: '已收集的星星', none: '还没有收集到星星。',
    parkSky: '公园星空', parkText: '今天已有 6 支队伍收集了 18 颗星星。', reset: '重置演示', teamSuffix: '颗星星'
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
const root = document.querySelector('#app');
const notice = document.querySelector('#notice');
const languageSelect = document.querySelector('#language-select');
const homeButton = document.querySelector('#home-button');
const appTitle = document.querySelector('.app-header h1');
let devPressTimer;

function words() { return TEXT[state.language]; }
function taskTitle(task) { return state.language === 'zh' ? task.titleZh : task.title; }
function taskInstruction(task) { return state.language === 'zh' ? task.instructionZh : task.instruction; }
function starName(task) { return state.language === 'zh' ? task.starZh : task.star; }
function format(text, values) { return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? ''); }
function showNotice(message) { notice.textContent = message; notice.hidden = false; }
function clearNotice() { notice.hidden = true; notice.textContent = ''; }
function activeOrSelectedTask() { return TASKS[state.activeTaskId || state.selectedTaskId]; }
function taskOptions() { return Object.values(TASKS).map(task => `<option value="${task.id}" ${task.id === state.selectedTaskId ? 'selected' : ''}>${taskTitle(task)}</option>`).join(''); }
function devOnly(markup) { return state.devMode ? markup : ''; }

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
  return `<section class="screen"><p class="eyebrow">${t.shared}</p><h2>${t.collect}</h2><p>${t.intro}</p><div class="actions"><button data-action="start">${t.start}</button></div></section>`;
}

function pairingMarkup() {
  const t = words();
  return `<section class="screen"><p class="eyebrow">${t.pairing}</p><h2>${t.pairing}</h2><p>${t.pairingText}</p><div class="actions"><button data-action="pair-moon">${t.pairingScan}</button></div>${devOnly(`<details open><summary>${t.demoTools}</summary><button class="secondary" data-action="simulate-pair">${t.demoMoon}</button></details>`)}</section>`;
}

function introductionMarkup() {
  const t = words(); const profile = state.moonProfile;
  return `<section class="screen"><p class="eyebrow">${t.profile}</p><div class="card"><h2>${profile.name}</h2><p><strong>${t.callName}:</strong> ${profile.callName}</p><p><strong>${t.likes}:</strong> ${profile.likes}</p></div><div class="card"><h3>${t.sunPrompt}</h3><p>${t.mapPrompt}</p></div><div class="actions"><button data-action="confirm-pair">${t.met}</button></div></section>`;
}

function homeMarkup() {
  const t = words();
  return `<section class="screen"><p class="eyebrow">${t.home}</p><h2>${t.home}</h2><p>${t.homeWelcome}</p><div class="card"><p class="score">${state.score}</p><p>${t.teamPoints}</p></div><div class="actions"><button data-action="open-map">${t.findNext}</button><button data-action="view-map">${t.map}</button><button data-action="sky">${t.scoreboard}</button></div></section>`;
}

function mapViewMarkup() {
  const t = words();
  return `<section class="screen"><p class="eyebrow">${t.backupMap}</p><h2>${t.backupMap}</h2><div class="park-map" role="img" aria-label="Park map with lake, friendly dog, and flower garden"><div class="lake">${t.lake}</div><div class="map-path path-one"></div><div class="map-path path-two"></div><div class="map-marker marker-dog">&#9733;<span>${t.dogZone}</span></div><div class="map-marker marker-flowers">&#9733;<span>${t.flowerZone}</span></div><div class="map-you">&#9679;<span>${t.youAreHere}</span></div></div></section>`;
}

function mapMarkup() {
  const t = words(); const task = activeOrSelectedTask();
  return `<section class="screen"><p class="eyebrow">${t.follow}</p><h2>${t.follow}</h2><p>${t.route}</p><div class="card"><p class="status">${t.ready} ${taskTitle(task)}</p><div class="actions"><button data-action="moon">${t.scanMoon}</button></div>${devOnly(`<div class="demo-control"><label>${t.demoLocation}<select data-action="select-task">${taskOptions()}</select></label><button class="secondary" data-action="simulate-moon">${t.demoMoon}</button></div>`)}</div></section>`;
}

function taskMarkup() {
  const t = words(); const task = activeOrSelectedTask();
  return `<section class="screen"><p class="eyebrow">${t.currentStar}</p><div class="card"><h2>${taskTitle(task)}</h2><p>${taskInstruction(task)}</p></div><div class="actions"><button data-action="detector">${t.findStar}</button></div><p>${t.taskReady}</p><div class="actions"><button data-action="star">${t.scanStar}</button></div>${devOnly(`<details open><summary>${t.demoTools}</summary><button class="secondary" data-action="simulate-star">${t.demoStar}</button></details>`)}</section>`;
}

function detectorMarkup() {
  const t = words();
  const strength = signalStrength();
  const rotation = manualHeading ?? detectorHeading ?? 0;
  const task = activeOrSelectedTask();
  return `<section class="screen detector-screen"><p class="eyebrow">${t.detector}</p><h2>${taskTitle(task)}</h2><div class="detector" style="--signal:${strength}; --rotation:${rotation}deg"><div class="signal-rings"><i></i><i></i><i></i></div><div class="compass-arrow">&#9650;</div><strong>${signalMessage(strength)}</strong></div><div class="actions"><button data-action="start-detector">${t.detectorStart}</button><button data-action="found-keeper">${t.detectorFound}</button></div>${devOnly(`<div class="demo-control"><label>${t.testHeading}<input type="range" min="0" max="360" value="${manualHeading ?? 0}" data-action="test-heading"></label></div>`)}</section>`;
}

function completeMarkup() {
  const t = words(); const task = TASKS[state.completedTaskIds.at(-1)];
  return `<section class="screen"><p class="eyebrow">${t.collected}</p><div class="card"><h2>${starName(task)}</h2><p>${format(t.completed, { task: taskTitle(task) })}</p><p class="score">+${task.points}</p></div><div class="actions"><button data-action="sky">${t.seeSky}</button><button class="secondary" data-action="continue">${t.another}</button></div></section>`;
}

function skyMarkup() {
  const t = words();
  const stars = state.completedTaskIds.map(id => `<li>${starName(TASKS[id])}</li>`).join('') || `<li>${t.none}</li>`;
  const filledStars = state.completedTaskIds.map(() => '<span class="collected" aria-label="Collected Star">*</span>').join('');
  return `<section class="screen"><p class="eyebrow">${t.ourSky}</p><div class="card"><p class="score">${state.score}</p><p>${t.teamPoints}</p></div><div class="sky" aria-label="Team sky">${filledStars}<span>*</span><span>*</span><span>*</span></div><div class="card"><h3>${t.stars}</h3><ul class="star-list">${stars}</ul></div><div class="card"><h3>${t.parkSky}</h3><p>${t.parkText}</p><ul class="team-list">${COMMUNITY_TEAMS.map(team => `<li>${team.name}: ${team.stars} ${t.teamSuffix}</li>`).join('')}</ul></div><div class="actions"><button data-action="continue">${t.another}</button><button class="secondary" data-action="reset">${t.reset}</button></div></section>`;
}

function render() {
  const t = words();
  document.querySelector('.app-header p').textContent = t.activity;
  document.querySelector('.app-header h1').textContent = t.title;
  languageSelect.value = state.language;
  homeButton.hidden = !state.paired || state.screen === 'home';
  root.innerHTML = ({ welcome: welcomeMarkup, pairing: pairingMarkup, introduction: introductionMarkup, home: homeMarkup, map: mapMarkup, 'map-view': mapViewMarkup, task: taskMarkup, detector: detectorMarkup, complete: completeMarkup, sky: skyMarkup })[state.screen]();
}

async function performScan(kind) {
  if (scanning) return;
  scanning = true;
  showNotice(kind === 'star' ? words().scanStarHint : words().scanMoonHint);
  try {
    await scanTag();
    if (kind === 'pair') {
      state = pairWithMoon(state, DEMO_MOON);
    } else {
      state = kind === 'moon' ? activateMoon(state) : completeWithStar(state);
    }
  } catch (error) {
    showNotice(error.message === 'NFC is not available in this browser. Use Android Chrome or the demo button.' ? words().nfcError : error.message);
  } finally {
    scanning = false;
    render();
  }
}

root.addEventListener('click', event => {
  const action = event.target.dataset.action;
  if (!action || action === 'select-task') return;
  clearNotice();
  if (action === 'start') state = startActivity(state);
  if (action === 'pair-moon') performScan('pair');
  if (action === 'moon') performScan('moon');
  if (action === 'star') performScan('star');
  if (action === 'detector') { stopDetector(); state = openDetector(state); }
  if (action === 'start-detector') startDetector();
  if (action === 'found-keeper') { stopDetector(); state = confirmStarKeeperFound(state); }
  if (action === 'simulate-pair') state = pairWithMoon(state, DEMO_MOON);
  if (action === 'confirm-pair') state = confirmPair(state);
  if (action === 'open-map') state = openMap(state);
  if (action === 'view-map') state = openMapBackup(state);
  if (action === 'simulate-moon') state = activateMoon(state);
  if (action === 'simulate-star') state = completeWithStar(state);
  if (action === 'sky') state = showSky(state);
  if (action === 'continue') state = continueExploring(state);
  if (action === 'reset') state = createInitialState();
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
languageSelect.addEventListener('change', event => { state = setLanguage(state, event.target.value); clearNotice(); render(); });
homeButton.addEventListener('click', () => { stopDetector(); state = goHome(state); clearNotice(); render(); });
appTitle.addEventListener('pointerdown', () => {
  devPressTimer = setTimeout(() => { state = toggleDevMode(state); clearNotice(); render(); }, 1200);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(type => appTitle.addEventListener(type, () => clearTimeout(devPressTimer)));
if (!canScanNfc()) showNotice(words().unavailable);
render();
