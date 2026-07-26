import test from 'node:test';
import assert from 'node:assert/strict';
import { canScanNfc } from '../src/nfc.js';

test('reports unsupported when NDEFReader is absent', () => {
  assert.equal(canScanNfc({}), false);
});


test('reports supported when NDEFReader exists', () => {
  assert.equal(canScanNfc({ NDEFReader: class {} }), true);
});
