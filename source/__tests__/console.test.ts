import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logResult, Console } from '../console';

describe('logResult', () => {
  beforeEach(() => {
    vi.spyOn(window.console, 'log').mockImplementation(() => {});
    vi.spyOn(window.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs a success message when no error is provided', () => {
    logResult();
    expect(window.console.log).toHaveBeenCalledTimes(1);
    const msg = (window.console.log as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(msg).toContain('[OK]');
  });

  it('logs a failure message when an error is provided', () => {
    const err = new Error('test error');
    logResult({ errorObject: err });
    expect(window.console.log).toHaveBeenCalledTimes(1);
    const msg = (window.console.log as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(msg).toContain('[FAIL]');
    expect(window.console.error).toHaveBeenCalledWith(err);
  });

  it('prefixes with library name when useLibraryName is true', () => {
    logResult({ useLibraryName: true });
    const msg = (window.console.log as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(msg).toContain('_muse::');
  });
});

describe('Console namespace', () => {
  it('exposes Function.result', () => {
    expect(Console.Function.result).toBe(logResult);
  });
});
