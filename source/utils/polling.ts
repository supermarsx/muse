/**
 * Shared polling utilities for wait-based functions.
 * Eliminates the duplicated setInterval/setTimeout/Promise pattern.
 * @module utils/polling
 */

const DEFAULT_INTERVAL = 50;
const DEFAULT_TIMEOUT = 15000;

/**
 * Options for the generic polling function.
 */
export interface PollOptions {
  /** Polling interval in milliseconds. @defaultValue 50 */
  interval?: number | undefined;
  /** Maximum wait time in milliseconds. @defaultValue 15000 */
  timeout?: number | undefined;
  /** An AbortSignal to cancel polling early. */
  signal?: AbortSignal | undefined;
}

/**
 * Polls a condition function at a regular interval until it returns a non-nullish value,
 * or rejects after a timeout. Uses chained `setTimeout` instead of `setInterval` to
 * prevent callback stacking when the condition check takes longer than the interval.
 *
 * @typeParam T - The type of value the condition resolves to.
 * @param condition - A function called on each interval tick.
 *   Return the value when found, or `null`/`undefined` to keep polling.
 * @param options - Polling interval, timeout, and abort configuration.
 * @param timeoutMessage - Error message used when the timeout is reached.
 * @returns A Promise that resolves with the value returned by `condition`.
 *
 * @example
 * ```ts
 * const element = await pollUntil(
 *   () => document.querySelector('#my-el'),
 *   { interval: 100, timeout: 5000 },
 *   'Element #my-el not found within 5s'
 * );
 * ```
 */
export function pollUntil<T>(
  condition: () => T | null | undefined,
  options: PollOptions,
  timeoutMessage: string,
): Promise<T> {
  const interval = options.interval ?? DEFAULT_INTERVAL;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const signal = options.signal;

  return new Promise<T>((resolve, reject) => {
    let lastError: unknown;
    let pollTimer: ReturnType<typeof setTimeout>;

    // Handle AbortSignal
    if (signal?.aborted) {
      reject(new Error('Polling aborted.', { cause: signal.reason }));
      return;
    }

    const cleanup = (): void => {
      clearTimeout(pollTimer);
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = (): void => {
      cleanup();
      reject(new Error('Polling aborted.', { cause: signal?.reason }));
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    const check = (): void => {
      try {
        const result = condition();
        if (result != null) {
          cleanup();
          resolve(result);
          return;
        }
      } catch (error: unknown) {
        lastError = error;
      }
      // Schedule next check — chained setTimeout prevents stacking
      pollTimer = setTimeout(check, interval);
    };

    // Immediate first check — avoid unnecessary delay when condition is already met
    check();

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(timeoutMessage, { cause: lastError }));
    }, timeout);
  });
}
