/**
 * Window object polling utilities.
 * Wait for objects to appear on the `window` global.
 * @module object
 */

import type { WaitForObjectOptions, WaitForNestedObjectOptions } from './types/object.type';
import { pollUntil } from './utils/polling';
import { win } from './utils/window';

/**
 * Waits for a top-level property on `window` to exist and be an Object.
 *
 * @param options - Wait options.
 * @param options.propertyName - The property name on `window` to poll for.
 * @param options.interval - Polling interval in ms. @defaultValue 50
 * @param options.timeout - Maximum wait time in ms. @defaultValue 15000
 * @returns A Promise resolving to the object once found.
 *
 * @example
 * ```ts
 * const myLib = await waitForObject({ propertyName: 'myLib' });
 * ```
 */
export function waitForObject({ propertyName, interval, timeout, signal }: WaitForObjectOptions): Promise<object> {
  return pollUntil<object>(
    () => {
      const value = win[propertyName];
      return value != null && typeof value === 'object' ? (value as object) : null;
    },
    { interval, timeout, signal },
    `Timed out waiting for object "${propertyName}" on window.`,
  );
}

/**
 * Waits for a nested (second-level) property on `window` to exist and be an Object.
 *
 * @param options - Wait options.
 * @param options.firstLevel - The first-level property name on `window`.
 * @param options.secondLevel - The second-level property name.
 * @param options.interval - Polling interval in ms. @defaultValue 50
 * @param options.timeout - Maximum wait time in ms. @defaultValue 15000
 * @returns A Promise resolving to the nested object once found.
 *
 * @example
 * ```ts
 * const api = await waitForNestedObject({ firstLevel: 'myLib', secondLevel: 'api' });
 * ```
 */
export function waitForNestedObject({
  firstLevel,
  secondLevel,
  interval,
  timeout,
  signal,
}: WaitForNestedObjectOptions): Promise<object> {
  return pollUntil<object>(
    () => {
      const parent = win[firstLevel];
      if (parent == null || typeof parent !== 'object') {
        return null;
      }
      const value = (parent as Record<string, unknown>)[secondLevel];
      return value != null && typeof value === 'object' ? (value as object) : null;
    },
    { interval, timeout, signal },
    `Timed out waiting for nested object "${firstLevel}.${secondLevel}" on window.`,
  );
}

/**
 * ObjectFn namespace for backward compatibility with the global `_muse.ObjectFn` API.
 */
export const ObjectFn = {
  wait: waitForObject,
  waitFor2ndLevel: waitForNestedObject,
  wait2nd: waitForNestedObject,
} as const;
