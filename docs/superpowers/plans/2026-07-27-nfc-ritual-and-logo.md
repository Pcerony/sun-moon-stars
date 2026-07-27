# NFC Ritual and Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把正式 Logo、太阳、月亮和星星素材接入网页，并为月亮配对与星星收集实现两套可区分、可清理、支持减少动态效果的 NFC 仪式动效。

**Architecture:** 原始图片保留在 `img/`，正式网页副本放入 `assets/branding` 与 `assets/ritual`。新增纯状态模块 `src/ritual.js` 描述扫描阶段和持续时间，`src/app.js` 负责把真实 NFC 与隐藏模拟扫描接入同一个动效完成回调，CSS 负责表现层。

**Tech Stack:** 静态 HTML、CSS 动画、原生 ES Modules、Web NFC、Web Audio、Vibration API、Node 内置测试、Playwright CLI。

---

### Task 1: 整理正式图片素材

**Files:**
- Preserve: `img/logo.png`
- Preserve: `img/moon.png`
- Preserve: `img/sun.png`
- Preserve: `img/star.png`
- Create: `assets/branding/logo.png`
- Create: `assets/ritual/moon.png`
- Create: `assets/ritual/sun.png`
- Create: `assets/ritual/star.png`

- [ ] **Step 1: 检查四张素材的尺寸与透明通道**

Run:

```bash
sips -g pixelWidth -g pixelHeight -g hasAlpha \
  img/logo.png img/moon.png img/sun.png img/star.png
```

Expected: 四个文件均可读取；Logo 已带透明通道，其他三张需要去除白底。

- [ ] **Step 2: 生成三张抠图用色键源图**

分别使用内置 ImageGen 编辑 `moon.png`、`sun.png`、`star.png`：只把纯白背景替换为均匀 `#00ff00`，保持主体轮廓、比例、颜色、渐变、内部白色 Logo 和留白完全不变。

- [ ] **Step 3: 转换为透明 PNG**

Run for each generated source:

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input tmp/imagegen/<name>-chroma.png \
  --out assets/ritual/<name>.png \
  --auto-key border \
  --soft-matte \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill
```

Expected: 输出包含 alpha 通道，四角透明，主体覆盖率合理，没有绿色边缘。

- [ ] **Step 4: 复制 Logo 并视觉检查**

Run:

```bash
mkdir -p assets/branding assets/ritual tmp/imagegen
cp img/logo.png assets/branding/logo.png
```

使用图像查看器检查四张正式素材；原图不覆盖。

- [ ] **Step 5: Commit**

```bash
git add assets/branding assets/ritual
git commit -m "feat: add transparent ritual assets"
```

### Task 2: 接入正式 Logo

**Files:**
- Modify: `index.html`
- Modify: `src/app.js`
- Modify: `styles.css`

- [ ] **Step 1: 替换 favicon 与品牌标记**

在 `index.html` 使用：

```html
<link rel="icon" type="image/png" href="./assets/branding/logo.png">
```

在页面左上角品牌区使用 Logo 图片，不再显示临时星形字符。

- [ ] **Step 2: 提供统一 Logo 标记**

在 `src/app.js` 增加：

```js
function logoMarkup(className = '') {
  return `<img class="brand-logo ${className}" src="./assets/branding/logo.png" alt="">`;
}
```

欢迎页在主插图上方出现一次 Logo；`dockMarkup()` 的首页按钮使用 Logo，保留无障碍名称。

- [ ] **Step 3: 调整 Logo 样式**

在 `styles.css` 定义固定尺寸、`object-fit: contain` 和黄色激活底，不把 Logo 添加到任务贴纸或普通页面内容。

- [ ] **Step 4: 浏览器检查**

检查欢迎页、首页 Dock、非首页 Dock 与深色星空页，确认 Logo 清楚、无黑底、无拉伸。

- [ ] **Step 5: Commit**

```bash
git add index.html src/app.js styles.css
git commit -m "feat: apply official app logo"
```

### Task 3: 建立可测试的 NFC 仪式状态

**Files:**
- Create: `src/ritual.js`
- Create: `tests/ritual.test.js`

- [ ] **Step 1: 写失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  beginRitual, failRitual, finishRitual, succeedRitual
} from '../src/ritual.js';

test('a ritual moves from scanning to success and complete', () => {
  const scanning = beginRitual('pair');
  const success = succeedRitual(scanning, false);
  assert.equal(scanning.phase, 'scanning');
  assert.equal(success.phase, 'success');
  assert.equal(success.duration, 3300);
  assert.equal(finishRitual(success).phase, 'complete');
});

test('reduced motion uses the short confirmation duration', () => {
  assert.equal(succeedRitual(beginRitual('star'), true).duration, 550);
});

test('failed scans never enter success', () => {
  assert.deepEqual(failRitual(beginRitual('moon')), {
    kind: 'moon',
    phase: 'error',
    duration: 0
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/ritual.test.js`

Expected: FAIL，因为 `src/ritual.js` 尚不存在。

- [ ] **Step 3: 实现最小状态模块**

```js
const DURATIONS = { pair: 3300, moon: 3300, star: 3600 };
const KINDS = new Set(Object.keys(DURATIONS));

export function beginRitual(kind) {
  if (!KINDS.has(kind)) throw new Error(`Unknown ritual: ${kind}`);
  return { kind, phase: 'scanning', duration: 0 };
}

export function succeedRitual(ritual, reducedMotion) {
  return {
    ...ritual,
    phase: 'success',
    duration: reducedMotion ? 550 : DURATIONS[ritual.kind]
  };
}

export function failRitual(ritual) {
  return { ...ritual, phase: 'error', duration: 0 };
}

export function finishRitual(ritual) {
  return { ...ritual, phase: 'complete', duration: 0 };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `node --test tests/ritual.test.js`

Expected: 3 passed，0 failed。

- [ ] **Step 5: Commit**

```bash
git add src/ritual.js tests/ritual.test.js
git commit -m "feat: add NFC ritual state model"
```

### Task 4: 把真实与模拟扫描接入同一流程

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: 导入仪式状态模块并增加运行时变量**

```js
import {
  beginRitual, failRitual, finishRitual, succeedRitual
} from './ritual.js';

let ritual = null;
let ritualTimer = null;
let ritualToken = 0;
```

- [ ] **Step 2: 增加统一成功提交函数**

```js
function applySuccessfulScan(kind) {
  if (kind === 'pair') state = pairWithMoon(state, DEMO_MOON);
  if (kind === 'moon') state = activateMoon(state);
  if (kind === 'star') state = completeWithStar(state);
}

function showSuccessfulRitual(kind) {
  const token = ++ritualToken;
  ritual = succeedRitual(
    beginRitual(kind),
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  playRitualFeedback(kind);
  render();
  ritualTimer = window.setTimeout(() => {
    if (token !== ritualToken) return;
    ritual = finishRitual(ritual);
    applySuccessfulScan(kind);
    ritual = null;
    render();
  }, ritual.duration);
}
```

- [ ] **Step 3: 重构真实与模拟扫描**

真实扫描在 `scanTag()` 成功后调用 `showSuccessfulRitual(kind)`，不再立即改变工作流状态。三个隐藏模拟按钮也调用该函数。

- [ ] **Step 4: 增加清理逻辑**

页面离开与返回首页前调用：

```js
function stopRitual() {
  ritualToken += 1;
  window.clearTimeout(ritualTimer);
  ritualTimer = null;
  ritual = null;
  if (navigator.vibrate) navigator.vibrate(0);
}
```

扫描失败时使用 `failRitual()`，清理成功层并保留现有错误提示。

- [ ] **Step 5: Commit**

```bash
git add src/app.js
git commit -m "feat: route scans through ritual completion"
```

### Task 5: 实现两套 NFC 动效层

**Files:**
- Modify: `src/app.js`
- Modify: `styles.css`

- [ ] **Step 1: 增加配对仪式标记**

配对成功层包含水波、太阳图片、月亮图片、伙伴贴纸和成功状态；不包含星星角色。

- [ ] **Step 2: 增加星星收藏标记**

收藏成功层包含水波、太阳图片、月亮图片、星星图片和覆盖屏幕上半区的星空；不添加抽象手臂或连接棍。

- [ ] **Step 3: 增加等待与成功 CSS**

等待阶段只循环水波。成功阶段按已确认时间线播放进入、靠近、收拢或飞入星空。动效层使用固定定位和最高页面层级，不改变底层布局。

- [ ] **Step 4: 增加减少动态效果**

```css
@media (prefers-reduced-motion: reduce) {
  .ritual-overlay *,
  .ritual-overlay *::before,
  .ritual-overlay *::after {
    animation-duration: .01ms !important;
    animation-delay: 0ms !important;
  }
}
```

减少动态效果时直接显示最终贴纸或已收藏星星。

- [ ] **Step 5: Commit**

```bash
git add src/app.js styles.css
git commit -m "feat: animate NFC pairing and star collection"
```

### Task 6: 增加声音、震动与完整验收

**Files:**
- Modify: `src/app.js`
- Modify: `README.md`
- Modify: `design-qa.md`

- [ ] **Step 1: 增加仪式反馈**

复用现有 Web Audio 初始化方式。配对播放单个柔和音和一次短震；星星收藏播放两个上行音和两次短震。API 不可用时静默跳过。

- [ ] **Step 2: 运行完整自动测试**

Run:

```bash
npm test
git diff --check
```

Expected: 所有测试通过，0 failed；无空白错误。

- [ ] **Step 3: 运行移动端浏览器流程**

使用 Playwright CLI 检查 320 × 700、390 × 844、460 × 900：

- 默认中文和英文切换；
- 普通模式不显示模拟控制；
- 月亮配对与星星收藏可从隐藏模拟控制完整播放；
- 动效播放前不提前改变分数或页面；
- 动效结束后只提交一次；
- Logo、动效层、Dock 和文字无重叠；
- 控制台 0 errors、0 warnings。

- [ ] **Step 4: 检查减少动态效果**

使用 Playwright 设置 `reducedMotion: 'reduce'`，确认两套仪式在 0.6 秒内完成且最终状态可辨识。

- [ ] **Step 5: 更新文档**

README 说明 NFC 仪式反馈、Logo 位置和实机限制；`design-qa.md` 记录视口、动效、透明素材、控制台与测试结果。

- [ ] **Step 6: Commit**

```bash
git add README.md design-qa.md src/app.js
git commit -m "docs: verify NFC ritual experience"
```

### Task 7: 发布 GitHub Pages

**Files:**
- No code changes

- [ ] **Step 1: 最终验证**

Run:

```bash
npm test
git diff --check
test -z "$(git status --porcelain)"
```

Expected: 所有测试通过，工作树干净。

- [ ] **Step 2: 推送独立分支与远端 main**

```bash
git push origin codex/visualize-app
git push origin HEAD:main
```

- [ ] **Step 3: 等待 Pages 发布**

使用 `gh run watch <run-id> --exit-status`，Expected: workflow conclusion `success`。

- [ ] **Step 4: 验证线上页面**

打开 `https://pcerony.github.io/sun-moon-stars/`，检查 Logo 与正式素材加载、默认中文、无横向溢出、控制台无错误。
