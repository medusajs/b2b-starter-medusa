"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tsup_1 = require("tsup");
var path_1 = require("path");
exports.default = (0, tsup_1.defineConfig)({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    tsconfig: path_1.default.resolve(__dirname, "tsconfig.json"),
    dts: true,
    clean: true,
});
