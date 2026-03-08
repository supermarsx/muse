/**
 * Library metadata and version information.
 * @module about
 */

/** Current library version. */
export const version = '2.0.0';

/** Library display name. */
export const libraryName = '_muse';

/** Library description. */
export const description = '_muse, master userscript extended';

/**
 * About namespace for backward compatibility with the global `_muse.About` API.
 */
export const About = {
  version,
  libraryName,
  description,
} as const;
