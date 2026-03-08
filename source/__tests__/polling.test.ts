import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pollUntil } from '../utils/polling';

describe('pollUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves immediately when condition is already met', async () => {
    const promise = pollUntil(() => 'found', { interval: 50, timeout: 1000 }, 'timeout');
    // Immediate first check resolves synchronously, but we need to flush
    // both the pending timeout timer AND the resolved promise microtask
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe('found');
  });

  it('resolves when condition becomes true after polling', async () => {
    let counter = 0;
    const promise = pollUntil(
      () => {
        counter++;
        return counter >= 3 ? 'done' : null;
      },
      { interval: 100, timeout: 5000 },
      'timeout',
    );

    // Immediate check: counter=1 (null)
    await vi.advanceTimersByTimeAsync(100); // counter=2 (null)
    await vi.advanceTimersByTimeAsync(100); // counter=3, resolves

    const result = await promise;
    expect(result).toBe('done');
  });

  it('rejects after timeout', async () => {
    const promise = pollUntil(() => null, { interval: 50, timeout: 200 }, 'custom timeout message');

    // Attach the rejection handler BEFORE advancing timers to avoid unhandled rejection
    const rejection = expect(promise).rejects.toThrow('custom timeout message');

    await vi.advanceTimersByTimeAsync(250);

    await rejection;
  });

  it('uses default interval and timeout when not specified', async () => {
    const promise = pollUntil(() => 'fast', {}, 'timeout');
    // Immediate first check resolves synchronously, but we need to flush
    // both the pending timeout timer AND the resolved promise microtask
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe('fast');
  });

  it('ignores exceptions from the condition function and keeps polling', async () => {
    let counter = 0;
    const promise = pollUntil(
      () => {
        counter++;
        if (counter < 3) {
          throw new Error('not ready');
        }
        return 'ready';
      },
      { interval: 100, timeout: 5000 },
      'timeout',
    );

    // Immediate check: counter=1 (throws)
    await vi.advanceTimersByTimeAsync(100); // counter=2 (throws)
    await vi.advanceTimersByTimeAsync(100); // counter=3 returns 'ready'

    const result = await promise;
    expect(result).toBe('ready');
  });

  it('skips null return values', async () => {
    let calls = 0;
    const promise = pollUntil(
      () => {
        calls++;
        return calls === 2 ? 42 : null;
      },
      { interval: 10, timeout: 1000 },
      'timeout',
    );

    // Immediate check: calls=1 (null)
    await vi.advanceTimersByTimeAsync(10); // calls=2, resolves

    const result = await promise;
    expect(result).toBe(42);
  });

  it('skips undefined return values', async () => {
    let calls = 0;
    const promise = pollUntil(
      () => {
        calls++;
        return calls === 2 ? 'found' : undefined;
      },
      { interval: 10, timeout: 1000 },
      'timeout',
    );

    // Immediate check: calls=1 (undefined)
    await vi.advanceTimersByTimeAsync(10); // calls=2, resolves

    const result = await promise;
    expect(result).toBe('found');
  });

  it('rejects when interval is negative', async () => {
    await expect(pollUntil(() => null, { interval: -1, timeout: 1000 }, 'fail')).rejects.toThrow(
      'Polling interval must be a positive finite number',
    );
  });

  it('rejects when interval is NaN', async () => {
    await expect(pollUntil(() => null, { interval: NaN, timeout: 1000 }, 'fail')).rejects.toThrow(
      'Polling interval must be a positive finite number',
    );
  });

  it('rejects when interval is Infinity', async () => {
    await expect(pollUntil(() => null, { interval: Infinity, timeout: 1000 }, 'fail')).rejects.toThrow(
      'Polling interval must be a positive finite number',
    );
  });

  it('rejects when timeout is negative', async () => {
    await expect(pollUntil(() => null, { interval: 50, timeout: -1 }, 'fail')).rejects.toThrow(
      'Polling timeout must be a positive finite number',
    );
  });

  it('rejects when timeout is NaN', async () => {
    await expect(pollUntil(() => null, { interval: 50, timeout: NaN }, 'fail')).rejects.toThrow(
      'Polling timeout must be a positive finite number',
    );
  });

  it('rejects when timeout is Infinity', async () => {
    await expect(pollUntil(() => null, { interval: 50, timeout: Infinity }, 'fail')).rejects.toThrow(
      'Polling timeout must be a positive finite number',
    );
  });

  it('rejects when interval is zero', async () => {
    await expect(pollUntil(() => null, { interval: 0, timeout: 1000 }, 'fail')).rejects.toThrow(
      'Polling interval must be a positive finite number',
    );
  });

  it('rejects when interval is below MIN_INTERVAL (e.g. 5ms)', async () => {
    await expect(pollUntil(() => null, { interval: 5, timeout: 1000 }, 'fail')).rejects.toThrow(
      'Polling interval must be at least 10ms, got 5ms.',
    );
  });

  it('accepts interval exactly at MIN_INTERVAL (10ms)', async () => {
    const promise = pollUntil(() => 'ok', { interval: 10, timeout: 1000 }, 'fail');
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe('ok');
  });
});
