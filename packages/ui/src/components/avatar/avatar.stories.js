"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XLarge = exports.Large = exports.Base = exports.Small = exports.XSmall = exports.TwoXSmall = exports.WithFallback = exports.WithImage = void 0;
var avatar_1 = require("./avatar");
var meta = {
    title: "Components/Avatar",
    component: avatar_1.Avatar,
    argTypes: {
        src: {
            control: {
                type: "text",
            },
        },
        fallback: {
            control: {
                type: "text",
            },
        },
        variant: {
            control: {
                type: "select",
                options: ["rounded", "squared"],
            },
        },
        size: {
            control: {
                type: "select",
                options: ["default", "large"],
            },
        },
    },
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.WithImage = {
    args: {
        src: "https://avatars.githubusercontent.com/u/10656202?v=4",
        fallback: "J",
        size: "base",
    },
};
exports.WithFallback = {
    args: {
        fallback: "J",
        size: "large",
    },
};
exports.TwoXSmall = {
    args: {
        fallback: "J",
        size: "2xsmall",
    },
};
exports.XSmall = {
    args: {
        fallback: "J",
        size: "xsmall",
    },
};
exports.Small = {
    args: {
        fallback: "J",
        size: "small",
    },
};
exports.Base = {
    args: {
        fallback: "J",
        size: "base",
    },
};
exports.Large = {
    args: {
        fallback: "J",
        size: "large",
    },
};
exports.XLarge = {
    args: {
        fallback: "J",
        size: "xlarge",
    },
};
