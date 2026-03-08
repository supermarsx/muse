import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseHotkey,
  registerHotkey,
  registerHotkeys,
  Hotkey,
} from '../hotkey';

describe('hotkey', () => {
  describe('parseHotkey', () => {
    it('parses Ctrl+S into key and ctrl modifier', () => {
      const handler = vi.fn();
      const binding = parseHotkey('Ctrl+S', handler);
      expect(binding).toEqual({
        key: 'S',
        modifiers: { ctrl: true },
        handler,
      });
    });

    it('parses Ctrl+Shift+S into key with ctrl and shift modifiers', () => {
      const handler = vi.fn();
      const binding = parseHotkey('Ctrl+Shift+S', handler);
      expect(binding).toEqual({
        key: 'S',
        modifiers: { ctrl: true, shift: true },
        handler,
      });
    });

    it('parses Alt+F4 into key with alt modifier', () => {
      const handler = vi.fn();
      const binding = parseHotkey('Alt+F4', handler);
      expect(binding).toEqual({
        key: 'F4',
        modifiers: { alt: true },
        handler,
      });
    });

    it('parses Meta+K into key with meta modifier', () => {
      const handler = vi.fn();
      const binding = parseHotkey('Meta+K', handler);
      expect(binding).toEqual({
        key: 'K',
        modifiers: { meta: true },
        handler,
      });
    });

    it('maps Cmd and Win to meta modifier', () => {
      const handler = vi.fn();

      const cmdBinding = parseHotkey('Cmd+J', handler);
      expect(cmdBinding.modifiers).toEqual({ meta: true });

      const winBinding = parseHotkey('Win+J', handler);
      expect(winBinding.modifiers).toEqual({ meta: true });
    });

    it('throws when no key is found in the shortcut', () => {
      const handler = vi.fn();
      expect(() => parseHotkey('Ctrl+Shift', handler)).toThrow(
        'no key found in shortcut',
      );
    });
  });

  describe('registerHotkey', () => {
    let handle: ReturnType<typeof registerHotkey>;

    afterEach(() => {
      handle?.unregister();
    });

    it('fires handler on matching keydown event', () => {
      const handler = vi.fn();
      handle = registerHotkey({ key: 's', modifiers: { ctrl: true }, handler });

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', ctrlKey: true }),
      );

      expect(handler).toHaveBeenCalledOnce();
    });

    it('does not fire handler on non-matching key', () => {
      const handler = vi.fn();
      handle = registerHotkey({ key: 's', modifiers: { ctrl: true }, handler });

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }),
      );

      expect(handler).not.toHaveBeenCalled();
    });

    it('only fires when modifiers match', () => {
      const handler = vi.fn();
      handle = registerHotkey({
        key: 's',
        modifiers: { ctrl: true, shift: true },
        handler,
      });

      // Missing shift
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', ctrlKey: true }),
      );
      expect(handler).not.toHaveBeenCalled();

      // All modifiers present
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true,
          shiftKey: true,
        }),
      );
      expect(handler).toHaveBeenCalledOnce();
    });

    it('calls preventDefault by default', () => {
      const handler = vi.fn();
      handle = registerHotkey({ key: 's', modifiers: { ctrl: true }, handler });

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        cancelable: true,
      });
      const spy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(spy).toHaveBeenCalledOnce();
    });

    it('does not call preventDefault when preventDefault is false', () => {
      const handler = vi.fn();
      handle = registerHotkey({
        key: 's',
        modifiers: { ctrl: true },
        handler,
        preventDefault: false,
      });

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        cancelable: true,
      });
      const spy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalledOnce();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('registerHotkeys', () => {
    let handle: ReturnType<typeof registerHotkeys>;

    afterEach(() => {
      handle?.unregister();
    });

    it('handles multiple bindings', () => {
      const saveHandler = vi.fn();
      const closeHandler = vi.fn();

      handle = registerHotkeys([
        { key: 's', modifiers: { ctrl: true }, handler: saveHandler },
        { key: 'Escape', handler: closeHandler },
      ]);

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', ctrlKey: true }),
      );
      expect(saveHandler).toHaveBeenCalledOnce();
      expect(closeHandler).not.toHaveBeenCalled();

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );
      expect(closeHandler).toHaveBeenCalledOnce();
    });
  });

  describe('unregister', () => {
    it('removes the keydown listener so handler no longer fires', () => {
      const handler = vi.fn();
      const handle = registerHotkey({
        key: 's',
        modifiers: { ctrl: true },
        handler,
      });

      handle.unregister();

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', ctrlKey: true }),
      );

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Hotkey namespace', () => {
    it('maps registerHotkeys correctly', () => {
      expect(Hotkey.registerHotkeys).toBe(registerHotkeys);
    });

    it('maps registerHotkey correctly', () => {
      expect(Hotkey.registerHotkey).toBe(registerHotkey);
    });

    it('maps parseHotkey correctly', () => {
      expect(Hotkey.parseHotkey).toBe(parseHotkey);
    });
  });
});
