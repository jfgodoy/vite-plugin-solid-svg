import solidPlugin from 'vite-plugin-solid'
import ssr from 'vite-plugin-ssr/plugin'
import { UserConfig } from 'vite'
import solidSvg from 'vite-plugin-solid-svg'
import Inspect from 'vite-plugin-inspect'

const config: UserConfig = {
  plugins: [Inspect(), solidPlugin({ ssr: true }), solidSvg(), ssr()],
  build: {
    // @ts-ignore
    polyfillDynamicImport: false,
  },
}

export default config
