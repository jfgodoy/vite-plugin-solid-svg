import solidPlugin from 'vite-plugin-solid'
import ssr from 'vite-plugin-ssr/plugin'
import { defineConfig } from 'vite'
import solidSvg from 'vite-plugin-solid-svg'
import Inspect from 'vite-plugin-inspect'
import { sharedViteConfig } from '../common/vite'

export default defineConfig({
  ...sharedViteConfig,
  plugins: [Inspect(), solidPlugin({ ssr: true }), solidSvg(), ssr()],
  build: {
    polyfillDynamicImport: false,
  },
})
