import babel from '@rollup/plugin-babel'
import del from 'rollup-plugin-delete'
import copy from 'rollup-plugin-copy'

/** @type {import('rollup').RollupOptions} */
const config = {
  input: './package/index.ts',
  treeshake: 'smallest',
  external: ['node:fs/promises', 'svgo', 'vite'],
  output: [
    {
      format: 'es',
      dir: 'dist/es',
    },
    {
      format: 'cjs',
      exports: 'auto',
      dir: 'dist/cjs',
    },
  ],
  plugins: [
    del({ targets: 'dist/*' }),
    babel({
      extensions: ['.ts'],
      babelHelpers: 'bundled',
      presets: ['@babel/preset-typescript'],
      exclude: /node_modules\//,
    }),
    copy({
      targets: [{ src: './package/types.d.ts', dest: './dist' }],
    }),
  ],
}
export default config
