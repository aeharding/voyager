/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*?inline" {
  const src: string;
  export default src;
}
