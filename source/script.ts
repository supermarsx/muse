/**
 * Script injection and removal utilities.
 * @module script
 */

import type { InjectOptions, InjectWaitOptions, InjectSyncOptions, RemovalResult } from './types/common.type';
import { getAllScripts } from './selector';
import { wrapError } from './utils/errors';
import { validateLocation, getInjectionTarget, injectElement, injectArray } from './utils/dom';

/**
 * Injects a script from a URL or inline text into a specific DOM location.
 *
 * @param options - Injection options.
 * @param options.url - Script URL to load externally.
 * @param options.text - Inline script content.
 * @param options.location - DOM location to inject into ('head' or 'body'). @defaultValue 'head'
 * @param options.wait - If `true`, returns a Promise that resolves on script load. @defaultValue false
 * @returns The created HTMLScriptElement, or a Promise resolving to the load Event.
 * @throws If neither `url` nor `text` is specified, or if the location is invalid.
 *
 * @example
 * ```ts
 * // Inject inline script
 * injectScript({ text: 'console.log("hello")' });
 *
 * // Inject external script and wait for load
 * await injectScript({ url: 'https://cdn.example.com/lib.js', wait: true });
 * ```
 */
export function injectScript(options: InjectWaitOptions): Promise<Event>;
export function injectScript(options?: InjectSyncOptions): HTMLScriptElement;
export function injectScript(options?: InjectOptions): Promise<Event> | HTMLScriptElement;
export function injectScript({ url = '', text = '', location = 'head', wait = false }: InjectOptions = {}):
  | Promise<Event>
  | HTMLScriptElement {
  try {
    if (!url && !text) {
      throw new Error('Neither url nor text was specified.');
    }
    validateLocation(location);

    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';

    if (url) {
      scriptElement.src = url;
    } else {
      scriptElement.textContent = text;
    }

    const target = getInjectionTarget(location);
    return injectElement(scriptElement, target, wait, url);
  } catch (error: unknown) {
    throw wrapError('Failed to inject script.', error);
  }
}

/**
 * Injects an array of scripts sequentially, each waiting for the previous to complete.
 *
 * @param items - Array of injection option objects.
 * @returns A Promise resolving to an array of script elements or load events.
 */
export async function injectScriptArray(items: InjectOptions[]): Promise<Array<HTMLScriptElement | Event>> {
  try {
    return await injectArray(items, (item) => injectScript({ ...item, wait: true }));
  } catch (error: unknown) {
    throw wrapError('Failed to inject scripts in bulk.', error);
  }
}

/**
 * Convenience function to inject an array of script URLs into the head, waiting for each.
 *
 * @param urls - Array of script URLs.
 * @returns A Promise resolving to an array of load events.
 */
export function injectScriptUrls(urls: string[]): Promise<Array<HTMLScriptElement | Event>> {
  return injectScriptArray(urls.map((url) => ({ url, location: 'head' as const, wait: true })));
}

/**
 * Removes external scripts from the DOM by partial `src` attribute match.
 *
 * @param scriptName - Partial string to match against script `src` attributes.
 * @returns `true` if at least one script was removed, `false` otherwise.
 */
export function removeExternalScript(scriptName: string): boolean {
  try {
    const scripts = Array.from(getAllScripts());
    let removed = false;
    for (const script of scripts) {
      if (script.src.includes(scriptName)) {
        script.remove();
        removed = true;
      }
    }
    return removed;
  } catch (error: unknown) {
    throw wrapError(`Failed to remove script "${scriptName}".`, error);
  }
}

/**
 * Removes multiple external scripts from the DOM by partial `src` match.
 *
 * @param scriptNames - Array of partial script names/URLs to remove.
 * @returns Array of removal results indicating which scripts were found and removed.
 */
export function removeExternalScripts(scriptNames: string[]): RemovalResult[] {
  try {
    const scripts = Array.from(getAllScripts());
    const removedSet = new Set<string>();

    for (const script of scripts) {
      if (!script.src) continue; // skip inline scripts early
      for (const name of scriptNames) {
        if (!removedSet.has(name) && script.src.includes(name)) {
          script.remove();
          removedSet.add(name);
          break;
        }
      }
    }

    return scriptNames.map((name) => ({
      name,
      removed: removedSet.has(name),
    }));
  } catch (error: unknown) {
    throw wrapError('Failed to bulk remove scripts.', error);
  }
}

/**
 * Script namespace for backward compatibility with the global `_muse.Script` API.
 */
export const Script = {
  getList: getAllScripts,
  inject: injectScript,
  add: injectScript,
  injectArray: injectScriptArray,
  addArray: injectScriptArray,
  injectArrayHeadUrlWait: injectScriptUrls,
  removeExternal: removeExternalScript,
  deleteExternal: removeExternalScript,
  removeExternalArray: removeExternalScripts,
  deleteExternalArray: removeExternalScripts,
} as const;
