"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XLargePlusMono = exports.XLargeRegularMono = exports.LargePlusMono = exports.LargeRegularMono = exports.BasePlusMono = exports.BaseRegularMono = exports.XLargePlusSans = exports.XLargeRegularSans = exports.LargePlusSans = exports.LargeRegularSans = exports.BasePlusSans = exports.BaseRegularSans = void 0;
var text_1 = require("./text");
var meta = {
    title: "Components/Text",
    component: text_1.Text,
    argTypes: {
        size: {
            control: {
                type: "select",
            },
            options: ["base", "large", "xlarge"],
        },
        weight: {
            control: {
                type: "select",
            },
            options: ["regular", "plus"],
        },
        family: {
            control: {
                type: "select",
            },
            options: ["sans", "mono"],
        },
    },
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.BaseRegularSans = {
    args: {
        size: "base",
        weight: "regular",
        family: "sans",
        children: "I am a paragraph",
    },
};
exports.BasePlusSans = {
    args: {
        size: "base",
        weight: "plus",
        family: "sans",
        children: "I am a paragraph",
    },
};
exports.LargeRegularSans = {
    args: {
        size: "large",
        weight: "regular",
        family: "sans",
        children: "I am a paragraph",
    },
};
exports.LargePlusSans = {
    args: {
        size: "large",
        weight: "plus",
        family: "sans",
        children: "I am a paragraph",
    },
};
exports.XLargeRegularSans = {
    args: {
        size: "xlarge",
        weight: "regular",
        family: "sans",
        children: "I am a paragraph",
    },
};
exports.XLargePlusSans = {
    args: {
        size: "xlarge",
        weight: "plus",
        family: "sans",
        children: "I am a paragraph",
    },
};
exports.BaseRegularMono = {
    args: {
        size: "base",
        weight: "regular",
        family: "mono",
        children: "I am a paragraph",
    },
};
exports.BasePlusMono = {
    args: {
        size: "base",
        weight: "plus",
        family: "mono",
        children: "I am a paragraph",
    },
};
exports.LargeRegularMono = {
    args: {
        size: "large",
        weight: "regular",
        family: "mono",
        children: "I am a paragraph",
    },
};
exports.LargePlusMono = {
    args: {
        size: "large",
        weight: "plus",
        family: "mono",
        children: "I am a paragraph",
    },
};
exports.XLargeRegularMono = {
    args: {
        size: "xlarge",
        weight: "regular",
        family: "mono",
        children: "I am a paragraph",
    },
};
exports.XLargePlusMono = {
    args: {
        size: "xlarge",
        weight: "plus",
        family: "mono",
        children: "I am a paragraph",
    },
};
