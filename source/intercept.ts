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
  /** The response body (may be null if not available). */
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

/**
 * Intercepts all `fetch()` calls. The `onRequest` callback fires before each
 * request; the `onResponse` callback fires after each response.
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
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? 'GET';

    if (options.onRequest) {
      const result = options.onRequest({ url, method });
      if (result === false) {
        return new Response(null, { status: 0, statusText: 'Blocked by interceptor' });
      }
    }

    const response = await originalFetch(input, init);

    if (options.onResponse) {
      // Clone so the original response body is still consumable
      const clone = response.clone();
      let body: unknown = null;
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
      options.onResponse({ url, status: response.status, body });
    }

    return response;
  };

  return {
    restore: () => {
      window.fetch = originalFetch;
    },
  };
}

/**
 * Intercepts all `XMLHttpRequest` calls. The `onRequest` callback fires on
 * `open()`; the `onResponse` callback fires on `load`.
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
  const OriginalXHR = window.XMLHttpRequest;

  const PatchedXHR = function (this: XMLHttpRequest) {
    const xhr = new OriginalXHR();
    let capturedUrl = '';
    let capturedMethod = 'GET';

    const originalOpen = xhr.open.bind(xhr);
    xhr.open = ((method: string, url: string | URL, ...rest: unknown[]) => {
      capturedMethod = method;
      capturedUrl = typeof url === 'string' ? url : url.href;

      if (options.onRequest) {
        options.onRequest({ url: capturedUrl, method: capturedMethod });
      }

      // Call the original open with proper arguments
      return (originalOpen as (...args: unknown[]) => void)(method, url, ...rest);
    }) as typeof xhr.open;

    if (options.onResponse) {
      xhr.addEventListener('load', () => {
        let body: unknown = null;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          body = xhr.responseText;
        }
        options.onResponse!({ url: capturedUrl, status: xhr.status, body });
      });
    }

    return xhr;
  } as unknown as typeof XMLHttpRequest;

  PatchedXHR.prototype = OriginalXHR.prototype;
  // Preserve static properties
  Object.defineProperty(PatchedXHR, 'UNSENT', { value: 0 });
  Object.defineProperty(PatchedXHR, 'OPENED', { value: 1 });
  Object.defineProperty(PatchedXHR, 'HEADERS_RECEIVED', { value: 2 });
  Object.defineProperty(PatchedXHR, 'LOADING', { value: 3 });
  Object.defineProperty(PatchedXHR, 'DONE', { value: 4 });

  window.XMLHttpRequest = PatchedXHR;

  return {
    restore: () => {
      window.XMLHttpRequest = OriginalXHR;
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
