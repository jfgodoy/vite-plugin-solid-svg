import { readFile } from 'node:fs/promises'
import { optimize, loadConfig, OptimizeOptions } from 'svgo'
import type { Plugin, ResolvedConfig } from 'vite'

type CompilerOptions = {
  allow_props_children?: boolean
}
export type SolidSVGPluginOptions = {
  /**
   * If true, will export as JSX component if `as` isn't specified.
   *
   * Otherwise will export as JSX component if '?as=component-solid'
   */
  defaultAsComponent?: boolean
  svgo?: {
    enabled?: boolean
    svgoConfig?: OptimizeOptions
  }
  compilerOptions?: CompilerOptions
}

async function compileSvg(source: string, compilerOptions: CompilerOptions) {
  let svgWithProps = source
    .replace(/([{}])/g, "{'$1'}")
    .replace(/<!--\s*([\s\S]*?)\s*-->/g, '{/* $1 */}')
    .replace(/(<svg[^>]*)>/i, '$1{...props}>')
  if (compilerOptions.allow_props_children) {
    svgWithProps = svgWithProps.replace(/\{'\{'\}\s*(props\.children)\s*\{'\}'\}/g, '{$1}')
  }
  return `export default (props = {}) => ${svgWithProps}`
}

async function optimizeSvg(content: string | Buffer, path: string, svgoConfig?: OptimizeOptions) {
  const config = svgoConfig || (await loadConfig())
  if (config && config.datauri) {
    throw new Error(
      'datauri option for svgo is not allowed when you use vite-plugin-solid-svg. Remove it or use a falsy value.'
    )
  }
  const result = optimize(content, Object.assign({}, config, { path }))
  if ('data' in result) return result.data
  else if (result.modernError) throw result.modernError
}

/* how this plugin works:
 * The plugin need to transform an svg file to a solid component.
 * To achieve this, in the transform hook, we call the vite-plugin-solid to compile the svg  source into the solid component.
 */

export default function (options: SolidSVGPluginOptions = {}): Plugin {
  const {
    defaultAsComponent = true,
    svgo = { enabled: true },
    compilerOptions = { allow_props_children: false },
  } = options

  const extPrefix = 'component-solid'
  const shouldProcess = (qs: string) => {
    const params = new URLSearchParams(qs)
    return (defaultAsComponent && !Array.from(params.entries()).length) || params.has(extPrefix)
  }

  let config: ResolvedConfig
  let solidPlugin: Plugin
  return {
    enforce: 'pre',
    name: 'solid-svg',

    configResolved(cfg) {
      config = cfg
      solidPlugin = config.plugins.find((p) => p.name == 'solid')
      if (!solidPlugin) {
        throw new Error('solid plugin not found')
      }
    },

    async load(id) {
      const [path, qs] = id.split('?')

      if (!path.endsWith('svg')) {
        return null
      }

      if (shouldProcess(qs)) {
        let code = await readFile(path, { encoding: 'utf8' })
        if (svgo.enabled) {
          let optimized = await optimizeSvg(code, path, svgo.svgoConfig)
          code = optimized || code
        }
        const result = await compileSvg(code, compilerOptions)

        return result
      }
    },

    transform(source, id, transformOptions) {
      const [path, qs] = id.split('?')
      if (path.endsWith('svg') && shouldProcess(qs)) {
        return solidPlugin.transform!.bind(this)(source, `${path}.tsx`, transformOptions)
      }
    },
  }
}
