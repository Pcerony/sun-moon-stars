const ICONS = {
  arrow: 'ph-caret-right',
  back: 'ph-arrow-left',
  brain: 'ph-brain',
  check: 'ph-check',
  detector: 'ph-compass',
  dog: 'ph-dog',
  egg: 'ph-egg',
  footprints: 'ph-footprints',
  flower: 'ph-flower',
  home: 'ph-house',
  language: 'ph-translate',
  locate: 'ph-crosshair',
  map: 'ph-map-trifold',
  menu: 'ph-list',
  music: 'ph-music-note',
  nfc: 'ph-contactless-payment',
  pair: 'ph-users',
  palette: 'ph-palette',
  paw: 'ph-paw-print',
  pin: 'ph-map-pin',
  reset: 'ph-arrow-counter-clockwise',
  sparkle: 'ph-sparkle',
  star: 'ph-star',
  thermometer: 'ph-thermometer-simple',
  tree: 'ph-tree',
  user: 'ph-user',
  walk: 'ph-person-simple-walk',
  watering: 'ph-drop'
};

export function icon(name, className = '') {
  const iconClass = ICONS[name];
  if (!iconClass) throw new Error(`Unknown icon: ${name}`);
  return `<i class="ph ${iconClass} icon ${className}" aria-hidden="true"></i>`;
}
