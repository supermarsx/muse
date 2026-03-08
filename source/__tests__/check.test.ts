import { describe, it, expect } from 'vitest';
import { isIframe, isWindowAccessible, isUnsafeWindowAccessible, Check } from '../check';

describe('check', () => {
  describe('isIframe', () => {
    it('returns false when not in an iframe (window === window.parent)', () => {
      // In happy-dom, window.parent === window by default
      expect(isIframe()).toBe(false);
    });
  });

  describe('isWindowAccessible', () => {
    it('returns true when window is an object', () => {
      expect(isWindowAccessible()).toBe(true);
    });
  });

  describe('isUnsafeWindowAccessible', () => {
    it('returns false when unsafeWindow is not defined', () => {
      // In happy-dom, there's no unsafeWindow global
      expect(isUnsafeWindowAccessible()).toBe(false);
    });
  });

  describe('Check namespace', () => {
    it('exposes all functions', () => {
      expect(Check.isIframe).toBe(isIframe);
      expect(Check.isWindowAccessible).toBe(isWindowAccessible);
      expect(Check.isUnsafeWindowAccessible).toBe(isUnsafeWindowAccessible);
    });
  });
});
