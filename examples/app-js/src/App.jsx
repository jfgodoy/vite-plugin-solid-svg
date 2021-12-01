import { lazy } from "solid-js";
import CircleIcon from "./svgs/circle.svg"
import rectIconUrl from "./svgs/rect.svg?url"
import icons from "./svgs/[name].svg";

let iconList = Object.entries(icons).map(function ([key, value]) {
  return {name: key, SvgComponent: lazy(() => value())}
});

function App() {
  return (
    <div>
      <ul>
        <li>svg as component: <CircleIcon /></li>
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
