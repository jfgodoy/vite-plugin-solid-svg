<h1 align="center">vite-plugin-solid-svg</h1>
<p align="center">Extend Vite with ability to use SVG files as Solid.js components.</p>

### Features:

- [SVGO](https://github.com/svg/svgo) optimization
- Hot Module Replacement support
- Support for `?component-solid` query string
- SSR

#### Currently supported Vite version:

<p><code>4 or above</code></p>

### Install

```bash
yarn add --dev vite-plugin-solid-svg

pnpm i -D vite-plugin-solid-svg
```

### Setup

```js
// vite.config.js
import solidPlugin from 'vite-plugin-solid'
import solidSvg from 'vite-plugin-solid-svg'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [solidPlugin(), solidSvg()],
})
```

#### typescript

vite adds its own definition for `"*.svg"` and defines them as `string`. As far as I know this cannot be overridden.
So we have two options: put our types before those of vite, or use imports with querystring.

If you are using `defaultAsComponent` which is the default, you need to put our types definition before vite in the tsconfig.
```jsonc
// tsconfig.json
"compilerOptions": {
  "types": [
    "vite-plugin-solid-svg/types-component-solid"
    "vite/client",
  ],
},
```
if you change to `defaultAsComponent=false`, you should use a different type definition that only identifies an svg import as a solid component when it matches the querystring. And in this case, put it before `"vite/client"`

```jsonc
// tsconfig.json
"compilerOptions": {
  "types": [
    "vite-plugin-solid-svg/types",
    "vite/client"
  ],
},
```

```ts
import MyIcon from './my-icon.svg';     // <-- this will match vite module definition, and therefore identified as string
import MyIcon from './my-icon.svg?component-solid';     // <-- this will match the definition in this plugin, and therefore identified as Solid Component
```

#### Options

```js
SolidSvg({
  /**
   * If true, will export as JSX component if `as` isn't specified.
   *
   * Otherwise will export as url, or as JSX component if '?as=component-solid'
   *
   */
  defaultAsComponent: true,

  svgo: {
    enabled: true, // optional, by default is true
    svgoConfig: <svgo config>  // optional, if defined, the file svgo.config.js is not loaded.
  }
})
```

If you need to configure `svgo`, you can also create a config file `svgo.config.js` in the project's root, following the instructions at [svgo docs](https://github.com/svg/svgo). The `svgo.svgoConfig` has precedence over the file.

### Usage

Import as a Solid.js component:

```tsx
import MyIcon from './my-icon.svg?component-solid';
// or './my-icon.svg' if `defaultAsComponent` is `true`
import MyIcon from './my-icon.svg';

const App = () => {
  return (
    <div>
        <h1> Title </h1>
        <MyIcon />
    </div>
  );
};

export default App;
```

To import all svg inside a folder, use `import.meta.glob('@/svgs/*.svg', { as: 'component-solid' })`. See [Vite docs](https://vitejs.dev/guide/features.html#static-assets) for more details.


```tsx
const icons = import.meta.glob('./*.svg', { as: 'component-solid' })

/*
  icons = {
    icon1: () => import("./icon1.svg"),
    icon2: () => import("./icon2.svg")
  }
*/

const App = () => {
  const Icon1 = lazy(() => iconsDic.icon1())
  return (
    <div>
        <p>hello</p><Icon1 />
    </div>
  );
};

export default App;
```

### Why

In a Solidjs + vite project, you can easily add an svg image using:

```tsx
import iconUrl from './icon.svg'

const App = () => {
  return (
    <div>
      <img href={iconUrl}>
    </div>
  )
}

```

However the fill color of the image cannot be overriden. Importing the svg as a component solves this and allows css styles to cascade into the svg content. Furthermore there may be situations where you'll need to ensure the image has been fully loaded, for example, before starting an animation. This module gives you a component that you can control when it's loaded.

# Credits

This plugin is based on the work from the following projects:

- https://github.com/visualfanatic/vite-svg
- https://github.com/cobbcheng/vite-plugin-svgstring
