/**
 * Selector (type)
 */

/**
 * 
 */
export type SelectorParametersObject = {
    selector: string,
    wait?: boolean
};

/**
 * 
 */
export type SelectorWaitParametersObject = {
    selector: string,
    timeout?: number
};

/**
 * 
 */
export type SelectorGetListParameters = {
    selector: string
};