/**
 * Shared safe window accessor for dynamic property lookup.
 * Centralizes the `window as unknown as Record<string, unknown>` cast
 * that was duplicated across function.ts and object.ts.
 * @module utils/window
 */

/** @internal Keys that should never be accessed via dynamic property lookup. */
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Safe window reference typed as a string-keyed record for dynamic property access.
 *
 * TypeScript won't allow `window['dynamicProp']` without an index signature,
 * and `window` can't be directly cast to `Record<string, unknown>` — it must
 * go through `unknown` first.
 */
export const win: Record<string, unknown> = window as unknown as Record<string, unknown>;

/**
 * Validates that a property key is not a prototype-related key.
 *
 * @param key - The property name to check.
 * @throws If the key is `__proto__`, `constructor`, or `prototype`.
 */
export function validatePropertyKey(key: string): void {
  if (BLOCKED_KEYS.has(key)) {
    throw new Error(`Access to "${key}" is not allowed.`);
  }
}
