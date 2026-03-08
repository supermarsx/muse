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
 * Cache for compiled glob-to-regex patterns with LRU eviction.
 * @internal
 */
const patternCache = new Map<string, RegExp>();

/** @internal Maximum entries in the pattern cache before evicting oldest. */
const MAX_PATTERN_CACHE_SIZE = 500;

/**
 * Tests whether a URL matches a pattern.
 *
 * - If `pattern` is a `RegExp`, it's tested directly.
 * - If `pattern` is a string, it's treated as a glob-like pattern where `*`
 *   matches any sequence of characters. Compiled patterns are cached for reuse.
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

  let compiled = patternCache.get(options.pattern);
  if (!compiled) {
    const escaped = options.pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^\\s]*');
    compiled = new RegExp(`^${escaped}$`);
    // LRU eviction: remove oldest entry when cache is full
    if (patternCache.size >= MAX_PATTERN_CACHE_SIZE) {
      const firstKey = patternCache.keys().next().value;
      if (firstKey !== undefined) {
        patternCache.delete(firstKey);
      }
    }
    patternCache.set(options.pattern, compiled);
  }
  return compiled.test(url);
}

/**
 * Handle returned by SPA navigation watchers.
 */
export interface NavigationHandle {
  /** Stop watching for navigation changes. */
  stop(): void;
}

// --- Centralized history patch registry ---
const urlChangeCallbacks = new Set<(url: string) => void>();
let historyPatched = false;
let originalPushState: typeof history.pushState;
let originalReplaceState: typeof history.replaceState;
let lastUrl = '';
let checking = false;

/** @internal Shared check function for all URL change listeners. */
function checkUrlChange(): void {
  if (checking) return; // reentrancy guard
  checking = true;
  try {
    const current = window.location.href;
    if (current !== lastUrl) {
      lastUrl = current;
      for (const cb of urlChangeCallbacks) {
        try {
          cb(current);
        } catch {
          // Don't let one callback break others
        }
      }
    }
  } finally {
    checking = false;
  }
}

/** @internal Patches history methods exactly once. */
function ensureHistoryPatched(): void {
  if (historyPatched) return;
  historyPatched = true;
  lastUrl = window.location.href;

  originalPushState = history.pushState.bind(history);
  originalReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    originalPushState(...args);
    checkUrlChange();
  };

  history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
    originalReplaceState(...args);
    checkUrlChange();
  };

  window.addEventListener('popstate', checkUrlChange, { passive: true });
}

/**
 * Watches for SPA-style navigation changes (pushState, replaceState, popstate).
 * Calls the callback whenever the URL changes.
 *
 * Multiple calls share a single set of history patches, avoiding the stacking
 * problem where each call wraps the previous wrapper. Calling `stop()` safely
 * removes only the registered callback.
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
  ensureHistoryPatched();
  urlChangeCallbacks.add(callback);

  return {
    stop: () => {
      urlChangeCallbacks.delete(callback);
      // Restore originals when the last listener is removed
      if (urlChangeCallbacks.size === 0 && historyPatched) {
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
        window.removeEventListener('popstate', checkUrlChange);
        historyPatched = false;
      }
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
  try {
    const searchParams = new URL(url ?? window.location.href).searchParams;
    return Object.fromEntries(searchParams.entries());
  } catch (error: unknown) {
    throw new Error(`Invalid URL: "${url ?? ''}"`, { cause: error });
  }
}

/**
 * Url namespace for backward compatibility with the global `_muse.Url` API.
 */
export const Url = {
  matchUrl,
  onUrlChange,
  getUrlParams,
} as const;
