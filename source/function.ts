/**
 * Function
 */

import { WaitFn2ndLevelObject, OriginalParametersObject, WaitFnObject } from 'types/function.type';

import { Selector } from 'selector';

export namespace FunctionFn {
    /**
     * Wait for a function to exist.
     * @param {string} functionName Function name
     * @param {number} interval Checking interval, default is 50ms
     * @param {number} timeout Timeout in ms, default is 15s
     * @returns {Promise<Function | Error>} Returns promise that resolves to function if successful, otherwise returns an error.
     */
    export function wait({ functionName, interval = 50, timeout = 15000 }: WaitFnObject): Promise<void> {
        return new Promise(function (resolve): void {
            try {
                const functionChecker = setInterval(function (): void {
                    const functionToCheck: any = window[functionName];
                    if (functionToCheck instanceof Function) {
                        clearTimeout(timeoutChecker);
                        clearInterval(functionChecker);
                        resolve();
                    }
                }, interval);

                const timeoutChecker = setTimeout(function (): void {
                    clearInterval(functionChecker);
                    const errorMessage: string = `Failed to wait for function ${functionName} after ${timeout}ms. Function not found.`;
                    throw new Error(errorMessage);
                }, timeout);
            } catch (error: any) {
                const errorMessage: string = `Failed to wait for function with error: ${error.message}.`;
                throw new Error(errorMessage);
            }
        });
    }

    /**
     * Wait for a 2nd level function to exist.
     * @param {string} firstLevel First level name
     * @param {string} secondLevel Second level function name
     * @param {number} interval Checking interval
     * @param {number} timeout Timeout in ms
     * @returns {Promise<Function | Error>} Returns promise that resolves to function if successful, otherwise returns an error.
     */
    export function waitFor2ndLevel({ firstLevel, secondLevel, interval = 50, timeout = 15000 }: WaitFn2ndLevelObject): Promise<Function> {
        return new Promise(function (resolve): void {
            try {
                const functionChecker = setInterval(function (): void {
                    if (typeof window[firstLevel] !== undefined) {
                        const functionToCheck: any = window[firstLevel][secondLevel];
                        if (functionToCheck instanceof Function) {
                            clearTimeout(timeoutChecker);
                            clearInterval(functionChecker);
                            resolve(functionToCheck);
                        }
                    }
                }, interval);
                const timeoutChecker = setTimeout(function (): void {
                    clearInterval(functionChecker);
                    const errorMessage: string = `Failed to wait for second level function ${firstLevel}.${secondLevel} after ${timeout}ms. Function not found.`;
                    throw new Error(errorMessage);
                }, timeout);
            } catch (error: any) {
                const errorMessage: string = `Failed to wait for second level function with error: ${error.message}.`;
                throw new Error(errorMessage);
            }
        });
    }
    export const wait2nd = FunctionFn.waitFor2ndLevel;

    /**
     * 
     */
    export function getList(): Array<RegExpExecArray | any> {
        try {
            let scripts: NodeListOf<HTMLElementTagNameMap['script']> = Selector.getListOfScripts() as NodeListOf<HTMLElementTagNameMap['script']>;
            let functionRegex: RegExp = /(((\w|\.)+)\((([^)]*)\)\;*))/g;
            let functionList: Array<RegExpExecArray | any> = [];
            for (const script of scripts) {
                const contents: string = script.innerHTML.toString();
                const matchesArray: Array<RegExpExecArray> = Array.from(contents.matchAll(functionRegex));
                if (matchesArray.length > 0)
                    for (const match of matchesArray)
                        functionList.push(match);
            }
            return functionList;
        } catch (error: any) {
            const message: string = 'Failed to get list of functions.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const getAll = FunctionFn.getList;

    /**
     * 
     * @param functionName 
     */
    export function getOriginalParameters({ functionName = '' }: OriginalParametersObject) {
        try {
            const functionList = FunctionFn.getList();
            for (const fn of functionList) {
                const currentScript: string = fn[2].toString();
                if (currentScript.includes(functionName)) {
                    const originalParameters: Array<string> = fn[5].toString().split(',');
                    return originalParameters;
                }
            }
            const message: string = 'Function name not found.';
            throw new Error(message);
        } catch (error: any) {
            const message: string = 'Failed to get original function parameters from script list.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const getParameters = FunctionFn.getOriginalParameters;

}