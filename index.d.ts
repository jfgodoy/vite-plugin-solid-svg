declare module 'vite-plugin-solid-svg' {
  import type { Plugin } from 'vite';
  interface Options {
    defaultExport?: "component" | "url"
  }

  function svg(options?: Options): Plugin
  export default svg
}

declare module '*.svg?component' {
  import type { Component, ComponentProps } from 'solid-js';
  const c: Component<ComponentProps<'svg'>>;
  export default c;
}

declare module '*[name].svg?component' {
  import type { Component, ComponentProps } from 'solid-js';
  interface PromiseComponentDict {
    [index: string]: () => Promise<{default: Component<ComponentProps<'svg'>>}>
  }
  const dict: PromiseComponentDict;
  export default dict;
}

declare module '*[name].svg?url' {
  interface PromiseStringDict {
    [index: string]: () => Promise<{default: string}>
  }
  const dict: PromiseStringDict;
  export default dict;
}

declare module '*.svg?url';
