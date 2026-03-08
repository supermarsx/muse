import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cloneElement, cloneElements, Clone } from '../clone';

describe('clone', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('cloneElement', () => {
    it('clones an element using sourceSelector', () => {
      const div = document.createElement('div');
      div.id = 'source';
      div.textContent = 'original';
      document.body.appendChild(div);

      const clone = cloneElement({ sourceSelector: '#source' });
      expect(clone).toBeInstanceOf(Node);
      expect((clone as HTMLElement).textContent).toBe('original');
    });

    it('clones an element using elementSelector', () => {
      const div = document.createElement('div');
      div.id = 'source2';
      document.body.appendChild(div);

      const clone = cloneElement({ elementSelector: '#source2' });
      expect(clone).toBeInstanceOf(Node);
    });

    it('appends clone to destination when destinationSelector is provided', () => {
      const source = document.createElement('div');
      source.id = 'src';
      source.textContent = 'clone me';
      document.body.appendChild(source);

      const dest = document.createElement('div');
      dest.id = 'dest';
      document.body.appendChild(dest);

      cloneElement({ sourceSelector: '#src', destinationSelector: '#dest' });
      expect(dest.children.length).toBe(1);
      expect(dest.children[0].textContent).toBe('clone me');
    });

    it('throws when both selectors are provided', () => {
      expect(() => cloneElement({ elementSelector: '#a', sourceSelector: '#b' })).toThrow('Failed to clone element.');
    });

    it('throws when neither selector is provided', () => {
      expect(() => cloneElement({})).toThrow('Failed to clone element.');
    });
  });

  describe('cloneElements', () => {
    it('clones multiple elements', () => {
      const d1 = document.createElement('div');
      d1.id = 'one';
      document.body.appendChild(d1);

      const d2 = document.createElement('div');
      d2.id = 'two';
      document.body.appendChild(d2);

      const results = cloneElements([{ sourceSelector: '#one' }, { sourceSelector: '#two' }]);
      expect(results.length).toBe(2);
    });

    it('throws when array is empty', () => {
      expect(() => cloneElements([])).toThrow('Failed to clone elements in bulk.');
    });
  });

  describe('Clone namespace', () => {
    it('exposes element and elementAll', () => {
      expect(Clone.element).toBe(cloneElement);
      expect(Clone.elementAll).toBe(cloneElements);
    });
  });
});
