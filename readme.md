# _muse

**Master Userscript Extended** -- A utility library for browser userscripts.

[![CI](https://github.com/supermarsx/muse/actions/workflows/ci.yml/badge.svg)](https://github.com/supermarsx/muse/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@muse/userscript)](https://www.npmjs.com/package/@muse/userscript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Provides DOM manipulation, style/script injection, dark mode, element polling, network interception, hotkeys, storage, timing utilities, and more -- all designed for the userscript ecosystem.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Modules](#modules)
  - [About](#about)
  - [Array](#array)
  - [Check](#check)
  - [Clone](#clone)
  - [Console](#console)
  - [Darkmode](#darkmode)
  - [Event](#event)
  - [Function](#function)
  - [Hotkey](#hotkey)
  - [Intercept](#intercept)
  - [Object](#object)
  - [Observe](#observe)
  - [Ready](#ready)
  - [Script](#script)
  - [Selector](#selector)
  - [Special](#special)
  - [Storage](#storage)
  - [Style](#style)
  - [Timing](#timing)
  - [URL](#url)
- [Utilities](#utilities)
- [Migration from v1](#migration-from-v1)
- [Development](#development)
- [License](#license)

---

## Installation

### npm (tree-shakeable ESM/CJS)

```bash
npm install @muse/userscript
```

```ts
// ESM - import only what you need
import { waitForElement, injectStyle, debounce } from '@muse/userscript';

// CJS
const { waitForElement, injectStyle } = require('@muse/userscript');
```

### Userscript `@require`

Add to your userscript metadata block:

```js
// @require  https://raw.githubusercontent.com/supermarsx/muse/main/dist/global/_muse.min.js
```

All functions are available under the `_muse` global:

```js
_muse.Selector.waitForElement({ selector: '#app' }).then(el => { /* ... */ });
_muse.Style.inject({ text: 'body { background: #000; }' });
```

### Package Exports

| Entry Point | Description |
|-------------|-------------|
| `@muse/userscript` | Tree-shakeable ESM/CJS library |
| `@muse/userscript/global` | Unminified webpack bundle (217 KiB) |
| `@muse/userscript/global/min` | Minified webpack bundle (65 KiB) |

---

## Quick Start

```ts
import { waitForElement, injectStyle, interceptFetch, registerHotkey, parseHotkey } from '@muse/userscript';

// Wait for an element to appear, then style it
const el = await waitForElement({ selector: '#content' });
injectStyle({ text: '#content { background: #1a1a2e; color: #eee; }' });

// Intercept fetch requests
const { restore } = interceptFetch({
  onRequest: (req) => console.log('Fetching:', req.url),
  onResponse: (res) => console.log('Response:', res.status),
});

// Register a keyboard shortcut
registerHotkey(parseHotkey('Ctrl+Shift+D', () => {
  document.body.classList.toggle('dark');
}));
```

---

## Modules

### About

Library metadata.

```ts
import { version, libraryName, description } from '@muse/userscript';
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `version` | `string` | Current library version (`"2.0.0"`) |
| `libraryName` | `string` | Library name (`"_muse"`) |
| `description` | `string` | Library description |
| `About` | `object` | Namespace: `{ version, libraryName, description }` |

---

### Array

Array/string matching utilities.

```ts
import { containsAny } from '@muse/userscript';

containsAny({ sourceString: 'hello world', substrings: ['world', 'foo'] }); // true
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `containsAny` | `({ sourceString, substrings }) => boolean` | Returns `true` if the string contains any of the substrings |
| `ArrayFn` | `object` | Namespace: `{ containsAny }` |

---

### Check

Runtime environment checks.

```ts
import { isIframe, isWindowAccessible, isUnsafeWindowAccessible } from '@muse/userscript';
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `isIframe` | `() => boolean` | `true` if running inside an iframe |
| `isWindowAccessible` | `() => boolean` | `true` if `window` is accessible |
| `isUnsafeWindowAccessible` | `() => boolean` | `true` if Greasemonkey/Tampermonkey `unsafeWindow` is accessible |
| `Check` | `object` | Namespace: `{ isIframe, isWindowAccessible, isUnsafeWindowAccessible }` |

---

### Clone

DOM element cloning.

```ts
import { cloneElement, cloneElements } from '@muse/userscript';

const clone = cloneElement({ sourceSelector: '#sidebar', destinationSelector: '#main' });
const clones = cloneElements([
  { sourceSelector: '.card', destinationSelector: '#grid' },
]);
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `cloneElement` | `(options) => Node` | Clones an element by selector, optionally appending to a destination |
| `cloneElements` | `(items) => Node[]` | Clones multiple elements in bulk |
| `Clone` | `object` | Namespace: `{ element, elementAll }` |

**Options:** `{ elementSelector?: string, sourceSelector?: string, destinationSelector?: string }`

---

### Console

Structured console logging.

```ts
import { logResult } from '@muse/userscript';

try {
  doSomething();
  logResult();           // logs [OK] with caller function name
} catch (e) {
  logResult({ errorObject: e as Error }); // logs [FAIL]
}
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `logResult` | `(options?) => void` | Logs `[OK]`/`[FAIL]` with auto-detected caller name |
| `Console` | `object` | Namespace: `{ Function: { result } }` |

---

### Darkmode

CSS filter-based dark mode.

```ts
import { invertColors, presetInvertAndHueRotate90, elementDarkmodeMethod1 } from '@muse/userscript';

// Quick dark mode preset
presetInvertAndHueRotate90();

// Custom inversion
invertColors({ invert: 85, tags: 'html' });

// Per-element dark mode
elementDarkmodeMethod1({ selectorOrArrayOfSelectors: ['.card', '.sidebar'] });
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `invertColors` | `(options?) => HTMLStyleElement` | Inverts colors via CSS filter |
| `invertColorsAndHueRotate` | `(options?) => HTMLStyleElement` | Invert + hue-rotate for natural dark mode |
| `presetInvertAndHueRotate90` | `() => HTMLStyleElement` | Preset: 90% invert, 180deg hue rotation |
| `presetInvertAndHueRotate85` | `() => HTMLStyleElement` | Preset: 85% invert, 180deg hue rotation |
| `presetInvertAltTagsContrast85` | `() => HTMLStyleElement` | Preset: 85% invert, hue-rotate, alt tags, 95% contrast |
| `elementDarkmodeMethod1` | `(options) => HTMLStyleElement \| HTMLStyleElement[]` | Invert + hue-rotate + forced colors per element |
| `elementDarkmodeMethod2` | `(options) => HTMLStyleElement \| HTMLStyleElement[]` | Forced black text on white background |
| `elementDarkmodeMethod3` | `(options) => HTMLStyleElement \| HTMLStyleElement[]` | Invert images within selector |
| `Darkmode` | `object` | Namespace with aliases |

---

### Event

DOM lifecycle events.

```ts
import { waitDomLoaded, waitDomLoadedAsync } from '@muse/userscript';

waitDomLoaded(() => console.log('DOM ready'));
await waitDomLoadedAsync();
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `waitDomLoaded` | `(callback) => void` | Calls back on `DOMContentLoaded`; fires immediately if already loaded |
| `waitDomLoadedAsync` | `() => Promise<void>` | Promise-based version of `waitDomLoaded` |
| `Event` | `object` | Namespace with aliases |

---

### Function

Window function polling and introspection.

```ts
import { waitForFunction, waitForNestedFunction, getFunctionList } from '@muse/userscript';

await waitForFunction({ propertyName: 'myGlobalFn' });
const fn = await waitForNestedFunction({ firstLevel: 'MyLib', secondLevel: 'init' });
fn();
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `waitForFunction` | `(options) => Promise<void>` | Polls until `window[propertyName]` is a function |
| `waitForNestedFunction` | `(options) => Promise<Function>` | Polls until `window[first][second]` is a function |
| `getFunctionList` | `() => RegExpMatchArray[]` | Extracts function signatures from inline scripts |
| `getOriginalParameters` | `({ functionName }) => string[]` | Gets original parameter list of a function from inline scripts |
| `FunctionFn` | `object` | Namespace with aliases |

**Options:** `{ propertyName, interval?, timeout?, signal? }`

---

### Hotkey

Keyboard shortcut registration.

```ts
import { registerHotkey, registerHotkeys, parseHotkey } from '@muse/userscript';

// Parse a shortcut string
const handle = registerHotkey(parseHotkey('Ctrl+Shift+S', (e) => {
  console.log('Save!');
}));

// Register multiple hotkeys
const handle2 = registerHotkeys([
  { key: 'k', modifiers: { ctrl: true }, handler: () => console.log('Search') },
  { key: 'Escape', handler: () => console.log('Close') },
]);

// Cleanup
handle.unregister();
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `registerHotkeys` | `(bindings) => HotkeyHandle` | Registers multiple keyboard shortcuts |
| `registerHotkey` | `(binding) => HotkeyHandle` | Registers a single keyboard shortcut |
| `parseHotkey` | `(shortcut, handler) => HotkeyBinding` | Parses `"Ctrl+Shift+S"` into a binding object |
| `Hotkey` | `object` | Namespace: `{ registerHotkeys, registerHotkey, parseHotkey }` |

**HotkeyBinding:** `{ key, modifiers?: { ctrl?, alt?, shift?, meta? }, handler, preventDefault? }`

---

### Intercept

Network request interception (fetch and XHR).

```ts
import { interceptFetch, interceptXHR } from '@muse/userscript';

const { restore } = interceptFetch({
  onRequest: (req) => {
    console.log('Request:', req.url, req.method);
    // return false to block the request
  },
  onResponse: (res) => {
    console.log('Response:', res.url, res.status, res.body);
  },
});

const xhrHandle = interceptXHR({
  onRequest: (req) => console.log('XHR:', req.url),
});

// Restore original behavior
restore();
xhrHandle.restore();
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `interceptFetch` | `(options) => InterceptHandle` | Monkey-patches `window.fetch`; return `false` from `onRequest` to block |
| `interceptXHR` | `(options) => InterceptHandle` | Monkey-patches `XMLHttpRequest` |
| `Intercept` | `object` | Namespace: `{ interceptFetch, interceptXHR }` |

---

### Object

Window object polling.

```ts
import { waitForObject, waitForNestedObject } from '@muse/userscript';

const obj = await waitForObject({ propertyName: 'myApp' });
const nested = await waitForNestedObject({ firstLevel: 'myApp', secondLevel: 'config' });
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `waitForObject` | `(options) => Promise<object>` | Polls until `window[propertyName]` is an object |
| `waitForNestedObject` | `(options) => Promise<object>` | Polls until `window[first][second]` is an object |
| `ObjectFn` | `object` | Namespace with aliases |

**Options:** `{ propertyName, interval?, timeout?, signal? }`

---

### Observe

MutationObserver conveniences.

```ts
import { observeElement, waitForChild } from '@muse/userscript';

// Watch for mutations
const { disconnect } = observeElement(
  { target: '#app' },
  (mutations) => console.log('Changed:', mutations.length),
);

// Wait for a child element to appear
const child = await waitForChild('#app', '.loaded-content', { timeout: 10000 });
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `observeElement` | `(config, callback) => ObserverHandle` | Observes DOM mutations on a target element |
| `waitForChild` | `(parent, selector, options?) => Promise<Element>` | Waits for a child matching `selector` to appear inside `parent` |
| `Observe` | `object` | Namespace: `{ observeElement, waitForChild }` |

---

### Ready

Page lifecycle / ready-state utilities.

```ts
import { onReady, whenReady } from '@muse/userscript';

await onReady(); // resolves at 'interactive'
await onReady({ state: 'complete' }); // resolves at 'complete'

whenReady(() => console.log('Page interactive'));
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `onReady` | `(options?) => Promise<void>` | Promise resolving when document reaches the specified ready state |
| `whenReady` | `(callback, options?) => void` | Calls back when ready state is reached; fires synchronously if already there |
| `Ready` | `object` | Namespace: `{ onReady, whenReady }` |

**Options:** `{ state?: 'loading' | 'interactive' | 'complete' }` (default: `'interactive'`)

---

### Script

Script injection and removal.

```ts
import { injectScript, injectScriptArray, injectScriptUrls, removeExternalScript } from '@muse/userscript';

// Inject inline script
injectScript({ text: 'console.log("injected")' });

// Inject from URL and wait for load
await injectScript({ url: 'https://cdn.example.com/lib.js', wait: true });

// Inject multiple URLs
await injectScriptUrls(['https://cdn.example.com/a.js', 'https://cdn.example.com/b.js']);

// Remove external scripts
removeExternalScript('analytics');
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `injectScript` | `(options?) => HTMLScriptElement \| Promise<Event>` | Injects a script (URL or inline text); returns Promise when `wait: true` |
| `injectScriptArray` | `(items) => Promise<Array>` | Injects an array of scripts sequentially |
| `injectScriptUrls` | `(urls) => Promise<Array>` | Injects an array of script URLs |
| `removeExternalScript` | `(name) => boolean` | Removes scripts matching a partial `src` match |
| `removeExternalScripts` | `(names) => RemovalResult[]` | Removes multiple external scripts |
| `Script` | `object` | Namespace with aliases |

**Options:** `{ url?, text?, location?: 'head' | 'body', wait?: boolean }`

---

### Selector

DOM element selection and waiting.

```ts
import { getElement, waitForElement, getArrayOfElements, queryAll } from '@muse/userscript';

// Sync get
const el = getElement({ selector: '#header' });

// Wait for element (returns Promise)
const el2 = await getElement({ selector: '#dynamic', wait: true });

// Wait with timeout and abort support
const controller = new AbortController();
const el3 = await waitForElement({ selector: '.lazy', timeout: 5000, signal: controller.signal });

// Get multiple elements in parallel
const elements = await getArrayOfElements([
  { selector: '#a' }, { selector: '#b' }, { selector: '#c' },
]);
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `getElement` | `(options) => Element \| Promise<Element>` | Gets an element; returns Promise when `wait: true` |
| `waitForElement` | `(options) => Promise<Element>` | Waits for an element via MutationObserver |
| `getArrayOfElements` | `(selectors, signal?) => Promise<Element[]>` | Waits for multiple elements in parallel |
| `queryAll` | `({ selector }) => NodeListOf<Element>` | `querySelectorAll` wrapper |
| `getAllScripts` | `() => NodeListOf<HTMLScriptElement>` | Returns all `<script>` elements |
| `getAllStyles` | `() => NodeListOf<HTMLStyleElement>` | Returns all `<style>` elements |
| `Selector` | `object` | Namespace with aliases |

---

### Special

Toast notifications and navigation buttons. Requires optional peer dependencies `render-jsx` and `solid-toast`.

```ts
import { initToast, showToast, addGoToTopAndBottomButtons } from '@muse/userscript';

initToast({ position: 'top-right' });
showToast({ message: 'Hello!', type: 'success' });

addGoToTopAndBottomButtons();
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `initToast` | `(options?) => void` | Initializes the toast notification system |
| `dismissToast` | `(toastId) => void` | Dismisses a toast by ID |
| `showToast` | `(options) => string \| Promise` | Shows a toast notification |
| `addGoToTopAndBottomButtons` | `() => HTMLDivElement` | Adds scroll-to-top/bottom navigation buttons |
| `Special` | `object` | Namespace with aliases |

---

### Storage

Type-safe localStorage/sessionStorage wrapper.

```ts
import { createStorage } from '@muse/userscript';

const store = createStorage({ prefix: 'myScript_' });
store.set('theme', 'dark');
const theme = store.get<string>('theme'); // 'dark'
store.has('theme'); // true
store.remove('theme');

// Use sessionStorage
const session = createStorage({ prefix: 'app_', backend: sessionStorage });
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `createStorage` | `(options?) => TypedStorage` | Creates a type-safe storage wrapper with JSON serialization |
| `StorageFn` | `object` | Namespace: `{ createStorage }` |

**TypedStorage methods:** `get<T>(key, default?)`, `set<T>(key, value)`, `remove(key)`, `has(key)`, `clear()`

---

### Style

CSS/style injection, inline styles, and element hiding.

```ts
import { injectStyle, injectTextHead, applyInlineStyle, displayNone, removeExternalStyle } from '@muse/userscript';

// Inject CSS text
injectStyle({ text: 'body { background: #111; color: #eee; }' });

// Inject stylesheet URL and wait
await injectStyle({ url: 'https://cdn.example.com/theme.css', wait: true });

// Inject to head directly
injectTextHead({ text: '.hidden { display: none; }' });

// Apply inline style (with optional waiting)
await applyInlineStyle({ selector: '#target', css: 'color: red;', wait: true });

// Hide elements
displayNone({ selectorOrArrayOfSelectors: ['.ads', '.banner'] });

// Remove external stylesheet
removeExternalStyle({ styleName: 'old-theme' });
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `injectStyle` | `(options?) => HTMLStyleElement \| HTMLLinkElement \| Promise<Event>` | Injects CSS text or stylesheet URL |
| `injectStyleArray` | `(items) => Promise<Array>` | Injects an array of stylesheets |
| `injectStyleUrls` | `(urls) => Promise<Array>` | Injects an array of stylesheet URLs |
| `injectTextHead` | `({ text }) => HTMLStyleElement` | Injects CSS text into `<head>` |
| `removeExternalStyle` | `({ styleName }) => boolean` | Removes external stylesheets by partial `href` match |
| `applyInlineStyle` | `(options) => Element \| Promise<Element>` | Applies inline CSS to an element |
| `applyHidingMethod` | `(options) => GenericStyleMethodResult` | Applies a hiding method to element(s) |
| `displayNone` | `(options) => GenericStyleMethodResult` | Hides with `display: none !important` |
| `opacityZero` | `(options) => GenericStyleMethodResult` | Hides with `opacity: 0 !important` |
| `visibilityHidden` | `(options) => GenericStyleMethodResult` | Hides with `visibility: hidden !important` |
| `Style` | `object` | Namespace with aliases |

---

### Timing

Debounce, throttle, and sleep.

```ts
import { debounce, throttle, sleep } from '@muse/userscript';

const debouncedSave = debounce(save, { delay: 300 });
const throttledScroll = throttle(onScroll, { interval: 100 });

debouncedSave();
debouncedSave.cancel();

await sleep(1000);
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `debounce` | `(fn, options?) => DebouncedFunction` | Debounces a function (default 250ms delay) |
| `throttle` | `(fn, options?) => ThrottledFunction` | Throttles a function (default 250ms interval) |
| `sleep` | `(ms) => Promise<void>` | Promise-based delay |
| `Timing` | `object` | Namespace: `{ debounce, throttle, sleep }` |

**Debounce options:** `{ delay?: number, leading?: boolean }`
**Throttle options:** `{ interval?: number, trailing?: boolean }`

Both returned functions have a `.cancel()` method.

---

### URL

URL matching and SPA navigation detection.

```ts
import { matchUrl, onUrlChange, getUrlParams } from '@muse/userscript';

if (matchUrl({ pattern: '*/dashboard/*' })) {
  console.log('On dashboard');
}

const { stop } = onUrlChange((url) => {
  console.log('Navigated to:', url);
});

const params = getUrlParams(); // { page: '1', sort: 'date' }
```

| Export | Signature | Description |
|--------|-----------|-------------|
| `matchUrl` | `(options) => boolean` | Tests URL against a pattern (RegExp or glob with `*`) |
| `onUrlChange` | `(callback) => NavigationHandle` | Watches for SPA navigation (pushState/replaceState/popstate) |
| `getUrlParams` | `(url?) => Record<string, string>` | Parses URL query parameters |
| `Url` | `object` | Namespace: `{ matchUrl, onUrlChange, getUrlParams }` |

---

## Utilities

Low-level utilities exported for advanced use cases.

| Export | Module | Description |
|--------|--------|-------------|
| `pollUntil` | `utils/polling` | Polls a condition at intervals until truthy or timeout |
| `wrapError` | `utils/errors` | Wraps an error with a message, preserving `cause` |
| `win` | `utils/window` | Safe `window` reference typed as `Record<string, unknown>` |
| `VALID_LOCATIONS` | `utils/dom` | `readonly ['head', 'body']` |
| `toArray` | `utils/dom` | Normalizes `T | T[]` to `T[]` |
| `validateLocation` | `utils/dom` | Asserts a string is a valid injection location |
| `getInjectionTarget` | `utils/dom` | Returns `document.head` or `document.body` |
| `injectElement` | `utils/dom` | Appends an element to a target with optional load waiting |
| `injectArray` | `utils/dom` | Sequentially injects an array of items |

---

## Migration from v1

### Breaking Changes in v2

1. **Module structure** -- The library is now fully modular with named exports. The old `master.ts` barrel file is replaced by `index.ts` with explicit exports.

2. **Namespace objects preserved** -- Backward-compatible namespace objects (`Selector`, `Style`, `Script`, etc.) are still exported for the global `_muse.*` API via `@require`.

3. **`removeExternal` in Style** -- Previously this function incorrectly removed `<script>` elements instead of `<style>` elements (copy-paste bug). This is now fixed.

4. **Error handling** -- All async polling functions now use proper `Error` objects (not raw strings). Timeout errors include the last captured error as `cause`.

5. **`waitForElement`** -- Now observes `document.documentElement` instead of `document.body` to avoid null reference errors when body is not yet available.

6. **AbortSignal support** -- `waitForElement`, `waitForFunction`, `waitForNestedFunction`, `waitForObject`, `waitForNestedObject`, and `getArrayOfElements` all accept an optional `signal` parameter.

7. **Function overloads** -- `getElement`, `injectScript`, `injectStyle`, and `applyInlineStyle` now have TypeScript overloads: when `wait: true` is passed, the return type is `Promise<T>`; otherwise it returns synchronously.

### New Modules in v2

- `timing` -- `debounce`, `throttle`, `sleep`
- `ready` -- `onReady`, `whenReady`
- `observe` -- `observeElement`, `waitForChild`
- `storage` -- `createStorage`
- `intercept` -- `interceptFetch`, `interceptXHR`
- `hotkey` -- `registerHotkeys`, `registerHotkey`, `parseHotkey`
- `url` -- `matchUrl`, `onUrlChange`, `getUrlParams`

### Optional Dependencies

`render-jsx` and `solid-toast` are now optional peer dependencies. They are only required if you use the `Special` module (toast notifications). The default global build includes `special.tsx`; if you only use named imports via npm, the Special module will be tree-shaken away if unused.

---

## Development

### Prerequisites

- Node.js >= 18
- npm

### Setup

```bash
git clone https://github.com/supermarsx/muse.git
cd muse
npm install
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Full build (ESM + CJS + types + webpack global) |
| `npm run build:lib` | Library builds only (ESM + CJS + types in parallel) |
| `npm run build:global` | Webpack global bundle only |
| `npm run dev` | Dev server with HMR and CORS headers |
| `npm run dev:watch` | Watch mode for webpack development build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | TypeScript type checking |
| `npm run clean` | Remove `dist/` |

### Build Outputs

| Path | Description |
|------|-------------|
| `dist/esm/` | ES Modules |
| `dist/cjs/` | CommonJS |
| `dist/types/` | TypeScript declarations |
| `dist/global/_muse.js` | Webpack dev bundle with userscript header |
| `dist/global/_muse.min.js` | Webpack production bundle (minified, with header) |

### Testing

Tests use [Vitest](https://vitest.dev/) with [happy-dom](https://github.com/nicedayfor/happy-dom). Coverage is collected via `@vitest/coverage-v8`.

Coverage thresholds: 80% statements, 85% branches, 85% functions, 80% lines.

---

## License

This project is licensed under the [MIT License](LICENSE).

This software is provided "as-is," without any express or implied warranty. In no event shall the authors be held liable for any damages arising from the use of this software.
