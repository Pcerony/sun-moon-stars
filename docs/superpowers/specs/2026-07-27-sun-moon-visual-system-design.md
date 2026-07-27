# Sun and Moon Visual System Design

## Goal

Transform the existing functional prototype into a cohesive mobile game-like experience without changing its physical-first activity model. The approved homepage sample in the visual companion, `homepage-v6.html`, is the visual baseline for every participant-facing screen.

The work must preserve the complete NFC, pairing, task, detector, completion, sky, language, home, and hidden developer-mode flows.

## Product Meaning

This is a cooperative outdoor activity, not a phone navigation product.

- The Moon uses the printed map and leads broad navigation.
- The Sun operates the phone and NFC scans.
- The phone reports the current simulated area, nearby activities, progress, and moment-to-moment feedback.
- The full digital map is a low-priority backup, not the primary home experience.
- GPS, current area, temperature, steps, shared activity data, and community data remain simulated.

## Reference Hierarchy

### Activity Map

`img/map/1120.jpg` is the activity map and must be used directly on the backup map screen. It is also a reference for the natural palette, park setting, task zones, and friendly illustrated tone.

### UI Quality

Every image in `img/参考/视觉风格/` informs the desired game UI quality:

- illustrated surfaces rather than dashboard panels;
- soft, cheerful colors;
- rounded, filled pictograms;
- sticker-like controls;
- map and nature motifs;
- minimal hard-edged geometry;
- little or no conventional drop shadow.

The product must not copy Animal Crossing branding, logos, characters, or exact screens.

### Character Style

Every image in `img/参考/人物/` is a mandatory character-style reference. These files are references only and must not be placed directly in the product UI.

Any final character illustration must preserve their defining style:

- older and younger participants together;
- simple rounded faces and proportions;
- warm expressions;
- soft hand-drawn outlines;
- uncomplicated park-activity poses;
- colors consistent with the activity map.

## Approved Homepage

The homepage uses three visually distinct vertical regions.

### Information Region

- Light blue background.
- Very faint hand-drawn water ripples.
- A shallow curved lower boundary.
- Shows only the simulated current area, update state, temperature, steps, and score.
- The current area is status information and is not clickable.
- Temperature and steps are display-only mock data with no threshold or health logic.

### Interaction Region

- Warm cream background.
- Very faint dashed map grid.
- Sparse rounded grass marks shaped like small waves or the Chinese character `山`.
- Shows nearby task buttons.
- Task buttons use different sizes, positions, and slight rotations rather than a regular grid.
- Task buttons are clearly interactive through button semantics, press feedback, and high-contrast task icons.

### Dock Region

- Solid teal-green background with a shallow curved top.
- Icon-only navigation for home, team sky, and backup map.
- The backup map receives the lowest visual emphasis.
- The active destination uses a pale yellow circular highlight.

## Visual Tokens

The initial palette is:

- Ink: `#35574b`
- Information blue: `#b9dfeb`
- Paper cream: `#f8f2dc`
- Dock teal: `#54b4a3`
- Task coral: `#f3957c`
- Task mint: `#83bca0`
- Accent yellow: `#f4c76a`
- Sticker edge: `#fffaf0`

Colors may be adjusted slightly during browser QA, but the resulting palette must retain the approved balance.

## Typography

- Chinese display and short UI labels: ZCOOL KuaiLe.
- Numbers and short Latin text: Nunito.
- Fonts must be bundled locally as web fonts so Android Chrome does not depend on a live font service.
- Chinese text remains short and large enough for outdoor reading.
- Paragraph-style explanatory copy is removed wherever an icon, illustration, number, or immediate action can communicate the same meaning.

## Component Rules

### Sticker Controls

- Interactive task and status graphics may use asymmetric organic silhouettes.
- Organic elements must not be arranged as a conventional equal-size grid.
- Every silhouette must retain an unobstructed outline.
- Components must not overlap each other or the Dock safe area.
- Touch targets remain at least 48 by 48 CSS pixels.

### Image Containers

- Images use ordinary rounded rectangles.
- Containers use a thin white sticker-like border.
- Do not use irregular image clipping, decorative blobs, hard shadows, or layered ornaments around images.
- Maintain stable horizontal page margins.

### Icons

- Use filled or rounded-line icons with round caps and round joins.
- Avoid sharp corners, thin technical symbols, and temporary Unicode glyphs in the production implementation.
- Every icon-only control requires an accessible name and an appropriate tooltip when its meaning is not universally familiar.

### Depth

- Prefer color separation, white sticker edges, and subtle highlights.
- Do not use thick offset shadows.
- Avoid stacks of rectangular cards.
- A screen should read as one illustrated surface with attached game objects.

## Screen Application

### Welcome

Use one focal illustration or symbol, a single start action, and almost no explanatory copy. Any participant illustration must be newly produced in the required character style.

### Pairing

Center the NFC necklace interaction. Use a rounded necklace/NFC illustration, a short scan label, and visible scanning feedback. Hidden simulation controls remain absent until developer mode is unlocked.

### Introduction

Present the Moon profile with a newly produced character portrait or avatar. Replace paragraph instructions with a small sequence of name, speech, and paper-map icons plus only essential labels.

### Home

Implement the approved three-region homepage. The two nearby task stickers are clickable:

- selecting one updates the selected mock task;
- the app then opens the existing paper-map prompt for that task;
- the phone still does not provide turn-by-turn navigation.

### Paper-Map Prompt

Use a paper-map symbol, the selected task icon, and the Moon role cue. Keep the real map off this screen so the physical paper map remains primary.

### Backup Map

Display `img/map/1120.jpg` directly inside a normal rounded rectangular image container with a white sticker edge. Support comfortable mobile inspection without adding route lines or turn-by-turn directions.

### Task

Use a custom task illustration, the task icon, and two clear actions: detector and NFC scan. Keep copy to the task name and the shortest necessary instruction.

### Star Detector

Turn the existing compass detector into the main illustrated surface. Use rounded waves or rings, a soft directional marker, and changing color/scale to communicate signal strength. Preserve orientation, vibration, generated audio, and the hidden manual-heading control.

### Completion

Use a large earned-Star object, point value, and two icon-forward actions: sky and continue. Avoid explanatory cards.

### Team Sky

Use an illustrated sky surface, collected Star objects, score, and compact community examples. Keep mock community data visually secondary. Reset remains a developer-oriented action and must not dominate the participant experience.

### Developer Mode

Developer controls may use the same palette but must remain clearly separated and appear only after the existing title long-press. Normal participant screens must never reveal demo or prototype wording.

## Motion

- Use short scale, fade, pulse, and float feedback.
- Scanning, detector strength, task press, Star collection, and location refresh may animate.
- Motion must not resize layout tracks or cause elements to collide.
- Respect `prefers-reduced-motion`.

## Responsive and Accessibility Requirements

- Design for 320 to 460 CSS-pixel mobile widths first.
- Maintain safe spacing above the Dock and around every organic silhouette.
- Prevent text, badges, and icons from overlapping at all supported widths.
- Keep high-contrast text and icon relationships.
- Update the document `lang` attribute when the user changes language.
- Provide accessible names for icon-only controls.
- Preserve keyboard activation and visible focus treatment.

## Asset Plan

- Use the supplied map directly only on the backup map screen.
- Do not ship the extracted character reference images.
- Produce a small consistent set of final character and task illustrations from the supplied references.
- Store production assets in a dedicated project asset directory with descriptive ASCII filenames.
- Do not commit `.DS_Store`, browser artifacts, generated previews, credentials, or temporary image-generation files.

## Behavior and Testing

- Preserve all existing pure state transitions unless the approved homepage requires a focused transition for selecting a nearby task and opening its paper-map prompt.
- Add focused state tests for any changed transition.
- Keep NFC behavior in `src/nfc.js`, workflow behavior in `src/state.js`, content in `src/tasks.js`, and rendering/integration in `src/app.js`.
- Run `npm test`.
- Exercise the full simulated flow for both tasks in a real mobile browser viewport.
- Test narrow and wide mobile viewports for overlap, text fit, tap target size, and Dock clearance.
- Real NFC and orientation hardware verification still require Android Chrome over HTTPS and physical tags.

## Backup

The original functional prototype is preserved at branch `codex/pre-visualization-backup`, pointing to commit `66d1e09`.
