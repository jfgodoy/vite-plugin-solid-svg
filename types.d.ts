declare module '*.svg?component-solid' {
  import type { Component, ComponentProps } from 'solid-js'
  const c: Component<ComponentProps<'svg'>>
  export default c
}
