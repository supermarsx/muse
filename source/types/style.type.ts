/**
 * Style (type)
 */

/**
 * 
 */
export type CssStringObject = {
    selector: string,
    css?: string,
    method?: string | number,
    inline?: boolean
};

/**
 * 
 */
export type InlineObject = {
    selector: string,
    css: string,
    wait?: boolean
};

/**
 * 
 */
export type InlineReturn =
    Promise<Element> |
    Element;

/**
 * 
 */
export type SelectorOrArrayOfSelectors =
    string | Array<string>;

/**
 * 
 */
export type GenericMethodObject = {
    selectorOrArrayOfSelectors: SelectorOrArrayOfSelectors,
    method?: string | number,
    inline?: boolean,
    wait?: boolean
};


/**
 * 
 */
export type GenericMethodReturn =
    Element |
    Array<Element | Event | HTMLStyleElement> |
    Promise<Element | Event | HTMLStyleElement |
        Array<Element | Event | HTMLStyleElement>
    >;

/**
 * 
 */
export type StyleInjectTextHeadObject = {
    text?: string;
};

/**
 * 
 */
export type StyleRemoveExternalObject = {
    scriptName: string
};