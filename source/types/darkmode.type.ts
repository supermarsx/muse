/**
 * Darkmode (type)
 */


/**
 * 
 */
export type InvertColorsObject = {
    invert?: number,
    tags?: string,
    additionalFilters?: string
};

/**
 * 
 */
export type InvertColorsAndHueRotateObject = InvertColorsObject & {
    rotation?: number
}

/**
 * 
 */
export type ElementMethodObject = {
    selectorOrArrayOfSelectors: string | Array<string>
}