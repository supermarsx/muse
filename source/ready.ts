/**
 * Page lifecycle / ready-state utilities.
 * @module ready
 */

/**
 * Options for {@link onReady}.
 */
export interface OnReadyOptions {
  /** The ready state to wait for. @defaultValue 'interactive' */
  state?: DocumentReadyState | undefined;
}

/** Valid ready states for runtime validation. */
const VALID_READY_STATES = new Set<string>(['loading', 'interactive', 'complete']);

/**
 * Returns a Promise that resolves when the document reaches the specified
 * ready state (or immediately if it already has).
 *
 * Ready states progress: `'loading'` → `'interactive'` → `'complete'`.
 *
 * @param options - Configuration for which state to wait for.
 * @returns A Promise that resolves when the target state is reached.
 *
 * @example
 * ```ts
 * // Wait for DOM to be interactive (default)
 * await onReady();
 *
 * // Wait for everything including sub-resources
 * await onReady({ state: 'complete' });
 * ```
 */
export function onReady(options: OnReadyOptions = {}): Promise<void> {
  const target = options.state ?? 'interactive';

  if (!VALID_READY_STATES.has(target)) {
    return Promise.reject(new Error(`onReady: invalid state "${target}". Must be "loading", "interactive", or "complete".`));
  }

  return new Promise<void>((resolve) => {
    if (isStateReached(document.readyState, target)) {
      resolve();
      return;
    }

    const handler = (): void => {
      if (isStateReached(document.readyState, target)) {
        document.removeEventListener('readystatechange', handler);
        resolve();
      }
    };
    document.addEventListener('readystatechange', handler);
  });
}

/**
 * Executes a callback when the document reaches the specified ready state.
 * If the state is already reached, the callback fires synchronously.
 *
 * @param callback - Function to invoke.
 * @param options - Configuration for which state to wait for.
 *
 * @example
 * ```ts
 * whenReady(() => {
 *   console.log('DOM is interactive!');
 * });
 * ```
 */
export function whenReady(callback: () => void, options: OnReadyOptions = {}): void {
  const target = options.state ?? 'interactive';

  if (!VALID_READY_STATES.has(target)) {
    throw new Error(`whenReady: invalid state "${target}". Must be "loading", "interactive", or "complete".`);
  }

  if (isStateReached(document.readyState, target)) {
    callback();
    return;
  }

  const handler = (): void => {
    if (isStateReached(document.readyState, target)) {
      document.removeEventListener('readystatechange', handler);
      callback();
    }
  };
  document.addEventListener('readystatechange', handler);
}

/** Numeric ordering for comparison. */
const STATE_ORDER: Record<DocumentReadyState, number> = {
  loading: 0,
  interactive: 1,
  complete: 2,
};

/** Returns true if `current` has reached at least `target`. */
function isStateReached(current: DocumentReadyState, target: DocumentReadyState): boolean {
  return STATE_ORDER[current] >= STATE_ORDER[target];
}

/**
 * Ready namespace for backward compatibility with the global `_muse.Ready` API.
 */
export const Ready = {
  onReady,
  whenReady,
} as const;
