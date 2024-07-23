/**
 * Script
 */

import { Selector } from 'selector';
import { InjectParametersObject } from './types/inject.type';

export namespace Script {

    export const getList: Function = Selector.getListOfScripts;

    /**
     * Injects a script from a URL or text into a specific DOM location.
     * @param {Object} o Function arguments object.
     * @param {string} [o.url] Script URL.
     * @param {string} [o.text] Script text.
     * @param {string} [o.location='head'] Injection location ('head' or 'body').
     * @param {string} [o.wait=false] Wait for script execution.
     * @returns {Promise<Event | Error> | HTMLScriptElement | Error} If wait is true returns a promise that resolves to an loaded event if successful, otherwise an error. If wait is false returns a script element if successful, otherwise returns an error.
     */
    export function inject({ url = '', text = '', location = 'head', wait = false }: InjectParametersObject = {}): Promise<Event> | HTMLScriptElement {
        try {
            const script: string = text;
            if (url.length === 0 && script.length === 0) {
                const message: string = 'Neither url or script was specified.';
                throw new Error(message);
            }
            const validLocations: Array<string> = ['head', 'body'];
            if (!(validLocations.includes(location))) {
                const message: string = `Invalid location, ${location}.`;
                throw new Error(message);
            }
            let scriptElement: HTMLScriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            if (url !== '') {
                scriptElement.src = url;
            } else if (script !== '') {
                scriptElement.innerHTML = script;
            }
            const locationElement: HTMLHeadElement | HTMLBodyElement = document[location as keyof Document] as HTMLHeadElement | HTMLBodyElement;
            if (wait) {
                return new Promise(function (resolve): void {
                    scriptElement.onload = function (event: Event): void { resolve(event); };
                    scriptElement.onerror = function (error: any): void { throw new Error(error) as Error; };
                    scriptElement = locationElement.appendChild(scriptElement);
                });
            } else {
                scriptElement = locationElement.appendChild(scriptElement);
                return scriptElement;
            }
        } catch (error: any) {
            const message: string = `Failed to inject script.`;
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const add = Script.inject;

    /**
     * Inject scripts sequentially.
     * @param {Array<InjectParametersObject>} arrayOfInjectParametersObject Array of injection parameters object. 
     * @returns Array containing script elements or events.
     */
    export function injectArray(arrayOfInjectParametersObject: Array<InjectParametersObject>): Promise<Array<HTMLScriptElement | Event>> {
        let arrayOfElements: Array<HTMLScriptElement | Event> = [];
        let promiseChain: Promise<void> = Promise.resolve();
        for (const injectParametersObject of arrayOfInjectParametersObject) {
            promiseChain = promiseChain.then(function (): Promise<HTMLScriptElement | Event> {
                return Script.inject(injectParametersObject) as Promise<HTMLScriptElement | Event>;
            }).then(function (scriptElementOrEvent: HTMLScriptElement | Event): void {
                arrayOfElements.push(scriptElementOrEvent);
            });
        }
        return promiseChain.then(function (): Array<HTMLScriptElement | Event> {
            return arrayOfElements;
        }).catch(function (error: any): never {
            const message: string = 'Failed to inject scripts in bulk.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        });
    }
    export const addArray: Function = Script.injectArray;

    /**
 * 
 * @param param0 
 * @returns 
 */
    export function injectArrayHeadUrlWait(arrayOfScriptUrls: Array<string>): Promise<Array<HTMLScriptElement | Event>> {
        let arrayOfInjectParametersObject: Array<InjectParametersObject> = [];
        for (const scriptUrl of arrayOfScriptUrls)
            arrayOfInjectParametersObject.push({
                url: scriptUrl,
                location: 'head',
                wait: true
            });
        return injectArray(arrayOfInjectParametersObject);
    }

    /**
     * Removes an external script from the DOM based on its partial source attribute match.
     * @param {string} scriptName Partial filename/src.
     * @returns {Boolean | Error} Returns true if successful, otherwise returns an error.
     */
    export function removeExternal(scriptName: string): boolean {
        try {
            const scriptsCollection: NodeListOf<HTMLElementTagNameMap['script']> = Selector.getListOfScripts();
            let removed: boolean = false;
            scriptsCollection.forEach(function (script): void {
                const containsScriptName: boolean = script.src.toString().includes(scriptName) ? true : false;
                if (containsScriptName) {
                    script.parentNode?.removeChild(script);
                    removed = true;
                }
            });
            return removed;
        } catch (error: any) {
            const message: string = `Failed to remove script.`;
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const deleteExternal: Function = Script.removeExternal;


    /**
     * Remove an array of external scripts from the DOM based on partial source attribute match.
     * @param arrayOfScriptNames Array of script names.
     * @returns 
     */
    export function removeExternalArray(arrayOfScriptNames: Array<string>): object {
        try {
            let removalResults: Array<Object> = [];
            for (const scriptName of arrayOfScriptNames) {
                const removed: boolean = Script.removeExternal(scriptName) as boolean;
                removalResults.push({ scriptName, removed });
            }
            return removalResults;
        } catch (error: any) {
            const message: string = 'Failed to bulk remove scripts.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const deleteExternalArray: Function = Script.removeExternalArray;
}