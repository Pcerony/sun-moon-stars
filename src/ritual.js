const DURATIONS = Object.freeze({
  pair: 3300,
  moon: 3300,
  star: 3600
});

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
