/**
 * Structured console logging utilities.
 * @module console
 */

import type { ResultLogOptions } from './types/console.type';
import { libraryName } from './about';
import { wrapError } from './utils/errors';

/**
 * Logs the result of a function call to the console with a success/failure indicator.
 * Automatically detects the calling function name from the stack trace.
 *
 * @param options - Logging options.
 * @param options.errorObject - An Error if the operation failed; omit for success.
 * @param options.useLibraryName - If `true`, prefixes the log with the library name.
 *
 * @example
 * ```ts
 * try {
 *   doSomething();
 *   logResult(); // logs: "doSomething: [checkmark]"
 * } catch (err) {
 *   logResult({ errorObject: err }); // logs: "doSomething: [cross]" + error details
 * }
 * ```
 */
export function logResult({ errorObject, useLibraryName = false }: ResultLogOptions = {}): void {
  try {
    const isSuccess = errorObject === undefined;
    const status = isSuccess ? '[OK]' : '[FAIL]';
    const prefix = useLibraryName ? `${libraryName}::` : '';

    const stackLines = new Error().stack?.split('\n');
    const callerLine = stackLines && stackLines.length > 2 ? stackLines[2].trim() : 'unknown';
    const callerFunction = callerLine.split(' ')[1] ?? 'anonymous';

    const message = `${prefix}${callerFunction}: ${status}`;
    window.console.log(message);

    if (!isSuccess) {
      window.console.error(errorObject);
    }
  } catch (error: unknown) {
    throw wrapError('Failed to log function result.', error);
  }
}

/**
 * Console namespace for backward compatibility with the global `_muse.Console` API.
 */
export const Console = {
  Function: {
    result: logResult,
  },
} as const;
