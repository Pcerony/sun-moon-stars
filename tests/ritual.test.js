import test from 'node:test';
import assert from 'node:assert/strict';
import {
  beginRitual,
  failRitual,
  finishRitual,
  ritualExitDuration,
  succeedRitual
} from '../src/ritual.js';

test('a ritual moves from scanning to success and complete', () => {
  const scanning = beginRitual('pair');
  const success = succeedRitual(scanning, false);

  assert.equal(scanning.phase, 'scanning');
  assert.equal(success.phase, 'success');
  assert.equal(success.duration, 4400);
  assert.equal(finishRitual(success).phase, 'complete');
});

test('reduced motion uses the short confirmation duration', () => {
  assert.equal(succeedRitual(beginRitual('star'), true).duration, 700);
  assert.equal(ritualExitDuration(true), 220);
});

test('the final success frame holds before a soft page reveal', () => {
  assert.equal(succeedRitual(beginRitual('star'), false).duration, 5000);
  assert.equal(ritualExitDuration(false), 650);
});

test('failed scans never enter success', () => {
  assert.deepEqual(failRitual(beginRitual('region')), {
    kind: 'region',
    phase: 'error',
    duration: 0
  });
});

test('region discovery and task unlocking are separate Moon rituals', () => {
  assert.equal(beginRitual('region').kind, 'region');
  assert.equal(beginRitual('task').kind, 'task');
});

test('unknown ritual kinds are rejected', () => {
  assert.throws(() => beginRitual('unknown'), /Unknown ritual/);
});
