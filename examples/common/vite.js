import path from 'node:path'

/** @type {import('vite').UserConfig}*/
export const sharedViteConfig = {
  resolve: {
    alias: [{ find: '@', replacement: path.resolve('../common') }],
  },
}
