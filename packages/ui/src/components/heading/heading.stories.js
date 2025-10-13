"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.H3 = exports.H2 = exports.H1 = void 0;
var heading_1 = require("./heading");
var meta = {
    title: "Components/Heading",
    component: heading_1.Heading,
    argTypes: {
        level: {
            control: {
                type: "select",
            },
            options: ["h1", "h2", "h3"],
        },
    },
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.H1 = {
    args: {
        level: "h1",
        children: "I am a H1 heading",
    },
};
exports.H2 = {
    args: {
        level: "h2",
        children: "I am a H2 heading",
    },
};
exports.H3 = {
    args: {
        level: "h3",
        children: "I am a H3 heading",
    },
};
