"use client";
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
exports.Command = void 0;
var copy_1 = require("@/components/copy");
var clx_1 = require("@/utils/clx");
var react_1 = require("react");
/**
 * This component is based on the div element and supports all of its props
 */
var CommandComponent = function (_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, clx_1.clx)("bg-ui-contrast-bg-base shadow-elevation-code-block flex items-center rounded-lg px-4 py-1.5", "[&>code]:text-ui-contrast-fg-primary [&>code]:code-body [&>code]:mx-2", className)} {...props}/>);
};
CommandComponent.displayName = "Command";
var CommandCopy = react_1.default.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<copy_1.Copy {...props} ref={ref} className={(0, clx_1.clx)("!text-ui-contrast-fg-secondary ml-auto", className)}/>);
});
CommandCopy.displayName = "Command.Copy";
var Command = Object.assign(CommandComponent, { Copy: CommandCopy });
exports.Command = Command;
