/**
 * About
 */

import packageJson from '../package.json';

export namespace About {
    export const version: string = packageJson.version;
    export const libraryName: string = packageJson.fullName;
    export const description: string = packageJson.description;
}