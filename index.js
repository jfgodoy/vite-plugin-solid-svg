"use strict";
const nodePath = require("path");
const fg = require("fast-glob");
const { readFile } = require("fs/promises");
const { optimize, loadConfig } = require("svgo");

async function compileSvg(source) {
  const svgWithProps = source.replace(/([{}])/g, "{'$1'}").replace(/(?<=<svg.*?)(>)/i, "{...props}>");
  return `export default (props = {}) => ${svgWithProps}`;
}

async function optimizeSvg(content, path) {
  const config = await loadConfig();
  if (config && config.datauri) {
    throw new Error("datauri option for svgo is not allowed when you use vite-plugin-solid-svg. Remove it or use a falsy value.");
  }
  const { data } = await optimize(content, Object.assign({}, config, { path }));
  return data;
}

/* how this plugin works:
 * The plugin need to transform an svg file to a solid component. We let the solid compilation to vite-plugin-solid.
 * To achieve this, the resolveId hook must resolve to some tsx, without querystring.
 * In the load hook, we read the svg and generate the source for the solid component.
 */

module.exports = (options = {}) => {
  const { defaultExport = "component" } = options;

  const isComponentMode = (qs) => {
    const params = new URLSearchParams(qs);
    if (params.has("component")) {
      return true;
    }
    if (params.has("url")) {
      return false;
    }
    return defaultExport == "component";
  };

  return {
    enforce: "pre",
    name: "solid-svg",
    resolveId(id, importer) {
      const [path, qs] = id.split("?");
      if (!path.endsWith(".svg")) {
        return null;
      }

      if (isComponentMode(qs) || id.indexOf("[name]") >= 0) {
        const mode = isComponentMode(qs) ? "as_component" : "as_url";
        let resolvedPath = nodePath.relative( nodePath.resolve("."), nodePath.resolve(nodePath.dirname(importer), path));
        resolvedPath = resolvedPath.replace(/\.svg$/, `.${mode}.svg.tsx`);
        return resolvedPath;
      }

      // if mode is url, we use the default behavior
      return null;
    },

    async load(id) {
      let path = id;
      let mode;

      if (path.endsWith(".as_component.svg.tsx")) {
        path = path.replace(".as_component.svg.tsx", ".svg");
        mode = "component";
      } else if (path.endsWith(".as_url.svg.tsx")) {
        path = path.replace(".as_url.svg.tsx", ".svg");
        mode = "url";
      } else {
        return null;
      }

      if (path.indexOf("[name]") >= 0) {
        const pattern = path.replace("[name].svg", "*.svg");
        const files = fg.sync(pattern);
        const regex = new RegExp(path.replace("[name].svg", "(.*)\\.svg"));
        let source = "export default {\n";
        files.forEach(file => {
          const matched = regex.exec(file);
          const name = matched[1];
          source += `"${name}": () => import("./${name}.svg?${mode}"),\n`;
        });
        source += "}";

        return source;
      }

      if (mode === "component") {
        const code = await readFile(path);
        const svg = await optimizeSvg(code, path);
        const result = await compileSvg(svg);

        return result;
      }
    },

  };
};
