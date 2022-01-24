#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
// commands
const dev_1 = require("./commands/dev");
const lint_1 = require("./commands/lint");
const jest_1 = require("./commands/jest");
const clean_1 = require("./commands/clean");
const build_1 = require("./commands/build");
const release_1 = require("./commands/release");
const changelog_1 = require("./commands/changelog");
const build_site_1 = require("./commands/build-site");
const commit_lint_1 = require("./commands/commit-lint");
(0, commander_1.version)(`@vant/cli ${package_json_1.default.version}`);
process.env.VANT_CLI_VERSION = package_json_1.default.version;
(0, commander_1.command)('dev')
    .description('Run webpack dev server')
    .action(dev_1.dev);
(0, commander_1.command)('lint')
    .description('Run eslint and stylelint')
    .action(lint_1.lint);
(0, commander_1.command)('test')
    .description('Run unit tests through jest')
    .option('--watch', 'Watch files for changes and rerun tests related to changed files')
    .option('--clearCache', 'Clears the configured Jest cache directory and then exits')
    .option('--changedSince <changedSince>', 'Runs tests related to the changes since the provided branch or commit hash')
    .option('--logHeapUsage', 'Logs the heap usage after every test. Useful to debug memory leaks')
    .option('--runInBand', 'Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests')
    .option('--debug', 'Print debugging info about your Jest config')
    .action(jest_1.test);
(0, commander_1.command)('clean')
    .description('Clean all dist files')
    .action(clean_1.clean);
(0, commander_1.command)('build')
    .description('Compile components in production mode')
    .option('--watch', 'Watch file change')
    .action(build_1.build);
(0, commander_1.command)('release')
    .description('Compile components and release it')
    .action(release_1.release);
(0, commander_1.command)('build-site')
    .description('Compile site in production mode')
    .action(build_site_1.buildSite);
(0, commander_1.command)('changelog')
    .description('Generate changelog')
    .action(changelog_1.changelog);
(0, commander_1.command)('commit-lint')
    .description('Lint commit message')
    .action(commit_lint_1.commitLint);
(0, commander_1.parse)();
