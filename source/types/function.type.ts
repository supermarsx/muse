/**
 * Function (type)
 */

/**
 * 
 */
export type OriginalParametersObject = {
    functionName?: string,
    scriptList: Array<RegExpExecArray>
};

/**
 * 
 */
export type WaitFnObject = {
    functionName: any | string,
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