import { describe, it, expect } from 'vitest';
import { wrapError } from '../utils/errors';

describe('wrapError', () => {
  it('creates an Error with the given message', () => {
    const error = wrapError('something failed', 'original');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('something failed');
  });

  it('attaches the original cause', () => {
    const original = new TypeError('bad type');
    const wrapped = wrapError('operation failed', original);
    expect(wrapped.cause).toBe(original);
  });

  it('handles non-Error causes', () => {
    const wrapped = wrapError('failed', 42);
    expect(wrapped.cause).toBe(42);
  });

  it('handles undefined cause', () => {
    const wrapped = wrapError('failed', undefined);
    expect(wrapped.cause).toBeUndefined();
  });
});
