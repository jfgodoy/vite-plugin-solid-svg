import { readFile } from 'node:fs/promises';
import { loadConfig, optimize } from 'svgo';

async function compileSvg(source, compilerOptions) {
  let svgWithProps = source.replace(/([{}])/g, "{'$1'}").replace(/(?<=<svg.*?)(>)/i, '{...props}>');
  if (compilerOptions.allow_props_children) {
    svgWithProps = svgWithProps.replace(/\{'\{'\}\s*(props\.children)\s*\{'\}'\}/g, '{$1}');
  }
  return `export default (props = {}) => ${svgWithProps}`;
}
async function optimizeSvg(content, path, svgoConfig) {
  const config = svgoConfig || (await loadConfig());
  if (config && config.datauri) {
    throw new Error('datauri option for svgo is not allowed when you use vite-plugin-solid-svg. Remove it or use a falsy value.');
  }
  const result = optimize(content, Object.assign({}, config, {
    path
  }));
  if ('data' in result) return result.data;else if (result.modernError) throw result.modernError;
}

/* how this plugin works:
 * The plugin need to transform an svg file to a solid component. We let the solid compilation to vite-plugin-solid.
 * To achieve this, the resolveId hook must resolve to some tsx, without querystring.
 * In the load hook, we read the svg and generate the source for the solid component.
 */

function index (options = {}) {
  const {
    defaultAsComponent = true,
    svgo = {
      enabled: true
    },
    compilerOptions = {
      allow_props_children: false
    }
  } = options;
  const shouldProcess = qs => {
    const params = new URLSearchParams(qs);
    return defaultAsComponent && !Array.from(params.entries()).length || params.has('component');
  };
  let config;
  return {
    enforce: 'pre',
    name: 'solid-svg',
    configResolved(cfg) {
      config = cfg;
    },
    async load(id) {
      const [path, qs] = id.split('?');
      if (!path.endsWith('svg')) {
        return null;
      }
      if (shouldProcess(qs)) {
        let code = await readFile(path, {
          encoding: 'utf8'
        });
        if (svgo.enabled) {
          let optimized = await optimizeSvg(code, path, svgo.svgoConfig);
          code = optimized || code;
        }
        const result = await compileSvg(code, compilerOptions);
        return result;
      }
    },
    transform(source, id, transformOptions) {
      const [path, qs] = id.split('?');
      if (path.endsWith('svg') && shouldProcess(qs)) {
        const solidPlugin = config.plugins.find(p => p.name == 'solid');
        if (!solidPlugin) {
          throw new Error('solid plugin not found');
        }
        return solidPlugin.transform.bind(this)(source, `${path}.tsx`, transformOptions);
      }
    }
  };
}

export { index as default };
