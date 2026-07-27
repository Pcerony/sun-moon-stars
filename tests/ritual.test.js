import test from 'node:test';
import assert from 'node:assert/strict';
import {
  beginRitual,
  failRitual,
  finishRitual,
  succeedRitual
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

test('unknown ritual kinds are rejected', () => {
  assert.throws(() => beginRitual('unknown'), /Unknown ritual/);
});
