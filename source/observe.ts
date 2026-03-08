/**
 * MutationObserver convenience utilities.
 * @module observe
 */

/**
 * Options for {@link observeElement}.
 */
export interface ObserveElementOptions {
  /** The target element or CSS selector to observe. */
  target: Element | string;
  /** MutationObserver configuration. @defaultValue `{ childList: true, subtree: true }` */
  options?: MutationObserverInit | undefined;
}

/**
 * A disposable observer handle returned by {@link observeElement}.
 */
export interface ObserverHandle {
  /** Stop observing. */
  disconnect(): void;
}

/**
 * Observes DOM mutations on a target element, invoking a callback for each batch.
 *
 * @param config - Observation configuration.
 * @param callback - Function called with each batch of MutationRecords.
 * @returns An {@link ObserverHandle} to disconnect the observer.
 * @throws If the target selector doesn't match any element.
 *
 * @example
 * ```ts
 * const handle = observeElement(
 *   { target: '#chat-container' },
 *   (mutations) => {
 *     for (const m of mutations) {
 *       console.log('Added nodes:', m.addedNodes.length);
 *     }
 *   },
 * );
 *
 * // Later: stop observing
 * handle.disconnect();
 * ```
 */
export function observeElement(
  config: ObserveElementOptions,
  callback: MutationCallback,
): ObserverHandle {
  const element =
    typeof config.target === 'string' ? document.querySelector(config.target) : config.target;

  if (!element) {
    throw new Error(
      `observeElement: target element not found${typeof config.target === 'string' ? ` (selector: "${config.target}")` : ''}.`,
    );
  }

  const observer = new MutationObserver(callback);
  observer.observe(element, config.options ?? { childList: true, subtree: true });

  return {
    disconnect: () => observer.disconnect(),
  };
}

/**
 * Waits for a child element matching `selector` to be added inside `parent`.
 * Resolves immediately if the element already exists.
 *
 * @param parent - The parent Element or CSS selector to observe.
 * @param selector - CSS selector of the child to wait for.
 * @param options - Optional timeout and AbortSignal.
 * @returns A Promise resolving to the matched child Element.
 * @throws On timeout or abort.
 *
 * @example
 * ```ts
 * const modal = await waitForChild('#app', '.modal-dialog', { timeout: 5000 });
 * ```
 */
export function waitForChild(
  parent: Element | string,
  selector: string,
  options: WaitForChildOptions = {},
): Promise<Element> {
  const timeout = options.timeout ?? 15000;
  const signal = options.signal;

  const parentEl =
    typeof parent === 'string' ? document.querySelector(parent) : parent;

  if (!parentEl) {
    return Promise.reject(
      new Error(
        `waitForChild: parent element not found${typeof parent === 'string' ? ` (selector: "${parent}")` : ''}.`,
      ),
    );
  }

  // Already present?
  const existing = parentEl.querySelector(selector);
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise<Element>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('waitForChild aborted.', { cause: signal.reason }));
      return;
    }

    const cleanup = (): void => {
      observer.disconnect();
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = (): void => {
      cleanup();
      reject(new Error('waitForChild aborted.', { cause: signal?.reason }));
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.matches(selector)) {
              cleanup();
              resolve(node);
              return;
            }
            const nested = node.querySelector(selector);
            if (nested) {
              cleanup();
              resolve(nested);
              return;
            }
          }
        }
      }
    });

    observer.observe(parentEl, { childList: true, subtree: true });
    signal?.addEventListener('abort', onAbort, { once: true });

    const timer = setTimeout(() => {
      cleanup();
      reject(
        new Error(`waitForChild: timed out waiting for "${selector}" inside parent.`),
      );
    }, timeout);
  });
}

/**
 * Options for {@link waitForChild}.
 */
export interface WaitForChildOptions {
  /** Maximum time to wait in milliseconds. @defaultValue 15000 */
  timeout?: number | undefined;
  /** An AbortSignal to cancel the wait. */
  signal?: AbortSignal | undefined;
}

/**
 * Observe namespace for backward compatibility with the global `_muse.Observe` API.
 */
export const Observe = {
  observeElement,
  waitForChild,
} as const;
