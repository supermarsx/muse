import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, sleep, Timing } from '../timing';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls fn once after delay expires (trailing, default)', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { delay: 100 });

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('multiple rapid calls result in only one invocation', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { delay: 100 });

    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('.cancel() prevents pending invocation', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { delay: 100 });

    debounced();
    vi.advanceTimersByTime(50);
    debounced.cancel();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  it('leading mode calls fn immediately on first call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { delay: 100, leading: true });

    debounced();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('leading mode does not call again until delay expires', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, { delay: 100, leading: true });

    debounced();
    expect(fn).toHaveBeenCalledTimes(1);

    debounced();
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);

    // After delay expires, hasLeadingCall resets so the next call fires immediately
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls fn immediately on first call (leading edge)', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, { interval: 100 });

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not call again within interval', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, { interval: 100 });

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    throttled();
    // Second call within interval should not fire immediately
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('fires trailing call after interval (trailing default true)', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, { interval: 100 });

    throttled(); // leading call
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    throttled(); // schedules trailing call

    vi.advanceTimersByTime(50); // remaining time elapses
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('trailing: false suppresses trailing call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, { interval: 100, trailing: false });

    throttled(); // leading call
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    throttled(); // no trailing scheduled

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('.cancel() prevents pending trailing invocation', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, { interval: 100 });

    throttled(); // leading call
    vi.advanceTimersByTime(50);
    throttled(); // schedules trailing

    throttled.cancel();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves after the specified ms', async () => {
    let resolved = false;
    const promise = sleep(500).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    vi.advanceTimersByTime(499);
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(1);
    await promise;
    expect(resolved).toBe(true);
  });
});

describe('Timing namespace', () => {
  it('maps debounce correctly', () => {
    expect(Timing.debounce).toBe(debounce);
  });

  it('maps throttle correctly', () => {
    expect(Timing.throttle).toBe(throttle);
  });

  it('maps sleep correctly', () => {
    expect(Timing.sleep).toBe(sleep);
  });
});
