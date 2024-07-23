/**
 * Style
 */

import { CssStringObject, GenericMethodObject, GenericMethodReturn, InlineObject, InlineReturn, StyleInjectTextHeadObject, StyleRemoveExternalObject } from 'types/style.type';
import { InjectParametersObject } from './types/inject.type';

import { Selector } from 'selector';

export namespace Style {

    export const getList: Function = Selector.getListOfStyles;

    /**
     * Inject stylesheet from URL or text into a specific DOM location.
     * @param {Object} o Function arguments object.
     * @param {string} [o.url] Style URL.
     * @param {string} [o.text] Style text (alternative to URL).
     * @param {string} [o.location='head'] Injection location ('head' or 'body').
     * @returns {HTMLStyleElement | HTMLLinkElement | Error} Returns style or link element if successful, otherwise returns an error.
     */
    export function inject({ url = '', text = '', location = 'head', wait = false }: InjectParametersObject): Promise<Event> | HTMLStyleElement | HTMLLinkElement {
        try {
            const style: string = text;
            if (url.length === 0 && style.length === 0) {
                const message: string = 'Neither url or style was specified.';
                throw new Error(message);
            }
            const validLocations: Array<string> = ['head', 'body'];
            if (!(validLocations.includes(location))) {
                const message: string = `Invalid location, ${location}.`;
                throw new Error(message);
            }
            let linkElement: HTMLLinkElement | undefined = undefined;
            let styleElement: HTMLStyleElement | undefined = undefined;
            if (url.length > 0) {
                linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.type = 'text/css';
                linkElement.href = url;
            } else if (style.length > 0) {
                styleElement = document.createElement('style');
                styleElement.innerHTML = style;
            }
            let stylesheetElement: HTMLStyleElement | HTMLLinkElement =
                (styleElement instanceof HTMLStyleElement) ?
                    styleElement as HTMLStyleElement :
                    linkElement as HTMLLinkElement;
            const locationElement: HTMLHeadElement | HTMLBodyElement = document[location as keyof Document] as HTMLHeadElement | HTMLBodyElement;
            if (wait) {
                return new Promise(function (resolve): void {
                    stylesheetElement.onload = function (event: Event): void { resolve(event); };
                    stylesheetElement.onerror = function (error: any): void { throw new Error(error) as Error; };
                    stylesheetElement = locationElement.appendChild(stylesheetElement);
                });
            } else {
                stylesheetElement = locationElement.appendChild(stylesheetElement);
                return stylesheetElement;
            }
        } catch (error: any) {
            const message: string = `Failed to inject style.`;
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const add: Function = Style.inject;

    /**
     * Inject styles sequentially.
     * @param {Array<InjectParametersObject>} arrayOfInjectParametersObject Array of injection parameters object.
     * @returns Array containing style, link elements or events. 
     */
    export function injectArray(arrayOfInjectParametersObject: Array<InjectParametersObject>): Promise<Array<HTMLStyleElement | HTMLLinkElement | Event>> {
        let arrayOfElements: Array<HTMLStyleElement | HTMLLinkElement | Event> = [];
        let promiseChain: Promise<void> = Promise.resolve();
        for (const injectParametersObject of arrayOfInjectParametersObject) {
            promiseChain = promiseChain.then(function (): Promise<HTMLStyleElement | HTMLLinkElement | Event> {
                return Style.inject(injectParametersObject) as Promise<HTMLStyleElement | HTMLLinkElement | Event>;
            }).then(function (stylesheetElementOrEvent: HTMLStyleElement | HTMLLinkElement | Event): void {
                arrayOfElements.push(stylesheetElementOrEvent);
            });
        }
        return promiseChain.then(function (): Array<HTMLStyleElement | HTMLLinkElement | Event> {
            return arrayOfElements;
        }).catch(function (error: any): never {
            const message: string = 'Failed to inject array of styles.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        });
    }

    /**
     * 
     * @param param0 
     * @returns 
     */
    export function injectArrayHeadUrl(arrayOfStyleUrls: Array<string>): Promise<Array<HTMLStyleElement | HTMLLinkElement | Event>> {
        let arrayOfInjectParametersObject: Array<InjectParametersObject> = [];
        for (const styleUrl of arrayOfStyleUrls)
            arrayOfInjectParametersObject.push({
                url: styleUrl,
                location: 'head'
            });
        return injectArray(arrayOfInjectParametersObject);
    }

    /**
     * Inject stylesheet text on head.
     * @param {string} text Style text.
     * @returns {HTMLStyleElement} Style element if successful.
     */
    export function injectTextHead({ text = '' }: StyleInjectTextHeadObject): HTMLStyleElement {
        return Style.inject({ text }) as HTMLStyleElement;
    }
    export const addTextHead: Function = Style.injectTextHead;

    /**
     * Removes an external script from the DOM based on its partial source attribute match.
     * @param {string} scriptName Partial filename/src.
     * @returns {Boolean | Error} True on success or error.
     */
    export function removeExternal({ scriptName = '' }: StyleRemoveExternalObject): Boolean {
        try {
            const scripts: NodeListOf<HTMLElementTagNameMap['script']> = Selector.getListOfScripts();
            for (const script of scripts) {
                const containsScriptName: boolean = script.src.toString().includes(scriptName) ? true : false;
                if (containsScriptName) script.parentNode?.removeChild(script);
            }
            return true;
        } catch (error: any) {
            const message: string = `Failed to remove script.`;
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const deleteExternal: Function = Style.removeExternal;

    /**
     * Element
     */
    export namespace Element {
        /**
         * Get a prepared CSS string to inject in this context.
         * @param selector Element selector.
         * @param css Selector properties. 
         * @returns Returns a prepared CSS string.
         */
        function getCssString({ selector = '', method = '', inline = false }: CssStringObject): string {
            let cssString: string;
            let properties: string;
            switch (method) {
                case 'displayNone':
                    properties = 'display: none !important;';
                    break;
                case 'opacityZero':
                    properties = 'opacity: 0 !important;';
                    break;
                case 'visibilityHidden':
                    properties = 'visibility: hidden !important;';
                    break;
                default:
                    properties = ''
                    break;
            }
            cssString = inline ? properties : `${selector} { ${properties} }`;
            return cssString;
        }

        /**
         * Apply inline style to element.
         * @param selector 
         * @param wait 
         */
        export function inline({ selector = '', css = '', wait = false }: InlineObject): InlineReturn {
            try {
                const attribute: string = 'style';
                if (wait) {
                    return new Promise(function (resolve): void {
                        (Selector.getElement({ selector, wait }) as Promise<Element>).then(function (element: Element): void {
                            element.setAttribute(attribute, css);
                            resolve(element);
                        });
                    });
                } else {
                    const element: Element = Selector.getElement({ selector }) as Element;
                    element.setAttribute(attribute, css);
                    return element;
                }
            } catch (error: any) {
                const message: string = 'Failed to apply inline style.';
                const cause: object = { cause: error };
                throw new Error(message, cause);
            }
        }

        /**
         * 
         * @param selectorOrArrayOfSelectors 
         * @param {string} method
         * @param {boolean} inline
         * @returns 
         */
        function genericMethod({ selectorOrArrayOfSelectors, method = '', inline = false, wait = false }: GenericMethodObject): GenericMethodReturn {
            if (Array.isArray(selectorOrArrayOfSelectors)) { // Array
                let arrayOfElements: Array<Event | Element | HTMLStyleElement> = [];
                if (inline) { // Array, inline
                    if (wait) { // Array, inline, wait 
                        let promiseChain: Promise<void> = Promise.resolve();
                        for (const selector of selectorOrArrayOfSelectors) {
                            const css: string = getCssString({ selector, method, inline });
                            promiseChain = promiseChain.then(function (): Promise<Element> {
                                return Style.Element.inline({ selector, css, wait }) as Promise<Element>;
                            }).then(function (scriptElementOrEvent: Element): void {
                                arrayOfElements.push(scriptElementOrEvent);
                            });
                        }
                        return promiseChain.then(function (): Array<Event | HTMLStyleElement | Element> {
                            return arrayOfElements;
                        }).catch(function (error: any): never {
                            const message: string = 'Failed to wait and apply inline darkmode to array of selectors.';
                            const cause: object = { cause: error };
                            throw new Error(message, cause);
                        });
                    } else { // Array, inline, nowait
                        try {
                            for (const selector of selectorOrArrayOfSelectors) {
                                const css: string = getCssString({ selector, method, inline });
                                const element: Element = Style.Element.inline({ selector, css }) as Element;
                                arrayOfElements.push(element);
                            }
                            return arrayOfElements;
                        } catch (error: any) {
                            const message: string = 'Failed to apply inline darkmode to array of selectors.';
                            const cause: object = { cause: error };
                            throw new Error(message, cause);
                        }
                    }
                } else { // Array, global
                    if (wait) { // Array, global, wait
                        let promiseChain: Promise<void> = Promise.resolve();
                        for (const selector of selectorOrArrayOfSelectors) {
                            const text: string = getCssString({ selector, method });
                            promiseChain = promiseChain.then(function (): Promise<Event> {
                                return Style.inject({ text, wait }) as Promise<Event>;
                            }).then(function (scriptElementOrEvent: Event): void {
                                arrayOfElements.push(scriptElementOrEvent);
                            });
                        }
                        return promiseChain.then(function (): Array<Event | HTMLStyleElement | Element> {
                            return arrayOfElements;
                        }).catch(function (error: any): never {
                            const message: string = 'Failed to wait and apply darkmode to array of selectors.';
                            const cause: object = { cause: error };
                            throw new Error(message, cause);
                        });
                    } else { // Array, global, nowait
                        try {
                            for (const selector of selectorOrArrayOfSelectors) {
                                const text: string = getCssString({ selector, method });
                                const element: Element = Style.inject({ text }) as HTMLStyleElement;
                                arrayOfElements.push(element);
                            }
                            return arrayOfElements;
                        } catch (error: any) {
                            const message: string = 'Failed to apply darkmode to array of selectors.';
                            const cause: object = { cause: error };
                            throw new Error(message, cause);
                        }

                    }
                }
            } else { // Single
                const selector: string = selectorOrArrayOfSelectors;
                if (inline) { // Single, inline
                    if (wait) { // Single, inline, wait
                        return new Promise(function (resolve): void {
                            const css: string = getCssString({ selector, method, inline });
                            (Style.Element.inline({ selector, css, wait }) as Promise<Element>).then(function (element): void {
                                resolve(element);
                            }).catch(function (error: any): never {
                                const message: string = 'Failed to wait and apply inline darkmode to selector.';
                                const cause: object = { cause: error };
                                throw new Error(message, cause);
                            });
                        });
                    } else { // Single, inline, nowait
                        try {
                            const css: string = getCssString({ selector, method, inline });
                            const element: Element = Style.Element.inline({ selector, css }) as Element;
                            return element;
                        } catch (error: any) {
                            const message: string = 'Failed to apply inline darkmode to selector.';
                            const cause: object = { cause: error };
                            throw new Error(message, cause);
                        }
                    }
                } else { // Single, global
                    if (wait) { // Single, global, wait
                        return new Promise(function (resolve): void {
                            const text: string = getCssString({ selector, method });
                            (Style.inject({ text, wait }) as Promise<Event>).then(function (event): void {
                                resolve(event);
                            }).catch(function (error: any): never {
                                const message: string = 'Failed to wait and apply darkmode to selector.';
                                const cause: object = { cause: error };
                                throw new Error(message, cause);
                            });
                        });
                    } else { // Single, global, nowait
                        try {
                            const text: string = getCssString({ selector, method });
                            const element: HTMLStyleElement = Style.inject({ text }) as HTMLStyleElement;
                            return element;
                        } catch (error: any) {
                            const message: string = 'Failed to apply darkmode to selector.';
                            const cause: object = { cause: error };
                            throw new Error(message, cause);
                        }

                    }
                }
            }
        }

        /**
         * Add 'display: none !important;' property to an element or array of elements.
         * @param selectorOrArrayOfSelectors Element selector or array of selectors.
         * @returns Returns html style element if successful, otherwise an error.
         */
        export function displayNone({ selectorOrArrayOfSelectors, inline = false, wait = false }: GenericMethodObject): GenericMethodReturn {
            const method: string = 'displayNone';
            return genericMethod({ selectorOrArrayOfSelectors, method, inline, wait });
        }

        /**
         * Add 'opacity: 0 !important;' property to an element or array of elements.
         * @param selectorOrArrayOfSelectors Element selector or array of selectors.
         * @returns Returns html style element if successful, otherwise an error.
         */
        export function opacityZero({ selectorOrArrayOfSelectors, inline = false, wait = false }: GenericMethodObject): GenericMethodReturn {
            const method: string = 'opacityZero';
            return genericMethod({ selectorOrArrayOfSelectors, method, inline, wait });
        }

        /**
         * Add 'visibility: hidden !important;' property to an element or array of elements.
         * @param selectorOrArrayOfSelectors Element selector or array of selectors.
         * @returns Returns html style element if successful, otherwise an error.
         */
        export function visibilityHidden({ selectorOrArrayOfSelectors, inline = false, wait = false }: GenericMethodObject): GenericMethodReturn {
            const method: string = 'visibilityHidden';
            return genericMethod({ selectorOrArrayOfSelectors, method, inline, wait });
        }
    }
}