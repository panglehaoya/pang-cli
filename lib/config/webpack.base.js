"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseConfig = void 0;
const sass_1 = __importDefault(require("sass"));
const friendly_errors_webpack_plugin_1 = __importDefault(require("@nuxt/friendly-errors-webpack-plugin"));
const vue_loader_1 = require("vue-loader");
const path_1 = require("path");
const fs_1 = require("fs");
const logger_1 = require("../common/logger");
const constant_1 = require("../common/constant");
const CACHE_LOADER = {
    loader: 'cache-loader',
    options: {
        cacheDirectory: constant_1.CACHE_DIR,
    },
};
const CSS_LOADERS = [
    'style-loader',
    'css-loader',
    {
        loader: 'postcss-loader',
        options: {
            config: {
                path: constant_1.POSTCSS_CONFIG_FILE,
            },
        },
    },
];
const plugins = [
    new vue_loader_1.VueLoaderPlugin(),
    new friendly_errors_webpack_plugin_1.default({
        clearConsole: false,
        logLevel: 'WARNING',
    }),
];
const tsconfigPath = (0, path_1.join)(constant_1.CWD, 'tsconfig.json');
if ((0, fs_1.existsSync)(tsconfigPath)) {
    const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
    plugins.push(new ForkTsCheckerPlugin({
        formatter: 'codeframe',
        vue: { enabled: true },
        logger: {
            // skip info message
            info() { },
            warn(message) {
                logger_1.consola.warn(message);
            },
            error(message) {
                logger_1.consola.error(message);
            },
        },
    }));
}
const VUE_LOADER = {
    loader: 'vue-loader',
    options: {
        compilerOptions: {
            preserveWhitespace: false,
        },
    },
};
exports.baseConfig = {
    mode: 'development',
    resolve: {
        extensions: [...constant_1.SCRIPT_EXTS, ...constant_1.STYLE_EXTS],
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: [CACHE_LOADER, VUE_LOADER],
            },
            {
                test: /\.(js|ts|jsx|tsx)$/,
                exclude: /node_modules\/(?!(@vant\/cli))/,
                use: [CACHE_LOADER, 'babel-loader'],
            },
            {
                test: /\.css$/,
                sideEffects: true,
                use: CSS_LOADERS,
            },
            {
                test: /\.less$/,
                sideEffects: true,
                use: [...CSS_LOADERS, 'less-loader'],
            },
            {
                test: /\.scss$/,
                sideEffects: true,
                use: [
                    ...CSS_LOADERS,
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: sass_1.default,
                        },
                    },
                ],
            },
            {
                test: /\.md$/,
                use: [CACHE_LOADER, VUE_LOADER, '@vant/markdown-loader'],
            },
        ],
    },
    plugins,
};
