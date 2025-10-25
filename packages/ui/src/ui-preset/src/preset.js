"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preset = void 0;
var plugin_1 = require("./plugin");
var preset = {
    content: [],
    plugins: [plugin_1.default, require("tailwindcss-animate")],
};
exports.preset = preset;
