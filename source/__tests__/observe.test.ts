import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { observeElement, waitForChild, Observe } from '../observe';

describe('observeElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('invokes callback when a child is added to an Element target', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const callback = vi.fn();
    observeElement({ target: container }, callback);

    const child = document.createElement('span');
    container.appendChild(child);

    // MutationObserver callbacks are async in happy-dom
    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });

    const mutations: MutationRecord[] = callback.mock.calls[0][0];
    expect(mutations.length).toBeGreaterThan(0);
    expect(mutations[0].addedNodes.length).toBeGreaterThan(0);
  });

  it('finds element by string selector and observes it', async () => {
    const container = document.createElement('div');
    container.id = 'observed';
    document.body.appendChild(container);

    const callback = vi.fn();
    observeElement({ target: '#observed' }, callback);

    const child = document.createElement('p');
    container.appendChild(child);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it('throws when string selector matches no element', () => {
    expect(() => observeElement({ target: '#nonexistent' }, vi.fn())).toThrow(
      'observeElement: target element not found (selector: "#nonexistent").',
    );
  });

  it('stops observation after disconnect', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const callback = vi.fn();
    const handle = observeElement({ target: container }, callback);

    handle.disconnect();

    container.appendChild(document.createElement('span'));

    // Give enough time for a potential (but unwanted) callback
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('waitForChild', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves immediately if the child already exists', async () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    child.className = 'target';
    parent.appendChild(child);
    document.body.appendChild(parent);

    const result = await waitForChild(parent, '.target');
    expect(result).toBe(child);
  });

  it('resolves when a matching child is added later', async () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const promise = waitForChild(parent, '.later', { timeout: 5000 });

    // Add the child after a small delay so MutationObserver can pick it up
    setTimeout(() => {
      const child = document.createElement('span');
      child.className = 'later';
      parent.appendChild(child);
    }, 10);

    const result = await promise;
    expect(result).toBeInstanceOf(Element);
    expect(result.classList.contains('later')).toBe(true);
  });

  it('rejects when timeout elapses', async () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    await expect(waitForChild(parent, '.never', { timeout: 50 })).rejects.toThrow(
      'waitForChild: timed out waiting for ".never" inside parent.',
    );
  });

  it('rejects when parent selector matches no element', async () => {
    await expect(waitForChild('#missing-parent', '.child')).rejects.toThrow(
      'waitForChild: parent element not found (selector: "#missing-parent").',
    );
  });

  it('rejects immediately when signal is already aborted', async () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const controller = new AbortController();
    controller.abort('cancelled');

    await expect(waitForChild(parent, '.child', { signal: controller.signal })).rejects.toThrow(
      'waitForChild aborted.',
    );
  });

  it('rejects when signal is aborted during the wait', async () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    const controller = new AbortController();

    const promise = waitForChild(parent, '.child', {
      timeout: 5000,
      signal: controller.signal,
    });

    setTimeout(() => controller.abort('cancelled mid-wait'), 10);

    await expect(promise).rejects.toThrow('waitForChild aborted.');
  });

  it('rejects when timeout is negative', async () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    await expect(waitForChild(parent, '.child', { timeout: -1 })).rejects.toThrow(
      'waitForChild: timeout must be a positive finite number, got -1.',
    );
  });

  it('rejects when timeout is NaN', async () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    await expect(waitForChild(parent, '.child', { timeout: NaN })).rejects.toThrow(
      'waitForChild: timeout must be a positive finite number, got NaN.',
    );
  });

  it('rejects when timeout is Infinity', async () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);

    await expect(waitForChild(parent, '.child', { timeout: Infinity })).rejects.toThrow(
      'waitForChild: timeout must be a positive finite number, got Infinity.',
    );
  });
});

describe('Observe namespace', () => {
  it('maps observeElement and waitForChild correctly', () => {
    expect(Observe.observeElement).toBe(observeElement);
    expect(Observe.waitForChild).toBe(waitForChild);
  });
});
