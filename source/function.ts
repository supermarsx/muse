/**
 * Window function polling and introspection utilities.
 * @module function
 */

import type {
  WaitForFunctionOptions,
  WaitForNestedFunctionOptions,
  GetOriginalParametersOptions,
} from './types/function.type';
import { pollUntil } from './utils/polling';
import { getAllScripts } from './selector';
import { wrapError } from './utils/errors';
import { win, validatePropertyKey } from './utils/window';

/**
 * Waits for a top-level function to exist on `window`.
 *
 * @param options - Wait options.
 * @param options.propertyName - The function name on `window` to poll for.
 * @param options.interval - Polling interval in ms. @defaultValue 50
 * @param options.timeout - Maximum wait time in ms. @defaultValue 15000
 * @returns A Promise that resolves when the function is found.
 *
 * @example
 * ```ts
 * await waitForFunction({ propertyName: 'initApp' });
 * window.initApp();
 * ```
 */
export function waitForFunction({ propertyName, interval, timeout, signal }: WaitForFunctionOptions): Promise<void> {
  validatePropertyKey(propertyName);
  return pollUntil(
    () => {
      const value = win[propertyName];
      return typeof value === 'function' ? true : null;
    },
    { interval, timeout, signal },
    `Timed out waiting for function "${propertyName}" on window.`,
  ).then(() => undefined);
}

/**
 * Waits for a nested (second-level) function to exist on `window`.
 *
 * @param options - Wait options.
 * @param options.firstLevel - The first-level property name on `window`.
 * @param options.secondLevel - The second-level function name.
 * @param options.interval - Polling interval in ms. @defaultValue 50
 * @param options.timeout - Maximum wait time in ms. @defaultValue 15000
 * @returns A Promise resolving to the function once found.
 *
 * @example
 * ```ts
 * const fn = await waitForNestedFunction({ firstLevel: 'myLib', secondLevel: 'init' });
 * fn();
 * ```
 */
export function waitForNestedFunction({
  firstLevel,
  secondLevel,
  interval,
  timeout,
  signal,
}: WaitForNestedFunctionOptions): Promise<(...args: unknown[]) => unknown> {
  validatePropertyKey(firstLevel);
  validatePropertyKey(secondLevel);
  return pollUntil(
    () => {
      const parent = win[firstLevel];
      if (parent == null || typeof parent !== 'object') {
        return null;
      }
      const value = (parent as Record<string, unknown>)[secondLevel];
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown) : null;
    },
    { interval, timeout, signal },
    `Timed out waiting for nested function "${firstLevel}.${secondLevel}" on window.`,
  );
}

/** @internal Regex to match function call patterns in script contents. */
const FUNCTION_CALL_REGEX = /(([\w.]+)\(([^)]*)\);*)/g;

/**
 * Scans all inline `<script>` elements and extracts function call signatures
 * using a regex pattern.
 *
 * @returns Array of regex match results, each representing a function call found in scripts.
 */
export function getFunctionList(): RegExpMatchArray[] {
  try {
    const scripts = getAllScripts();
    const results: RegExpMatchArray[] = [];

    for (const script of scripts) {
      const contents = script.innerHTML;
      for (const match of contents.matchAll(FUNCTION_CALL_REGEX)) {
        results.push(match);
      }
    }

    return results;
  } catch (error: unknown) {
    throw wrapError('Failed to get list of functions.', error);
  }
}

/**
 * Retrieves the original parameters of a function by scanning inline script contents.
 *
 * @param options - Search options.
 * @param options.functionName - The function name to search for.
 * @returns Array of parameter strings.
 * @throws If scanning fails or the function name is not found.
 */
export function getOriginalParameters({ functionName }: GetOriginalParametersOptions): string[] {
  try {
    const scripts = getAllScripts();

    for (const script of scripts) {
      const contents = script.innerHTML;
      for (const match of contents.matchAll(FUNCTION_CALL_REGEX)) {
        const currentScript = match[2];
        if (currentScript?.includes(functionName)) {
          const params = match[3];
          if (!params || params.trim() === '') return [];
          return params.split(',').map((p) => p.trim());
        }
      }
    }
    throw new Error(`Function "${functionName}" not found in script contents.`);
  } catch (error: unknown) {
    throw wrapError('Failed to get original function parameters from script list.', error);
  }
}

/**
 * FunctionFn namespace for backward compatibility with the global `_muse.FunctionFn` API.
 */
export const FunctionFn = {
  wait: waitForFunction,
  waitFor2ndLevel: waitForNestedFunction,
  wait2nd: waitForNestedFunction,
  getList: getFunctionList,
  getAll: getFunctionList,
  getOriginalParameters,
  getParameters: getOriginalParameters,
} as const;
