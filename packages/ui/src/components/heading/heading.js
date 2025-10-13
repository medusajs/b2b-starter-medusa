"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.headingVariants = exports.Heading = void 0;
var cva_1 = require("cva");
var React = require("react");
var clx_1 = require("@/utils/clx");
var headingVariants = (0, cva_1.cva)({
    base: "font-sans font-medium",
    variants: {
        level: {
            h1: "h1-core",
            h2: "h2-core",
            h3: "h3-core",
        },
    },
    defaultVariants: {
        level: "h1",
    },
});
exports.headingVariants = headingVariants;
/**
 * This component is based on the heading element (`h1`, `h2`, etc...) depeneding on the specified level
 * and supports all of its props
 */
var Heading = function (_a) {
    var 
    /**
     * The heading level which specifies which heading element is used.
     */
    _b = _a.level, 
    /**
     * The heading level which specifies which heading element is used.
     */
    level = _b === void 0 ? "h1" : _b, className = _a.className, props = __rest(_a, ["level", "className"]);
    var Component = level || "h1";
    return (<Component className={(0, clx_1.clx)(headingVariants({ level: level }), className)} {...props}/>);
};
exports.Heading = Heading;
