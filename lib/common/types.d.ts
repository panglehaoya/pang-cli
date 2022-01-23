import type Webpack from 'webpack';
import type WebpackDevServer from 'webpack-dev-server';
export declare type WebpackConfig = Webpack.Configuration & {
    devServer?: WebpackDevServer.Configuration;
};
