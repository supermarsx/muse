/**
 * Check
 */

export namespace Check {
    /**
     * Checks if current window is an iframe.
     * @returns {boolean} True if current window is an iframe, otherwise false.
     */
    export function isIframe(): boolean {
        const isIframe: boolean = (window !== window.parent);
        return isIframe;
    }

    /**
     * Checks if 'window' global variable is accessible.
     * @returns {boolean} True if window is accessible, otherwise false.
     */
    export function isWindowAccessible(): boolean {
        const objectType: string = 'object';
        const isWindowAccessible: boolean = (typeof window === objectType) ? true : false;
        return isWindowAccessible;
    }

    /**
     * Checks if 'unsafeWindow' global variable is accessible.
     * @returns {boolean} True if unsafeWindow is accessible, otherwise false.
     */
    export function isUnsafeWindowAccessible(): boolean {
        const objectType: string = 'object';
        // @ts-ignore
        const isUnsafeWindowAccessible: boolean = (typeof unsafeWindow === objectType) ? true : false;
        return isUnsafeWindowAccessible;
    }
}
