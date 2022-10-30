import { Component, For, lazy } from 'solid-js'
import CircleIcon from '@/svgs/circle.svg?component-solid'
import rectIconUrl from '@/svgs/rect.svg?url'

const modules = import.meta.glob('@/svgs/*.svg', { as: 'component' })

let iconList = Object.entries(modules).map(function ([key, value]) {
  return { name: key, SvgComponent: lazy(value) }
})

const Page: Component = () => {
  return (
    <>
      <h1>Welcome</h1>
      <ul>
        <li>
          svg as component: <CircleIcon />
        </li>
        <li>
          svg as url: <img src={rectIconUrl} />
        </li>
        <li>
          load directory:
          <ul>
            <For each={iconList}>
              {({ name, SvgComponent }) => (
                <li>
                  {name}: <SvgComponent />
                </li>
              )}
            </For>
          </ul>
        </li>
      </ul>
    </>
  )
}

export { Page }
