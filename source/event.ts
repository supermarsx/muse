/**
 * DOM event utilities.
 * @module event
 */

/**
 * Executes a callback when the DOM content has finished loading.
 * If the DOM is already loaded, the callback is invoked immediately.
 *
 * @param callback - Function to execute once `DOMContentLoaded` fires.
 *
 * @example
 * ```ts
 * waitDomLoaded(() => console.log('DOM ready'));
 * ```
 */
export function waitDomLoaded(callback: VoidFunction): void {
  if (document.readyState !== 'loading') {
    try {
      callback();
    } catch (error: unknown) {
      console.warn('[_muse] waitDomLoaded callback error:', error);
    }
    return;
  }
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      try {
        callback();
      } catch (error: unknown) {
        console.warn('[_muse] waitDomLoaded callback error:', error);
      }
    },
    { once: true },
  );
}

/**
 * Returns a Promise that resolves when the DOM content has finished loading.
 * If the DOM is already loaded, the Promise resolves immediately.
 *
 * @returns A Promise that resolves when `DOMContentLoaded` fires (or immediately if already loaded).
 *
 * @example
 * ```ts
 * await waitDomLoadedAsync();
 * console.log('DOM ready');
 * ```
 */
export function waitDomLoadedAsync(): Promise<void> {
  if (document.readyState !== 'loading') {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
}

/**
 * Event namespace for backward compatibility with the global `_muse.Event` API.
 */
export const Event = {
  waitDomLoaded,
  domLoaded: waitDomLoaded,
  waitDomLoadedAlt: waitDomLoadedAsync,
  waitDomLoadedPromise: waitDomLoadedAsync,
  domLoadedPromise: waitDomLoadedAsync,
} as const;
