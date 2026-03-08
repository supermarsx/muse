/**
 * Darkmode utility types.
 * @module types/darkmode
 */

/**
 * Options for CSS filter-based color inversion.
 */
export interface InvertColorsOptions {
  /** Inversion amount from 0 (none) to 1 (full). @defaultValue 1 */
  invert?: number;
  /** CSS selectors to apply the inversion filter to. @defaultValue 'html, img, video, iframe' */
  tags?: string;
  /** Additional CSS filter functions to append. @defaultValue '' */
  additionalFilters?: string;
}

/**
 * Options for CSS filter-based color inversion with hue rotation.
 */
export interface InvertColorsAndHueRotateOptions extends InvertColorsOptions {
  /** Hue rotation in degrees. @defaultValue 180 */
  rotation?: number;
}

/**
 * Options for applying darkmode to specific elements.
 */
export interface ElementDarkmodeOptions {
  /** A single CSS selector or an array of selectors to apply darkmode to. */
  selectorOrArrayOfSelectors: string | string[];
}

/**
 * The darkmode method number (1, 2, or 3).
 * - Method 1: Invert + hue-rotate with forced colors and background
 * - Method 2: Forced colors and background only
 * - Method 3: Invert images within the selector
 */
export type DarkmodeMethod = 1 | 2 | 3;
