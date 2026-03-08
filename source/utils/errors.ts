/**
 * Shared error handling utilities.
 * Centralizes the error-wrapping pattern used throughout the library.
 * @module utils/errors
 */

/**
 * Wraps an error with a descriptive message, preserving the original cause.
 *
 * @param message - Human-readable description of what failed.
 * @param cause - The original error that triggered the failure.
 * @returns A new Error with the message and cause attached.
 */
export function wrapError(message: string, cause: unknown): Error {
  return new Error(message, { cause });
}
