/**
 * Type-safe localStorage/sessionStorage wrapper with JSON serialization.
 * @module storage
 */

import { wrapError } from './utils/errors';

/**
 * Options for {@link createStorage}.
 */
export interface CreateStorageOptions {
  /** A key prefix to namespace all keys. @defaultValue '' */
  prefix?: string | undefined;
  /** Which Storage backend to use. @defaultValue localStorage */
  backend?: Storage | undefined;
}

/**
 * A type-safe storage accessor.
 */
export interface TypedStorage {
  /** Retrieve a value by key. Returns `defaultValue` if the key doesn't exist. */
  get<T>(key: string, defaultValue: T): T;
  /** Retrieve a value by key. Returns `null` if the key doesn't exist. */
  get<T>(key: string): T | null;
  /** Store a value (serialized as JSON). */
  set<T>(key: string, value: T): void;
  /** Remove a key. */
  remove(key: string): void;
  /** Check whether a key exists. */
  has(key: string): boolean;
  /** Remove all keys with the configured prefix. */
  clear(): void;
}

/**
 * Creates a type-safe storage wrapper around `localStorage` or `sessionStorage`
 * with optional key prefixing and automatic JSON serialization.
 *
 * @param options - Storage configuration.
 * @returns A {@link TypedStorage} instance.
 *
 * @example
 * ```ts
 * const store = createStorage({ prefix: 'myScript_' });
 *
 * store.set('theme', { dark: true, accent: '#ff0' });
 * const theme = store.get<{ dark: boolean; accent: string }>('theme');
 *
 * store.remove('theme');
 * ```
 */
export function createStorage(options: CreateStorageOptions = {}): TypedStorage {
  const prefix = options.prefix ?? '';
  const backend = options.backend ?? localStorage;

  const prefixedKey = prefix ? (key: string): string => `${prefix}${key}` : (key: string): string => key;

  return {
    get<T>(key: string, defaultValue?: T): T | null {
      try {
        const raw = backend.getItem(prefixedKey(key));
        if (raw === null) {
          return defaultValue ?? null;
        }
        return JSON.parse(raw) as T;
      } catch (error: unknown) {
        throw wrapError(`Failed to read storage key "${key}".`, error);
      }
    },

    set<T>(key: string, value: T): void {
      try {
        backend.setItem(prefixedKey(key), JSON.stringify(value));
      } catch (error: unknown) {
        throw wrapError(`Failed to write storage key "${key}".`, error);
      }
    },

    remove(key: string): void {
      backend.removeItem(prefixedKey(key));
    },

    has(key: string): boolean {
      return backend.getItem(prefixedKey(key)) !== null;
    },

    clear(): void {
      if (!prefix) {
        backend.clear();
        return;
      }
      // Iterate backward to avoid index shifting when removing
      for (let i = backend.length - 1; i >= 0; i--) {
        const k = backend.key(i);
        if (k?.startsWith(prefix)) {
          backend.removeItem(k);
        }
      }
    },
  };
}

/**
 * Storage namespace for backward compatibility with the global `_muse.Storage` API.
 */
export const StorageFn = {
  createStorage,
} as const;
