# Change Log

## [0.6.3] - 2023-07-10
- Fix svgo type inference by moving `@types/svgo` from `devDependencies` to `dependencies`

## [0.6.2] - 2023-06-04
- Add typescript defenition for `defaultAsComponent` case.

## [0.6.1] - 2022-11-18
- replace svg comments with jsx comments

## [0.6.0] - 2022-11-04
the plugin was rewrited as a typescript project. Some features were removed as they are supported internally by vite.
### **breaking changes**
- Removed [name] pattern, as Vite supports globs by default: https://vitejs.dev/guide/features.html#glob-import
- Replace `defaultExport` option for `defaultAsComponent`
- Replace `component` sufix in query string for `component-solid`

## [0.5.0] - 2022-09-18
- fix typescript definition for `?url`
- add support for `props.children` inside svg, but only if it enabled in the options. See #19

## [0.4.1] - 2022-08-09
- fix hot module reload

## [0.4.0] - 2022-08-03
- add support for vite@3
- add check for datauri option in svgo config. The datauri option breaks this plugin, so is not allowed.
- allow disable or pass a custom configuration for svgo

## [0.3.1] - 2022-07-26
- fixes load of svg files that contains a style block (issue #13)

## [0.3.0] - 2022-07-21
- add typescript example
- fixes typescripts issues by changing module declarations
- fix typescript compilation

## [0.2.0] - 2021-12-14
- fix ssr by using solid compiler (issue #6)
- add examples projects
- ignore other querystring params in the path (issue #1)

## [0.1.2] - 2021-08-07
- fix error ocurred when the component is called without props

## [0.1.1] - 2021-08-07
- fix passing props to the SVG Component

## [0.1.0] - 2021-08-07
First release
