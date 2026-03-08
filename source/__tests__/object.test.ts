import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitForObject, waitForNestedObject, ObjectFn } from '../object';

describe('object', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up any window properties set during tests
    delete (window as unknown as Record<string, unknown>)['testLib'];
    delete (window as unknown as Record<string, unknown>)['myLib'];
    delete (window as unknown as Record<string, unknown>)['primitiveVal'];
  });

  describe('waitForObject', () => {
    it('resolves when an object appears on window', async () => {
      const target = { version: '1.0' };

      const promise = waitForObject({ propertyName: 'testLib', interval: 10, timeout: 1000 });

      // Object not yet on window — advance one tick
      vi.advanceTimersByTime(10);

      // Place the object on window
      (window as unknown as Record<string, unknown>)['testLib'] = target;

      // Next tick picks it up
      vi.advanceTimersByTime(10);

      const result = await promise;
      expect(result).toBe(target);
    });

    it('rejects on timeout when object never appears', async () => {
      const promise = waitForObject({ propertyName: 'testLib', interval: 10, timeout: 150 });

      vi.advanceTimersByTime(200);

      await expect(promise).rejects.toThrow('Timed out waiting for object "testLib" on window.');
    });

    it('ignores non-object values (primitives, null)', async () => {
      const promise = waitForObject({ propertyName: 'primitiveVal', interval: 10, timeout: 500 });

      // Set a string — should be ignored
      (window as unknown as Record<string, unknown>)['primitiveVal'] = 'hello';
      vi.advanceTimersByTime(10);

      // Set a number — should be ignored
      (window as unknown as Record<string, unknown>)['primitiveVal'] = 42;
      vi.advanceTimersByTime(10);

      // Set null — should be ignored
      (window as unknown as Record<string, unknown>)['primitiveVal'] = null;
      vi.advanceTimersByTime(10);

      // Set a boolean — should be ignored
      (window as unknown as Record<string, unknown>)['primitiveVal'] = true;
      vi.advanceTimersByTime(10);

      // Finally set an actual object — should resolve
      const target = { ready: true };
      (window as unknown as Record<string, unknown>)['primitiveVal'] = target;
      vi.advanceTimersByTime(10);

      const result = await promise;
      expect(result).toBe(target);
    });

    it('rejects when AbortSignal is aborted', async () => {
      const controller = new AbortController();

      const promise = waitForObject({
        propertyName: 'testLib',
        interval: 10,
        timeout: 5000,
        signal: controller.signal,
      });

      vi.advanceTimersByTime(30);

      controller.abort('user cancelled');

      await expect(promise).rejects.toThrow('Polling aborted.');
    });
  });

  describe('waitForNestedObject', () => {
    it('resolves when nested object appears on window', async () => {
      const api = { call: () => {} };

      const promise = waitForNestedObject({
        firstLevel: 'myLib',
        secondLevel: 'api',
        interval: 10,
        timeout: 1000,
      });

      // First level not present yet
      vi.advanceTimersByTime(10);

      // Set first level without second level
      (window as unknown as Record<string, unknown>)['myLib'] = {};
      vi.advanceTimersByTime(10);

      // Now set the nested property
      ((window as unknown as Record<string, unknown>)['myLib'] as Record<string, unknown>)['api'] = api;
      vi.advanceTimersByTime(10);

      const result = await promise;
      expect(result).toBe(api);
    });

    it('rejects on timeout when nested object never appears', async () => {
      const promise = waitForNestedObject({
        firstLevel: 'myLib',
        secondLevel: 'api',
        interval: 10,
        timeout: 100,
      });

      vi.advanceTimersByTime(150);

      await expect(promise).rejects.toThrow(
        'Timed out waiting for nested object "myLib.api" on window.',
      );
    });
  });

  describe('ObjectFn namespace', () => {
    it('maps wait to waitForObject', () => {
      expect(ObjectFn.wait).toBe(waitForObject);
    });

    it('maps waitFor2ndLevel to waitForNestedObject', () => {
      expect(ObjectFn.waitFor2ndLevel).toBe(waitForNestedObject);
    });

    it('maps wait2nd to waitForNestedObject', () => {
      expect(ObjectFn.wait2nd).toBe(waitForNestedObject);
    });
  });
});
