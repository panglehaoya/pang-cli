"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const jest_1 = require("jest");
const common_1 = require("../common");
const gen_package_entry_1 = require("../compiler/gen-package-entry");
const constant_1 = require("../common/constant");
function test(command) {
    (0, common_1.setNodeEnv)('test');
    (0, gen_package_entry_1.genPackageEntry)({
        outputPath: constant_1.PACKAGE_ENTRY_FILE,
    });
    const config = {
        rootDir: constant_1.ROOT,
        watch: command.watch,
        config: constant_1.JEST_CONFIG_FILE,
        clearCache: command.clearCache,
        changedSince: command.changedSince,
        logHeapUsage: command.logHeapUsage,
        runInBand: command.runInBand,
        debug: command.debug,
    };
    (0, jest_1.runCLI)(config, [constant_1.ROOT])
        .then(response => {
        if (!response.results.success && !command.watch) {
            process.exit(1);
        }
    })
        .catch(err => {
        console.log(err);
        if (!command.watch) {
            process.exit(1);
        }
    });
}
exports.test = test;
