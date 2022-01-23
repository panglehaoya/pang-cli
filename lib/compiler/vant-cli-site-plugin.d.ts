import { Compiler } from 'webpack';
export declare function genSiteEntry(): Promise<unknown>;
export declare class VantCliSitePlugin {
    apply(compiler: Compiler): void;
}
