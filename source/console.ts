/**
 * Console
 */

import { ResultParametersObject } from 'types/console.type';

import { About } from 'about';

export namespace Console {
    export namespace Function {
        /**
         * Console log the result of a function
         * @param isSuccess 
         * @param error 
         */
        export function result({ errorObject = undefined, useLibraryName = false }: ResultParametersObject = {}): void {
            try {
                const isSuccess: boolean = (typeof errorObject === 'undefined') ? true : false;
                const status: string = isSuccess ? '✅' : '❌';
                const prefix: string = useLibraryName ? `${About.libraryName}::` : '';
                const callerFunction: string = (new Error()).stack?.split('\n')[2].trim().split(' ')[1].toString() as string;
                const message: string = `${prefix}${callerFunction}: ${status}`;
                window.console.log(message);
                if (isSuccess === false) window.console.error(errorObject);
            } catch (error: any) {
                const message: string = 'Failed to log function result.';
                const cause: object = { cause: error };
                throw new Error(message, cause);
            }
        }
    }
}
