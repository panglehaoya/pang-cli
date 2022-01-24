"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const clean_1 = require("./clean");
const css_1 = require("../common/css");
const logger_1 = require("../common/logger");
const manager_1 = require("../common/manager");
const compile_js_1 = require("../compiler/compile-js");
const compile_sfc_1 = require("../compiler/compile-sfc");
const compile_style_1 = require("../compiler/compile-style");
const compile_package_1 = require("../compiler/compile-package");
const gen_package_entry_1 = require("../compiler/gen-package-entry");
const gen_style_deps_map_1 = require("../compiler/gen-style-deps-map");
const gen_component_style_1 = require("../compiler/gen-component-style");
const constant_1 = require("../common/constant");
const gen_package_style_1 = require("../compiler/gen-package-style");
const gen_vetur_config_1 = require("../compiler/gen-vetur-config");
const common_1 = require("../common");
async function compileFile(filePath) {
    if ((0, common_1.isSfc)(filePath)) {
        return (0, compile_sfc_1.compileSfc)(filePath);
    }
    if ((0, common_1.isScript)(filePath)) {
        return (0, compile_js_1.compileJs)(filePath);
    }
    if ((0, common_1.isStyle)(filePath)) {
        return (0, compile_style_1.compileStyle)(filePath);
    }
    if ((0, common_1.isAsset)(filePath)) {
        return Promise.resolve();
    }
    return (0, fs_extra_1.remove)(filePath);
}
async function compileDir(dir) {
    const files = (0, fs_extra_1.readdirSync)(dir);
    await Promise.all(files.map(filename => {
        const filePath = (0, path_1.join)(dir, filename);
        if ((0, common_1.isDemoDir)(filePath) || (0, common_1.isTestDir)(filePath)) {
            return (0, fs_extra_1.remove)(filePath);
        }
        if ((0, common_1.isDir)(filePath)) {
            return compileDir(filePath);
        }
        return compileFile(filePath);
    }));
}
async function buildEs() {
    (0, common_1.setModuleEnv)('esmodule');
    await (0, fs_extra_1.copy)(constant_1.SRC_DIR, constant_1.ES_DIR);
    await compileDir(constant_1.ES_DIR);
}
async function buildLib() {
    (0, common_1.setModuleEnv)('commonjs');
    await (0, fs_extra_1.copy)(constant_1.SRC_DIR, constant_1.LIB_DIR);
    await compileDir(constant_1.LIB_DIR);
}
async function buildStyleEntry() {
    await (0, gen_style_deps_map_1.genStyleDepsMap)();
    (0, gen_component_style_1.genComponentStyle)();
}
async function buildPacakgeEntry() {
    const esEntryFile = (0, path_1.join)(constant_1.ES_DIR, 'index.js');
    const libEntryFile = (0, path_1.join)(constant_1.LIB_DIR, 'index.js');
    const styleEntryFile = (0, path_1.join)(constant_1.LIB_DIR, `index.${css_1.CSS_LANG}`);
    (0, gen_package_entry_1.genPackageEntry)({
        outputPath: esEntryFile,
        pathResolver: (path) => `./${(0, path_1.relative)(constant_1.SRC_DIR, path)}`,
    });
    (0, common_1.setModuleEnv)('esmodule');
    await (0, compile_js_1.compileJs)(esEntryFile);
    (0, gen_package_style_1.genPacakgeStyle)({
        outputPath: styleEntryFile,
        pathResolver: (path) => path.replace(constant_1.SRC_DIR, '.'),
    });
    (0, common_1.setModuleEnv)('commonjs');
    await (0, fs_extra_1.copy)(esEntryFile, libEntryFile);
    await (0, compile_js_1.compileJs)(libEntryFile);
    await (0, compile_style_1.compileStyle)(styleEntryFile);
}
async function buildPackages() {
    (0, common_1.setModuleEnv)('esmodule');
    await (0, compile_package_1.compilePackage)(false);
    await (0, compile_package_1.compilePackage)(true);
    (0, gen_vetur_config_1.genVeturConfig)();
}
const tasks = [
    {
        text: 'Build ESModule Outputs',
        task: buildEs,
    },
    {
        text: 'Build Commonjs Outputs',
        task: buildLib,
    },
    {
        text: 'Build Style Entry',
        task: buildStyleEntry,
    },
    {
        text: 'Build Package Entry',
        task: buildPacakgeEntry,
    },
    {
        text: 'Build Packed Outputs',
        task: buildPackages,
    },
];
async function runBuildTasks() {
    for (let i = 0; i < tasks.length; i++) {
        const { task, text } = tasks[i];
        const spinner = (0, logger_1.ora)(text).start();
        try {
            /* eslint-disable no-await-in-loop */
            await task();
            spinner.succeed(text);
        }
        catch (err) {
            spinner.fail(text);
            console.log(err);
            throw err;
        }
    }
    logger_1.consola.success('Compile successfully');
}
function watchFileChange() {
    logger_1.consola.info('\nWatching file changes...');
    chokidar_1.default.watch(constant_1.SRC_DIR).on('change', async (path) => {
        if ((0, common_1.isDemoDir)(path) || (0, common_1.isTestDir)(path)) {
            return;
        }
        const spinner = (0, logger_1.ora)('File changed, start compilation...').start();
        const esPath = path.replace(constant_1.SRC_DIR, constant_1.ES_DIR);
        const libPath = path.replace(constant_1.SRC_DIR, constant_1.LIB_DIR);
        try {
            await (0, fs_extra_1.copy)(path, esPath);
            await (0, fs_extra_1.copy)(path, libPath);
            await compileFile(esPath);
            await compileFile(libPath);
            await (0, gen_style_deps_map_1.genStyleDepsMap)();
            (0, gen_component_style_1.genComponentStyle)({ cache: false });
            spinner.succeed('Compiled: ' + (0, logger_1.slimPath)(path));
        }
        catch (err) {
            spinner.fail('Compile failed: ' + path);
            console.log(err);
        }
    });
}
async function build(cmd = {}) {
    (0, common_1.setNodeEnv)('production');
    try {
        await (0, clean_1.clean)();
        await (0, manager_1.installDependencies)();
        await runBuildTasks();
        if (cmd.watch) {
            watchFileChange();
        }
    }
    catch (err) {
        logger_1.consola.error('Build failed');
        process.exit(1);
    }
}
exports.build = build;
