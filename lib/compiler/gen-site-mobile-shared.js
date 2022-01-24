"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genSiteMobileShared = void 0;
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const constant_1 = require("../common/constant");
const common_1 = require("../common");
function genInstall() {
    return `import Vue from 'vue';
import PackageEntry from './package-entry';
import './package-style';
`;
}
function genImports(demos) {
    return demos
        .map(item => `import ${item.name} from '${(0, common_1.removeExt)((0, common_1.normalizePath)(item.path))}';`)
        .join('\n');
}
function genExports(demos) {
    return `export const demos = {\n  ${demos
        .map(item => item.name)
        .join(',\n  ')}\n};`;
}
function getSetName(demos) {
    return demos
        .map(item => `${item.name}.name = 'demo-${item.component}';`)
        .join('\n');
}
function genConfig(demos) {
    const vantConfig = (0, common_1.getVantConfig)();
    const demoNames = demos.map(item => (0, common_1.decamelize)(item.name));
    function demoFilter(nav) {
        return nav.filter(group => {
            group.items = group.items.filter((item) => demoNames.includes(item.path));
            return group.items.length;
        });
    }
    const { nav, locales } = vantConfig.site;
    if (locales) {
        Object.keys(locales).forEach((lang) => {
            if (locales[lang].nav) {
                locales[lang].nav = demoFilter(locales[lang].nav);
            }
        });
    }
    else if (nav) {
        vantConfig.site.nav = demoFilter(nav);
    }
    return `export const config = ${JSON.stringify(vantConfig, null, 2)}`;
}
function genCode(components) {
    const demos = components
        .map(component => ({
        component,
        name: (0, common_1.pascalize)(component),
        path: (0, path_1.join)(constant_1.SRC_DIR, component, 'demo/index.vue'),
    }))
        .filter(item => (0, fs_extra_1.existsSync)(item.path));
    return `${genInstall()}
${genImports(demos)}

Vue.use(PackageEntry);

${getSetName(demos)}

${genExports(demos)}
${genConfig(demos)}
`;
}
function genSiteMobileShared() {
    const dirs = (0, fs_extra_1.readdirSync)(constant_1.SRC_DIR);
    const code = genCode(dirs);
    (0, common_1.smartOutputFile)(constant_1.SITE_MODILE_SHARED_FILE, code);
}
exports.genSiteMobileShared = genSiteMobileShared;
