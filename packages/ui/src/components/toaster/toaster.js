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
exports.Toaster = void 0;
var React = require("react");
var sonner_1 = require("sonner");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Toaster component of the Sonner library](https://sonner.emilkowal.ski/toaster).
 */
var Toaster = function (_a) {
    var 
    /**
     * The position of the created toasts.
     */
    _b = _a.position, 
    /**
     * The position of the created toasts.
     */
    position = _b === void 0 ? "bottom-right" : _b, 
    /**
     * The gap between the toast components.
     */
    _c = _a.gap, 
    /**
     * The gap between the toast components.
     */
    gap = _c === void 0 ? 12 : _c, 
    /**
     * The space from the edges of the screen.
     */
    _d = _a.offset, 
    /**
     * The space from the edges of the screen.
     */
    offset = _d === void 0 ? 24 : _d, 
    /**
     * The time in milliseconds that a toast is shown before it's
     * automatically dismissed.
     *
     * @defaultValue 4000
     */
    duration = _a.duration, props = __rest(_a, ["position", "gap", "offset", "duration"]);
    return (<sonner_1.Toaster position={position} gap={gap} offset={offset} cn={clx_1.clx} toastOptions={{
            duration: duration,
        }} {...props}/>);
};
exports.Toaster = Toaster;
