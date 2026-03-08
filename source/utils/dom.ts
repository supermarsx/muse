/**
 * Shared DOM injection utilities.
 * Consolidates the VALID_LOCATIONS constant and common injection patterns
 * that were duplicated across script.ts and style.ts.
 * @module utils/dom
 */

/**
 * Valid DOM locations where elements can be injected.
 */
export const VALID_LOCATIONS = ['head', 'body'] as const;

/**
 * Type for valid injection location strings.
 */
export type InjectionLocation = (typeof VALID_LOCATIONS)[number];

/**
 * Normalizes a value or array of values into an array.
 *
 * @param value - A single value or array of values.
 * @returns An array containing the value(s).
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Validates that a CSS selector string does not contain characters that could
 * enable CSS injection when interpolated into a stylesheet rule.
 *
 * @param selector - The CSS selector to validate.
 * @throws If the selector contains `{` or `}` characters.
 */
/** @internal Characters that could enable CSS injection when interpolated into a rule. */
const DANGEROUS_SELECTOR_CHARS = /[{}<>\\]/;

/** @internal Block CSS comment sequences that could break context. */
const CSS_COMMENT_PATTERN = /\/\*/;

export function validateCssSelector(selector: string): void {
  if (DANGEROUS_SELECTOR_CHARS.test(selector) || CSS_COMMENT_PATTERN.test(selector)) {
    throw new Error(`Invalid CSS selector: "${selector}" — contains disallowed characters.`);
  }
}

/**
 * Validates that a location string is a valid injection target.
 *
 * @param location - The location string to validate.
 * @throws If the location is not 'head' or 'body'.
 */
export function validateLocation(location: string): asserts location is InjectionLocation {
  if (!VALID_LOCATIONS.includes(location as InjectionLocation)) {
    throw new Error(`Invalid location: "${location}". Must be "head" or "body".`);
  }
}

/**
 * Gets the target DOM element for injection based on the location string.
 *
 * @param location - The validated location ('head' or 'body').
 * @returns The target HTMLElement.
 * @throws If the target element (document.head or document.body) is not available.
 */
export function getInjectionTarget(location: InjectionLocation): HTMLHeadElement | HTMLBodyElement {
  const target = document[location];
  if (!target) {
    throw new Error(`Injection target document.${location} is not available.`);
  }
  return target;
}

/** @internal Dangerous URL schemes that must never be injected as src/href. */
const UNSAFE_URL_SCHEMES = /^(javascript|data|vbscript):/i;

/**
 * Validates that a URL does not use a dangerous scheme (javascript:, data:, vbscript:).
 * @internal
 */
export function validateUrlScheme(url: string): void {
  if (UNSAFE_URL_SCHEMES.test(url.trim())) {
    throw new Error(`Unsafe URL scheme detected: "${url}".`);
  }
}

/**
 * Injects an element into the DOM, optionally returning a Promise that
 * resolves on load or rejects on error.
 *
 * @param element - The element to inject.
 * @param target - The DOM target to append to.
 * @param wait - Whether to wait for the element to load.
 * @param errorLabel - Label for the error message if loading fails (e.g. the URL).
 * @returns The element, or a Promise resolving to the load Event.
 */
export function injectElement<T extends HTMLElement>(
  element: T,
  target: HTMLElement,
  wait: boolean,
  errorLabel: string,
): Promise<Event> | T {
  // Validate URL scheme if errorLabel is a URL (non-empty means external resource)
  if (errorLabel) {
    validateUrlScheme(errorLabel);
  }
  if (wait) {
    // Inline content (no src/href) never fires load/error events.
    // Resolve immediately after appending to avoid hanging forever.
    if (!errorLabel) {
      target.appendChild(element);
      return Promise.resolve(new Event('load'));
    }

    return new Promise<Event>((resolve, reject) => {
      element.onload = (event: Event) => resolve(event);
      element.onerror = (event) =>
        reject(new Error(`Resource failed to load: ${errorLabel}`, { cause: event }));
      target.appendChild(element);
    });
  }

  target.appendChild(element);
  return element;
}

/**
 * Injects an array of items sequentially, each waiting for the previous to complete.
 *
 * @typeParam T - The return type of individual inject results.
 * @param items - Array of items to inject.
 * @param injectFn - Function that injects a single item (called with `wait: true`).
 * @returns A Promise resolving to an array of results.
 */
export async function injectArray<TItem, TResult>(
  items: TItem[],
  injectFn: (item: TItem) => Promise<TResult>,
): Promise<TResult[]> {
  const results: TResult[] = [];
  for (const item of items) {
    const result = await injectFn(item);
    results.push(result);
  }
  return results;
}
