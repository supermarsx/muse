/**
 * Clone utility types.
 * @module types/clone
 */

/**
 * Options for cloning a DOM element.
 * Provide either `elementSelector` or `sourceSelector`, but not both.
 */
export interface CloneElementOptions {
  /** CSS selector for the source element to clone. */
  elementSelector?: string;
  /** Alternative CSS selector for the source element (alias for `elementSelector`). */
  sourceSelector?: string;
  /** CSS selector for the destination element to append the clone to. */
  destinationSelector?: string;
}
