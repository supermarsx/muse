/**
 * Special
 */

/** @jsx renderer.create */

import { buttonGoToTopAndBottomHtml } from 'html/special.html';
import { buttonGoToTopAndBottomStyle } from 'styles/special.styles';
import { ToastInitObject, ToastMessageObject } from 'types/special.type';

import { Style } from 'style';
import toast, { Toaster } from 'solid-toast';
import { CommonDOMRenderer } from 'render-jsx/dom';

export namespace Special {

    /**
     * Special elements
     */
    export namespace Element {

        /**
         * 
         */
        export namespace Button {

        }

        /**
         * 
         */
        export namespace Toast {

            /**
             * 
             */
            export function init({ position = 'bottom-left', gutter = 8 }: ToastInitObject): void {
                const renderer = new CommonDOMRenderer();
                return renderer.render(<div><Toaster position={position} gutter={gutter} /></div>).on(document.body);
            }

            /**
             * 
             * @param toastId 
             * @returns 
             */
            export function dismiss(toastId: any): void {
                return toast.dismiss(toastId);
            }

            /**
             * 
             * @param param0 
             */
            export function message({
                message = '',
                toastOptions,
                type = 'default',
                promise,
                promiseMessages = {
                    loading: '',
                    success: '',
                    error: ''
                }
            }: ToastMessageObject): string | Promise<any> {
                switch (type) {
                    case 'loading':
                        return toast.loading(message, toastOptions);
                    case 'success':
                        return toast.success(message, toastOptions);
                    case 'error':
                        return toast.error(message, toastOptions);
                    case 'promise':
                        return toast.promise(promise, promiseMessages, toastOptions);
                    default:
                        return toast(message, toastOptions);
                }
            }
        }

        /**
         * Add a button to right bottom corner to got to the top and bottom of the page.
         * @returns Returns a div element of the injected button, otherwise an error.
         */
        export function addButtonGoToTopAndBottom(): HTMLDivElement {
            try {
                const div: HTMLDivElement = document.createElement('div');
                const text: string = buttonGoToTopAndBottomStyle;
                div.innerHTML = buttonGoToTopAndBottomHtml;
                Style.injectTextHead({ text });
                const injectedDiv: HTMLDivElement = document.body.appendChild(div);
                return injectedDiv;
            } catch (error: any) {
                const message: string = `Failed to add go to top and go to bottom buttons.`;
                const cause: Object = { cause: error };
                throw new Error(message, cause);
            }
        }
        export const addTopBottom: Function = Element.addButtonGoToTopAndBottom;
    }
}