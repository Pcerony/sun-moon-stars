export function canScanNfc(platform = globalThis) {
  return typeof platform.NDEFReader === 'function';
}

export async function scanTag({ platform = globalThis, signal } = {}) {
  if (!canScanNfc(platform)) {
    throw new Error('NFC is not available in this browser. Use Android Chrome or the demo button.');
  }

  const reader = new platform.NDEFReader();
  await reader.scan({ signal });

  return new Promise((resolve, reject) => {
    reader.addEventListener('reading', event => {
      resolve({ serialNumber: event.serialNumber || 'tag' });
    }, { once: true });
    reader.addEventListener('readingerror', () => {
      reject(new Error('The tag could not be read. Please try again.'));
    }, { once: true });
  });
}
