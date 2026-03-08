/**
 * DOM element cloning utilities.
 * @module clone
 */

import type { CloneElementOptions } from './types/clone.type';
import { getElement } from './selector';
import { wrapError } from './utils/errors';

/**
 * Clones a DOM element and optionally appends it to a destination.
 * Provide either `elementSelector` or `sourceSelector`, but not both.
 *
 * @param options - Clone options.
 * @param options.elementSelector - CSS selector for the source element.
 * @param options.sourceSelector - Alternative CSS selector for the source element.
 * @param options.destinationSelector - If provided, the clone is appended to this element.
 * @returns The cloned Node (appended to destination if specified).
 * @throws If both or neither source selectors are provided, or if elements are not found.
 *
 * @example
 * ```ts
 * const clone = cloneElement({ sourceSelector: '#original', destinationSelector: '#target' });
 * ```
 */
export function cloneElement({
  elementSelector = '',
  sourceSelector = '',
  destinationSelector = '',
}: CloneElementOptions): Node {
  try {
    const hasElement = elementSelector.length > 0;
    const hasSource = sourceSelector.length > 0;

    if (hasElement && hasSource) {
      throw new Error('Two source selectors were provided. Use only one.');
    }
    if (!hasElement && !hasSource) {
      throw new Error('No source selector was provided.');
    }

    const selector = hasElement ? elementSelector : sourceSelector;
    const sourceElement = getElement({ selector });
    const clonedNode = sourceElement.cloneNode(true);

    if (destinationSelector.length > 0) {
      const destinationElement = getElement({ selector: destinationSelector });
      return destinationElement.appendChild(clonedNode);
    }

    return clonedNode;
  } catch (error: unknown) {
    throw wrapError('Failed to clone element.', error);
  }
}

/**
 * Clones multiple elements in bulk.
 *
 * @param items - Array of clone option objects.
 * @returns Array of cloned Nodes.
 * @throws If the array is empty or any individual clone fails.
 */
export function cloneElements(items: CloneElementOptions[]): Node[] {
  try {
    if (items.length === 0) {
      throw new Error('Parameter array is empty.');
    }
    return items.map((item) => cloneElement(item));
  } catch (error: unknown) {
    throw wrapError('Failed to clone elements in bulk.', error);
  }
}

/**
 * Clone namespace for backward compatibility with the global `_muse.Clone` API.
 */
export const Clone = {
  element: cloneElement,
  elementAll: cloneElements,
} as const;
