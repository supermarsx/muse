import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('url', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('matchUrl', () => {
    it('matches when RegExp pattern matches the URL', async () => {
      const { matchUrl } = await import('../url');
      const result = matchUrl({ pattern: /example\.com\/dashboard/, url: 'https://example.com/dashboard/home' });
      expect(result).toBe(true);
    });

    it('does not match when RegExp pattern does not match the URL', async () => {
      const { matchUrl } = await import('../url');
      const result = matchUrl({ pattern: /admin\/settings/, url: 'https://example.com/dashboard/home' });
      expect(result).toBe(false);
    });

    it('matches when string glob pattern with * matches the URL', async () => {
      const { matchUrl } = await import('../url');
      const result = matchUrl({
        pattern: 'https://example.com/dashboard/*',
        url: 'https://example.com/dashboard/home',
      });
      expect(result).toBe(true);
    });

    it('does not match when string glob pattern does not match the URL', async () => {
      const { matchUrl } = await import('../url');
      const result = matchUrl({ pattern: 'https://example.com/admin/*', url: 'https://example.com/dashboard/home' });
      expect(result).toBe(false);
    });

    it('uses the explicit url option instead of window.location.href', async () => {
      const { matchUrl } = await import('../url');
      const result = matchUrl({ pattern: 'https://custom.test/page', url: 'https://custom.test/page' });
      expect(result).toBe(true);
    });

    it('escapes special regex characters in string patterns', async () => {
      const { matchUrl } = await import('../url');
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

    it('returns false for URLs exceeding MAX_URL_LENGTH', async () => {
      const { matchUrl } = await import('../url');
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      const result = matchUrl({ pattern: /.*/, url: longUrl });
      expect(result).toBe(false);
    });
  });

  describe('onUrlChange', () => {
    it('fires callback when pushState is called', async () => {
      const { onUrlChange } = await import('../url');
      const callback = vi.fn();
      const handle = onUrlChange(callback);

      history.pushState({}, '', '/new-page-' + Math.random());

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(window.location.href);

      handle.stop();
    });

    it('fires callback when replaceState is called', async () => {
      const { onUrlChange } = await import('../url');
      const callback = vi.fn();
      const handle = onUrlChange(callback);

      history.replaceState({}, '', '/replaced-page-' + Math.random());

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(window.location.href);

      handle.stop();
    });

    it('stop() removes the callback so it no longer fires', async () => {
      const { onUrlChange } = await import('../url');
      const callback = vi.fn();
      const handle = onUrlChange(callback);

      handle.stop();

      // After stop, the callback should not be called even if URL changes
      callback.mockClear();
      history.pushState({}, '', '/after-stop-' + Math.random());
      expect(callback).not.toHaveBeenCalled();
    });

    it('does not call callback after stop()', async () => {
      const { onUrlChange } = await import('../url');
      const callback = vi.fn();
      const handle = onUrlChange(callback);

      handle.stop();

      history.pushState({}, '', '/after-stop');
      history.replaceState({}, '', '/after-stop-replace');

      expect(callback).not.toHaveBeenCalled();
    });

    it('throws when maximum number of URL callbacks is reached', async () => {
      const { onUrlChange } = await import('../url');
      const handles: ReturnType<typeof onUrlChange>[] = [];

      // Register 200 callbacks (the max)
      for (let i = 0; i < 200; i++) {
        handles.push(onUrlChange(() => {}));
      }

      // The 201st should throw
      expect(() => onUrlChange(() => {})).toThrow('Maximum number of URL change callbacks (200) reached.');

      // Cleanup
      for (const h of handles) h.stop();
    });
  });

  describe('getUrlParams', () => {
    it('parses query params from an explicit URL', async () => {
      const { getUrlParams } = await import('../url');
      const params = getUrlParams('https://example.com?page=1');
      expect(params).toEqual({ page: '1' });
    });

    it('returns an empty object for a URL with no params', async () => {
      const { getUrlParams } = await import('../url');
      const params = getUrlParams('https://example.com/path');
      expect(params).toEqual({});
    });

    it('handles multiple params', async () => {
      const { getUrlParams } = await import('../url');
      const params = getUrlParams('https://example.com?page=1&sort=name&order=asc');
      expect(params).toEqual({ page: '1', sort: 'name', order: 'asc' });
    });

    it('throws when URL exceeds MAX_URL_LENGTH', async () => {
      const { getUrlParams } = await import('../url');
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      expect(() => getUrlParams(longUrl)).toThrow('Invalid URL:');
    });
  });

  describe('matchUrl glob wildcard', () => {
    it('matches URLs with encoded spaces using glob wildcard', async () => {
      const { matchUrl } = await import('../url');
      const result = matchUrl({
        pattern: 'https://example.com/path/*',
        url: 'https://example.com/path/with%20spaces',
      });
      expect(result).toBe(true);
    });
  });

  describe('Url namespace', () => {
    it('maps all functions correctly', async () => {
      const { matchUrl, onUrlChange, getUrlParams, Url } = await import('../url');
      expect(Url.matchUrl).toBe(matchUrl);
      expect(Url.onUrlChange).toBe(onUrlChange);
      expect(Url.getUrlParams).toBe(getUrlParams);
    });
  });
});
