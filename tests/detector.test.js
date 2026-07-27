import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createReadiness,
  shouldUpdateDetector,
  signalStrength,
  updateReadiness
} from '../src/detector.js';

test('signal strength rises toward the simulated target heading', () => {
  assert.equal(signalStrength(75, 0), 1);
  assert.equal(signalStrength(255, 0), 0.08);
});

test('readiness requires a sustained near signal', () => {
  let readiness = updateReadiness(createReadiness(), 0.92, 1000);
  readiness = updateReadiness(readiness, 0.92, 1800);
  assert.equal(readiness.ready, true);
});

test('a weak signal clears pending readiness', () => {
  const pending = updateReadiness(createReadiness(), 0.92, 1000);
  assert.deepEqual(updateReadiness(pending, 0.4, 1200), createReadiness());
});

test('readiness stays ready after brief sensor noise', () => {
  let readiness = updateReadiness(createReadiness(), 0.92, 1000);
  readiness = updateReadiness(readiness, 0.92, 1800);
  assert.equal(updateReadiness(readiness, 0.4, 1900).ready, true);
});

test('sensor updates pause while an NFC scan or ritual owns the screen', () => {
  const active = { listening: true, screen: 'detector', scanning: false, ritualActive: false };
  assert.equal(shouldUpdateDetector(active), true);
  assert.equal(shouldUpdateDetector({ ...active, scanning: true }), false);
  assert.equal(shouldUpdateDetector({ ...active, ritualActive: true }), false);
  assert.equal(shouldUpdateDetector({ ...active, screen: 'home' }), false);
});
