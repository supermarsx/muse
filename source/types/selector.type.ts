/**
 * Selector utility types.
 * @module types/selector
 */

/**
 * Options for selecting a single DOM element.
 */
export interface GetElementOptions {
  /** CSS selector string. */
  selector: string;
  /** If true, waits for the element to appear in the DOM. */
  wait?: boolean;
  /** An AbortSignal to cancel the wait early (only used when `wait` is true). */
  signal?: AbortSignal | undefined;
}

/** Options for getElement with wait: true. */
export interface GetElementWaitOptions {
  selector: string;
  wait: true;
  /** An AbortSignal to cancel the wait early. */
  signal?: AbortSignal | undefined;
}

/** Options for getElement with wait: false or unset. */
export interface GetElementSyncOptions {
  selector: string;
  wait?: false;
}

/**
 * Options for waiting for an element to appear in the DOM.
 */
export interface WaitForElementOptions {
  /** CSS selector string. */
  selector: string;
  /** Timeout in milliseconds. @defaultValue 15000 */
  timeout?: number;
  /** An AbortSignal to cancel the wait early. */
  signal?: AbortSignal | undefined;
}

/**
 * Options for selecting all matching DOM elements.
 */
export interface QueryAllOptions {
  /** CSS selector string. */
  selector: string;
}
