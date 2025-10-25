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
exports.yelloSolarVariants = exports.YelloSolarButton = void 0;
var class_variance_authority_1 = require("class-variance-authority");
var cn_1 = require("../../utils/cn");
var yelloSolarVariants = (0, class_variance_authority_1.cva)("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background", {
    variants: {
        variant: {
            default: "bg-yello-solar text-white hover:bg-yello-solar/90",
            outline: "border-2 border-transparent bg-transparent text-yello-solar hover:bg-yello-solar/10",
            stroke: "border-2 bg-transparent text-yello-solar",
            ghost: "hover:bg-yello-solar/10 text-yello-solar",
        },
        size: {
            default: "h-10 py-2 px-4",
            sm: "h-9 px-3 rounded-md",
            lg: "h-11 px-8 rounded-md",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
exports.yelloSolarVariants = yelloSolarVariants;
var YelloSolarButton = function (_a) {
    var className = _a.className, variant = _a.variant, size = _a.size, props = __rest(_a, ["className", "variant", "size"]);
    return (<button className={(0, cn_1.cn)(yelloSolarVariants({ variant: variant, size: size }), 
        // Apply stroke gradient for stroke variant
        variant === "stroke" && "border-image: linear-gradient(135deg, #FFCE00 0%, #FF6600 50%, #FF0066 100%) 1", className)} {...props}/>);
};
exports.YelloSolarButton = YelloSolarButton;
