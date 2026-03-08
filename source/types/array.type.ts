/**
 * Array utility types.
 * @module types/array
 */

/**
 * Parameters for checking if a string contains any of an array of substrings.
 */
export interface ArrayContainsParams {
  /** The source string to search within. */
  sourceString: string;
  /** Array of substrings to search for. */
  substrings: string[];
}
