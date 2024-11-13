/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-svgr/client" />

/**
 * Version from package.json
 */
declare const APP_VERSION: string;

/**
 * Only available for main builds (not releases)
 *
 * @example 123
 */
declare const APP_BUILD: number | undefined;

/**
 * Git sha if main build, otherwise tag name
 */
declare const APP_GIT_REF: string;

declare const BUILD_FOSS_ONLY: boolean;
