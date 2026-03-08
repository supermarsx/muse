/**
 * Console utility types.
 * @module types/console
 */

/**
 * Parameters for the structured console result logger.
 */
export interface ResultLogOptions {
  /** An error object if the operation failed; omit for success. */
  errorObject?: Error | undefined;
  /** Whether to prefix the log message with the library name. */
  useLibraryName?: boolean;
}
