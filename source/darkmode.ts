/**
 * Darkmode
 */

import { ElementMethodObject, InvertColorsAndHueRotateObject, InvertColorsObject } from 'types/darkmode.type';

import { Style } from 'style';
import { CssStringObject, GenericMethodObject } from 'types/style.type';

export namespace Darkmode {
    /**
     * Get a prepared CSS string to inject in this context.
     * @param {Object} [o] Invert colors object, contains style parameters.
     * @param {number} [o.invert=1] Inversion percentage (from 0 to 1).
     * @param {string} [o.tags] Tags or selectors to apply inversion to.
     * @param {string} [o.additionalFilters] Additional filters to add besides invert.
     * @returns Returns a prepared CSS string.
     */
    function getCssString({ invert = 1, tags = 'html, img, video, iframe', additionalFilters = '' }: InvertColorsObject = {}): string {
        const cssString: string = `
            body { background: white; }
            ${tags} { filter: invert(${invert}) ${additionalFilters}; }
        `;
        return cssString;
    }

    /**
     * Inverts colors of specific tags or selectors to achieve darkmode.
     * @param {Object} [o] Invert colors object, contains style parameters.
     * @param {number} [o.invert=1] Inversion percentage (from 0 to 1).
     * @param {string} [o.tags='html, img, video, iframe'] Tags or selectors to apply inversion to.
     * @param {string} [o.additionalfilters=''] Additional filters to add besides invert.
     * @returns {HTMLStyleElement} Returns an html style element if successful, otherwise an error.
     */
    export function invertColors({ invert = 1, tags = 'html, img, video, iframe', additionalFilters = '' }: InvertColorsObject = {}): HTMLStyleElement {
        try {
            const css: string = getCssString({ invert, tags, additionalFilters });
            const styleElement: HTMLStyleElement = Style.inject({ text: css }) as HTMLStyleElement;
            return styleElement;
        } catch (error: any) {
            const message: string = 'Failed to invert colors.';
            const cause: Object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const invert = Darkmode.invertColors;

    /**
     * Inverts and hue rotates colors of specific tags or selectors to achieve darkmode.
     * @param {Object} [o] Invert colors and hue rotate object, contains style parameters.
     * @param {number} [o.invert=1] Inversion percentage (from 0 to 1).
     * @param {number} [o.rotation=180] Hue rotation in degrees (from 0 to 360).
     * @param {string} [o.tags='html, img, video, iframe'] Tags or selectors to apply inversion to.
     * @param {string} [o.additionalfilters=''] Additional filters to add besides invert.
     * @returns {HTMLStyleElement | Error} Returns an html style element if successful, otherwise an error.
     */
    export function invertColorsAndHueRotate({ invert = 1, rotation = 180, tags = 'html, img, video, iframe', additionalFilters = '' }: InvertColorsAndHueRotateObject = {}): HTMLStyleElement {
        try {
            additionalFilters = `hue-rotate(${rotation}deg) ${additionalFilters}`;
            const styleElement: HTMLStyleElement = Darkmode.invertColors({ invert, tags, additionalFilters }) as HTMLStyleElement;
            return styleElement;
        } catch (error: any) {
            const message: string = 'Failed to invert colors and hue rotate.';
            const cause: object = { cause: error };
            throw new Error(message, cause);
        }
    }
    export const invertRotate = Darkmode.invertColorsAndHueRotate;

    /**
     * Darkmode presets
     */
    export namespace Preset {
        /**
         * Invert colors 90% and hue rotate 180deg.
         * @returns {HTMLStyleElement} Returns an html style element if successful, otherwise an error.
         */
        export function invertAndHueRotate90(): HTMLStyleElement {
            const invert: number = 0.9;
            return Darkmode.invertColorsAndHueRotate({ invert });
        }

        /**
         * Invert colors 85% and hue rotate 180deg.
         * @returns {HTMLStyleElement} Returns an html style element if successful, otherwise an error.
         */
        export function invertAndHueRotate85(): HTMLStyleElement {
            const invert: number = 0.85;
            return Darkmode.invertColorsAndHueRotate({ invert });
        }

        /**
         * Invert colors 85%, hue rotate 180deg, alternative tags and contrast 95%.
         * @returns {HTMLStyleElement} Returns an html style element if successful, otherwise an error.
         */
        export function invertAndHueRotateAltTagsAndContrast85(): HTMLStyleElement {
            const invert: number = 0.85;
            const tags: string = 'html, img, video';
            const additionalFilters: string = 'contrast(0.95)';
            return Darkmode.invertColorsAndHueRotate({ invert, tags, additionalFilters });
        }
    }

    /**
     * Element
     */
    export namespace Element {
        /**
         * Get a prepared CSS string for element darkmode methods.
         * @param {string} selector Element selector.
         * @returns {string} Prepared CSS string.
         */
        function getCssString({ selector = '', method = 1 }: CssStringObject): string {
            let cssString: string;
            switch (method) {
                case 1: // Method 1
                    cssString = `
                        ${selector}, ${selector} a, ${selector} span { color: #000000 !important; }
                        ${selector} { background: #ffffff !important; }
                        ${selector} { filter: invert(1) hue-rotate(180deg) !important; }
                    `;
                    break;
                case 2: // Method 2
                    cssString = `
                        ${selector}, ${selector} a, ${selector} span { color: #000000 !important; }
                        ${selector} { background: #ffffff !important; }
                    `;
                    break;
                case 3: // Method 3
                    cssString = `
                        ${selector} img { filter: invert(1) hue-rotate(180deg) !important; }
                    `;
                    break;
                default:
                    cssString = '';
                    break;
            }
            return cssString;
        }

        /**
         * Apply darkmode to element or array of elements using a preferred method.
         * @param {string | Array<string>} selectorOrArrayOfSelectors Element selector or array of element selectors.
         * @param {number} method Darkmode method number.
         * @returns {Array<HTMLStyleElement > | HTMLStyleElement } Array of style elements or error, single element or error.
         */
        function genericMethod({ selectorOrArrayOfSelectors, method = 1 }: GenericMethodObject): Array<HTMLStyleElement> | HTMLStyleElement {
            let text: string;
            if (Array.isArray(selectorOrArrayOfSelectors)) {
                let arrayOfStyleElements: Array<HTMLStyleElement> = [];
                for (const selector of selectorOrArrayOfSelectors) {
                    text = getCssString({ selector, method });
                    const styleElement: HTMLStyleElement = Style.addTextHead({ text });
                    arrayOfStyleElements.push(styleElement);
                }
                return arrayOfStyleElements;
            } else {
                const selector: string = selectorOrArrayOfSelectors;
                text = getCssString({ selector, method });
                const styleElement: HTMLStyleElement = Style.addTextHead({ text });
                return styleElement;
            }
        }

        /**
         * Apply darkmode to element or array of elements using method 1.
         * @param {string | Array<string>} selectorOrArrayOfSelectors Element selector or array of element selectors.
         * @returns {Array<HTMLStyleElement > | HTMLStyleElement } Array of style elements or error, single element or error.
         */
        export function method1({ selectorOrArrayOfSelectors }: ElementMethodObject): Array<HTMLStyleElement> | HTMLStyleElement {
            const method: number = 1;
            return genericMethod({ selectorOrArrayOfSelectors, method });
        }

        /**
         * Apply darkmode to element or array of elements using method 2.
         * @param {string | Array<string>} selectorOrArrayOfSelectors Element selector or array of element selectors.
         * @returns {Array<HTMLStyleElement> | HTMLStyleElement } Array of style elements or error, single element or error.
         */
        export function method2({ selectorOrArrayOfSelectors }: ElementMethodObject): Array<HTMLStyleElement> | HTMLStyleElement {
            const method: number = 2;
            return genericMethod({ selectorOrArrayOfSelectors, method });
        }

        /**
         * Apply darkmode to element or array of elements using method 3.
         * @param {string | Array<string>} selectorOrArrayOfSelectors Element selector or array of element selectors.
         * @returns {Array<HTMLStyleElement > | HTMLStyleElement} Array of style elements or error, single element or error.
         */
        export function method3(selectorOrArrayOfSelectors: string | Array<string>): Array<HTMLStyleElement> | HTMLStyleElement {
            const method: number = 3;
            return genericMethod({ selectorOrArrayOfSelectors, method });
        }
    }
}