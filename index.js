"use strict";
const nodePath = require("path");
const fg = require("fast-glob");
const { readFile } = require("fs/promises");
const { optimize, loadConfig } = require("svgo");

async function compileSvg(source) {
  return `
  import { template, spread } from "solid-js/web";

  const _tmpl$ = template(\`${source}\`, 0);
  export default (props = {}) => {
    const _el$ = _tmpl$.cloneNode(true);
    spread(_el$, props, true);
    return _el$;
  };
  `;
}


async function optimizeSvg(content, path) {
  const config = await loadConfig();
  const { data } = await optimize(content, Object.assign({}, config, { path }));
  return data;
}

module.exports = (options = {}) => {
  const { defaultExport = "component" } = options;
  const svgRegex = /(?:\[name\])?\.svg(?:\?(component|url)(?:&inilne)?)?$/;

  return {
    enforce: "pre",
    name: "solid-svg",
    resolveId(id, importer) {
      const result = id.match(svgRegex);

      if (!result) {
        return null;
      }
      if (id.indexOf("[name]") >= 0) {
        /* when build is from `npm run dev`, the id is an absolute path, with root the project dir, and the importer
        * is the absolute path to the index.html, with root the system root.
        * When build is from `npm run build, the id the same declared in code, and the importer is the absolute path
        * to the importer.
        * If you know a better way to get the absolute path to a "virtual" file, let me know
        */
        const importerDir = nodePath.dirname(importer);
        const absPath = nodePath.isAbsolute(id) ? nodePath.join(importerDir, id) : nodePath.resolve(importerDir, id);
        return absPath;
      }
    },
    async load(id) {
      const result = id.match(svgRegex);

      if (!result) {
        return null;
      }

      const type = result[1];

      if (id.indexOf("[name]") >= 0) {
        const pattern = id.replace(svgRegex, "*.svg");
        const files = fg.sync(pattern);
        const regex = new RegExp(id.replace(svgRegex, "(.*)\\.svg"));
        let source = "export default {\n";
        files.forEach(file => {
          const matched = regex.exec(file);
          const name = matched[1];
          const qs = type ? `?${type}` : "";
          source += `"${name}": () => import("${file}${qs}"),\n`;
        });
        source += "}";
        return source;
      }



      if ((defaultExport === "component" && typeof type === "undefined") || type === "component") {
        const idWithoutQuery = id.replace(".svg?component", ".svg");
        const code = await readFile(idWithoutQuery);
        const svg = await optimizeSvg(code, idWithoutQuery);
        const result = await compileSvg(svg);

        return result;
      }
    },
    async transform(source, id) {
      const result = id.match(svgRegex);

      if (!result) {
        return null;
      }

      const type = result[1];

      if ((defaultExport === "url" && typeof type === "undefined") || type === "url") {
        return source;
      }
    }
  };
};
