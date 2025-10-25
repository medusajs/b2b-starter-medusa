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
exports.Copy = void 0;
var tooltip_1 = require("@/components/tooltip");
var clx_1 = require("@/utils/clx");
var icons_1 = require("@medusajs/icons");
var copy_to_clipboard_1 = require("copy-to-clipboard");
var radix_ui_1 = require("radix-ui");
var react_1 = require("react");
/**
 * This component is based on the `button` element and supports all of its props
 */
var Copy = react_1.default.forwardRef(function (_a, ref) {
    var children = _a.children, className = _a.className, 
    /**
     * The content to copy.
     */
    content = _a.content, 
    /**
     * The variant of the copy button.
     */
    _b = _a.variant, 
    /**
     * The variant of the copy button.
     */
    variant = _b === void 0 ? "default" : _b, 
    /**
     * Whether to remove the wrapper `button` element and use the
     * passed child element instead.
     */
    _c = _a.asChild, 
    /**
     * Whether to remove the wrapper `button` element and use the
     * passed child element instead.
     */
    asChild = _c === void 0 ? false : _c, props = __rest(_a, ["children", "className", "content", "variant", "asChild"]);
    var _d = (0, react_1.useState)(false), done = _d[0], setDone = _d[1];
    var _e = (0, react_1.useState)(false), open = _e[0], setOpen = _e[1];
    var _f = (0, react_1.useState)("Copy"), text = _f[0], setText = _f[1];
    var copyToClipboard = function (e) {
        e.stopPropagation();
        setDone(true);
        (0, copy_to_clipboard_1.default)(content);
        setTimeout(function () {
            setDone(false);
        }, 2000);
    };
    react_1.default.useEffect(function () {
        if (done) {
            setText("Copied");
            return;
        }
        setTimeout(function () {
            setText("Copy");
        }, 500);
    }, [done]);
    var isDefaultVariant = function (variant) {
        return variant === "default";
    };
    var isDefault = isDefaultVariant(variant);
    var Component = asChild ? radix_ui_1.Slot.Root : "button";
    return (<tooltip_1.Tooltip content={text} open={done || open} onOpenChange={setOpen}>
        <Component ref={ref} aria-label="Copy code snippet" type="button" className={(0, clx_1.clx)("h-fit w-fit", className)} onClick={copyToClipboard} {...props}>
          {children ? (children) : done ? (isDefault ? (<icons_1.CheckCircleSolid className="text-ui-fg-subtle"/>) : (<icons_1.CheckCircleMiniSolid className="text-ui-fg-subtle"/>)) : isDefault ? (<icons_1.SquareTwoStack className="text-ui-fg-subtle"/>) : (<icons_1.SquareTwoStackMini className="text-ui-fg-subtle"/>)}
        </Component>
      </tooltip_1.Tooltip>);
});
exports.Copy = Copy;
Copy.displayName = "Copy";
