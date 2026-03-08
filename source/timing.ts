/**
 * Timing utilities: debounce, throttle, and sleep.
 * @module timing
 */

/**
 * Options for {@link debounce}.
 */
export interface DebounceOptions {
  /** Delay in milliseconds before invoking after the last call. @defaultValue 250 */
  delay?: number | undefined;
  /** If true, invoke on the leading edge instead of the trailing edge. @defaultValue false */
  leading?: boolean | undefined;
}

/**
 * A debounced function with a `cancel` method to clear any pending invocation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  /** Cancel any pending delayed invocation. */
  cancel(): void;
}

/**
 * Creates a debounced version of a function that delays invocation until
 * `delay` milliseconds have elapsed since the last call.
 *
 * @typeParam T - The function type.
 * @param fn - The function to debounce.
 * @param options - Debounce configuration.
 * @returns A debounced wrapper with a `cancel()` method.
 *
 * @example
 * ```ts
 * const save = debounce(() => saveData(), { delay: 500 });
 * input.addEventListener('input', save);
 *
 * // Cancel any pending call
 * save.cancel();
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: DebounceOptions = {},
): DebouncedFunction<T> {
  if (typeof fn !== 'function') {
    throw new Error('debounce: first argument must be a function.');
  }
  const delay = options.delay ?? 250;
  if (!Number.isFinite(delay) || delay < 0) {
    throw new Error(`debounce: delay must be a non-negative finite number, got ${delay}.`);
  }
  const leading = options.leading ?? false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let hasLeadingCall = false;

  const debounced = ((...args: Parameters<T>): void => {
    if (leading && !hasLeadingCall) {
      hasLeadingCall = true;
      fn(...args);
    }

    if (timer != null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      if (!leading) {
        fn(...args);
      }
      hasLeadingCall = false;
    }, delay);
  }) as DebouncedFunction<T>;

  debounced.cancel = (): void => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
    hasLeadingCall = false;
  };

  return debounced;
}

/**
 * Options for {@link throttle}.
 */
export interface ThrottleOptions {
  /** Minimum interval in milliseconds between invocations. @defaultValue 250 */
  interval?: number | undefined;
  /** If true, also invoke on the trailing edge. @defaultValue true */
  trailing?: boolean | undefined;
}

/**
 * A throttled function with a `cancel` method to clear any pending trailing invocation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ThrottledFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  /** Cancel any pending trailing invocation. */
  cancel(): void;
}

/**
 * Creates a throttled version of a function that invokes at most once per
 * `interval` milliseconds. Always fires on the leading edge; optionally
 * fires on the trailing edge.
 *
 * @typeParam T - The function type.
 * @param fn - The function to throttle.
 * @param options - Throttle configuration.
 * @returns A throttled wrapper with a `cancel()` method.
 *
 * @example
 * ```ts
 * const onScroll = throttle(() => updateUI(), { interval: 100 });
 * window.addEventListener('scroll', onScroll);
 *
 * // Cleanup
 * onScroll.cancel();
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: ThrottleOptions = {},
): ThrottledFunction<T> {
  if (typeof fn !== 'function') {
    throw new Error('throttle: first argument must be a function.');
  }
  const interval = options.interval ?? 250;
  if (!Number.isFinite(interval) || interval < 0) {
    throw new Error(`throttle: interval must be a non-negative finite number, got ${interval}.`);
  }
  const trailing = options.trailing ?? true;
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const throttled = ((...args: Parameters<T>): void => {
    const now = Date.now();
    const remaining = interval - (now - lastCall);

    if (remaining <= 0) {
      // Leading edge: enough time has passed
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
      lastCall = now;
      fn(...args);
    } else if (trailing && timer == null) {
      // Schedule trailing edge
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  }) as ThrottledFunction<T>;

  throttled.cancel = (): void => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
    lastCall = 0;
  };

  return throttled;
}

/**
 * Options for {@link sleep}.
 */
export interface SleepOptions {
  /** An AbortSignal to cancel the sleep early. The returned Promise rejects with an `AbortError`. */
  signal?: AbortSignal | undefined;
}

/**
 * Returns a Promise that resolves after the specified number of milliseconds.
 * Useful for introducing delays in async flows.
 *
 * Supports an optional {@link AbortSignal} to cancel the sleep early, which
 * causes the returned Promise to reject with an `AbortError`.
 *
 * @param ms - The number of milliseconds to wait.
 * @param options - Optional settings including an AbortSignal.
 * @returns A Promise that resolves after `ms` milliseconds.
 *
 * @example
 * ```ts
 * await sleep(1000); // Wait 1 second
 * console.log('Done!');
 * ```
 *
 * @example
 * ```ts
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 500);
 * try {
 *   await sleep(10000, { signal: controller.signal });
 * } catch (err) {
 *   console.log('Sleep was cancelled');
 * }
 * ```
 */
export function sleep(ms: number, options?: SleepOptions): Promise<void> {
  if (!Number.isFinite(ms) || ms < 0) {
    return Promise.reject(new Error(`sleep: ms must be a non-negative finite number, got ${ms}.`));
  }
  const { signal } = options ?? {};

  if (signal?.aborted) {
    return Promise.reject(new DOMException('Sleep aborted', 'AbortError'));
  }

  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort(): void {
      clearTimeout(timer);
      reject(new DOMException('Sleep aborted', 'AbortError'));
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Timing namespace for backward compatibility with the global `_muse.Timing` API.
 */
export const Timing = {
  debounce,
  throttle,
  sleep,
} as const;
