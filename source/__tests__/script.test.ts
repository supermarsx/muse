import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { injectScript, injectScriptArray, injectScriptUrls, removeExternalScript, removeExternalScripts, Script } from '../script';

describe('script', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('injectScript', () => {
    it('creates a script element with inline text', () => {
      const result = injectScript({ text: 'console.log("test")' });
      expect(result).toBeInstanceOf(HTMLScriptElement);
      expect((result as HTMLScriptElement).innerHTML).toBe('console.log("test")');
    });

    it('creates a script element with a URL', () => {
      const result = injectScript({ url: 'https://example.com/lib.js' });
      expect(result).toBeInstanceOf(HTMLScriptElement);
      expect((result as HTMLScriptElement).src).toContain('example.com/lib.js');
    });

    it('defaults to inserting into head', () => {
      injectScript({ text: 'var x = 1;' });
      expect(document.head.querySelectorAll('script').length).toBe(1);
    });

    it('can insert into body', () => {
      injectScript({ text: 'var y = 1;', location: 'body' });
      expect(document.body.querySelectorAll('script').length).toBe(1);
    });

    it('throws when neither url nor text is provided', () => {
      expect(() => injectScript()).toThrow('Failed to inject script.');
    });

    it('throws on invalid location', () => {
      expect(() => injectScript({ text: 'x', location: 'footer' as any })).toThrow('Failed to inject script.');
    });

    it('returns a Promise when wait is true', () => {
      const result = injectScript({ text: 'var z = 1;', wait: true });
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('removeExternalScript', () => {
    it('removes scripts matching the name', () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.example.com/analytics.js';
      document.head.appendChild(script);

      const removed = removeExternalScript('analytics');
      expect(removed).toBe(true);
      expect(document.head.querySelectorAll('script').length).toBe(0);
    });

    it('returns false when no scripts match', () => {
      const removed = removeExternalScript('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('removeExternalScripts', () => {
    it('removes multiple scripts and returns results', () => {
      const s1 = document.createElement('script');
      s1.src = 'https://cdn.example.com/a.js';
      document.head.appendChild(s1);

      const s2 = document.createElement('script');
      s2.src = 'https://cdn.example.com/b.js';
      document.head.appendChild(s2);

      const results = removeExternalScripts(['a.js', 'b.js', 'c.js']);
      expect(results).toEqual([
        { name: 'a.js', removed: true },
        { name: 'b.js', removed: true },
        { name: 'c.js', removed: false },
      ]);
    });
  });

  describe('injectScriptArray', () => {
    it('returns a Promise that calls injectScript for each item', () => {
      const result = injectScriptArray([
        { text: 'var a = 1;' },
        { text: 'var b = 2;' },
      ]);
      // injectScriptArray returns a Promise (it calls injectScript with wait: true)
      expect(result).toBeInstanceOf(Promise);
      // Suppress unhandled rejection from happy-dom failing to load resources
      result.catch(() => {});
    });
  });

  describe('injectScriptUrls', () => {
    it('returns a Promise for the array of URL injections', () => {
      const result = injectScriptUrls(['https://example.com/a.js', 'https://example.com/b.js']);
      expect(result).toBeInstanceOf(Promise);
      // Suppress unhandled rejection from happy-dom failing to load resources
      result.catch(() => {});
    });
  });

  describe('Script namespace', () => {
    it('exposes all functions', () => {
      expect(Script.inject).toBe(injectScript);
      expect(Script.add).toBe(injectScript);
      expect(Script.removeExternal).toBe(removeExternalScript);
      expect(Script.removeExternalArray).toBe(removeExternalScripts);
    });
  });
});
