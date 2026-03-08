/**
 * Function utility types.
 * @module types/function
 */

import type { WaitForPropertyOptions, WaitForNestedPropertyOptions } from './common.type';

/**
 * Options for waiting on a top-level window function.
 */
export interface WaitForFunctionOptions extends WaitForPropertyOptions {}

/**
 * Options for waiting on a nested (second-level) window function.
 */
export interface WaitForNestedFunctionOptions extends WaitForNestedPropertyOptions {}

/**
 * Options for retrieving original parameters of a function from script contents.
 */
export interface GetOriginalParametersOptions {
  /** The function name to search for in script contents. */
  functionName: string;
}
