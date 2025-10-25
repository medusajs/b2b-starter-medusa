"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Small = exports.Search = exports.Password = exports.Invalid = exports.Disabled = exports.Default = void 0;
var input_1 = require("./input");
var meta = {
    title: "Components/Input",
    component: input_1.Input,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    args: {
        placeholder: "Placeholder",
    },
};
exports.Disabled = {
    args: {
        value: "Floyd Mayweather",
        disabled: true,
    },
};
exports.Invalid = {
    args: {
        placeholder: "Placeholder",
        required: true,
    },
};
exports.Password = {
    args: {
        type: "password",
    },
};
exports.Search = {
    args: {
        type: "search",
        placeholder: "Search",
    },
};
exports.Small = {
    args: {
        size: "small",
        placeholder: "Placeholder",
    },
};
