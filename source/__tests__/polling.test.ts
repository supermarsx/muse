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
    vi.advanceTimersByTime(50);
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

    vi.advanceTimersByTime(100); // counter=1
    vi.advanceTimersByTime(100); // counter=2
    vi.advanceTimersByTime(100); // counter=3, resolves

    const result = await promise;
    expect(result).toBe('done');
  });

  it('rejects after timeout', async () => {
    const promise = pollUntil(() => null, { interval: 50, timeout: 200 }, 'custom timeout message');

    vi.advanceTimersByTime(250);

    await expect(promise).rejects.toThrow('custom timeout message');
  });

  it('uses default interval and timeout when not specified', async () => {
    const promise = pollUntil(() => 'fast', {}, 'timeout');
    vi.advanceTimersByTime(50); // default interval
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

    vi.advanceTimersByTime(100); // throws
    vi.advanceTimersByTime(100); // throws
    vi.advanceTimersByTime(100); // returns 'ready'

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

    vi.advanceTimersByTime(10);
    vi.advanceTimersByTime(10);

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

    vi.advanceTimersByTime(10);
    vi.advanceTimersByTime(10);

    const result = await promise;
    expect(result).toBe('found');
  });
});
