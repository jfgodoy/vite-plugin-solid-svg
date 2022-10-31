import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import solidSvg from 'vite-plugin-solid-svg'
import Inspect from 'vite-plugin-inspect'
import { sharedViteConfig } from '../common/vite'

export default defineConfig({
  ...sharedViteConfig,
  plugins: [Inspect(), solidPlugin(), solidSvg()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
})
