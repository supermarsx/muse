import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getElement,
  waitForElement,
  getArrayOfElements,
  queryAll,
  getAllScripts,
  getAllStyles,
  Selector,
} from '../selector';

describe('selector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getElement', () => {
    it('returns an element matching the selector', () => {
      const div = document.createElement('div');
      div.id = 'test-el';
      document.body.appendChild(div);

      const result = getElement({ selector: '#test-el' });
      expect(result).toBe(div);
    });

    it('throws when selector is empty', () => {
      expect(() => getElement({ selector: '' })).toThrow('Failed to get element from selector.');
    });

    it('throws when element is not found', () => {
      expect(() => getElement({ selector: '#nonexistent' })).toThrow('Failed to get element from selector.');
    });
  });

  describe('waitForElement', () => {
    it('resolves immediately if element already exists', async () => {
      const div = document.createElement('div');
      div.id = 'existing';
      document.body.appendChild(div);

      const result = await waitForElement({ selector: '#existing' });
      expect(result).toBe(div);
    });

    it('resolves when element appears later', async () => {
      const promise = waitForElement({ selector: '#later', timeout: 5000 });

      // Simulate element appearing after a delay
      setTimeout(() => {
        const div = document.createElement('div');
        div.id = 'later';
        document.body.appendChild(div);
      }, 50);

      const result = await promise;
      expect(result.id).toBe('later');
    });

    it('rejects on timeout', async () => {
      await expect(waitForElement({ selector: '#never', timeout: 100 })).rejects.toThrow('Failed to wait for element.');
    });

    it('rejects when timeout is negative', async () => {
      await expect(waitForElement({ selector: '#never', timeout: -1 })).rejects.toThrow('Failed to wait for element.');
    });

    it('rejects when timeout is NaN', async () => {
      await expect(waitForElement({ selector: '#never', timeout: NaN })).rejects.toThrow('Failed to wait for element.');
    });

    it('rejects when timeout is Infinity', async () => {
      await expect(waitForElement({ selector: '#never', timeout: Infinity })).rejects.toThrow(
        'Failed to wait for element.',
      );
    });
  });

  describe('queryAll', () => {
    it('returns all matching elements', () => {
      document.body.innerHTML = '<p class="item">1</p><p class="item">2</p><span>3</span>';
      const result = queryAll({ selector: '.item' });
      expect(result.length).toBe(2);
    });

    it('returns empty NodeList when nothing matches', () => {
      const result = queryAll({ selector: '.nonexistent' });
      expect(result.length).toBe(0);
    });

    it('throws when selector is empty', () => {
      expect(() => queryAll({ selector: '' })).toThrow('Failed to get element collection from selector.');
    });
  });

  describe('getAllScripts', () => {
    it('returns script elements in the DOM', () => {
      const script = document.createElement('script');
      script.textContent = 'console.log("test")';
      document.body.appendChild(script);

      const scripts = getAllScripts();
      expect(scripts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getAllStyles', () => {
    it('returns style elements in the DOM', () => {
      const style = document.createElement('style');
      style.textContent = 'body { color: red; }';
      document.body.appendChild(style);

      const styles = getAllStyles();
      expect(styles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getElement with wait', () => {
    it('returns a Promise when wait is true', async () => {
      const div = document.createElement('div');
      div.id = 'wait-el';
      document.body.appendChild(div);

      const result = await getElement({ selector: '#wait-el', wait: true });
      expect(result.id).toBe('wait-el');
    });
  });

  describe('waitForElement with AbortSignal', () => {
    it('rejects immediately if signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort('cancelled');

      await expect(waitForElement({ selector: '#never', signal: controller.signal })).rejects.toThrow(
        'Failed to wait for element.',
      );
    });

    it('rejects when signal is aborted during wait', async () => {
      const controller = new AbortController();
      const promise = waitForElement({ selector: '#never-appears', timeout: 5000, signal: controller.signal });

      setTimeout(() => controller.abort('user cancel'), 50);

      await expect(promise).rejects.toThrow('Failed to wait for element.');
    });
  });

  describe('getArrayOfElements', () => {
    it('resolves all selectors in parallel', async () => {
      const d1 = document.createElement('div');
      d1.id = 'arr1';
      const d2 = document.createElement('div');
      d2.id = 'arr2';
      document.body.appendChild(d1);
      document.body.appendChild(d2);

      const result = await getArrayOfElements([{ selector: '#arr1' }, { selector: '#arr2' }]);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('arr1');
      expect(result[1].id).toBe('arr2');
    });

    it('rejects if any selector fails to appear', async () => {
      const d1 = document.createElement('div');
      d1.id = 'arr-ok';
      document.body.appendChild(d1);

      await expect(getArrayOfElements([{ selector: '#arr-ok' }, { selector: '#arr-missing' }])).rejects.toThrow(
        'Failed to get array of elements.',
      );
    }, 20000);
  });

  describe('Selector namespace', () => {
    it('exposes all functions', () => {
      expect(Selector.getElement).toBe(getElement);
      expect(Selector.get).toBe(getElement);
      expect(Selector.waitForElement).toBe(waitForElement);
      expect(Selector.getList).toBe(queryAll);
      expect(Selector.allScripts).toBe(getAllScripts);
      expect(Selector.allStyles).toBe(getAllStyles);
    });
  });
});
