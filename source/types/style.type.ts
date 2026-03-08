/**
 * Style utility types.
 * @module types/style
 */

/** Supported CSS hiding methods. */
export type HidingMethod = 'displayNone' | 'opacityZero' | 'visibilityHidden';

/**
 * Options for applying inline styles to an element.
 */
export interface InlineStyleOptions {
  /** CSS selector for the target element. */
  selector: string;
  /** CSS properties to apply as inline style. */
  css: string;
  /** If true, waits for the element to appear before applying. */
  wait?: boolean;
}

/** Options for applyInlineStyle with wait: true. */
export interface InlineStyleWaitOptions {
  selector: string;
  css: string;
  wait: true;
}

/** Options for applyInlineStyle with wait: false or unset. */
export interface InlineStyleSyncOptions {
  selector: string;
  css: string;
  wait?: false;
}

/**
 * Return type for inline style application.
 */
export type InlineStyleResult = Promise<Element> | Element;

/**
 * Options for generic style method application (hiding, darkmode).
 */
export interface GenericStyleMethodOptions {
  /** A single CSS selector or array of selectors. */
  selectorOrArrayOfSelectors: string | string[];
  /** The method name or number to use. */
  method?: string | number;
  /** If true, applies as inline styles instead of injected stylesheets. */
  inline?: boolean;
  /** If true, waits for elements to appear before applying. */
  wait?: boolean;
}

/**
 * Return type for generic style methods.
 */
export type GenericStyleMethodResult =
  | Element
  | Array<Element | Event | HTMLStyleElement>
  | Promise<Element | Event | HTMLStyleElement | Array<Element | Event | HTMLStyleElement>>;

/**
 * Options for injecting text-based styles into the head.
 */
export interface InjectTextHeadOptions {
  /** CSS text to inject. */
  text?: string;
}

/**
 * Options for removing external stylesheets.
 */
export interface RemoveExternalStyleOptions {
  /** Partial stylesheet href to match for removal. */
  styleName: string;
}
