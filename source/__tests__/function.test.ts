import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  waitForFunction,
  waitForNestedFunction,
  getFunctionList,
  getOriginalParameters,
  FunctionFn,
} from '../function';

describe('function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as any).myFunc;
    delete (window as any).someLib;
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('waitForFunction', () => {
    it('resolves when a function appears on window', async () => {
      const promise = waitForFunction({ propertyName: 'myFunc', interval: 50, timeout: 1000 });

      // Simulate the function appearing after 100ms
      setTimeout(() => {
        (window as any).myFunc = () => {};
      }, 100);

      vi.advanceTimersByTime(50); // poll 1 — not yet
      vi.advanceTimersByTime(50); // 100ms — setTimeout fires, sets myFunc
      vi.advanceTimersByTime(50); // poll 3 — finds it

      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects on timeout when the function never appears', async () => {
      const promise = waitForFunction({ propertyName: 'myFunc', interval: 50, timeout: 200 });

      vi.advanceTimersByTime(250);

      await expect(promise).rejects.toThrow('Timed out waiting for function "myFunc" on window.');
    });

    it('rejects when the abort signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort('cancelled');

      const promise = waitForFunction({ propertyName: 'myFunc', interval: 50, timeout: 5000, signal: controller.signal });

      await expect(promise).rejects.toThrow('Polling aborted.');
    });

    it('rejects when the abort signal is triggered during polling', async () => {
      const controller = new AbortController();
      const promise = waitForFunction({ propertyName: 'myFunc', interval: 50, timeout: 5000, signal: controller.signal });

      vi.advanceTimersByTime(100); // a couple of polls
      controller.abort('user cancelled');

      await expect(promise).rejects.toThrow('Polling aborted.');
    });
  });

  describe('waitForNestedFunction', () => {
    it('resolves when a nested function appears on window', async () => {
      const promise = waitForNestedFunction({
        firstLevel: 'someLib',
        secondLevel: 'init',
        interval: 50,
        timeout: 1000,
      });

      setTimeout(() => {
        (window as any).someLib = { init: () => 'initialized' };
      }, 100);

      vi.advanceTimersByTime(50);
      vi.advanceTimersByTime(50);
      vi.advanceTimersByTime(50);

      const result = await promise;
      expect(typeof result).toBe('function');
    });

    it('rejects on timeout when the nested function never appears', async () => {
      const promise = waitForNestedFunction({
        firstLevel: 'someLib',
        secondLevel: 'init',
        interval: 50,
        timeout: 200,
      });

      vi.advanceTimersByTime(250);

      await expect(promise).rejects.toThrow(
        'Timed out waiting for nested function "someLib.init" on window.',
      );
    });

    it('keeps polling when firstLevel exists but secondLevel does not yet', async () => {
      (window as any).someLib = {};

      const promise = waitForNestedFunction({
        firstLevel: 'someLib',
        secondLevel: 'init',
        interval: 50,
        timeout: 1000,
      });

      vi.advanceTimersByTime(50); // poll — secondLevel missing
      vi.advanceTimersByTime(50); // poll — still missing

      (window as any).someLib.init = () => 'ready';
      vi.advanceTimersByTime(50); // poll — found

      const result = await promise;
      expect(typeof result).toBe('function');
    });
  });

  describe('getFunctionList', () => {
    it('returns matches from inline script elements', () => {
      document.body.innerHTML = `
        <script>initApp('param1','param2');</script>
        <script>trackEvent('click','button');</script>
      `;

      const results = getFunctionList();
      expect(results.length).toBeGreaterThanOrEqual(2);

      const functionNames = results.map((match) => match[2]);
      expect(functionNames).toContain('initApp');
      expect(functionNames).toContain('trackEvent');
    });

    it('returns an empty array when there are no scripts', () => {
      document.body.innerHTML = '<div>no scripts here</div>';

      const results = getFunctionList();
      expect(results).toEqual([]);
    });

    it('returns an empty array when scripts have no function calls', () => {
      document.body.innerHTML = '<script>var x = 1;</script>';

      const results = getFunctionList();
      expect(results).toEqual([]);
    });
  });

  describe('getOriginalParameters', () => {
    it('returns split parameters for a matching function', () => {
      document.body.innerHTML = `<script>myFunction('a','b','c');</script>`;

      const params = getOriginalParameters({ functionName: 'myFunction' });
      expect(params).toEqual(["'a'", "'b'", "'c'"]);
    });

    it('throws when the function name is not found in any script', () => {
      document.body.innerHTML = `<script>otherFunction('x');</script>`;

      expect(() => getOriginalParameters({ functionName: 'nonExistent' })).toThrow(
        'Failed to get original function parameters from script list.',
      );

      // Verify cause chain: the inner error says the function was not found
      try {
        getOriginalParameters({ functionName: 'nonExistent' });
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toContain('not found in script contents');
      }
    });

    it('throws wrapped error when no scripts exist', () => {
      document.body.innerHTML = '';

      expect(() => getOriginalParameters({ functionName: 'anything' })).toThrow(
        'Failed to get original function parameters from script list.',
      );
    });
  });

  describe('FunctionFn namespace', () => {
    it('maps wait to waitForFunction', () => {
      expect(FunctionFn.wait).toBe(waitForFunction);
    });

    it('maps waitFor2ndLevel to waitForNestedFunction', () => {
      expect(FunctionFn.waitFor2ndLevel).toBe(waitForNestedFunction);
    });

    it('maps wait2nd to waitForNestedFunction', () => {
      expect(FunctionFn.wait2nd).toBe(waitForNestedFunction);
    });

    it('maps getList to getFunctionList', () => {
      expect(FunctionFn.getList).toBe(getFunctionList);
    });

    it('maps getAll to getFunctionList', () => {
      expect(FunctionFn.getAll).toBe(getFunctionList);
    });

    it('maps getOriginalParameters', () => {
      expect(FunctionFn.getOriginalParameters).toBe(getOriginalParameters);
    });

    it('maps getParameters to getOriginalParameters', () => {
      expect(FunctionFn.getParameters).toBe(getOriginalParameters);
    });
  });
});
