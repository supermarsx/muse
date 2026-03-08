import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitDomLoaded, waitDomLoadedAsync, Event } from '../event';

describe('event', () => {
  const originalReadyState = document.readyState;

  afterEach(() => {
    Object.defineProperty(document, 'readyState', {
      value: originalReadyState,
      writable: true,
      configurable: true,
    });
  });

  describe('waitDomLoaded', () => {
    it('invokes callback immediately when document is already loaded', () => {
      // In happy-dom, readyState is typically 'complete' or 'interactive'
      expect(document.readyState).not.toBe('loading');

      const callback = vi.fn();
      waitDomLoaded(callback);
      expect(callback).toHaveBeenCalledOnce();
    });

    it('defers callback until DOMContentLoaded when readyState is loading', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });

      const callback = vi.fn();
      waitDomLoaded(callback);

      expect(callback).not.toHaveBeenCalled();

      document.dispatchEvent(new window.Event('DOMContentLoaded'));
      expect(callback).toHaveBeenCalledOnce();
    });

    it('only fires the callback once via { once: true }', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });

      const callback = vi.fn();
      waitDomLoaded(callback);

      document.dispatchEvent(new window.Event('DOMContentLoaded'));
      document.dispatchEvent(new window.Event('DOMContentLoaded'));
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('waitDomLoadedAsync', () => {
    it('resolves immediately when document is already loaded', async () => {
      expect(document.readyState).not.toBe('loading');

      await expect(waitDomLoadedAsync()).resolves.toBeUndefined();
    });

    it('resolves when DOMContentLoaded fires while readyState is loading', async () => {
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });

      const promise = waitDomLoadedAsync();

      document.dispatchEvent(new window.Event('DOMContentLoaded'));
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('Event namespace', () => {
    it('maps domLoaded to waitDomLoaded', () => {
      expect(Event.domLoaded).toBe(waitDomLoaded);
    });

    it('maps waitDomLoadedAlt to waitDomLoadedAsync', () => {
      expect(Event.waitDomLoadedAlt).toBe(waitDomLoadedAsync);
    });

    it('maps waitDomLoadedPromise to waitDomLoadedAsync', () => {
      expect(Event.waitDomLoadedPromise).toBe(waitDomLoadedAsync);
    });

    it('maps domLoadedPromise to waitDomLoadedAsync', () => {
      expect(Event.domLoadedPromise).toBe(waitDomLoadedAsync);
    });

    it('includes waitDomLoaded itself', () => {
      expect(Event.waitDomLoaded).toBe(waitDomLoaded);
    });
  });
});
