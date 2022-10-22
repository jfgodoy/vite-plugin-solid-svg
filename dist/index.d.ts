import { OptimizeOptions } from 'svgo';
import type { Plugin } from 'vite';
declare type CompilerOptions = {
    allow_props_children?: boolean;
};
export declare type SolidSVGPluginOptions = {
    /**
     * If true, will export as JSX component if `as` isn't specified.
     *
     * Otherwise will export as JSX component if '?as=component'
     */
    defaultAsComponent?: boolean;
    svgo?: {
        enabled?: boolean;
        svgoConfig?: OptimizeOptions;
    };
    compilerOptions?: CompilerOptions;
};
export default function (options?: SolidSVGPluginOptions): Plugin;
export {};
