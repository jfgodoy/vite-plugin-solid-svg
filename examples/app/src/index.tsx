import { render } from 'solid-js/web'

import './index.css'
import { lazy, For } from 'solid-js'
import type { Component, JSX } from 'solid-js'
import CircleIcon from '@/svgs/circle.svg?component-solid'
import rectIconUrl from '@/svgs/rect.svg?url'

type IconModule = {default: Component<JSX.SvgSVGAttributes<SVGSVGElement>>}
const modules = import.meta.glob<IconModule>('@/svgs/*.svg', { as: 'component-solid' })

const icons = Object.entries(modules).map(([key, value]) => {
  return { name: key, SvgComponent: lazy(value) }
})

function App() {
  return (
    <div>
      <ul>
        <li>
          svg as component: <CircleIcon fill="blue" />
        </li>
        <li>
          svg as url: <img src={rectIconUrl} />
        </li>
        <li>
          load directory:
          <ul>
            <For each={icons}>
              {({ name, SvgComponent }) => (
                <li>
                  {name}: <SvgComponent />
                </li>
              )}
            </For>
          </ul>
        </li>
      </ul>
    </div>
  )
}
render(() => <App />, document.getElementById('root') as HTMLElement)
