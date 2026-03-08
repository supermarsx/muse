/**
 * Special UI component types.
 * @module types/special
 */

import type { Renderable, ToastOptions, ToastPosition, ValueOrFunction } from 'solid-toast';

/**
 * Options for initializing the toast notification system.
 */
export interface ToastInitOptions {
  /** Position of the toast container. @defaultValue 'bottom-left' */
  position: ToastPosition;
  /** Gap between toasts in pixels. @defaultValue 8 */
  gutter: number;
}

/** Supported toast message types. */
export type ToastType = 'default' | 'loading' | 'success' | 'error' | 'promise';

/**
 * Options for displaying a toast message.
 */
export interface ToastMessageOptions {
  /** The text message to display. */
  message?: string;
  /** solid-toast options for customization. */
  toastOptions?: ToastOptions;
  /** The type of toast to show. @defaultValue 'default' */
  type?: ToastType;
  /** A promise to track (required when type is 'promise'). */
  promise?: Promise<unknown>;
  /** Messages to display for each promise state. */
  promiseMessages?: {
    loading: Renderable;
    success: ValueOrFunction<Renderable, unknown>;
    error: ValueOrFunction<Renderable, unknown>;
  };
}
