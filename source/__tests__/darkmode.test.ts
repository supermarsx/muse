import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  invertColors,
  invertColorsAndHueRotate,
  presetInvertAndHueRotate90,
  presetInvertAndHueRotate85,
  presetInvertAltTagsContrast85,
  elementDarkmodeMethod1,
  elementDarkmodeMethod2,
  elementDarkmodeMethod3,
  Darkmode,
} from '../darkmode';

describe('darkmode', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('invertColors', () => {
    it('returns an HTMLStyleElement with CSS containing "invert"', () => {
      const result = invertColors();
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect(result.innerHTML).toContain('invert');
    });

    it('uses default invert value of 1', () => {
      const result = invertColors();
      expect(result.innerHTML).toContain('invert(1)');
    });

    it('applies a custom invert value', () => {
      const result = invertColors({ invert: 0.8 });
      expect(result.innerHTML).toContain('invert(0.8)');
    });

    it('applies custom tags', () => {
      const result = invertColors({ tags: 'html, img' });
      expect(result.innerHTML).toContain('html, img');
      expect(result.innerHTML).not.toContain('video');
    });

    it('applies additionalFilters', () => {
      const result = invertColors({ additionalFilters: 'contrast(0.9)' });
      expect(result.innerHTML).toContain('contrast(0.9)');
    });

    it('includes body background in the CSS', () => {
      const result = invertColors();
      expect(result.innerHTML).toContain('body');
      expect(result.innerHTML).toContain('background: white');
    });
  });

  describe('invertColorsAndHueRotate', () => {
    it('includes hue-rotate in the CSS', () => {
      const result = invertColorsAndHueRotate();
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect(result.innerHTML).toContain('hue-rotate');
    });

    it('uses default rotation of 180deg', () => {
      const result = invertColorsAndHueRotate();
      expect(result.innerHTML).toContain('hue-rotate(180deg)');
    });

    it('applies a custom rotation value', () => {
      const result = invertColorsAndHueRotate({ rotation: 90 });
      expect(result.innerHTML).toContain('hue-rotate(90deg)');
    });

    it('combines invert and hue-rotate', () => {
      const result = invertColorsAndHueRotate({ invert: 0.85 });
      expect(result.innerHTML).toContain('invert(0.85)');
      expect(result.innerHTML).toContain('hue-rotate(180deg)');
    });
  });

  describe('presets', () => {
    it('presetInvertAndHueRotate90 returns an HTMLStyleElement', () => {
      const result = presetInvertAndHueRotate90();
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect(result.innerHTML).toContain('invert(0.9)');
      expect(result.innerHTML).toContain('hue-rotate(180deg)');
    });

    it('presetInvertAndHueRotate85 returns an HTMLStyleElement', () => {
      const result = presetInvertAndHueRotate85();
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect(result.innerHTML).toContain('invert(0.85)');
      expect(result.innerHTML).toContain('hue-rotate(180deg)');
    });

    it('presetInvertAltTagsContrast85 returns an HTMLStyleElement with contrast', () => {
      const result = presetInvertAltTagsContrast85();
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect(result.innerHTML).toContain('invert(0.85)');
      expect(result.innerHTML).toContain('contrast(0.95)');
    });
  });

  describe('elementDarkmodeMethod1', () => {
    it('injects a style element for a single selector', () => {
      const result = elementDarkmodeMethod1({ selectorOrArrayOfSelectors: '.card' });
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect((result as HTMLStyleElement).innerHTML).toContain('.card');
      expect((result as HTMLStyleElement).innerHTML).toContain('filter: invert(1) hue-rotate(180deg)');
    });

    it('returns an array of style elements for an array of selectors', () => {
      const result = elementDarkmodeMethod1({
        selectorOrArrayOfSelectors: ['.card', '.panel'],
      }) as HTMLStyleElement[];
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(HTMLStyleElement);
      expect(result[0].innerHTML).toContain('.card');
      expect(result[1].innerHTML).toContain('.panel');
    });

    it('includes forced color and background rules', () => {
      const result = elementDarkmodeMethod1({ selectorOrArrayOfSelectors: '.widget' });
      expect((result as HTMLStyleElement).innerHTML).toContain('color: #000000 !important');
      expect((result as HTMLStyleElement).innerHTML).toContain('background: #ffffff !important');
    });
  });

  describe('elementDarkmodeMethod2', () => {
    it('injects a style element for a single selector', () => {
      const result = elementDarkmodeMethod2({ selectorOrArrayOfSelectors: '.sidebar' });
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect((result as HTMLStyleElement).innerHTML).toContain('.sidebar');
      expect((result as HTMLStyleElement).innerHTML).toContain('color: #000000 !important');
      expect((result as HTMLStyleElement).innerHTML).toContain('background: #ffffff !important');
    });

    it('does not include filter inversion', () => {
      const result = elementDarkmodeMethod2({ selectorOrArrayOfSelectors: '.sidebar' });
      expect((result as HTMLStyleElement).innerHTML).not.toContain('filter:');
    });
  });

  describe('elementDarkmodeMethod3', () => {
    it('injects a style element targeting images within the selector', () => {
      const result = elementDarkmodeMethod3({ selectorOrArrayOfSelectors: '.content' });
      expect(result).toBeInstanceOf(HTMLStyleElement);
      expect((result as HTMLStyleElement).innerHTML).toContain('.content img');
      expect((result as HTMLStyleElement).innerHTML).toContain('filter: invert(1) hue-rotate(180deg)');
    });
  });

  describe('Darkmode namespace', () => {
    it('maps top-level functions', () => {
      expect(Darkmode.invertColors).toBe(invertColors);
      expect(Darkmode.invert).toBe(invertColors);
      expect(Darkmode.invertColorsAndHueRotate).toBe(invertColorsAndHueRotate);
      expect(Darkmode.invertRotate).toBe(invertColorsAndHueRotate);
    });

    it('maps Preset functions', () => {
      expect(Darkmode.Preset.invertAndHueRotate90).toBe(presetInvertAndHueRotate90);
      expect(Darkmode.Preset.invertAndHueRotate85).toBe(presetInvertAndHueRotate85);
      expect(Darkmode.Preset.invertAndHueRotateAltTagsAndContrast85).toBe(presetInvertAltTagsContrast85);
    });

    it('maps Element methods', () => {
      expect(Darkmode.Element.method1).toBe(elementDarkmodeMethod1);
      expect(Darkmode.Element.method2).toBe(elementDarkmodeMethod2);
      expect(Darkmode.Element.method3).toBe(elementDarkmodeMethod3);
    });
  });
});
