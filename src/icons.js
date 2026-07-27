const ICONS = {
  arrow: '<path d="m9 5 7 7-7 7"/>',
  detector: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  footprints: '<ellipse cx="8" cy="8" rx="3" ry="5"/><ellipse cx="16" cy="16" rx="3" ry="5"/>',
  home: '<path d="M4 11.5 12 5l8 6.5V20h-5v-6H9v6H4v-8.5Z"/>',
  language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
  menu: '<path d="M5 7h14M5 12h14M5 17h14"/>',
  nfc: '<path d="M8 5c5 2 8 6 8 11M6 9c3 1 6 4 6 8M5 14c2 1 3 2 3 4"/><circle cx="5" cy="20" r="1"/>',
  pair: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 20c0-4 2-7 5-7s5 3 5 7M11 20c0-4 2-7 5-7s5 3 5 7"/>',
  paper: '<path d="M6 3h9l4 4v14H6V3Z"/><path d="M15 3v5h5M9 13h6M9 17h5"/>',
  paw: '<circle cx="7" cy="8" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="8" r="2"/><path d="M6 17c0-4 3-7 6-7s6 3 6 7c0 3-2 4-6 4s-6-1-6-4Z"/>',
  reset: '<path d="M4 11a8 8 0 1 1 2 6"/><path d="M4 5v6h6"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  thermometer: '<path d="M10 5v9a4 4 0 1 0 4 0V5a2 2 0 0 0-4 0Z"/><path d="M12 9v8"/>',
  watering: '<path d="M4 13c0-5 4-9 9-9v13H7c-2 0-3-1-3-3v-1Z"/><path d="M13 8h4c3 0 5 2 5 5M22 13v4"/><path d="M18 20h.01M21 21h.01"/>'
};

export function icon(name, className = '') {
  const paths = ICONS[name];
  if (!paths) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}
