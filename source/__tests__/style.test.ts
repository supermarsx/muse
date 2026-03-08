import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  injectStyle,
  injectStyleArray,
  injectStyleUrls,
  injectTextHead,
  removeExternalStyle,
  applyInlineStyle,
  applyHidingMethod,
  displayNone,
  opacityZero,
  visibilityHidden,
  Style,
} from '../style';

describe('style', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('injectStyle', () => {
    it('creates an inline style element from text', () => {
      const result = injectStyle({ text: 'body { color: red; }' });
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect((result as HTMLStyleElement).innerHTML).toBe('body { color: red; }');
    });

    it('creates a link element from URL', () => {
      const result = injectStyle({ url: 'https://example.com/style.css' });
      expect(result).toBeInstanceOf(HTMLLinkElement);
      expect((result as HTMLLinkElement).href).toContain('example.com/style.css');
    });

    it('defaults to inserting into head', () => {
      injectStyle({ text: 'body { margin: 0; }' });
      expect(document.head.querySelectorAll('style').length).toBe(1);
    });

    it('can insert into body', () => {
      injectStyle({ text: 'p { color: blue; }', location: 'body' });
      expect(document.body.querySelectorAll('style').length).toBe(1);
    });

    it('throws when neither url nor text is provided', () => {
      expect(() => injectStyle()).toThrow('Failed to inject style.');
    });

    it('throws on invalid location', () => {
      expect(() => injectStyle({ text: 'x', location: 'footer' as any })).toThrow('Failed to inject style.');
    });

    it('returns a Promise when wait is true', () => {
      const result = injectStyle({ text: 'body {}', wait: true });
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('injectTextHead', () => {
    it('injects CSS text into head', () => {
      const result = injectTextHead({ text: '.cls { display: flex; }' });
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect(document.head.querySelectorAll('style').length).toBe(1);
    });
  });

  describe('removeExternalStyle', () => {
    it('removes link elements matching the name', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.example.com/theme.css';
      document.head.appendChild(link);

      const removed = removeExternalStyle({ styleName: 'theme.css' });
      expect(removed).toBe(true);
      expect(document.head.querySelectorAll('link[rel="stylesheet"]').length).toBe(0);
    });

    it('returns false when no styles match', () => {
      const removed = removeExternalStyle({ styleName: 'nonexistent' });
      expect(removed).toBe(false);
    });
  });

  describe('applyInlineStyle', () => {
    it('applies inline CSS to an element', () => {
      const div = document.createElement('div');
      div.id = 'target';
      document.body.appendChild(div);

      const result = applyInlineStyle({ selector: '#target', css: 'color: red;' });
      expect((result as Element).getAttribute('style')).toBe('color: red;');
    });
  });

  describe('applyHidingMethod', () => {
    it('injects a displayNone style by default', () => {
      const result = applyHidingMethod({ selectorOrArrayOfSelectors: '.hide-me' });
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect((result as HTMLStyleElement).innerHTML).toContain('display: none !important');
    });

    it('injects opacity style when method is opacityZero', () => {
      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: '.fade',
        method: 'opacityZero',
      });
      expect((result as HTMLStyleElement).innerHTML).toContain('opacity: 0 !important');
    });

    it('handles array of selectors', () => {
      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: ['.a', '.b'],
      }) as HTMLStyleElement[];
      expect(result.length).toBe(2);
    });

    it('applies inline when inline option is true', () => {
      const div = document.createElement('div');
      div.id = 'inline-hide';
      document.body.appendChild(div);

      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: '#inline-hide',
        inline: true,
      });
      expect((result as Element).getAttribute('style')).toContain('display: none');
    });
  });

  describe('convenience methods', () => {
    it('displayNone delegates correctly', () => {
      const result = displayNone({ selectorOrArrayOfSelectors: '.dn' });
      expect((result as HTMLStyleElement).innerHTML).toContain('display: none');
    });

    it('opacityZero delegates correctly', () => {
      const result = opacityZero({ selectorOrArrayOfSelectors: '.oz' });
      expect((result as HTMLStyleElement).innerHTML).toContain('opacity: 0');
    });

    it('visibilityHidden delegates correctly', () => {
      const result = visibilityHidden({ selectorOrArrayOfSelectors: '.vh' });
      expect((result as HTMLStyleElement).innerHTML).toContain('visibility: hidden');
    });
  });

  describe('injectStyleArray', () => {
    it('returns a Promise that calls injectStyle for each item', () => {
      const result = injectStyleArray([
        { text: '.a { color: red; }' },
        { text: '.b { color: blue; }' },
      ]);
      // injectStyleArray returns a Promise (it calls injectStyle with wait: true)
      expect(result).toBeInstanceOf(Promise);
      // Suppress unhandled rejection from happy-dom failing to load resources
      result.catch(() => {});
    });
  });

  describe('injectStyleUrls', () => {
    it('returns a Promise for the array of URL injections', () => {
      const result = injectStyleUrls(['https://example.com/a.css', 'https://example.com/b.css']);
      expect(result).toBeInstanceOf(Promise);
      // Suppress unhandled rejection from happy-dom failing to load resources
      result.catch(() => {});
    });
  });

  describe('applyInlineStyle with wait', () => {
    it('returns a Promise when wait is true', async () => {
      const div = document.createElement('div');
      div.id = 'wait-target';
      document.body.appendChild(div);

      const result = await applyInlineStyle({
        selector: '#wait-target',
        css: 'color: green;',
        wait: true,
      });
      expect(result.getAttribute('style')).toBe('color: green;');
    });
  });

  describe('applyHidingMethod edge cases', () => {
    it('throws for unknown hiding method', () => {
      expect(() =>
        applyHidingMethod({
          selectorOrArrayOfSelectors: '.x',
          method: 'bogus' as any,
        }),
      ).toThrow('Failed to apply hiding method.');
    });

    it('handles inline + wait with single selector', () => {
      const div = document.createElement('div');
      div.id = 'inline-wait';
      document.body.appendChild(div);

      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: '#inline-wait',
        inline: true,
        wait: true,
      });
      expect(result).toBeInstanceOf(Promise);
    });

    it('handles inline + wait with array of selectors', () => {
      const d1 = document.createElement('div');
      d1.id = 'ihw1';
      const d2 = document.createElement('div');
      d2.id = 'ihw2';
      document.body.appendChild(d1);
      document.body.appendChild(d2);

      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: ['#ihw1', '#ihw2'],
        inline: true,
        wait: true,
      });
      expect(result).toBeInstanceOf(Promise);
    });

    it('handles inline without wait with array of selectors', () => {
      const d1 = document.createElement('div');
      d1.id = 'ih1';
      const d2 = document.createElement('div');
      d2.id = 'ih2';
      document.body.appendChild(d1);
      document.body.appendChild(d2);

      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: ['#ih1', '#ih2'],
        inline: true,
      }) as Element[];
      expect(result.length).toBe(2);
      expect(result[0].getAttribute('style')).toContain('display: none');
    });

    it('handles global wait with single selector', () => {
      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: '.gw-single',
        wait: true,
      });
      expect(result).toBeInstanceOf(Promise);
    });

    it('handles global wait with array of selectors', () => {
      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: ['.gw1', '.gw2'],
        wait: true,
      });
      expect(result).toBeInstanceOf(Promise);
    });

    it('visibilityHidden method works via applyHidingMethod', () => {
      const result = applyHidingMethod({
        selectorOrArrayOfSelectors: '.vh-test',
        method: 'visibilityHidden',
      });
      expect((result as HTMLStyleElement).innerHTML).toContain('visibility: hidden');
    });
  });

  describe('Style namespace', () => {
    it('exposes key functions', () => {
      expect(Style.inject).toBe(injectStyle);
      expect(Style.add).toBe(injectStyle);
      expect(Style.injectTextHead).toBe(injectTextHead);
      expect(Style.removeExternal).toBe(removeExternalStyle);
      expect(Style.Element.displayNone).toBe(displayNone);
      expect(Style.Element.opacityZero).toBe(opacityZero);
      expect(Style.Element.visibilityHidden).toBe(visibilityHidden);
    });
  });
});
