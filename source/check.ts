/**
 * Runtime environment checks for userscript contexts.
 * @module check
 */

declare const unsafeWindow: Window | undefined;

/**
 * Checks if the current window is running inside an iframe.
 * Uses a try-catch to handle cross-origin SecurityError when accessing window.parent.
 *
 * @returns `true` if the current context is an iframe, `false` otherwise.
 */
export function isIframe(): boolean {
  try {
    return window !== window.parent;
  } catch {
    // Cross-origin iframe — accessing window.parent throws SecurityError
    return true;
  }
}

/**
 * Checks if the `window` global is accessible.
 *
 * @returns `true` if `window` is a non-null object, `false` otherwise.
 */
export function isWindowAccessible(): boolean {
  return typeof window === 'object' && window !== null;
}

/**
 * Checks if the Greasemonkey/Tampermonkey `unsafeWindow` global is accessible.
 *
 * @returns `true` if `unsafeWindow` is a non-null object, `false` otherwise.
 */
export function isUnsafeWindowAccessible(): boolean {
  return typeof unsafeWindow === 'object' && unsafeWindow !== null;
}

/**
 * Check namespace for backward compatibility with the global `_muse.Check` API.
 */
export const Check = {
  isIframe,
  isWindowAccessible,
  isUnsafeWindowAccessible,
} as const;
