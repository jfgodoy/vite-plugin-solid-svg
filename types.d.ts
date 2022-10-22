declare module '*.svg?component' {
  import type { Component, ComponentProps } from 'solid-js'
  const c: Component<ComponentProps<'svg'>>
  export default c
}
