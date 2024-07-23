/**
 * Clone
 */

import { ElementSelectorObject } from 'types/clone.type';

import { Selector } from 'selector';

export namespace Clone {
    /**
     * Clones an element based on a selector, and optionally appends it to a destination selector.
     * @param {Object} [o] Element selector object.
     * @param {string} [o.elementSelector] Source element selector.
     * @param {string} [o.sourceSelector] Source element selector (alternative).
     * @param {string} [o.destinationSelector] Destination element selector.
     * @returns {Node} Cloned node.
     */
    export function element({ elementSelector = '', sourceSelector = '', destinationSelector = '' }: ElementSelectorObject): Node {
        try {
            const elementSelectorInUse: boolean = elementSelector.length > 0 ? true : false;
            const sourceSelectorInUse: boolean = sourceSelector.length > 0 ? true : false;
            if (elementSelectorInUse && sourceSelectorInUse) {
                const message: string = `There's two source selectors.`
                throw new Error(message);
            }
            if (!elementSelectorInUse && !sourceSelectorInUse) {
                const message: string = 'No source selectors were provided.';
                throw new Error(message);
            }
            let clonedNode: Node;
            let destinationNode: Node | undefined = undefined;
            sourceSelector = elementSelector.length > 0 ? elementSelector : sourceSelector;
            const sourceElement: Element = Selector.get(sourceSelector) as Element;
            const sourceNode: Node = sourceElement.cloneNode(true);
            if (destinationSelector.length > 0) {
                const destinationElement: Element = Selector.getElement({ selector: destinationSelector }) as Element;
                destinationNode = destinationElement.appendChild(sourceNode);
            }
            clonedNode = (destinationNode instanceof Node) ? destinationNode : sourceNode;
            return clonedNode;
        } catch (error: any) {
            const message: string = 'Failed to clone element.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }

    /**
     * Clone an array of elements to a destination
     * @param {Array<ElementSelectorObject>} arrayOfElementSelectorObject Array of element selctor objects.
     * @returns {Array<Node>} Array of cloned nodes.
     */
    export function elementAll(arrayOfElementSelectorObject: Array<ElementSelectorObject>): Array<Node> {
        try {
            const isParameterArrayEmpty: boolean = arrayOfElementSelectorObject.length === 0 ? true : false;
            if (isParameterArrayEmpty) {
                const message: string = 'Parameter array is empty.';
                throw new Error(message);
            }
            const clonedNodes: Array<Node> = [];
            for (const elementSelectorObject of arrayOfElementSelectorObject) {
                const clonedNode = Clone.element(elementSelectorObject);
                clonedNodes.push(clonedNode);
            }
            return clonedNodes;
        } catch (error: any) {
            const message: string = 'Failed to clone elements in bulk.';
            const cause: Object = { cause: error };
            throw new Error(message, cause);
        }
    }
}

