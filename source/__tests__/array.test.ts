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

  it('throws for an empty substrings array', () => {
    expect(() => containsAny({ sourceString: 'hello', substrings: [] })).toThrow(
      'containsAny: substrings must be a non-empty array.',
    );
  });

  it('throws when sourceString is not a string', () => {
    expect(() => containsAny({ sourceString: 123 as any, substrings: ['a'] })).toThrow(
      'containsAny: sourceString must be a string.',
    );
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
