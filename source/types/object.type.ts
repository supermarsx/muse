/**
 * Object (type)
 */

/**
 * 
 */
export type WaitFnObject = {
    objectName: any | string,
    interval?: number,
    timeout?: number
};

/**
 * 
 */
export type WaitFn2ndLevelObject = {
    firstLevel: any | string,
    secondLevel: any | string,
    interval?: number,
    timeout?: number
};