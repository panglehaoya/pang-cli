"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileSfc = exports.parseSfc = void 0;
const compiler = __importStar(require("vue-template-compiler"));
const compileUtils = __importStar(require("@vue/component-compiler-utils"));
const hash_sum_1 = __importDefault(require("hash-sum"));
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const common_1 = require("../common");
const compile_js_1 = require("./compile-js");
const compile_style_1 = require("./compile-style");
const RENDER_FN = '__vue_render__';
const STATIC_RENDER_FN = '__vue_staticRenderFns__';
// trim some unused code
function trim(code) {
    return code.replace(/\/\/\n/g, '').trim();
}
function getSfcStylePath(filePath, ext, index) {
    const number = index !== 0 ? `-${index + 1}` : '';
    return (0, common_1.replaceExt)(filePath, `-sfc${number}.${ext}`);
}
function getExportKeyword(script) {
    const EXPORT_DEFAULT = 'export default {';
    const EXPORT_WITH_DEFINE_COMPONENT = 'export default defineComponent({';
    return script.includes(EXPORT_WITH_DEFINE_COMPONENT)
        ? EXPORT_WITH_DEFINE_COMPONENT
        : EXPORT_DEFAULT;
}
// inject render fn to script
function injectRender(script, render) {
    script = trim(script);
    render = render
        .replace('var render', `var ${RENDER_FN}`)
        .replace('var staticRenderFns', `var ${STATIC_RENDER_FN}`);
    const exportKeyword = getExportKeyword(script);
    return script.replace(exportKeyword, `${render}\n${exportKeyword}\n  render: ${RENDER_FN},\n\n  staticRenderFns: ${STATIC_RENDER_FN},\n`);
}
function injectScopeId(script, scopeId) {
    const exportKeyword = getExportKeyword(script);
    return script.replace(exportKeyword, `${exportKeyword}\n  _scopeId: '${scopeId}',\n\n`);
}
function injectStyle(script, styles, filePath) {
    if (styles.length) {
        const exportKeyword = getExportKeyword(script);
        const imports = styles
            .map((style, index) => {
            const { base } = (0, path_1.parse)(getSfcStylePath(filePath, 'css', index));
            return `import './${base}';`;
        })
            .join('\n');
        return script.replace(exportKeyword, `${imports}\n\n${exportKeyword}`);
    }
    return script;
}
function compileTemplate(template) {
    const result = compileUtils.compileTemplate({
        compiler,
        source: template,
        isProduction: true,
    });
    return result.code;
}
function parseSfc(filePath) {
    const source = (0, fs_extra_1.readFileSync)(filePath, 'utf-8');
    const descriptor = compileUtils.parse({
        source,
        compiler,
        needMap: false,
    });
    return descriptor;
}
exports.parseSfc = parseSfc;
async function compileSfc(filePath) {
    const tasks = [(0, fs_extra_1.remove)(filePath)];
    const source = (0, fs_extra_1.readFileSync)(filePath, 'utf-8');
    const descriptor = parseSfc(filePath);
    const { template, styles } = descriptor;
    const hasScoped = styles.some((s) => s.scoped);
    const scopeId = hasScoped ? `data-v-${(0, hash_sum_1.default)(source)}` : '';
    // compile js part
    if (descriptor.script) {
        const lang = descriptor.script.lang || 'js';
        const scriptFilePath = (0, common_1.replaceExt)(filePath, `.${lang}`);
        tasks.push(new Promise((resolve, reject) => {
            let script = descriptor.script.content;
            script = injectStyle(script, styles, filePath);
            if (template) {
                const render = compileTemplate(template.content);
                script = injectRender(script, render);
            }
            if (scopeId) {
                script = injectScopeId(script, scopeId);
            }
            (0, fs_extra_1.writeFileSync)(scriptFilePath, script);
            (0, compile_js_1.compileJs)(scriptFilePath).then(resolve).catch(reject);
        }));
    }
    // compile style part
    tasks.push(...styles.map((style, index) => {
        const cssFilePath = getSfcStylePath(filePath, style.lang || 'css', index);
        let styleSource = trim(style.content);
        if (style.scoped) {
            styleSource = compileUtils.compileStyle({
                id: scopeId,
                scoped: true,
                source: styleSource,
                filename: cssFilePath,
                preprocessLang: style.lang,
            }).code;
        }
        (0, fs_extra_1.writeFileSync)(cssFilePath, styleSource);
        return (0, compile_style_1.compileStyle)(cssFilePath);
    }));
    return Promise.all(tasks);
}
exports.compileSfc = compileSfc;
