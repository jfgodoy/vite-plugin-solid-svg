import type { Component } from 'solid-js';
import { lazy, For } from "solid-js";
import CircleIcon from "./svgs/circle.svg?component";
import rectIconUrl from "./svgs/rect.svg?url"
import icons from "./svgs/[name].svg?component";

let iconList = Object.entries(icons).map(function ([key, value]) {
  return {name: key, SvgComponent: lazy(() => value())}
});

const App: Component = () => {
  return (
    <div>
      <ul>
        <li>svg as component: <CircleIcon fill="blue"/></li>
        <li>svg as url: <img src={rectIconUrl} /></li>
        <li>
          load directory:
          <ul>
            <For each={iconList}>
              {
                ({name, SvgComponent}) => <li>{name}: <SvgComponent /></li>
              }
            </For>
          </ul>
        </li>
      </ul>

    </div>
  );
}

export default App;
