/**
 * Keyboard shortcut / hotkey utilities.
 * @module hotkey
 */

/**
 * Modifier keys for a hotkey binding.
 */
export interface HotkeyModifiers {
  /** Require Ctrl key (or Cmd on macOS). @defaultValue false */
  ctrl?: boolean | undefined;
  /** Require Alt key. @defaultValue false */
  alt?: boolean | undefined;
  /** Require Shift key. @defaultValue false */
  shift?: boolean | undefined;
  /** Require Meta key (Windows/Cmd). @defaultValue false */
  meta?: boolean | undefined;
}

/**
 * A single hotkey binding definition.
 */
export interface HotkeyBinding {
  /** The key to listen for (e.g. `'s'`, `'Escape'`, `'F1'`). Uses `KeyboardEvent.key`. */
  key: string;
  /** Modifier requirements. */
  modifiers?: HotkeyModifiers | undefined;
  /** The handler to invoke when the hotkey is pressed. */
  handler: (event: KeyboardEvent) => void;
  /** If true, calls `event.preventDefault()`. @defaultValue true */
  preventDefault?: boolean | undefined;
}

/**
 * Handle returned by {@link registerHotkeys} to unregister all bindings.
 */
export interface HotkeyHandle {
  /** Remove all hotkey listeners. */
  unregister(): void;
}

/**
 * Internal normalized binding with pre-lowercased key.
 * @internal
 */
interface NormalizedBinding extends HotkeyBinding {
  _lowerKey: string;
}

// --- Centralized hotkey listener registry ---
const hotkeyBindings = new Set<NormalizedBinding>();
let hotkeyListenerAttached = false;

/** @internal Attaches a single shared keydown listener. */
function ensureHotkeyListener(): void {
  if (hotkeyListenerAttached) return;
  hotkeyListenerAttached = true;

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    const eventKey = event.key.toLowerCase();
    for (const binding of hotkeyBindings) {
      if (eventKey === binding._lowerKey && matchesModifiers(event, binding)) {
        if (binding.preventDefault !== false) {
          event.preventDefault();
        }
        binding.handler(event);
      }
    }
  });
}

/**
 * Registers one or more keyboard shortcuts on the document.
 *
 * Multiple calls share a single `keydown` listener, avoiding the overhead
 * of attaching separate listeners for each registration.
 *
 * @param bindings - One or more hotkey binding definitions.
 * @returns A {@link HotkeyHandle} to unregister all bindings.
 *
 * @example
 * ```ts
 * const handle = registerHotkeys([
 *   {
 *     key: 's',
 *     modifiers: { ctrl: true },
 *     handler: () => saveDocument(),
 *   },
 *   {
 *     key: 'Escape',
 *     handler: () => closeModal(),
 *   },
 * ]);
 *
 * // Later: cleanup
 * handle.unregister();
 * ```
 */
export function registerHotkeys(bindings: HotkeyBinding[]): HotkeyHandle {
  ensureHotkeyListener();

  // Pre-normalize keys to avoid repeated toLowerCase() on every keydown
  const normalizedBindings: NormalizedBinding[] = bindings.map((b) => ({
    ...b,
    _lowerKey: b.key.toLowerCase(),
  }));

  for (const nb of normalizedBindings) {
    hotkeyBindings.add(nb);
  }

  return {
    unregister: () => {
      for (const nb of normalizedBindings) {
        hotkeyBindings.delete(nb);
      }
    },
  };
}

/**
 * Registers a single keyboard shortcut.
 * Convenience wrapper around {@link registerHotkeys}.
 *
 * @param binding - A single hotkey binding definition.
 * @returns A {@link HotkeyHandle} to unregister the binding.
 *
 * @example
 * ```ts
 * const handle = registerHotkey({
 *   key: 'k',
 *   modifiers: { ctrl: true },
 *   handler: () => openSearch(),
 * });
 * ```
 */
export function registerHotkey(binding: HotkeyBinding): HotkeyHandle {
  return registerHotkeys([binding]);
}

/**
 * Parses a shortcut string like `"Ctrl+Shift+S"` into a {@link HotkeyBinding}.
 *
 * @param shortcut - A `+`-separated shortcut string. Modifier names are case-insensitive.
 * @param handler - The handler to invoke.
 * @returns A {@link HotkeyBinding} ready for {@link registerHotkeys}.
 *
 * @example
 * ```ts
 * const binding = parseHotkey('Ctrl+Shift+S', () => saveAs());
 * const handle = registerHotkeys([binding]);
 * ```
 */
export function parseHotkey(
  shortcut: string,
  handler: (event: KeyboardEvent) => void,
): HotkeyBinding {
  const parts = shortcut.split('+').map((s) => s.trim());
  const modifiers: HotkeyModifiers = {};
  let key = '';

  for (const part of parts) {
    const lower = part.toLowerCase();
    switch (lower) {
      case 'ctrl':
      case 'control':
        modifiers.ctrl = true;
        break;
      case 'alt':
        modifiers.alt = true;
        break;
      case 'shift':
        modifiers.shift = true;
        break;
      case 'meta':
      case 'cmd':
      case 'win':
        modifiers.meta = true;
        break;
      default:
        if (key) {
          throw new Error(`parseHotkey: multiple keys found in shortcut "${shortcut}" ("${key}" and "${part}").`);
        }
        key = part;
    }
  }

  if (!key) {
    throw new Error(`parseHotkey: no key found in shortcut "${shortcut}".`);
  }

  return { key, modifiers, handler };
}

/** Checks whether a keyboard event's modifier state matches a binding. */
function matchesModifiers(event: KeyboardEvent, binding: HotkeyBinding): boolean {
  const mod = binding.modifiers ?? {};

  if (!!mod.ctrl !== (event.ctrlKey || event.metaKey)) {
    // Treat Ctrl and Meta (Cmd) as interchangeable when ctrl is specified
    // Only if meta is not separately required
    if (mod.meta !== undefined) {
      if (!!mod.ctrl !== event.ctrlKey) return false;
    } else {
      return false;
    }
  }
  if (!!mod.alt !== event.altKey) return false;
  if (!!mod.shift !== event.shiftKey) return false;
  if (mod.meta !== undefined && !!mod.meta !== event.metaKey) return false;

  return true;
}

/**
 * Hotkey namespace for backward compatibility with the global `_muse.Hotkey` API.
 */
export const Hotkey = {
  registerHotkeys,
  registerHotkey,
  parseHotkey,
} as const;
