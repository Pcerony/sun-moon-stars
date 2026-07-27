# “太阳与月亮”全页面视觉化实施计划

> **供执行代理使用：** 必须按任务逐项执行，并使用 `superpowers:executing-plans`。步骤采用复选框格式。

**目标：** 以已经确认的首页 V6 为视觉标准，在保留现有 NFC、配对、任务和探测器流程的基础上，完成所有页面的视觉化。

**架构：** 继续使用无构建步骤的静态 HTML、CSS 和 ES 模块。状态转换留在 `src/state.js`，任务与模拟户外数据留在 `src/tasks.js`，SVG 图标字符串集中到新的 `src/icons.js`，所有页面渲染和硬件集成继续由 `src/app.js` 负责。正式字体和插图保存在 `assets/`，活动地图继续使用 `img/map/1120.jpg`。

**技术栈：** HTML、CSS、JavaScript ES 模块、Web NFC、Device Orientation、Web Audio、Node 内置测试器、Playwright CLI。

---

## 文件结构

- 新建 `assets/fonts/`：保存本地中文与数字字体。
- 新建 `assets/illustrations/`：保存正式人物和任务插图。
- 新建 `src/icons.js`：集中提供圆润 SVG 图标。
- 修改 `index.html`：更新移动端页面外壳、语言属性和资源预加载。
- 修改 `styles.css`：实现完整视觉系统、响应式和动效。
- 修改 `src/tasks.js`：增加区域、图标和模拟户外数据。
- 修改 `src/state.js`：增加首页附近任务选择转换。
- 修改 `src/app.js`：把全部页面替换为新视觉结构。
- 修改 `tests/state.test.js`：覆盖首页任务选择。
- 修改 `README.md`、`docs/DECISIONS.md`：记录视觉系统与素材边界。

### 任务 1：建立视觉素材与字体基础

**文件：**

- 新建：`assets/fonts/ZCOOLKuaiLe-Regular.ttf`
- 新建：`assets/fonts/Nunito-VariableFont_wght.ttf`
- 新建：`assets/fonts/OFL-ZCOOL-KuaiLe.txt`
- 新建：`assets/fonts/OFL-Nunito.txt`
- 新建：`assets/illustrations/`
- 修改：`.gitignore`

- [ ] **步骤 1：创建素材目录**

运行：

```bash
mkdir -p assets/fonts assets/illustrations
```

预期：两个目录存在，且未影响现有源文件。

- [ ] **步骤 2：下载可再分发字体和许可证**

运行：

```bash
curl -L https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf \
  -o assets/fonts/ZCOOLKuaiLe-Regular.ttf
curl -L 'https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/Nunito%5Bwght%5D.ttf' \
  -o assets/fonts/Nunito-VariableFont_wght.ttf
curl -L https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/OFL.txt \
  -o assets/fonts/OFL-ZCOOL-KuaiLe.txt
curl -L https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/OFL.txt \
  -o assets/fonts/OFL-Nunito.txt
```

预期：两个字体文件均可被 `file` 识别为 TrueType 字体，许可证文件非空。

- [ ] **步骤 3：保护临时生成文件**

在 `.gitignore` 中加入：

```gitignore
tmp/
assets/illustrations/*-source.*
```

保留最终插图，不提交图片生成源文件。

- [ ] **步骤 4：提交字体基础**

```bash
git add .gitignore assets/fonts
git commit -m "chore: add local interface fonts"
```

### 任务 2：增加首页附近任务状态转换

**文件：**

- 修改：`tests/state.test.js`
- 修改：`src/state.js`

- [ ] **步骤 1：先写失败测试**

在 `tests/state.test.js` 导入 `openNearbyTask` 并增加：

```js
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
```

- [ ] **步骤 2：运行测试确认失败**

运行：

```bash
npm test
```

预期：因为 `openNearbyTask` 尚未导出而失败。

- [ ] **步骤 3：实现最小状态转换**

在 `src/state.js` 增加：

```js
export function openNearbyTask(state, taskId) {
  if (
    !state.paired ||
    !TASKS[taskId] ||
    state.activeTaskId ||
    state.completedTaskIds.includes(taskId)
  ) {
    return state;
  }

  return {
    ...state,
    selectedTaskId: taskId,
    screen: 'map'
  };
}
```

- [ ] **步骤 4：运行测试确认通过**

运行：

```bash
npm test
```

预期：全部状态和 NFC 测试通过。

- [ ] **步骤 5：提交状态转换**

```bash
git add src/state.js tests/state.test.js
git commit -m "feat: open nearby tasks from home"
```

### 任务 3：扩展任务与模拟户外数据

**文件：**

- 修改：`src/tasks.js`

- [ ] **步骤 1：给任务增加视觉和区域字段**

把任务对象扩展为：

```js
export const TASKS = {
  dog: {
    id: 'dog',
    area: 'Lakeside',
    areaZh: '湖畔区',
    title: 'Meet a Friendly Dog',
    titleZh: '友善的小狗',
    instruction: 'Say hello and gently pet the friendly dog together.',
    instructionZh: '一起向小狗打招呼，轻轻摸摸它。',
    points: 10,
    star: 'Kindness Star',
    starZh: '温柔之星',
    icon: 'paw',
    illustration: './assets/illustrations/task-dog.png'
  },
  flowers: {
    id: 'flowers',
    area: 'Garden',
    areaZh: '花园区',
    title: 'Water the Flowers',
    titleZh: '给花浇水',
    instruction: 'Give the garden flowers a little water together.',
    instructionZh: '一起为花园里的花浇一点水。',
    points: 10,
    star: 'Garden Star',
    starZh: '花园之星',
    icon: 'watering',
    illustration: './assets/illustrations/task-flowers.png'
  }
};

export const MOCK_OUTDOOR_STATUS = Object.freeze({
  temperatureCelsius: 24,
  steps: 3248,
  updatedAt: '10:24'
});
```

- [ ] **步骤 2：确认状态测试未受影响**

运行：

```bash
npm test
```

预期：全部测试通过。

- [ ] **步骤 3：提交数据扩展**

```bash
git add src/tasks.js
git commit -m "feat: add visual task metadata"
```

### 任务 4：建立圆润图标模块

**文件：**

- 新建：`src/icons.js`

- [ ] **步骤 1：创建统一图标接口**

创建：

```js
const ICONS = {
  home: '<path d="M4 11.5 12 5l8 6.5V20h-5v-6H9v6H4v-8.5Z"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
  thermometer: '<path d="M10 5v9a4 4 0 1 0 4 0V5a2 2 0 0 0-4 0Z"/><path d="M12 9v8"/>',
  footprints: '<ellipse cx="8" cy="8" rx="3" ry="5"/><ellipse cx="16" cy="16" rx="3" ry="5"/>',
  locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  watering: '<path d="M4 13c0-5 4-9 9-9v13H7c-2 0-3-1-3-3v-1Z"/><path d="M13 8h4c3 0 5 2 5 5M22 13v4"/><path d="M18 20h.01M21 21h.01"/>',
  paw: '<circle cx="7" cy="8" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="8" r="2"/><path d="M6 17c0-4 3-7 6-7s6 3 6 7c0 3-2 4-6 4s-6-1-6-4Z"/>',
  nfc: '<path d="M8 5c5 2 8 6 8 11M6 9c3 1 6 4 6 8M5 14c2 1 3 2 3 4"/><circle cx="5" cy="20" r="1"/>',
  detector: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'
};

export function icon(name, className = '') {
  const paths = ICONS[name];
  if (!paths) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}
```

- [ ] **步骤 2：通过 Node 验证模块可导入**

运行：

```bash
node -e "import('./src/icons.js').then(({icon}) => console.log(icon('home').includes('<svg')))"
```

预期输出：

```text
true
```

- [ ] **步骤 3：提交图标模块**

```bash
git add src/icons.js
git commit -m "feat: add rounded interface icons"
```

### 任务 5：重建页面外壳与视觉系统

**文件：**

- 修改：`index.html`
- 修改：`styles.css`

- [ ] **步骤 1：更新页面外壳**

在 `index.html` 中：

- 保留 `#app` 和 `#notice`；
- 把首页按钮、语言按钮和积分区域放进 `.top-tools`；
- 使用图标按钮，不使用 Unicode 房屋字符；
- 预加载两个本地字体；
- 保留 `src/app.js` ES 模块入口。

字体预加载代码：

```html
<link rel="preload" href="./assets/fonts/ZCOOLKuaiLe-Regular.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="./assets/fonts/Nunito-VariableFont_wght.ttf" as="font" type="font/ttf" crossorigin>
```

- [ ] **步骤 2：建立 CSS 字体和颜色变量**

`styles.css` 顶部必须包含：

```css
@font-face {
  font-family: "ZCOOL KuaiLe";
  src: url("./assets/fonts/ZCOOLKuaiLe-Regular.ttf") format("truetype");
  font-display: swap;
}

@font-face {
  font-family: "Nunito";
  src: url("./assets/fonts/Nunito-VariableFont_wght.ttf") format("truetype");
  font-weight: 200 1000;
  font-display: swap;
}

:root {
  --ink: #35574b;
  --info-blue: #b9dfeb;
  --paper: #f8f2dc;
  --dock: #54b4a3;
  --coral: #f3957c;
  --mint: #83bca0;
  --yellow: #f4c76a;
  --sticker: #fffaf0;
  --safe-inline: clamp(16px, 5vw, 22px);
  color: var(--ink);
  background: #edf2e9;
  font-family: "ZCOOL KuaiLe", system-ui, sans-serif;
}
```

- [ ] **步骤 3：实现三个页面区域和背景纹理**

实现 `.info-zone`、`.interaction-zone` 和 `.app-dock`：

```css
.info-zone {
  background-color: var(--info-blue);
  background-image: var(--water-texture);
}

.interaction-zone {
  background-color: var(--paper);
  background-image: var(--grass-grid-texture);
}

.app-dock {
  position: sticky;
  bottom: 0;
  background: var(--dock);
}
```

纹理使用已经确认的浅色水波、虚线网格和“山”字草纹 SVG 数据图案。

- [ ] **步骤 4：实现组件、动效和安全区**

覆盖：

- `.sticker-action`
- `.image-sticker`
- `.status-blob`
- `.task-sticker`
- `.app-dock`
- `.detector-surface`
- `.sky-surface`
- `.dev-panel`

所有互动组件使用：

```css
button {
  min-width: 48px;
  min-height: 48px;
}

.task-sticker:active {
  transform: scale(.96);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

- [ ] **步骤 5：运行静态语法检查**

运行：

```bash
node --check src/app.js
npm test
```

预期：语法检查无输出，全部测试通过。

- [ ] **步骤 6：提交视觉基础**

```bash
git add index.html styles.css
git commit -m "feat: establish illustrated visual system"
```

### 任务 6：制作正式插图素材

**文件：**

- 新建：`assets/illustrations/welcome-pair.png`
- 新建：`assets/illustrations/moon-profile.png`
- 新建：`assets/illustrations/task-dog.png`
- 新建：`assets/illustrations/task-flowers.png`

- [ ] **步骤 1：生成伙伴欢迎插图**

使用地图和全部人物参考图作为画风参考，生成：

```text
用途：移动网页欢迎页插图。
主体：一位年长参与者和一位年轻参与者在公园里并肩站立，年长者拿纸质地图，年轻参与者拿手机。
画风：严格参考人物文件夹中的圆润手绘人物比例，并提高线条、上色和细节质量；颜色与活动地图一致。
构图：横向双人半身到全身构图，人物完整，四周留白，背景简单。
限制：不出现文字、标志、二维码、路线箭头或动物森友会角色。
```

- [ ] **步骤 2：生成月亮头像**

```text
用途：配对后的月亮人物资料。
主体：同一位年长参与者，友善微笑，胸像。
画风：与欢迎页人物完全一致。
构图：居中、简单浅色背景、适合圆角矩形裁切。
限制：不出现文字或多余道具。
```

- [ ] **步骤 3：生成两个任务插图**

小狗任务：

```text
用途：移动网页任务插图。
主体：同一对伙伴一起向一只友善的小狗打招呼。
画风：与欢迎页人物一致，温暖公园卡通插画。
构图：横向场景，动作清楚，适合普通圆角矩形容器。
限制：不出现文字、徽标或额外人物。
```

浇花任务：

```text
用途：移动网页任务插图。
主体：同一对伙伴一起用小水壶给花浇水。
画风：与欢迎页人物一致，温暖公园卡通插画。
构图：横向场景，动作清楚，适合普通圆角矩形容器。
限制：不出现文字、徽标或额外人物。
```

- [ ] **步骤 4：逐张检查并保存正式文件**

检查：

- 人物年龄关系正确；
- 两张任务图人物一致；
- 没有文字和水印；
- 手、脸和道具无明显错误；
- 圆角矩形裁切不会切掉主体。

- [ ] **步骤 5：提交正式插图**

```bash
git add assets/illustrations
git commit -m "feat: add activity illustrations"
```

### 任务 7：逐页替换渲染结构

**文件：**

- 修改：`src/app.js`

- [ ] **步骤 1：导入图标、户外数据和新状态转换**

`src/app.js` 导入：

```js
import { icon } from './icons.js';
import { COMMUNITY_TEAMS, MOCK_OUTDOOR_STATUS, TASKS } from './tasks.js';
import { openNearbyTask } from './state.js';
```

- [ ] **步骤 2：实现首页**

首页必须输出：

- `.info-zone`：区域、更新时间、温度、步数和积分；
- `.interaction-zone`：两个不规则任务按钮；
- `.app-dock`：首页、星空、备用地图。

任务按钮使用：

```html
<button class="task-sticker task-sticker--dog" data-action="nearby-task" data-task-id="dog" aria-label="友善的小狗">
  ${icon('paw')}
  <span class="point-badge">${icon('star')}10</span>
</button>
```

- [ ] **步骤 3：替换欢迎、配对和介绍页**

使用正式插图、图标和极短文字。保持 `start`、`pair-moon`、`simulate-pair` 和 `confirm-pair` 动作名称不变。

- [ ] **步骤 4：替换地图提示、任务和备用地图页**

备用地图使用：

```html
<figure class="image-sticker backup-map">
  <img src="./img/map/1120.jpg" alt="${t.mapAlt}">
</figure>
```

地图提示页不得显示这张完整地图。

- [ ] **步骤 5：替换探测器、完成页和星空页**

保留所有现有动作名称和探测器计算函数。只更换标记结构和样式类。

- [ ] **步骤 6：接入首页任务点击**

点击事件增加：

```js
if (action === 'nearby-task') {
  state = openNearbyTask(state, event.target.closest('[data-task-id]').dataset.taskId);
}
```

- [ ] **步骤 7：同步语言属性和无障碍状态**

渲染时增加：

```js
document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : 'en';
```

扫描中禁用重复扫描按钮，并保留 `aria-live` 提示。

- [ ] **步骤 8：运行测试和语法检查**

```bash
node --check src/app.js
npm test
```

预期：无语法错误，全部测试通过。

- [ ] **步骤 9：提交全部页面渲染**

```bash
git add src/app.js
git commit -m "feat: visualize complete activity flow"
```

### 任务 8：浏览器视觉检查与修复

**文件：**

- 修改：`styles.css`
- 必要时修改：`src/app.js`

- [ ] **步骤 1：启动本地服务器**

```bash
python3 -m http.server 8080
```

- [ ] **步骤 2：检查 320 × 700**

使用 Playwright 完整走通：

```text
欢迎 → 开始 → 隐藏开发模式 → 模拟配对 → 确认伙伴 →
首页 → 选择小狗 → 模拟月亮扫描 → 探测器 → 返回任务 →
模拟星星扫描 → 完成 → 星空 → 首页
```

检查所有贴纸轮廓、文字、徽章、Dock 安全区和图片边距。

- [ ] **步骤 3：检查 390 × 844 和 460 × 900**

重复两个任务，检查：

- 中英文；
- 首页散点构图；
- 信息区和交互区弧形边界；
- 备用地图；
- 探测器；
- 完成页；
- 星空；
- 隐藏开发工具。

- [ ] **步骤 4：检查动效降级**

模拟 `prefers-reduced-motion: reduce`，确认动画不会持续循环。

- [ ] **步骤 5：修复所有视觉问题**

只修复浏览器检查中实际发现的遮挡、裁切、对比度或触控问题，不增加新功能。

- [ ] **步骤 6：运行最终测试**

```bash
npm test
git diff --check
```

预期：全部测试通过，差异检查无输出。

- [ ] **步骤 7：提交视觉修复**

```bash
git add styles.css src/app.js
git commit -m "fix: polish mobile activity visuals"
```

### 任务 9：更新项目文档

**文件：**

- 修改：`README.md`
- 修改：`docs/DECISIONS.md`

- [ ] **步骤 1：更新 README**

记录：

- 首页显示模拟区域、温度、步数和附近任务；
- 备用地图使用正式地图素材；
- 本地字体和正式插图目录；
- 人物参考图不直接进入正式页面；
- 隐藏开发模式开启方式不变。

- [ ] **步骤 2：增加视觉决策记录**

在 `docs/DECISIONS.md` 增加：

```markdown
## 2026-07-27：视觉系统

参与者页面采用浅蓝信息区、米色草纹交互区和绿色底部导航。
任务按钮使用非网格散点贴纸布局；图片只使用普通圆角矩形和白色贴纸边。
中文使用本地站酷快乐体，数字和短英文使用本地 Nunito。
人物参考图只用于定义画风，不能直接作为正式产品素材。
```

- [ ] **步骤 3：运行最终验证并提交**

```bash
npm test
git diff --check
git add README.md docs/DECISIONS.md
git commit -m "docs: document visualized activity flow"
```
