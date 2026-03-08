/**
 * CSS filter-based dark mode utilities.
 * @module darkmode
 */

import type {
  InvertColorsOptions,
  InvertColorsAndHueRotateOptions,
  ElementDarkmodeOptions,
  DarkmodeMethod,
} from './types/darkmode.type';
import { injectStyle, injectTextHead } from './style';
import { wrapError } from './utils/errors';
import { toArray, validateCssSelector } from './utils/dom';

/** @internal Pattern to reject dangerous characters in additionalFilters. */
const DANGEROUS_FILTER_CHARS = /[{}<>;]/;

/** @internal Pattern to reject url() references in additionalFilters. */
const DANGEROUS_FILTER_URL = /url\s*\(/i;

/** @internal Allowlist of safe CSS filter function names. */
const SAFE_FILTER_FUNCTIONS = new Set([
  'blur',
  'brightness',
  'contrast',
  'drop-shadow',
  'grayscale',
  'hue-rotate',
  'invert',
  'opacity',
  'saturate',
  'sepia',
]);

/** @internal Regex to extract function names from a CSS filter string. */
const FILTER_FUNCTION_NAMES = /([a-z-]+)\s*\(/gi;

/**
 * Validates that additionalFilters only contains safe CSS filter functions.
 * @internal
 */
function validateAdditionalFilters(filters: string): void {
  if (!filters) return;
  if (DANGEROUS_FILTER_CHARS.test(filters) || DANGEROUS_FILTER_URL.test(filters)) {
    throw new Error('additionalFilters contains invalid characters or url() references.');
  }
  // Block CSS comment sequences that could break out of filter context
  if (/\/\*/.test(filters)) {
    throw new Error('additionalFilters contains disallowed CSS comment sequence.');
  }
  // Check that all function calls use allowed filter names
  // Use matchAll to avoid shared mutable lastIndex state on the global regex
  for (const match of filters.matchAll(FILTER_FUNCTION_NAMES)) {
    if (!SAFE_FILTER_FUNCTIONS.has(match[1].toLowerCase())) {
      throw new Error(`additionalFilters contains disallowed function: "${match[1]}".`);
    }
  }
}

/**
 * Validates that a numeric parameter is a finite number.
 * @internal
 */
function validateFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`Parameter "${name}" must be a finite number, got ${value}.`);
  }
}

/**
 * Generates a CSS string for filter-based color inversion.
 * @internal
 */
function getInversionCss({
  invert = 1,
  tags = 'html, img, video, iframe',
  additionalFilters = '',
}: InvertColorsOptions = {}): string {
  validateCssSelector(tags);
  validateFiniteNumber(invert, 'invert');
  if (invert < 0 || invert > 1) {
    throw new Error(`Parameter "invert" must be between 0 and 1, got ${invert}.`);
  }
  validateAdditionalFilters(additionalFilters);
  return `
    body { background: white; }
    ${tags} { filter: invert(${invert}) ${additionalFilters}; }
  `;
}

/**
 * Inverts colors of specific tags/selectors using CSS filters to achieve dark mode.
 *
 * @param options - Inversion options.
 * @param options.invert - Inversion amount (0-1). @defaultValue 1
 * @param options.tags - CSS selectors to apply inversion to. @defaultValue 'html, img, video, iframe'
 * @param options.additionalFilters - Extra CSS filter functions. @defaultValue ''
 * @returns The injected HTMLStyleElement.
 *
 * @example
 * ```ts
 * invertColors(); // Full inversion
 * invertColors({ invert: 0.9, tags: 'html, img' });
 * ```
 */
export function invertColors(options: InvertColorsOptions = {}): HTMLStyleElement {
  try {
    const css = getInversionCss(options);
    return injectStyle({ text: css }) as HTMLStyleElement;
  } catch (error: unknown) {
    throw wrapError('Failed to invert colors.', error);
  }
}

/**
 * Inverts and hue-rotates colors for a more natural dark mode appearance.
 *
 * @param options - Inversion and rotation options.
 * @param options.invert - Inversion amount (0-1). @defaultValue 1
 * @param options.rotation - Hue rotation in degrees. @defaultValue 180
 * @param options.tags - CSS selectors to apply to. @defaultValue 'html, img, video, iframe'
 * @param options.additionalFilters - Extra CSS filter functions.
 * @returns The injected HTMLStyleElement.
 */
export function invertColorsAndHueRotate({
  invert = 1,
  rotation = 180,
  tags = 'html, img, video, iframe',
  additionalFilters = '',
}: InvertColorsAndHueRotateOptions = {}): HTMLStyleElement {
  try {
    validateFiniteNumber(rotation, 'rotation');
    const combinedFilters = `hue-rotate(${rotation}deg) ${additionalFilters}`;
    return invertColors({ invert, tags, additionalFilters: combinedFilters });
  } catch (error: unknown) {
    throw wrapError('Failed to invert colors and hue rotate.', error);
  }
}

// --- Presets ---

/**
 * Preset: Invert 90% with 180deg hue rotation.
 */
export function presetInvertAndHueRotate90(): HTMLStyleElement {
  return invertColorsAndHueRotate({ invert: 0.9 });
}

/**
 * Preset: Invert 85% with 180deg hue rotation.
 */
export function presetInvertAndHueRotate85(): HTMLStyleElement {
  return invertColorsAndHueRotate({ invert: 0.85 });
}

/**
 * Preset: Invert 85%, hue-rotate 180deg, alt tags, 95% contrast.
 */
export function presetInvertAltTagsContrast85(): HTMLStyleElement {
  return invertColorsAndHueRotate({
    invert: 0.85,
    tags: 'html, img, video',
    additionalFilters: 'contrast(0.95)',
  });
}

// --- Element-level darkmode ---

/**
 * Generates a CSS string for element-level darkmode by method number.
 * @internal
 */
function getElementDarkmodeCss(selector: string, method: DarkmodeMethod): string {
  validateCssSelector(selector);
  switch (method) {
    case 1:
      return `
        ${selector}, ${selector} a, ${selector} span { color: #000000 !important; }
        ${selector} { background: #ffffff !important; }
        ${selector} { filter: invert(1) hue-rotate(180deg) !important; }
      `;
    case 2:
      return `
        ${selector}, ${selector} a, ${selector} span { color: #000000 !important; }
        ${selector} { background: #ffffff !important; }
      `;
    case 3:
      return `
        ${selector} img { filter: invert(1) hue-rotate(180deg) !important; }
      `;
    default:
      throw new Error(`Unknown darkmode method: ${String(method)}.`);
  }
}

/**
 * Applies element-level darkmode using a specific method.
 *
 * @param options - Element selection options.
 * @param method - The darkmode method (1, 2, or 3).
 * @returns Style element(s) injected.
 */
function applyElementDarkmode(
  { selectorOrArrayOfSelectors }: ElementDarkmodeOptions,
  method: DarkmodeMethod,
): HTMLStyleElement {
  const selectors = toArray(selectorOrArrayOfSelectors);

  // Batch all CSS into a single <style> element to avoid N style recalculations
  const combinedCss = selectors.map((selector) => getElementDarkmodeCss(selector, method)).join('\n');
  return injectTextHead({ text: combinedCss });
}

/**
 * Apply darkmode method 1 (invert + hue-rotate + forced colors/background) to element(s).
 */
export function elementDarkmodeMethod1(options: ElementDarkmodeOptions): HTMLStyleElement {
  return applyElementDarkmode(options, 1);
}

/**
 * Apply darkmode method 2 (forced colors/background only) to element(s).
 */
export function elementDarkmodeMethod2(options: ElementDarkmodeOptions): HTMLStyleElement {
  return applyElementDarkmode(options, 2);
}

/**
 * Apply darkmode method 3 (invert images within selector) to element(s).
 */
export function elementDarkmodeMethod3(options: ElementDarkmodeOptions): HTMLStyleElement {
  return applyElementDarkmode(options, 3);
}

/**
 * Darkmode namespace for backward compatibility with the global `_muse.Darkmode` API.
 */
export const Darkmode = {
  invertColors,
  invert: invertColors,
  invertColorsAndHueRotate,
  invertRotate: invertColorsAndHueRotate,
  Preset: {
    invertAndHueRotate90: presetInvertAndHueRotate90,
    invertAndHueRotate85: presetInvertAndHueRotate85,
    invertAndHueRotateAltTagsAndContrast85: presetInvertAltTagsContrast85,
  },
  Element: {
    method1: elementDarkmodeMethod1,
    method2: elementDarkmodeMethod2,
    method3: elementDarkmodeMethod3,
  },
} as const;
