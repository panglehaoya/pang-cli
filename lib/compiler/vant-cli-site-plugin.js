"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VantCliSitePlugin = exports.genSiteEntry = void 0;
const common_1 = require("../common");
const css_1 = require("../common/css");
const gen_package_entry_1 = require("./gen-package-entry");
const gen_package_style_1 = require("./gen-package-style");
const gen_site_mobile_shared_1 = require("./gen-site-mobile-shared");
const gen_site_desktop_shared_1 = require("./gen-site-desktop-shared");
const gen_style_deps_map_1 = require("./gen-style-deps-map");
const constant_1 = require("../common/constant");
const PLUGIN_NAME = 'VantCliSitePlugin';
async function genSiteEntry() {
    return new Promise((resolve, reject) => {
        (0, gen_style_deps_map_1.genStyleDepsMap)()
            .then(() => {
            (0, gen_package_entry_1.genPackageEntry)({
                outputPath: constant_1.PACKAGE_ENTRY_FILE,
            });
            (0, gen_package_style_1.genPacakgeStyle)({
                outputPath: (0, common_1.replaceExt)(constant_1.PACKAGE_STYLE_FILE, `.${css_1.CSS_LANG}`),
            });
            (0, gen_site_mobile_shared_1.genSiteMobileShared)();
            (0, gen_site_desktop_shared_1.genSiteDesktopShared)();
            resolve();
        })
            .catch(err => {
            console.log(err);
            reject(err);
        });
    });
}
exports.genSiteEntry = genSiteEntry;
class VantCliSitePlugin {
    apply(compiler) {
        if (process.env.NODE_ENV === 'production') {
            compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, genSiteEntry);
        }
        else {
            compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, genSiteEntry);
        }
    }
}
exports.VantCliSitePlugin = VantCliSitePlugin;
