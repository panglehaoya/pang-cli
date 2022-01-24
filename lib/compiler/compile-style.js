"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileStyle = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const common_1 = require("../common");
const compile_css_1 = require("./compile-css");
const compile_less_1 = require("./compile-less");
const compile_sass_1 = require("./compile-sass");
const logger_1 = require("../common/logger");
async function compileFile(filePath) {
    const parsedPath = (0, path_1.parse)(filePath);
    try {
        if (parsedPath.ext === '.less') {
            const source = await (0, compile_less_1.compileLess)(filePath);
            return await (0, compile_css_1.compileCss)(source);
        }
        if (parsedPath.ext === '.scss') {
            const source = await (0, compile_sass_1.compileSass)(filePath);
            return await (0, compile_css_1.compileCss)(source);
        }
        const source = (0, fs_1.readFileSync)(filePath, 'utf-8');
        return await (0, compile_css_1.compileCss)(source);
    }
    catch (err) {
        logger_1.consola.error('Compile style failed: ' + filePath);
        throw err;
    }
}
async function compileStyle(filePath) {
    const css = await compileFile(filePath);
    (0, fs_1.writeFileSync)((0, common_1.replaceExt)(filePath, '.css'), css);
}
exports.compileStyle = compileStyle;
