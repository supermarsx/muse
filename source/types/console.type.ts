/**
 * Console (Type)
 */

/**
 * Console function result parameters object
 * @typedef {Object} ResultParametersObject
 * @property {Error | Object} errorObject Error Object or an empty object
 * @property {boolean} useLibraryName Use library name as message prefix
 */
export type ResultParametersObject = {
    errorObject?: Error | Object | undefined,
    useLibraryName?: boolean
};