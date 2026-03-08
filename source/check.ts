/**
 * Runtime environment checks for userscript contexts.
 * @module check
 */

declare const unsafeWindow: Window | undefined;

/**
 * Checks if the current window is running inside an iframe.
 *
 * @returns `true` if the current context is an iframe, `false` otherwise.
 */
export function isIframe(): boolean {
  return window !== window.parent;
}

/**
 * Checks if the `window` global is accessible.
 *
 * @returns `true` if `window` is an object, `false` otherwise.
 */
export function isWindowAccessible(): boolean {
  return typeof window === 'object';
}

/**
 * Checks if the Greasemonkey/Tampermonkey `unsafeWindow` global is accessible.
 *
 * @returns `true` if `unsafeWindow` is an object, `false` otherwise.
 */
export function isUnsafeWindowAccessible(): boolean {
  return typeof unsafeWindow === 'object';
}

/**
 * Check namespace for backward compatibility with the global `_muse.Check` API.
 */
export const Check = {
  isIframe,
  isWindowAccessible,
  isUnsafeWindowAccessible,
} as const;
