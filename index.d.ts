declare module 'vite-plugin-solid-svg' {
  import type { Plugin } from 'vite';
  interface Options {
    defaultExport?: "component" | "url"
  }

  function svg(options?: Options): Plugin
  export default svg
}

declare module '*.svg';
declare module '*.svg?component';
declare module '*.svg?url';
