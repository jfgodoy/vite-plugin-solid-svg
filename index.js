"use strict";
const nodePath = require("path");
const { readFile } = require("fs/promises");
const { optimize, loadConfig } = require("svgo");

module.exports = () => {
  return {
    enforce: "pre",
    name: "solid-svg",
    resolveId(path, importer) {
      if (!path.endsWith(".svg") && !path.endsWith(".svg.tsx")) {
        return null;
      }

      const resolvedPath = nodePath.join(nodePath.dirname(importer), path);
      const resolvedPathAsComponent = resolvedPath.replace(/\.svg$/, ".svg.tsx");

      return resolvedPathAsComponent;
    },

    async load(path) {
      if (!path.endsWith(".svg") && !path.endsWith(".svg.tsx")) {
        return null;
      }

      const svgPath = path.replace(/\.svg\.tsx$/, ".svg");
      const content = await readFile(svgPath);
      const config = await loadConfig();
      const { data } = await optimize(content, Object.assign({}, config, { path: svgPath }));
      const svgWithProps = data.replace(/(?<=<svg.*?)(>)/i, "{...props}>");

      return `export default (props = {}) => ${svgWithProps}`;
    },
  };
};
