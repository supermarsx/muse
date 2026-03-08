import { describe, it, expect } from 'vitest';
import { containsAny, ArrayFn } from '../array';

describe('containsAny', () => {
  it('returns true when source contains at least one substring', () => {
    expect(containsAny({ sourceString: 'hello world', substrings: ['world', 'foo'] })).toBe(true);
  });

  it('returns true when source contains all substrings', () => {
    expect(containsAny({ sourceString: 'hello world', substrings: ['hello', 'world'] })).toBe(true);
  });

  it('returns false when source contains none of the substrings', () => {
    expect(containsAny({ sourceString: 'hello', substrings: ['world', 'foo'] })).toBe(false);
  });

  it('returns false for an empty substrings array', () => {
    expect(containsAny({ sourceString: 'hello', substrings: [] })).toBe(false);
  });

  it('returns true for empty substring (always contained)', () => {
    expect(containsAny({ sourceString: 'hello', substrings: [''] })).toBe(true);
  });

  it('is case-sensitive', () => {
    expect(containsAny({ sourceString: 'Hello', substrings: ['hello'] })).toBe(false);
  });
});

describe('ArrayFn namespace', () => {
  it('exposes containsAny', () => {
    expect(ArrayFn.containsAny).toBe(containsAny);
  });
});
