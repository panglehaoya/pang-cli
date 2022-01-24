"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genStyleDepsMap = exports.checkStyleExists = void 0;
const path_1 = require("path");
const css_1 = require("../common/css");
const fs_extra_1 = require("fs-extra");
const get_deps_1 = require("./get-deps");
const common_1 = require("../common");
const constant_1 = require("../common/constant");
function matchPath(path, component) {
    const p = (0, path_1.relative)(constant_1.SRC_DIR, path);
    const arr = p.split(path_1.sep);
    return arr.includes(component);
}
function getStylePath(component) {
    return (0, path_1.join)(constant_1.SRC_DIR, `${component}/index.${css_1.CSS_LANG}`);
}
function checkStyleExists(component) {
    return (0, fs_extra_1.existsSync)(getStylePath(component));
}
exports.checkStyleExists = checkStyleExists;
// analyze component dependencies
function analyzeComponentDeps(components, component) {
    const checkList = [];
    const componentEntry = (0, get_deps_1.fillExt)((0, path_1.join)(constant_1.SRC_DIR, component, 'index'));
    const record = new Set();
    function search(filePath) {
        record.add(filePath);
        (0, get_deps_1.getDeps)(filePath).forEach(key => {
            if (record.has(key)) {
                return;
            }
            search(key);
            components
                .filter(item => matchPath(key, item))
                .forEach(item => {
                if (!checkList.includes(item) && item !== component) {
                    checkList.push(item);
                }
            });
        });
    }
    search(componentEntry);
    return checkList.filter(checkStyleExists);
}
function getSequence(components, depsMap) {
    const sequence = [];
    const record = new Set();
    function add(item) {
        const deps = depsMap[item];
        if (sequence.includes(item) || !deps) {
            return;
        }
        if (record.has(item)) {
            sequence.push(item);
            return;
        }
        record.add(item);
        if (!deps.length) {
            sequence.push(item);
            return;
        }
        deps.forEach(add);
        if (sequence.includes(item)) {
            return;
        }
        const maxIndex = Math.max(...deps.map(dep => sequence.indexOf(dep)));
        sequence.splice(maxIndex + 1, 0, item);
    }
    components.forEach(add);
    return sequence;
}
async function genStyleDepsMap() {
    const components = (0, common_1.getComponents)();
    return new Promise(resolve => {
        (0, get_deps_1.clearDepsCache)();
        const map = {};
        components.forEach(component => {
            map[component] = analyzeComponentDeps(components, component);
        });
        const sequence = getSequence(components, map);
        Object.keys(map).forEach(key => {
            map[key] = map[key].sort((a, b) => sequence.indexOf(a) - sequence.indexOf(b));
        });
        (0, common_1.smartOutputFile)(constant_1.STYPE_DEPS_JSON_FILE, JSON.stringify({ map, sequence }, null, 2));
        resolve();
    });
}
exports.genStyleDepsMap = genStyleDepsMap;
