/**
 * Array utilities for substring matching.
 * @module array
 */

import type { ArrayContainsParams } from './types/array.type';

/**
 * Checks whether a source string contains any of the given substrings.
 *
 * @param options - The search parameters.
 * @param options.sourceString - The string to search within.
 * @param options.substrings - An array of substrings to look for.
 * @returns `true` if at least one substring is found, `false` otherwise.
 *
 * @example
 * ```ts
 * containsAny({ sourceString: 'hello world', substrings: ['world', 'foo'] }); // true
 * containsAny({ sourceString: 'hello', substrings: ['world'] }); // false
 * ```
 */
export function containsAny({ sourceString, substrings }: ArrayContainsParams): boolean {
  for (const sub of substrings) {
    if (sourceString.includes(sub)) {
      return true;
    }
  }
  return false;
}

/**
 * ArrayFn namespace for backward compatibility with the global `_muse.ArrayFn` API.
 */
export const ArrayFn = {
  containsAny,
} as const;
