"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const release_it_1 = __importDefault(require("release-it"));
const build_1 = require("../commands/build");
const changelog_1 = require("../commands/changelog");
class VantCliReleasePlugin extends release_it_1.default.Plugin {
    async beforeRelease() {
        // log an empty line
        console.log('');
        await (0, build_1.build)();
        await (0, changelog_1.changelog)();
    }
}
module.exports = VantCliReleasePlugin;
