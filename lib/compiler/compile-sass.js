"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileSass = void 0;
const sass_1 = require("sass");
async function compileSass(filePath) {
    const { css } = sass_1.renderSync({ file: filePath });
    return css;
}
exports.compileSass = compileSass;
