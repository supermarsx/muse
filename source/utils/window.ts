/**
 * Shared safe window accessor for dynamic property lookup.
 * Centralizes the `window as unknown as Record<string, unknown>` cast
 * that was duplicated across function.ts and object.ts.
 * @module utils/window
 */

/**
 * Safe window reference typed as a string-keyed record for dynamic property access.
 *
 * TypeScript won't allow `window['dynamicProp']` without an index signature,
 * and `window` can't be directly cast to `Record<string, unknown>` — it must
 * go through `unknown` first.
 */
export const win: Record<string, unknown> = window as unknown as Record<string, unknown>;
