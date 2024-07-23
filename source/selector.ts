/**
 * Selector
 */

import { SelectorGetListParameters, SelectorParametersObject, SelectorWaitParametersObject } from 'types/selector.type';

export namespace Selector {
    /**
     * Selects the first DOM element that matches the selector.
     * @param {string | object} selectorParameters Element selector string or a selector parameters object.
     * @param {string} [selectorParameters.selector] Element selector.
     * @param {string} [selectorParameters.wait] Switch to wait for selector to exist.
     * @returns {Element | Error} The first Element within the document that matches the specified selector, or Error if no matches are found or there was another error.
     */
    export function getElement({ selector = '', wait = false }: SelectorParametersObject): Promise<Element> | Element {
        try {
            let element: Element | null;
            if (selector.length === 0) {
                const message: string = 'Selector parameter is empty.';
                throw new Error(message);
            }
            if (wait) return Selector.waitForElement({ selector }) as Promise<Element>;
            element = document.querySelector(selector) as Element;
            return element;
        } catch (error: any) {
            const message: string = 'Failed to get element from selector.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const get: Function = Selector.getElement;

    /**
     * Wait for element to exist.
     * @param {string} selector Element selector.
     * @param {number} [timeout=15000] Timeout in milliseconds (default is 15 seconds (15000)).
     * @returns {Promise<Element>} Promise that resolves to element if found, or rejects with an error if the timeout is reached.
     */
    export function waitForElement({ selector = '', timeout = 15000 }: SelectorWaitParametersObject): Promise<Element> | Error {
        return new Promise(function (resolve, reject): void {
            const element: Element = Selector.getElement({ selector }) as Element;
            if (element instanceof Element) resolve(element);
            const observer: MutationObserver = new MutationObserver(function (): void {
                const element: Element = Selector.getElement({ selector }) as Element;
                if (element instanceof Element) {
                    observer.disconnect();
                    clearTimeout(timeoutChecker);
                    resolve(element);
                }
            });
            const options: object = {
                childList: true,
                subtree: true
            };
            const target: Node = document.body as Node;
            observer.observe(target, options);
            const timeoutChecker = setTimeout(function (): void {
                observer.disconnect();
                const message: string = `Timed out waiting for element.`;
                reject(message);
            }, timeout);
        });
    }

    /**
     * Gets an array of elements.
     */
    export function getArrayOfElements(arrayOfSelectorParameters: Array<SelectorParametersObject>): Promise<Array<Element>> {
        let arrayOfElements: Array<Element> = [];
        let promiseChain: Promise<void> = Promise.resolve();
        for (const selectorParameters of arrayOfSelectorParameters) {
            promiseChain = promiseChain.then(function (): Promise<Element> {
                return Selector.get(selectorParameters) as Promise<Element>;
            }).then(function (element: Element): void {
                arrayOfElements.push(element);
            });
        }
        return promiseChain.then(function (): Array<Element> {
            return arrayOfElements;
        }).catch(function (error: any): never {
            const message: string = `Failed to get array of elements.`;
            const cause: object = { cause: error };
            throw new Error(message, cause);
        });
    }
    export const getArray: Function = Selector.getArrayOfElements;

    /** 
     * Selects all DOM elements that matches the selector.
     * @param
     * @returns {}
     */
    export function getList({ selector }: SelectorGetListParameters): NodeListOf<Element> {
        try {
            const elementCollection: NodeListOf<Element> = document.querySelectorAll(selector) as NodeListOf<Element>;
            return elementCollection;
        } catch (error: any) {
            const message: string = 'Failed to get element collection from selector.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const list: Function = Selector.getList;

    /**
     * Selects all 'script' elements in the DOM.
     * @returns
     */
    export function getListOfScripts(): NodeListOf<HTMLElementTagNameMap['script']> {
        const selector: string = 'script';
        return Selector.getList({ selector }) as NodeListOf<HTMLElementTagNameMap['script']>
    }
    export const allScripts: Function = Selector.getListOfScripts;

    /**
     * Selects all 'style' elements in the DOM.
     * @returns
     */
    export function getListOfStyles(): NodeListOf<HTMLElementTagNameMap['style']> {
        const selector: string = 'style';
        return Selector.getList({ selector }) as NodeListOf<HTMLElementTagNameMap['style']>;
    }
    export const allStyles: Function = Selector.getListOfStyles;
}