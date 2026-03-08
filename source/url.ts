/**
 * URL matching and SPA navigation detection utilities.
 * @module url
 */

/**
 * Options for {@link matchUrl}.
 */
export interface MatchUrlOptions {
  /** A string pattern or RegExp to test against the current URL. */
  pattern: string | RegExp;
  /** The URL to test. @defaultValue `window.location.href` */
  url?: string | undefined;
}

/**
 * Tests whether a URL matches a pattern.
 *
 * - If `pattern` is a `RegExp`, it's tested directly.
 * - If `pattern` is a string, it's treated as a glob-like pattern where `*`
 *   matches any sequence of characters.
 *
 * @param options - Match options.
 * @returns `true` if the URL matches the pattern.
 *
 * @example
 * ```ts
 * if (matchUrl({ pattern: '*://example.com/dashboard/*' })) {
 *   // We're on the dashboard
 * }
 *
 * if (matchUrl({ pattern: /\/user\/\d+/ })) {
 *   // We're on a user profile page
 * }
 * ```
 */
export function matchUrl(options: MatchUrlOptions): boolean {
  const url = options.url ?? window.location.href;

  if (options.pattern instanceof RegExp) {
    return options.pattern.test(url);
  }

  // Convert glob-like pattern to RegExp
  const escaped = options.pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`).test(url);
}

/**
 * Handle returned by SPA navigation watchers.
 */
export interface NavigationHandle {
  /** Stop watching for navigation changes. */
  stop(): void;
}

/**
 * Watches for SPA-style navigation changes (pushState, replaceState, popstate).
 * Calls the callback whenever the URL changes.
 *
 * @param callback - Invoked with the new URL string on each navigation.
 * @returns A {@link NavigationHandle} to stop watching.
 *
 * @example
 * ```ts
 * const handle = onUrlChange((newUrl) => {
 *   console.log('Navigated to:', newUrl);
 *   if (newUrl.includes('/settings')) {
 *     initSettings();
 *   }
 * });
 *
 * // Later: cleanup
 * handle.stop();
 * ```
 */
export function onUrlChange(callback: (url: string) => void): NavigationHandle {
  let lastUrl = window.location.href;

  const check = (): void => {
    const current = window.location.href;
    if (current !== lastUrl) {
      lastUrl = current;
      callback(current);
    }
  };

  // Patch pushState and replaceState
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    originalPushState(...args);
    check();
  };

  history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
    originalReplaceState(...args);
    check();
  };

  // Listen for popstate (back/forward)
  window.addEventListener('popstate', check);

  return {
    stop: () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', check);
    },
  };
}

/**
 * Returns parsed URL parameters as a typed record.
 *
 * @param url - The URL to parse. @defaultValue `window.location.href`
 * @returns A record of parameter names to values.
 *
 * @example
 * ```ts
 * // URL: https://example.com?page=1&sort=name
 * const params = getUrlParams();
 * // { page: '1', sort: 'name' }
 * ```
 */
export function getUrlParams(url?: string): Record<string, string> {
  const searchParams = new URL(url ?? window.location.href).searchParams;
  const result: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Url namespace for backward compatibility with the global `_muse.Url` API.
 */
export const Url = {
  matchUrl,
  onUrlChange,
  getUrlParams,
} as const;
