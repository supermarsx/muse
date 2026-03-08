/**
 * Common shared types used across the library.
 * @module types/common
 */

/**
 * Options for polling-based wait functions.
 */
export interface WaitOptions {
  /** Polling interval in milliseconds. */
  interval?: number;
  /** Maximum time to wait before timing out, in milliseconds. */
  timeout?: number;
  /** An AbortSignal to cancel the wait early. */
  signal?: AbortSignal | undefined;
}

/**
 * Options for waiting on a top-level window property.
 */
export interface WaitForPropertyOptions extends WaitOptions {
  /** The property name on `window` to wait for. */
  propertyName: string;
}

/**
 * Options for waiting on a nested (second-level) window property.
 */
export interface WaitForNestedPropertyOptions extends WaitOptions {
  /** The first-level property name on `window`. */
  firstLevel: string;
  /** The second-level property name under `window[firstLevel]`. */
  secondLevel: string;
}

/**
 * Parameters for injecting a script or stylesheet.
 */
export interface InjectOptions {
  /** URL of the resource to inject. Mutually exclusive with `text`. */
  url?: string;
  /** Inline text content to inject. Mutually exclusive with `url`. */
  text?: string;
  /** DOM location to inject into. */
  location?: 'head' | 'body';
  /** Whether to return a Promise that resolves when the resource loads. */
  wait?: boolean;
}

/** Options for inject functions with wait: true. */
export interface InjectWaitOptions {
  url?: string;
  text?: string;
  location?: 'head' | 'body';
  wait: true;
}

/** Options for inject functions with wait: false or unset. */
export interface InjectSyncOptions {
  url?: string;
  text?: string;
  location?: 'head' | 'body';
  wait?: false;
}

/**
 * Result of removing an external resource.
 */
export interface RemovalResult {
  /** Name/partial src that was searched for. */
  name: string;
  /** Whether matching elements were found and removed. */
  removed: boolean;
}
