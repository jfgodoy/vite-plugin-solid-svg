import type { Plugin } from "vite";

export type Comp = "component" | "comp";

export type Export = Comp | "url";

export interface Options {
  defaultExport?: Export;
}

declare function svg(options?: Options): Plugin;

export default svg;
