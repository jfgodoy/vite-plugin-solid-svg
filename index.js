"use strict";
const nodePath = require("path");
const fg = require("fast-glob");
const { readFile } = require("fs/promises");
const { optimize, loadConfig } = require("svgo");

async function compileSvg(source) {
  const svgWithProps = source.replace(/(?<=<svg.*?)(>)/i, "{...props}>");
  return `export default (props = {}) => ${svgWithProps}`;
}


async function optimizeSvg(content, path) {
  const config = await loadConfig();
  const { data } = await optimize(content, Object.assign({}, config, { path }));
  return data;
}

module.exports = (options = {}) => {
  const { defaultExport = "component" } = options;
  const svgRegex = /(?:\[name\])?\.svg(?:.tsx)?(?:\?(component|url))?$/;

  return {
    enforce: "pre",
    name: "solid-svg",
    resolveId(id, importer) {
      const result = id.match(svgRegex);

      if (!result) {
        return null;
      }

      const type = result[1];
      const resolvedPath = nodePath.relative( nodePath.resolve("."), nodePath.resolve(nodePath.dirname(importer), id));

      if (id.indexOf("[name]") >= 0) {
        return resolvedPath;
      }

      if ((defaultExport === "component" && typeof type === "undefined") || type === "component") {
        const resolvedPathAsComponent =  resolvedPath.replace(/\.svg(\.tsx)?/, ".svg.tsx");
        return resolvedPathAsComponent;
      }

      // if mode is url, we use the default behavior
      return null;
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
          source += `"${name}": () => import("./${name}.svg${qs}"),\n`;
        });
        source += "}";

        return source;
      }

      if ((defaultExport === "component" && typeof type === "undefined") || type === "component") {
        const idWithoutQuery = id.replace(/\.svg.*/, ".svg");
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
