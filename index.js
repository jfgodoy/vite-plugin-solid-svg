"use strict";
const nodePath = require("path");
const fg = require("fast-glob");
const { readFile } = require("fs/promises");
const { optimize, loadConfig } = require("svgo");

async function compileSvg(source) {
  const svgWithProps = source.replace(/([{}])/g, "{'$1'}").replace(/(?<=<svg.*?)(>)/i, "{...props}>");
  return `export default (props = {}) => ${svgWithProps}`;
}


async function optimizeSvg(content, path, svgoConfig) {
  const config = svgoConfig || await loadConfig();
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
  const { defaultExport = "component", svgo = { enabled: true } } = options;

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

  let config;

  return {
    enforce: "pre",
    name: "solid-svg",

    configResolved(cfg) {
      config = cfg;
    },

    resolveId(id, importer) {
      const [path, qs] = id.split("?");

      if (path.endsWith(".svg") && path.indexOf("[name]") >= 0) {
        let resolvedPath = nodePath.relative( nodePath.resolve("."), nodePath.resolve(nodePath.dirname(importer), path));
        resolvedPath = `${resolvedPath}?${qs}`;
        return resolvedPath;
      }

      return null;
    },

    async load(id) {
      const [path, qs] = id.split("?");

      if (!path.endsWith("svg")) {
        return null;
      }

      const mode = isComponentMode(qs) ? "component" : "url";

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
        let code = await readFile(path, {encoding: "utf8"});
        if (svgo.enabled) {
          code = await optimizeSvg(code, path, svgo.svgoConfig);
        }
        const result = await compileSvg(code);

        return result;
      }
    },

    transform(source, id, transformOptions) {
      const [path, qs] = id.split("?");
      if (path.endsWith("svg") && isComponentMode(qs)) {
        const solidPlugin = config.plugins.find(p => p.name == "solid");
        if (!solidPlugin) {
          throw new Error("solid plugin not found");
        }
        return solidPlugin.transform(source, `${path}.tsx`, transformOptions);
      }
    },

  };
};
