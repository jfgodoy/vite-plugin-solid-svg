import { JSX } from "solid-js";

declare module "*.svg" {
  const Svg: JSX.SvgSVGAttributes<SVGSVGElement>;
  export default Svg;
}
