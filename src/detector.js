export function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

export function angleDistance(a, b) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

export function signalStrength(heading, startHeading, target = 75) {
  if (heading === null || startHeading === null) return 0.08;
  const relativeHeading = normalizeAngle(heading - startHeading);
  return Math.max(0.08, 1 - angleDistance(relativeHeading, target) / 145);
}

export function createReadiness() {
  return { nearSince: null, ready: false };
}

export function updateReadiness(readiness, strength, now, threshold = 0.88, holdMs = 700) {
  if (readiness.ready) return readiness;
  if (strength < threshold) return createReadiness();
  const nearSince = readiness.nearSince ?? now;
  return {
    nearSince,
    ready: now - nearSince >= holdMs
  };
}

export function shouldUpdateDetector({ listening, screen, scanning, ritualActive }) {
  return listening && screen === 'detector' && !scanning && !ritualActive;
}
