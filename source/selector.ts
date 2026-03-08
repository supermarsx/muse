/**
 * DOM element selector utilities.
 * @module selector
 */

import type {
  GetElementOptions,
  GetElementWaitOptions,
  GetElementSyncOptions,
  WaitForElementOptions,
  QueryAllOptions,
} from './types/selector.type';
import { wrapError } from './utils/errors';

/**
 * Selects the first DOM element matching the given CSS selector.
 * Optionally waits for the element to appear using a MutationObserver.
 *
 * @param options - Selection options.
 * @param options.selector - CSS selector string.
 * @param options.wait - If `true`, returns a Promise that resolves when the element appears.
 * @returns The matched Element, or a Promise resolving to it if `wait` is true.
 * @throws If the selector is empty or if `querySelector` fails.
 *
 * @example
 * ```ts
 * const el = getElement({ selector: '#my-div' });
 * const elAsync = await getElement({ selector: '#lazy-div', wait: true });
 * ```
 */
export function getElement(options: GetElementWaitOptions): Promise<Element>;
export function getElement(options: GetElementSyncOptions): Element;
export function getElement(options: GetElementOptions): Promise<Element> | Element;
export function getElement({ selector, wait = false, signal }: GetElementOptions): Promise<Element> | Element {
  try {
    if (!selector) {
      throw new Error('Selector parameter is empty.');
    }
    if (wait) {
      return waitForElement({ selector, signal });
    }
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`No element found for selector: ${selector}`);
    }
    return element;
  } catch (error: unknown) {
    throw wrapError('Failed to get element from selector.', error);
  }
}

/**
 * Waits for an element matching the CSS selector to appear in the DOM.
 * Uses a MutationObserver to detect DOM changes.
 *
 * @param options - Wait options.
 * @param options.selector - CSS selector string.
 * @param options.timeout - Maximum time to wait in ms. @defaultValue 15000
 * @returns A Promise that resolves with the Element, or rejects on timeout.
 */
export function waitForElement({ selector, timeout = 15000, signal }: WaitForElementOptions): Promise<Element> {
  if (!Number.isFinite(timeout) || timeout <= 0) {
    return Promise.reject(
      wrapError('Failed to wait for element.', new Error(`timeout must be a positive finite number, got ${timeout}.`)),
    );
  }

  return new Promise<Element>((resolve, reject) => {
    // If already aborted, reject immediately
    if (signal?.aborted) {
      reject(wrapError('Failed to wait for element.', new Error('Wait aborted.', { cause: signal.reason })));
      return;
    }

    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    let settled = false;
    let timer: ReturnType<typeof setTimeout>;

    const cleanup = (): void => {
      observer.disconnect();
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(wrapError('Failed to wait for element.', new Error('Wait aborted.', { cause: signal?.reason })));
    };

    const observer = new MutationObserver((mutations) => {
      if (settled) return;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.matches(selector)) {
              settled = true;
              cleanup();
              resolve(node);
              return;
            }
            const nested = node.querySelector(selector);
            if (nested) {
              settled = true;
              cleanup();
              resolve(nested);
              return;
            }
          }
        }
      }
    });

    // Use documentElement instead of body — body can be null if called before
    // the <body> tag is parsed (e.g. in a script in <head>).
    const root = document.documentElement ?? document.body;
    if (!root) {
      reject(wrapError('Failed to wait for element.', new Error('No root element available to observe.')));
      return;
    }

    observer.observe(root, { childList: true, subtree: true });
    signal?.addEventListener('abort', onAbort, { once: true });

    // Double-check after observe to close the race window between initial check and observe
    const afterObserve = document.querySelector(selector);
    if (afterObserve) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(afterObserve);
      return;
    }

    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(wrapError('Failed to wait for element.', new Error(`Timed out waiting for element: ${selector}`)));
    }, timeout);
  });
}

/**
 * Retrieves multiple elements in parallel. Each selector waits for its element to appear.
 *
 * @param selectors - Array of selection options (each may specify `wait`).
 * @param signal - Optional AbortSignal to cancel all pending waits.
 * @returns A Promise resolving to an array of matched Elements (in the same order as `selectors`).
 */
export async function getArrayOfElements(selectors: GetElementOptions[], signal?: AbortSignal): Promise<Element[]> {
  try {
    return await Promise.all(selectors.map((params) => getElement({ ...params, wait: true, signal })));
  } catch (error: unknown) {
    throw wrapError('Failed to get array of elements.', error);
  }
}

/**
 * Selects all DOM elements matching the given CSS selector.
 *
 * @param options - Query options.
 * @param options.selector - CSS selector string.
 * @returns A NodeList of matching Elements.
 */
export function queryAll({ selector }: QueryAllOptions): NodeListOf<Element> {
  try {
    if (!selector) {
      throw new Error('Selector parameter is empty.');
    }
    return document.querySelectorAll(selector);
  } catch (error: unknown) {
    throw wrapError('Failed to get element collection from selector.', error);
  }
}

/**
 * Selects all `<script>` elements in the DOM.
 *
 * @returns A NodeList of all script elements.
 */
export function getAllScripts(): NodeListOf<HTMLScriptElement> {
  return document.querySelectorAll<HTMLScriptElement>('script');
}

/**
 * Selects all `<style>` elements in the DOM.
 *
 * @returns A NodeList of all style elements.
 */
export function getAllStyles(): NodeListOf<HTMLStyleElement> {
  return document.querySelectorAll<HTMLStyleElement>('style');
}

/**
 * Selector namespace for backward compatibility with the global `_muse.Selector` API.
 */
export const Selector = {
  getElement,
  get: getElement,
  waitForElement,
  getArrayOfElements,
  getArray: getArrayOfElements,
  getList: queryAll,
  list: queryAll,
  getListOfScripts: getAllScripts,
  allScripts: getAllScripts,
  getListOfStyles: getAllStyles,
  allStyles: getAllStyles,
} as const;
