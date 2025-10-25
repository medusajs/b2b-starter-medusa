"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_1 = require("tailwindcss/plugin");
var constants_1 = require("./constants");
var theme_1 = require("./theme/extension/theme");
var colors_1 = require("./theme/tokens/colors");
var components_1 = require("./theme/tokens/components");
var effects_1 = require("./theme/tokens/effects");
var gradients_1 = require("./theme/tokens/gradients");
var typography_1 = require("./theme/tokens/typography");
exports.default = (0, plugin_1.default)(function medusaUi(_a) {
    var _b;
    var addBase = _a.addBase, addComponents = _a.addComponents, config = _a.config;
    var _c = [].concat(config("darkMode", "media")), darkMode = _c[0], _d = _c[1], className = _d === void 0 ? ".dark" : _d;
    addBase({
        "*": {
            borderColor: "var(--border-base)",
        },
        ":root": __assign({}, gradients_1.gradients),
    });
    addComponents(typography_1.typography);
    addBase(__assign({ ":root": __assign(__assign({}, colors_1.colors.light), effects_1.effects.light) }, components_1.components.light));
    if (darkMode === "class") {
        addBase((_b = {},
            _b[className] = __assign(__assign({}, colors_1.colors.dark), effects_1.effects.dark),
            _b));
    }
    else {
        addBase({
            "@media (prefers-color-scheme: dark)": __assign({ ":root": __assign(__assign({}, colors_1.colors.dark), effects_1.effects.dark) }, components_1.components.dark),
        });
    }
}, {
    theme: {
        extend: __assign(__assign({}, theme_1.theme.extend), { fontFamily: {
                sans: constants_1.FONT_FAMILY_SANS,
                mono: constants_1.FONT_FAMILY_MONO,
            }, transitionProperty: {
                fg: "color, background-color, border-color, box-shadow, opacity",
            }, keyframes: {
                "accordion-down": {
                    from: { height: "0px" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0px" },
                },
            }, animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            } }),
    },
});
