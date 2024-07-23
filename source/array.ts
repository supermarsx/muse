/**
 * Array
 */

import { ArrayContainsParameters } from 'types/array.type';

export namespace ArrayFn {
    /**
     * 
     * @param param0 
     */
    export function containsAny({ sourceString, arrayOfSubStrings }: ArrayContainsParameters) {
        for (const subString of arrayOfSubStrings) {
            if (sourceString.indexOf(subString) != -1) return true
        }
        return false;
    }
}