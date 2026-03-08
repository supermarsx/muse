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
 */
export function getInjectionTarget(location: InjectionLocation): HTMLHeadElement | HTMLBodyElement {
  return document[location];
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
  if (wait) {
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
