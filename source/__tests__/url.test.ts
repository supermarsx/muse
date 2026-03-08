import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchUrl, onUrlChange, getUrlParams, Url } from '../url';

describe('url', () => {
  let originalPushState: typeof history.pushState;
  let originalReplaceState: typeof history.replaceState;

  beforeEach(() => {
    originalPushState = history.pushState;
    originalReplaceState = history.replaceState;
  });

  afterEach(() => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  });

  describe('matchUrl', () => {
    it('matches when RegExp pattern matches the URL', () => {
      const result = matchUrl({ pattern: /example\.com\/dashboard/, url: 'https://example.com/dashboard/home' });
      expect(result).toBe(true);
    });

    it('does not match when RegExp pattern does not match the URL', () => {
      const result = matchUrl({ pattern: /admin\/settings/, url: 'https://example.com/dashboard/home' });
      expect(result).toBe(false);
    });

    it('matches when string glob pattern with * matches the URL', () => {
      const result = matchUrl({ pattern: 'https://example.com/dashboard/*', url: 'https://example.com/dashboard/home' });
      expect(result).toBe(true);
    });

    it('does not match when string glob pattern does not match the URL', () => {
      const result = matchUrl({ pattern: 'https://example.com/admin/*', url: 'https://example.com/dashboard/home' });
      expect(result).toBe(false);
    });

    it('uses the explicit url option instead of window.location.href', () => {
      const result = matchUrl({ pattern: 'https://custom.test/page', url: 'https://custom.test/page' });
      expect(result).toBe(true);
    });

    it('escapes special regex characters in string patterns', () => {
      // Dots and other special chars like +, ^, $, {, }, (, ), |, [, ] are escaped
      const result = matchUrl({
        pattern: 'https://example.com/path',
        url: 'https://example.com/path',
      });
      expect(result).toBe(true);

      // The dot should be literal, not a regex wildcard
      const mismatch = matchUrl({
        pattern: 'https://example.com',
        url: 'https://exampleXcom',
      });
      expect(mismatch).toBe(false);
    });
  });

  describe('onUrlChange', () => {
    it('fires callback when pushState is called', () => {
      const callback = vi.fn();
      const handle = onUrlChange(callback);

      history.pushState({}, '', '/new-page');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(window.location.href);

      handle.stop();
    });

    it('fires callback when replaceState is called', () => {
      const callback = vi.fn();
      const handle = onUrlChange(callback);

      history.replaceState({}, '', '/replaced-page');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(window.location.href);

      handle.stop();
    });

    it('restores original pushState and replaceState on stop()', () => {
      const callback = vi.fn();

      const handle = onUrlChange(callback);

      // After patching, pushState and replaceState should trigger the callback
      const patchedPush = history.pushState;
      const patchedReplace = history.replaceState;

      handle.stop();

      // After stop, they should no longer be the patched versions
      expect(history.pushState).not.toBe(patchedPush);
      expect(history.replaceState).not.toBe(patchedReplace);
    });

    it('does not call callback after stop()', () => {
      const callback = vi.fn();
      const handle = onUrlChange(callback);

      handle.stop();

      history.pushState({}, '', '/after-stop');
      history.replaceState({}, '', '/after-stop-replace');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getUrlParams', () => {
    it('parses query params from an explicit URL', () => {
      const params = getUrlParams('https://example.com?page=1');
      expect(params).toEqual({ page: '1' });
    });

    it('returns an empty object for a URL with no params', () => {
      const params = getUrlParams('https://example.com/path');
      expect(params).toEqual({});
    });

    it('handles multiple params', () => {
      const params = getUrlParams('https://example.com?page=1&sort=name&order=asc');
      expect(params).toEqual({ page: '1', sort: 'name', order: 'asc' });
    });
  });

  describe('Url namespace', () => {
    it('maps matchUrl correctly', () => {
      expect(Url.matchUrl).toBe(matchUrl);
    });

    it('maps onUrlChange correctly', () => {
      expect(Url.onUrlChange).toBe(onUrlChange);
    });

    it('maps getUrlParams correctly', () => {
      expect(Url.getUrlParams).toBe(getUrlParams);
    });
  });
});
