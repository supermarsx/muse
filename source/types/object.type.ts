/**
 * Object utility types.
 * @module types/object
 */

import type { WaitForPropertyOptions, WaitForNestedPropertyOptions } from './common.type';

/**
 * Options for waiting on a top-level window object.
 */
export interface WaitForObjectOptions extends WaitForPropertyOptions {}

/**
 * Options for waiting on a nested (second-level) window object.
 */
export interface WaitForNestedObjectOptions extends WaitForNestedPropertyOptions {}
