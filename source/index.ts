/**
 * _muse - Master Userscript Extended
 *
 * A utility library for browser userscripts providing DOM manipulation,
 * style injection, dark mode, element cloning, and event handling.
 *
 * @packageDocumentation
 */

// Core modules - named exports for tree-shakeable imports
export { version, libraryName, description, About } from './about';
export { containsAny, ArrayFn } from './array';
export { isIframe, isWindowAccessible, isUnsafeWindowAccessible, Check } from './check';
export { cloneElement, cloneElements, Clone } from './clone';
export { logResult, Console } from './console';
export {
  invertColors,
  invertColorsAndHueRotate,
  presetInvertAndHueRotate90,
  presetInvertAndHueRotate85,
  presetInvertAltTagsContrast85,
  elementDarkmodeMethod1,
  elementDarkmodeMethod2,
  elementDarkmodeMethod3,
  Darkmode,
} from './darkmode';
export { waitDomLoaded, waitDomLoadedAsync, Event } from './event';
export { waitForFunction, waitForNestedFunction, getFunctionList, getOriginalParameters, FunctionFn } from './function';
export { waitForObject, waitForNestedObject, ObjectFn } from './object';
export {
  injectScript,
  injectScriptArray,
  injectScriptUrls,
  removeExternalScript,
  removeExternalScripts,
  Script,
} from './script';
export {
  getElement,
  waitForElement,
  getArrayOfElements,
  queryAll,
  getAllScripts,
  getAllStyles,
  Selector,
} from './selector';
export { initToast, dismissToast, showToast, addGoToTopAndBottomButtons, Special } from './special';
export {
  injectStyle,
  injectStyleArray,
  injectStyleUrls,
  injectTextHead,
  removeExternalStyle,
  applyInlineStyle,
  applyHidingMethod,
  displayNone,
  opacityZero,
  visibilityHidden,
  Style,
} from './style';

// New feature modules
export { debounce, throttle, sleep, Timing } from './timing';
export { onReady, whenReady, Ready } from './ready';
export { observeElement, waitForChild, Observe } from './observe';
export { createStorage, StorageFn } from './storage';
export { interceptFetch, interceptXHR, Intercept } from './intercept';
export { registerHotkeys, registerHotkey, parseHotkey, Hotkey } from './hotkey';
export { matchUrl, onUrlChange, getUrlParams, Url } from './url';

// Utility exports
export { pollUntil } from './utils/polling';
export { wrapError } from './utils/errors';
export { win } from './utils/window';
export {
  VALID_LOCATIONS,
  toArray,
  validateLocation,
  getInjectionTarget,
  injectElement,
  injectArray,
} from './utils/dom';

// Type exports
export type { ArrayContainsParams } from './types/array.type';
export type { CloneElementOptions } from './types/clone.type';
export type {
  WaitOptions,
  WaitForPropertyOptions,
  WaitForNestedPropertyOptions,
  InjectOptions,
  InjectWaitOptions,
  InjectSyncOptions,
  RemovalResult,
} from './types/common.type';
export type { ResultLogOptions } from './types/console.type';
export type {
  InvertColorsOptions,
  InvertColorsAndHueRotateOptions,
  ElementDarkmodeOptions,
  DarkmodeMethod,
} from './types/darkmode.type';
export type {
  WaitForFunctionOptions,
  WaitForNestedFunctionOptions,
  GetOriginalParametersOptions,
} from './types/function.type';
export type { WaitForObjectOptions, WaitForNestedObjectOptions } from './types/object.type';
export type {
  GetElementOptions,
  GetElementWaitOptions,
  GetElementSyncOptions,
  WaitForElementOptions,
  QueryAllOptions,
} from './types/selector.type';
export type { ToastInitOptions, ToastType, ToastMessageOptions } from './types/special.type';
export type {
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
export type { PollOptions } from './utils/polling';
export type { InjectionLocation } from './utils/dom';

// New feature module types
export type { DebounceOptions, DebouncedFunction, ThrottleOptions, ThrottledFunction } from './timing';
export type { OnReadyOptions } from './ready';
export type { ObserveElementOptions, ObserverHandle, WaitForChildOptions } from './observe';
export type { CreateStorageOptions, TypedStorage } from './storage';
export type {
  InterceptedRequest,
  InterceptedResponse,
  RequestInterceptor,
  ResponseInterceptor,
  InterceptHandle,
} from './intercept';
export type { HotkeyModifiers, HotkeyBinding, HotkeyHandle } from './hotkey';
export type { MatchUrlOptions, NavigationHandle } from './url';
