/**
 * Network request interception utilities (fetch and XMLHttpRequest).
 * @module intercept
 */

/**
 * A request descriptor passed to intercept callbacks.
 */
export interface InterceptedRequest {
  /** The request URL. */
  url: string;
  /** The HTTP method (GET, POST, etc.). */
  method: string;
}

/**
 * A response descriptor passed to response-intercept callbacks.
 */
export interface InterceptedResponse {
  /** The request URL. */
  url: string;
  /** The HTTP status code. */
  status: number;
  /** The response body (parsed JSON, text string, or null if not readable/binary). */
  body: unknown;
}

/**
 * Callback for intercepting outgoing requests.
 * Return `false` to block the request (fetch only).
 */
export type RequestInterceptor = (request: InterceptedRequest) => void | false;

/**
 * Callback for intercepting incoming responses.
 */
export type ResponseInterceptor = (response: InterceptedResponse) => void;

/**
 * Handle returned by intercept functions to restore original behavior.
 */
export interface InterceptHandle {
  /** Remove the intercept and restore the original function. */
  restore(): void;
}

/** @internal Intercept options shape. */
interface InterceptOptions {
  onRequest?: RequestInterceptor | undefined;
  onResponse?: ResponseInterceptor | undefined;
}

// --- Centralized fetch interception registry ---
const fetchInterceptors = new Set<InterceptOptions>();
let fetchPatched = false;
let originalFetch: typeof window.fetch;

/** @internal Patches window.fetch exactly once. */
function ensureFetchPatched(): void {
  if (fetchPatched) return;
  fetchPatched = true;
  originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? 'GET';

    // Fire onRequest callbacks; if any returns false, block the request
    for (const interceptor of fetchInterceptors) {
      if (interceptor.onRequest) {
        const result = interceptor.onRequest({ url, method });
        if (result === false) {
          return new Response(null, { status: 0, statusText: 'Blocked by interceptor' });
        }
      }
    }

    const response = await originalFetch(input, init);

    // Fire onResponse callbacks asynchronously to avoid blocking the caller
    let hasResponseInterceptor = false;
    for (const interceptor of fetchInterceptors) {
      if (interceptor.onResponse) {
        hasResponseInterceptor = true;
        break;
      }
    }
    if (hasResponseInterceptor) {
      const clone = response.clone();
      // Only read body for text/json content types to avoid consuming large binary responses
      void (async () => {
        let body: unknown = null;
        const contentType = clone.headers.get('content-type') ?? '';
        if (contentType.includes('json') || contentType.includes('text')) {
          try {
            const text = await clone.text();
            try {
              body = JSON.parse(text);
            } catch {
              body = text;
            }
          } catch {
            // Body not readable — leave as null
          }
        }
        const info: InterceptedResponse = { url, status: response.status, body };
        for (const interceptor of fetchInterceptors) {
          if (interceptor.onResponse) {
            try {
              interceptor.onResponse(info);
            } catch {
              // Don't let one interceptor break others
            }
          }
        }
      })();
    }

    return response;
  };
}

/**
 * Intercepts all `fetch()` calls. The `onRequest` callback fires before each
 * request; the `onResponse` callback fires after each response.
 *
 * Multiple calls share a single fetch patch, avoiding the stacking problem
 * where each call wraps the previous wrapper. Calling `restore()` safely
 * removes only the registered interceptor.
 *
 * @param options - Intercept callbacks.
 * @returns An {@link InterceptHandle} to restore the original `fetch`.
 *
 * @example
 * ```ts
 * const handle = interceptFetch({
 *   onRequest: (req) => console.log('Fetching:', req.url),
 *   onResponse: (res) => console.log('Got status:', res.status),
 * });
 *
 * // Later: restore original fetch
 * handle.restore();
 * ```
 */
export function interceptFetch(options: {
  onRequest?: RequestInterceptor | undefined;
  onResponse?: ResponseInterceptor | undefined;
}): InterceptHandle {
  ensureFetchPatched();
  fetchInterceptors.add(options);

  return {
    restore: () => {
      fetchInterceptors.delete(options);
      if (fetchInterceptors.size === 0 && fetchPatched) {
        window.fetch = originalFetch;
        fetchPatched = false;
      }
    },
  };
}

// --- Centralized XHR interception registry ---
const xhrInterceptors = new Set<InterceptOptions>();
let xhrPatched = false;
let OriginalXHR: typeof XMLHttpRequest;

/** @internal Patches window.XMLHttpRequest exactly once. */
function ensureXHRPatched(): void {
  if (xhrPatched) return;
  xhrPatched = true;
  OriginalXHR = window.XMLHttpRequest;

  const PatchedXHR = function (this: XMLHttpRequest) {
    const xhr = new OriginalXHR();
    let capturedUrl = '';
    let capturedMethod = 'GET';

    const originalOpen = xhr.open;
    xhr.open = function (method: string, url: string | URL, ...rest: unknown[]) {
      capturedMethod = method;
      capturedUrl = typeof url === 'string' ? url : url.href;

      for (const interceptor of xhrInterceptors) {
        if (interceptor.onRequest) {
          try {
            interceptor.onRequest({ url: capturedUrl, method: capturedMethod });
          } catch {
            // Don't let one interceptor break others
          }
        }
      }

      return (originalOpen as Function).call(xhr, method, url, ...rest);
    } as typeof xhr.open;

    // Only process response if there are response interceptors
    xhr.addEventListener('load', () => {
      let hasResponseInterceptor = false;
      for (const interceptor of xhrInterceptors) {
        if (interceptor.onResponse) {
          hasResponseInterceptor = true;
          break;
        }
      }
      if (!hasResponseInterceptor) return;

      let body: unknown = null;
      const contentType = xhr.getResponseHeader('content-type') ?? '';
      if (contentType.includes('json') || contentType.includes('text')) {
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          body = xhr.responseText;
        }
      }

      const info: InterceptedResponse = { url: capturedUrl, status: xhr.status, body };
      for (const interceptor of xhrInterceptors) {
        if (interceptor.onResponse) {
          try {
            interceptor.onResponse(info);
          } catch {
            // Don't let one interceptor break others
          }
        }
      }
    });

    return xhr;
  } as unknown as typeof XMLHttpRequest;

  PatchedXHR.prototype = OriginalXHR.prototype;
  Object.defineProperty(PatchedXHR, 'UNSENT', { value: 0 });
  Object.defineProperty(PatchedXHR, 'OPENED', { value: 1 });
  Object.defineProperty(PatchedXHR, 'HEADERS_RECEIVED', { value: 2 });
  Object.defineProperty(PatchedXHR, 'LOADING', { value: 3 });
  Object.defineProperty(PatchedXHR, 'DONE', { value: 4 });

  window.XMLHttpRequest = PatchedXHR;
}

/**
 * Intercepts all `XMLHttpRequest` calls. The `onRequest` callback fires on
 * `open()`; the `onResponse` callback fires on `load`.
 *
 * Multiple calls share a single XHR patch, avoiding the stacking problem.
 * Calling `restore()` safely removes only the registered interceptor.
 *
 * @param options - Intercept callbacks.
 * @returns An {@link InterceptHandle} to restore the original XMLHttpRequest.
 *
 * @example
 * ```ts
 * const handle = interceptXHR({
 *   onRequest: (req) => console.log('XHR:', req.method, req.url),
 * });
 *
 * // Later: restore
 * handle.restore();
 * ```
 */
export function interceptXHR(options: {
  onRequest?: RequestInterceptor | undefined;
  onResponse?: ResponseInterceptor | undefined;
}): InterceptHandle {
  ensureXHRPatched();
  xhrInterceptors.add(options);

  return {
    restore: () => {
      xhrInterceptors.delete(options);
      if (xhrInterceptors.size === 0 && xhrPatched) {
        window.XMLHttpRequest = OriginalXHR;
        xhrPatched = false;
      }
    },
  };
}

/**
 * Intercept namespace for backward compatibility with the global `_muse.Intercept` API.
 */
export const Intercept = {
  interceptFetch,
  interceptXHR,
} as const;
