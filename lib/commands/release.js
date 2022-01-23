"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.release = void 0;
/* eslint-disable no-template-curly-in-string */
const release_it_1 = __importDefault(require("release-it"));
const path_1 = require("path");
const PLUGIN_PATH = path_1.join(__dirname, '../compiler/vant-cli-release-plugin.js');
async function release() {
    await release_it_1.default({
        plugins: {
            [PLUGIN_PATH]: {},
        },
        git: {
            tagName: 'v${version}',
            commitMessage: 'chore: release ${version}',
        },
    });
}
exports.release = release;
