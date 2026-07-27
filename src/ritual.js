const DURATIONS = Object.freeze({
  pair: 4400,
  region: 4400,
  task: 4400,
  star: 5000
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
    duration: reducedMotion ? 700 : DURATIONS[ritual.kind]
  };
}

export function ritualExitDuration(reducedMotion) {
  return reducedMotion ? 220 : 650;
}

export function failRitual(ritual) {
  return { ...ritual, phase: 'error', duration: 0 };
}

export function finishRitual(ritual) {
  return { ...ritual, phase: 'complete', duration: 0 };
}
