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
exports.Textarea = void 0;
var React = require("react");
var input_1 = require("@/components/input");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the `textarea` element and supports all of its props
 */
var Textarea = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<textarea ref={ref} className={(0, clx_1.clx)(input_1.inputBaseStyles, "txt-small min-h-[60px] w-full px-2 py-1.5", className)} {...props}/>);
});
exports.Textarea = Textarea;
Textarea.displayName = "Textarea";
