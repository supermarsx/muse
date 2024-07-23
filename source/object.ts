/**
 * Object
 */

import { WaitFn2ndLevelObject, WaitFnObject } from 'types/object.type';

export namespace ObjectFn {
    /**
     * 
     * @param objectName 
     * @param param1 
     * @returns 
     */
    export function wait({ objectName, interval = 50, timeout = 15000 }: WaitFnObject): Promise<Object> {
        return new Promise(function (resolve): void {
            try {
                const objectChecker = setInterval(function (): void {
                    const objectToCheck: any = window[objectName];
                    if (objectToCheck instanceof Object) {
                        clearTimeout(timeoutChecker);
                        clearInterval(objectChecker);
                        resolve(objectToCheck);
                    }
                }, interval);

                const timeoutChecker = setTimeout(function (): void {
                    clearInterval(objectChecker);
                    const message: string = 'Timed out waiting for object.';
                    throw new Error(message);
                }, timeout);
            } catch (error: any) {
                const message: string = 'Failed to wait for object.';
                const cause: object = { cause: error };
                throw new Error(message, cause);
            }
        });
    }

    /**
     * Wait for a 2nd level object to exist.
     * @param {string} firstLevel First level name
     * @param {string} secondLevel Second level object name
     * @param {string} callback Callback function
     * @param {number} interval Checking interval
     * @param {number} timeout Timeout in ms
     * @returns {Promise<Object | Error>} Returns a promise that resolves to an object if successful, otherwise returns an error. 
     */
    export function waitFor2ndLevel({ firstLevel, secondLevel, interval = 50, timeout = 15000 }: WaitFn2ndLevelObject): Promise<Object> {
        return new Promise(function (resolve): void {
            try {
                const objectChecker = setInterval(function (): void {
                    if (typeof window[firstLevel] !== undefined) {
                        const objectToCheck: any = window[firstLevel][secondLevel];
                        if (objectToCheck instanceof Object) {
                            clearTimeout(timeoutChecker);
                            clearInterval(objectChecker);
                            resolve(objectToCheck);
                        }
                    }
                }, interval);

                const timeoutChecker = setTimeout(function (): void {
                    clearInterval(objectChecker);
                    const message: string = 'Timed out waiting for second level object.';
                    throw new Error(message);
                }, timeout);
            } catch (error: any) {
                const message: string = 'Failed to wait for second level object.';
                const cause: object = { cause: error };
                throw new Error(message, cause);
            }
        });
    }
    export const wait2nd = ObjectFn.waitFor2ndLevel;
}