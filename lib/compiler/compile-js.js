"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileJs = void 0;
const core_1 = require("@babel/core");
const fs_extra_1 = require("fs-extra");
const common_1 = require("../common");
const css_1 = require("../common/css");
const get_deps_1 = require("./get-deps");
function compileJs(filePath) {
    return new Promise((resolve, reject) => {
        let code = (0, fs_extra_1.readFileSync)(filePath, 'utf-8');
        code = (0, css_1.replaceCssImportExt)(code);
        code = (0, get_deps_1.replaceScriptImportExt)(code, '.vue', '');
        (0, core_1.transformAsync)(code, { filename: filePath })
            .then((result) => {
            if (result) {
                const jsFilePath = (0, common_1.replaceExt)(filePath, '.js');
                (0, fs_extra_1.removeSync)(filePath);
                (0, fs_extra_1.outputFileSync)(jsFilePath, result.code);
                resolve();
            }
        })
            .catch(reject);
    });
}
exports.compileJs = compileJs;
