import { describe, it, expect, vi } from 'vitest';

// Mock the special module since solid-toast/render-jsx crash in happy-dom
vi.mock('../special', () => ({
  initToast: vi.fn(),
  dismissToast: vi.fn(),
  showToast: vi.fn(),
  addGoToTopAndBottomButtons: vi.fn(),
  Special: {
    initToast: vi.fn(),
    dismissToast: vi.fn(),
    showToast: vi.fn(),
    addGoToTopAndBottomButtons: vi.fn(),
  },
}));

import {
  version,
  libraryName,
  containsAny,
  isIframe,
  isWindowAccessible,
  cloneElement,
  logResult,
  waitDomLoaded,
  waitDomLoadedAsync,
  waitForFunction,
  waitForObject,
  getElement,
  waitForElement,
  queryAll,
  injectScript,
  injectStyle,
  pollUntil,
  wrapError,
  About,
  ArrayFn,
  Check,
  Clone,
  Console,
  Event,
  FunctionFn,
  ObjectFn,
  Selector,
  Script,
  Style,
  Special,
} from '../index';

describe('index (barrel exports)', () => {
  it('exports all named functions', () => {
    expect(typeof version).toBe('string');
    expect(typeof libraryName).toBe('string');
    expect(typeof containsAny).toBe('function');
    expect(typeof isIframe).toBe('function');
    expect(typeof isWindowAccessible).toBe('function');
    expect(typeof cloneElement).toBe('function');
    expect(typeof logResult).toBe('function');
    expect(typeof waitDomLoaded).toBe('function');
    expect(typeof waitDomLoadedAsync).toBe('function');
    expect(typeof waitForFunction).toBe('function');
    expect(typeof waitForObject).toBe('function');
    expect(typeof getElement).toBe('function');
    expect(typeof waitForElement).toBe('function');
    expect(typeof queryAll).toBe('function');
    expect(typeof injectScript).toBe('function');
    expect(typeof injectStyle).toBe('function');
    expect(typeof pollUntil).toBe('function');
    expect(typeof wrapError).toBe('function');
  });

  it('exports all backward-compat namespaces', () => {
    expect(About).toBeDefined();
    expect(ArrayFn).toBeDefined();
    expect(Check).toBeDefined();
    expect(Clone).toBeDefined();
    expect(Console).toBeDefined();
    expect(Event).toBeDefined();
    expect(FunctionFn).toBeDefined();
    expect(ObjectFn).toBeDefined();
    expect(Selector).toBeDefined();
    expect(Script).toBeDefined();
    expect(Style).toBeDefined();
    expect(Special).toBeDefined();
  });
});
