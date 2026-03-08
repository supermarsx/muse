import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onReady, whenReady, Ready } from '../ready';

describe('onReady', () => {
  // In happy-dom, document.readyState is already 'complete'.

  it('resolves immediately when readyState is already "complete"', async () => {
    expect(document.readyState).toBe('complete');
    await expect(onReady()).resolves.toBeUndefined();
  });

  it('resolves immediately when target is "interactive" and readyState is "complete"', async () => {
    await expect(onReady({ state: 'interactive' })).resolves.toBeUndefined();
  });

  it('rejects when state is invalid', async () => {
    await expect(onReady({ state: 'bogus' as any })).rejects.toThrow(
      'onReady: invalid state "bogus". Must be "loading", "interactive", or "complete".',
    );
  });

  describe('when readyState is "loading"', () => {
    let originalDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalDescriptor =
        Object.getOwnPropertyDescriptor(document, 'readyState') ??
        Object.getOwnPropertyDescriptor(Document.prototype, 'readyState');
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      // Restore original readyState descriptor
      if (originalDescriptor) {
        Object.defineProperty(document, 'readyState', originalDescriptor);
      } else {
        // Remove the own-property override so the prototype getter is used again
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (document as any).readyState;
      }
    });

    it('waits and resolves when readystatechange fires with "interactive"', async () => {
      const promise = onReady();

      // Should not resolve yet
      let resolved = false;
      void promise.then(() => {
        resolved = true;
      });
      await Promise.resolve();
      expect(resolved).toBe(false);

      // Simulate the transition to 'interactive'
      (document as any).readyState = 'interactive';
      document.dispatchEvent(new Event('readystatechange'));

      await expect(promise).resolves.toBeUndefined();
    });

    it('waits for "complete" when state option is "complete"', async () => {
      const promise = onReady({ state: 'complete' });

      let resolved = false;
      void promise.then(() => {
        resolved = true;
      });
      await Promise.resolve();
      expect(resolved).toBe(false);

      // Transition directly to 'complete' — should resolve
      (document as any).readyState = 'complete';
      document.dispatchEvent(new Event('readystatechange'));

      await expect(promise).resolves.toBeUndefined();
    });
  });
});

describe('whenReady', () => {
  it('calls callback immediately when state is already reached', () => {
    const callback = vi.fn();
    whenReady(callback);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('calls callback immediately when target is "complete" and readyState is "complete"', () => {
    const callback = vi.fn();
    whenReady(callback, { state: 'complete' });
    expect(callback).toHaveBeenCalledOnce();
  });

  it('throws when state is invalid', () => {
    expect(() => whenReady(() => {}, { state: 'bogus' as any })).toThrow(
      'whenReady: invalid state "bogus". Must be "loading", "interactive", or "complete".',
    );
  });

  describe('when readyState is "loading"', () => {
    let originalDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalDescriptor =
        Object.getOwnPropertyDescriptor(document, 'readyState') ??
        Object.getOwnPropertyDescriptor(Document.prototype, 'readyState');
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      if (originalDescriptor) {
        Object.defineProperty(document, 'readyState', originalDescriptor);
      } else {
        delete (document as any).readyState;
      }
    });

    it('defers callback until readystatechange fires with target state', () => {
      const callback = vi.fn();
      whenReady(callback);

      expect(callback).not.toHaveBeenCalled();

      (document as any).readyState = 'interactive';
      document.dispatchEvent(new Event('readystatechange'));

      expect(callback).toHaveBeenCalledOnce();
    });

    it('does not call callback on "interactive" when target is "complete"', () => {
      const callback = vi.fn();
      whenReady(callback, { state: 'complete' });

      (document as any).readyState = 'interactive';
      document.dispatchEvent(new Event('readystatechange'));
      expect(callback).not.toHaveBeenCalled();
    });

    it('calls callback when readystatechange fires with "complete"', () => {
      const callback = vi.fn();
      whenReady(callback, { state: 'complete' });

      (document as any).readyState = 'complete';
      document.dispatchEvent(new Event('readystatechange'));
      expect(callback).toHaveBeenCalledOnce();
    });
  });
});

describe('Ready namespace', () => {
  it('exposes onReady and whenReady', () => {
    expect(Ready.onReady).toBe(onReady);
    expect(Ready.whenReady).toBe(whenReady);
  });
});
