"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSite = void 0;
const fs_extra_1 = require("fs-extra");
const common_1 = require("../common");
const compile_site_1 = require("../compiler/compile-site");
const constant_1 = require("../common/constant");
async function buildSite() {
    (0, common_1.setNodeEnv)('production');
    await (0, fs_extra_1.emptyDir)(constant_1.SITE_DIST_DIR);
    await (0, compile_site_1.compileSite)(true);
}
exports.buildSite = buildSite;
