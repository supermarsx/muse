/**
 * Special UI components (toast notifications, navigation buttons).
 * @module special
 */

/** @jsx renderer.create */

import { buttonGoToTopAndBottomStyle } from './styles/special.styles';
import type { ToastInitOptions, ToastMessageOptions } from './types/special.type';

import { injectTextHead } from './style';
import toast, { Toaster } from 'solid-toast';
import { CommonDOMRenderer } from 'render-jsx/dom';
import { wrapError } from './utils/errors';

/** @internal Guard against double-initialization of the toast container. */
let toastInitialized = false;

/**
 * Initializes the toast notification system by rendering the Toaster component.
 *
 * @param options - Toast init options.
 * @param options.position - Position of the toast container. @defaultValue 'bottom-left'
 * @param options.gutter - Gap between toasts in pixels. @defaultValue 8
 */
export function initToast({ position = 'bottom-left', gutter = 8 }: ToastInitOptions): void {
  if (toastInitialized) return;
  if (!document.body) {
    throw new Error('Cannot initialize toast: document.body is not available.');
  }
  toastInitialized = true;
  const renderer = new CommonDOMRenderer();
  return renderer
    .render(
      <div>
        <Toaster position={position} gutter={gutter} />
      </div>,
    )
    .on(document.body);
}

/**
 * Dismisses a specific toast by its ID.
 *
 * @param toastId - The ID of the toast to dismiss.
 */
export function dismissToast(toastId: string): void {
  return toast.dismiss(toastId);
}

/**
 * Displays a toast notification.
 *
 * @param options - Toast message options.
 * @param options.message - Text to display.
 * @param options.type - Toast type ('default', 'loading', 'success', 'error', 'promise').
 * @param options.toastOptions - Additional solid-toast options.
 * @param options.promise - Promise to track (required when type is 'promise').
 * @param options.promiseMessages - Messages for each promise state.
 * @returns The toast ID string, or a Promise for promise-type toasts.
 */
export function showToast({
  message: msg = '',
  toastOptions,
  type = 'default',
  promise: trackedPromise,
  promiseMessages = {
    loading: '',
    success: '',
    error: '',
  },
}: ToastMessageOptions): string | Promise<unknown> {
  switch (type) {
    case 'loading':
      return toast.loading(msg, toastOptions);
    case 'success':
      return toast.success(msg, toastOptions);
    case 'error':
      return toast.error(msg, toastOptions);
    case 'promise':
      if (!trackedPromise) {
        throw new Error('A promise must be provided when type is "promise".');
      }
      return toast.promise(trackedPromise, promiseMessages, toastOptions);
    default:
      return toast(msg, toastOptions);
  }
}

/** @internal Guard against double-initialization of the go-to buttons. */
let buttonsInitialized = false;

/**
 * Adds "go to top" and "go to bottom" navigation buttons to the page.
 *
 * @returns The injected container div element.
 */
export function addGoToTopAndBottomButtons(): HTMLDivElement {
  try {
    if (buttonsInitialized) {
      throw new Error('Go-to-top and go-to-bottom buttons are already initialized.');
    }
    if (!document.body) {
      throw new Error('Cannot add buttons: document.body is not available.');
    }
    buttonsInitialized = true;

    const div = document.createElement('div');

    const topBtn = document.createElement('button');
    topBtn.className = 'fast-shortcut first-button';
    topBtn.title = 'Go to top';
    topBtn.textContent = '\u2191'; // ↑
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const bottomBtn = document.createElement('button');
    bottomBtn.className = 'fast-shortcut second-button';
    bottomBtn.title = 'Go to bottom';
    bottomBtn.textContent = '\u2193'; // ↓
    bottomBtn.addEventListener('click', () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    div.appendChild(topBtn);
    div.appendChild(bottomBtn);

    injectTextHead({ text: buttonGoToTopAndBottomStyle });
    return document.body.appendChild(div);
  } catch (error: unknown) {
    throw wrapError('Failed to add go-to-top and go-to-bottom buttons.', error);
  }
}

/**
 * Special namespace for backward compatibility with the global `_muse.Special` API.
 */
export const Special = {
  Element: {
    Toast: {
      init: initToast,
      dismiss: dismissToast,
      message: showToast,
    },
    addButtonGoToTopAndBottom: addGoToTopAndBottomButtons,
    addTopBottom: addGoToTopAndBottomButtons,
  },
} as const;
