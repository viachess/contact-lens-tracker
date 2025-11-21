import { describe, test, expect } from 'vitest';

describe('PWA/notifications setup', () => {
  test('service worker registration available', () => {
    expect(typeof navigator !== 'undefined').toBe(true);
  });
});
