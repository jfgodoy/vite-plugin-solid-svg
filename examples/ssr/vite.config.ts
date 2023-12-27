import path from 'node:path'
import solidPlugin from 'vite-plugin-solid'
import ssr from 'vite-plugin-ssr/plugin'
import { defineConfig } from 'vite'
import solidSvg from 'vite-plugin-solid-svg'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  resolve: {
    alias: [{ find: '~', replacement: path.resolve('./') }],
  },
  plugins: [Inspect(), solidPlugin({ ssr: true }), solidSvg(), ssr()],
})
