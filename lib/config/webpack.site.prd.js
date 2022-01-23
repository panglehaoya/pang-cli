"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSitePrdConfig = void 0;
const webpack_merge_1 = require("webpack-merge");
const lodash_1 = require("lodash");
const common_1 = require("../common");
const webpack_site_dev_1 = require("./webpack.site.dev");
const constant_1 = require("../common/constant");
const vantConfig = common_1.getVantConfig();
const outputDir = lodash_1.get(vantConfig, 'build.site.outputDir', constant_1.SITE_DIST_DIR);
const publicPath = lodash_1.get(vantConfig, 'build.site.publicPath', '/');
function getSitePrdConfig() {
    return common_1.getWebpackConfig(webpack_merge_1.merge(webpack_site_dev_1.getSiteDevBaseConfig(), {
        mode: 'production',
        stats: 'none',
        performance: {
            maxAssetSize: 5 * 1024 * 1024,
            maxEntrypointSize: 5 * 1024 * 1024,
        },
        output: {
            publicPath,
            path: outputDir,
            filename: '[name].[hash:8].js',
            chunkFilename: 'async_[name].[chunkhash:8].js',
        },
    }));
}
exports.getSitePrdConfig = getSitePrdConfig;
