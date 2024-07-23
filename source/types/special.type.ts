/**
 * Special (type)
 */

import { Renderable, ToastOptions, ToastPosition, ValueOrFunction } from 'solid-toast';

/**
 * 
 */
export type ToastInitObject = {
    position: ToastPosition,
    gutter: number
};

/**
 * 
 */
export type ToastMessageObject = {
    message?: string,
    toastOptions?: ToastOptions,
    type?: string,
    promise?: any,
    promiseMessages: {
        loading: Renderable,
        success: ValueOrFunction<Renderable, any>,
        error: ValueOrFunction<Renderable, any>
    }
};