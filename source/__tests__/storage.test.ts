import { describe, it, expect, beforeEach } from 'vitest';
import { createStorage, StorageFn } from '../storage';

beforeEach(() => {
  localStorage.clear();
});

describe('createStorage (no prefix)', () => {
  it('get returns null for a non-existent key', () => {
    const store = createStorage();
    expect(store.get('missing')).toBeNull();
  });

  it('get returns defaultValue for a non-existent key', () => {
    const store = createStorage();
    expect(store.get('missing', 42)).toBe(42);
  });

  it('set + get roundtrips an object', () => {
    const store = createStorage();
    const obj = { dark: true, accent: '#ff0' };
    store.set('theme', obj);
    expect(store.get('theme')).toEqual(obj);
  });

  it('set + get roundtrips a string', () => {
    const store = createStorage();
    store.set('name', 'Alice');
    expect(store.get('name')).toBe('Alice');
  });

  it('set + get roundtrips a number', () => {
    const store = createStorage();
    store.set('count', 99);
    expect(store.get('count')).toBe(99);
  });

  it('set + get roundtrips an array', () => {
    const store = createStorage();
    const arr = [1, 'two', { three: 3 }];
    store.set('list', arr);
    expect(store.get('list')).toEqual(arr);
  });

  it('has returns true after set and false after remove', () => {
    const store = createStorage();
    expect(store.has('key')).toBe(false);
    store.set('key', 'value');
    expect(store.has('key')).toBe(true);
    store.remove('key');
    expect(store.has('key')).toBe(false);
  });

  it('remove deletes a key', () => {
    const store = createStorage();
    store.set('key', 'value');
    store.remove('key');
    expect(store.get('key')).toBeNull();
  });

  it('clear with no prefix clears all keys', () => {
    const store = createStorage();
    store.set('a', 1);
    store.set('b', 2);
    store.clear();
    expect(store.has('a')).toBe(false);
    expect(store.has('b')).toBe(false);
  });
});

describe('createStorage (with prefix)', () => {
  it('stores keys with the prefix in the backend', () => {
    const store = createStorage({ prefix: 'app_' });
    store.set('color', 'red');
    // The raw backend key should be prefixed
    expect(localStorage.getItem('app_color')).toBe(JSON.stringify('red'));
    // The unprefixed key should not exist
    expect(localStorage.getItem('color')).toBeNull();
  });

  it('clear only removes prefixed keys', () => {
    // Seed a non-prefixed key directly
    localStorage.setItem('other', 'keep');

    const store = createStorage({ prefix: 'ns_' });
    store.set('a', 1);
    store.set('b', 2);

    store.clear();

    // Prefixed keys are gone
    expect(store.has('a')).toBe(false);
    expect(store.has('b')).toBe(false);
    // The non-prefixed key survives
    expect(localStorage.getItem('other')).toBe('keep');
  });
});

describe('createStorage (custom backend)', () => {
  it('uses the provided backend instead of localStorage', () => {
    const data = new Map<string, string>();
    const mock: Storage = {
      get length() {
        return data.size;
      },
      clear() {
        data.clear();
      },
      getItem(key: string) {
        return data.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        data.set(key, value);
      },
      removeItem(key: string) {
        data.delete(key);
      },
      key(index: number) {
        return [...data.keys()][index] ?? null;
      },
    };

    const store = createStorage({ backend: mock });
    store.set('x', 123);
    expect(store.get('x')).toBe(123);
    expect(data.get('x')).toBe(JSON.stringify(123));
    // localStorage should be untouched
    expect(localStorage.getItem('x')).toBeNull();
  });
});

describe('createStorage error handling', () => {
  it('get throws a wrapped error for non-parseable JSON', () => {
    // Write invalid JSON directly into the backend
    localStorage.setItem('bad', '{not json}');

    const store = createStorage();
    expect(() => store.get('bad')).toThrowError('Failed to read storage key "bad".');

    // Verify the cause chain
    try {
      store.get('bad');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).cause).toBeInstanceOf(SyntaxError);
    }
  });

  it('set throws a wrapped error when the backend rejects the write', () => {
    const failingBackend: Storage = {
      length: 0,
      clear() {},
      getItem() {
        return null;
      },
      setItem() {
        throw new Error('quota exceeded');
      },
      removeItem() {},
      key() {
        return null;
      },
    };

    const store = createStorage({ backend: failingBackend });
    expect(() => store.set('k', 'v')).toThrowError('Failed to write storage key "k".');

    // Verify the cause chain
    try {
      store.set('k', 'v');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).cause).toBeInstanceOf(Error);
      expect(((error as Error).cause as Error).message).toBe('quota exceeded');
    }
  });
});

describe('StorageFn namespace', () => {
  it('exposes createStorage', () => {
    expect(StorageFn.createStorage).toBe(createStorage);
  });
});
