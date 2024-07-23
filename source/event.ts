/**
 * Event
 */

export namespace Event {
    /**
     * Wait for the DOM content to be loaded before executing the callback.
     * @callback callback Callback function to execute once the DOM content is loaded.
     */
    export function waitDomLoaded(callback: VoidFunction): void {
        const eventName: string = 'DOMContentLoaded';
        document.addEventListener(eventName, callback);
    }
    export const domLoaded = Event.waitDomLoaded;

    /**
     * Wait for the DOM content to be loaded using a promise. Alternative method.
     * @returns {Promise<void>} Returns a promise that resolves to nothing.
     */
    export function waitDomLoadedAlt(): Promise<void> {
        return new Promise(function (resolve): void {
            const eventName: string = 'DOMContentLoaded';
            document.addEventListener(eventName, function (): void { resolve() });
        });
    }
    export const waitDomLoadedPromise = Event.waitDomLoadedAlt;
    export const domLoadedPromise = Event.waitDomLoadedAlt;
}