/**
 * CSS/style injection, manipulation, and element hiding utilities.
 * @module style
 */

import type { InjectOptions, InjectWaitOptions, InjectSyncOptions } from './types/common.type';
import type {
  HidingMethod,
  InlineStyleOptions,
  InlineStyleWaitOptions,
  InlineStyleSyncOptions,
  InlineStyleResult,
  GenericStyleMethodOptions,
  GenericStyleMethodResult,
  InjectTextHeadOptions,
  RemoveExternalStyleOptions,
} from './types/style.type';
import { getElement, getAllStyles } from './selector';
import { wrapError } from './utils/errors';
import { validateLocation, getInjectionTarget, injectElement, injectArray, toArray } from './utils/dom';

/**
 * Injects a stylesheet from a URL or inline CSS text into the DOM.
 *
 * @param options - Injection options.
 * @param options.url - Stylesheet URL (creates a `<link>` element).
 * @param options.text - Inline CSS text (creates a `<style>` element).
 * @param options.location - DOM location ('head' or 'body'). @defaultValue 'head'
 * @param options.wait - If `true`, returns a Promise that resolves on load. @defaultValue false
 * @returns The created element, or a Promise resolving to the load Event.
 *
 * @example
 * ```ts
 * // Inject inline CSS
 * injectStyle({ text: 'body { background: #000; }' });
 *
 * // Inject external stylesheet and wait
 * await injectStyle({ url: 'https://cdn.example.com/style.css', wait: true });
 * ```
 */
export function injectStyle(options: InjectWaitOptions): Promise<Event>;
export function injectStyle(options?: InjectSyncOptions): HTMLStyleElement | HTMLLinkElement;
export function injectStyle(options?: InjectOptions): Promise<Event> | HTMLStyleElement | HTMLLinkElement;
export function injectStyle({ url = '', text = '', location = 'head', wait = false }: InjectOptions = {}):
  | Promise<Event>
  | HTMLStyleElement
  | HTMLLinkElement {
  try {
    if (!url && !text) {
      throw new Error('Neither url nor text was specified.');
    }
    validateLocation(location);

    let element: HTMLStyleElement | HTMLLinkElement;

    if (url) {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = url;
      element = linkElement;
    } else {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = text;
      element = styleElement;
    }

    const target = getInjectionTarget(location);
    return injectElement(element, target, wait, url);
  } catch (error: unknown) {
    throw wrapError('Failed to inject style.', error);
  }
}

/**
 * Injects an array of stylesheets sequentially.
 *
 * @param items - Array of injection option objects.
 * @returns A Promise resolving to an array of created elements or load events.
 */
export async function injectStyleArray(
  items: InjectOptions[],
): Promise<Array<HTMLStyleElement | HTMLLinkElement | Event>> {
  try {
    return await injectArray(items, (item) => injectStyle({ ...item, wait: true }));
  } catch (error: unknown) {
    throw wrapError('Failed to inject array of styles.', error);
  }
}

/**
 * Convenience function to inject an array of stylesheet URLs into the head.
 *
 * @param urls - Array of stylesheet URLs.
 * @returns A Promise resolving to an array of load events.
 */
export function injectStyleUrls(urls: string[]): Promise<Array<HTMLStyleElement | HTMLLinkElement | Event>> {
  return injectStyleArray(urls.map((url) => ({ url, location: 'head' as const })));
}

/**
 * Injects CSS text into the document head as a `<style>` element.
 *
 * @param options - Text injection options.
 * @param options.text - CSS text to inject.
 * @returns The created HTMLStyleElement.
 */
export function injectTextHead({ text = '' }: InjectTextHeadOptions = {}): HTMLStyleElement {
  return injectStyle({ text }) as HTMLStyleElement;
}

/**
 * Removes external stylesheets from the DOM by partial `href` attribute match.
 * (Fixed: the original code incorrectly removed scripts instead of styles.)
 *
 * @param options - Removal options.
 * @param options.styleName - Partial string to match against stylesheet `href` attributes.
 * @returns `true` if at least one stylesheet was removed.
 */
export function removeExternalStyle({ styleName }: RemoveExternalStyleOptions): boolean {
  try {
    const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
    let removed = false;
    links.forEach((link) => {
      if (link.href.includes(styleName)) {
        link.parentNode?.removeChild(link);
        removed = true;
      }
    });
    return removed;
  } catch (error: unknown) {
    throw wrapError(`Failed to remove stylesheet "${styleName}".`, error);
  }
}

/**
 * Valid hiding method names.
 * @internal
 */
const HIDING_METHODS: readonly HidingMethod[] = ['displayNone', 'opacityZero', 'visibilityHidden'] as const;

/**
 * Type guard for HidingMethod.
 * @internal
 */
function isHidingMethod(value: string | number): value is HidingMethod {
  return typeof value === 'string' && (HIDING_METHODS as readonly string[]).includes(value);
}

/**
 * Generates a CSS property string for a given hiding method.
 * @internal
 */
function getHidingCss(method: HidingMethod): string {
  switch (method) {
    case 'displayNone':
      return 'display: none !important;';
    case 'opacityZero':
      return 'opacity: 0 !important;';
    case 'visibilityHidden':
      return 'visibility: hidden !important;';
  }
}

/**
 * Applies inline CSS to a specific element.
 *
 * @param options - Inline style options.
 * @param options.selector - CSS selector for the target element.
 * @param options.css - CSS properties to set as inline style.
 * @param options.wait - If `true`, waits for the element to appear first.
 * @returns The target Element, or a Promise resolving to it if `wait` is true.
 */
export function applyInlineStyle(options: InlineStyleWaitOptions): Promise<Element>;
export function applyInlineStyle(options: InlineStyleSyncOptions): Element;
export function applyInlineStyle(options: InlineStyleOptions): InlineStyleResult;
export function applyInlineStyle({ selector, css, wait = false }: InlineStyleOptions): InlineStyleResult {
  try {
    if (wait) {
      return getElement({ selector, wait: true })
        .then((element: Element) => {
          element.setAttribute('style', css);
          return element;
        })
        .catch((error: unknown) => {
          throw wrapError('Failed to apply inline style.', error);
        });
    }
    const element = getElement({ selector });
    element.setAttribute('style', css);
    return element;
  } catch (error: unknown) {
    throw wrapError('Failed to apply inline style.', error);
  }
}

/**
 * Applies a hiding method to one or more elements, either as inline styles or injected stylesheets.
 *
 * @param options - Method options.
 * @param options.selectorOrArrayOfSelectors - CSS selector(s) to target.
 * @param options.method - The hiding method name.
 * @param options.inline - If `true`, applies as inline `style` attribute.
 * @param options.wait - If `true`, waits for elements to appear.
 * @returns The result (elements, events, or Promises thereof).
 */
export function applyHidingMethod({
  selectorOrArrayOfSelectors,
  method = 'displayNone',
  inline = false,
  wait = false,
}: GenericStyleMethodOptions): GenericStyleMethodResult {
  try {
    if (!isHidingMethod(method)) {
      throw new Error(`Unknown hiding method: "${String(method)}".`);
    }
    const properties = getHidingCss(method);
    const selectors = toArray(selectorOrArrayOfSelectors);
    const isSingle = !Array.isArray(selectorOrArrayOfSelectors);

    if (inline) {
      if (wait) {
        const promises = selectors.map(
          (sel) => applyInlineStyle({ selector: sel, css: properties, wait: true }),
        );
        if (isSingle) {
          return promises[0];
        }
        return Promise.all(promises);
      }
      const elements = selectors.map((sel) => applyInlineStyle({ selector: sel, css: properties }));
      return isSingle ? elements[0] : elements;
    }

    // Global (stylesheet injection)
    if (wait) {
      const promises = selectors.map((sel) => {
        const text = `${sel} { ${properties} }`;
        return injectStyle({ text, wait: true });
      });
      if (isSingle) {
        return promises[0];
      }
      return Promise.all(promises);
    }

    const elements = selectors.map((sel) => {
      const text = `${sel} { ${properties} }`;
      return injectStyle({ text });
    });
    return isSingle ? elements[0] : elements;
  } catch (error: unknown) {
    throw wrapError('Failed to apply hiding method.', error);
  }
}

/**
 * Hides element(s) using `display: none !important`.
 */
export function displayNone(options: GenericStyleMethodOptions): GenericStyleMethodResult {
  return applyHidingMethod({ ...options, method: 'displayNone' });
}

/**
 * Hides element(s) using `opacity: 0 !important`.
 */
export function opacityZero(options: GenericStyleMethodOptions): GenericStyleMethodResult {
  return applyHidingMethod({ ...options, method: 'opacityZero' });
}

/**
 * Hides element(s) using `visibility: hidden !important`.
 */
export function visibilityHidden(options: GenericStyleMethodOptions): GenericStyleMethodResult {
  return applyHidingMethod({ ...options, method: 'visibilityHidden' });
}

/**
 * Style namespace for backward compatibility with the global `_muse.Style` API.
 */
export const Style = {
  getList: getAllStyles,
  inject: injectStyle,
  add: injectStyle,
  injectArray: injectStyleArray,
  injectArrayHeadUrl: injectStyleUrls,
  injectTextHead: injectTextHead,
  addTextHead: injectTextHead,
  removeExternal: removeExternalStyle,
  deleteExternal: removeExternalStyle,
  Element: {
    inline: applyInlineStyle,
    displayNone,
    opacityZero,
    visibilityHidden,
  },
} as const;
