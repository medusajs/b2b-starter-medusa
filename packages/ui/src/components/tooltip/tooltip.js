"use client";
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
exports.TooltipProvider = exports.Tooltip = void 0;
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip) primitive.
 *
 * @excludeExternal
 */
var Tooltip = function (_a) {
    var 
    /**
     * The element to trigger the tooltip.
     *
     * @keep
     */
    children = _a.children, 
    /**
     * The content to display in the tooltip.
     */
    content = _a.content, 
    /**
     * Whether the tooltip is currently open.
     *
     * @keep
     */
    open = _a.open, 
    /**
     * Whether the tooltip is open by default.
     *
     * @keep
     */
    defaultOpen = _a.defaultOpen, 
    /**
     * A function that is called when the tooltip's open state changes.
     *
     * @keep
     */
    onOpenChange = _a.onOpenChange, 
    /**
     * The time in milliseconds to delay the tooltip's appearance.
     *
     * @keep
     */
    delayDuration = _a.delayDuration, 
    /**
     * The maximum width of the tooltip.
     */
    _b = _a.maxWidth, 
    /**
     * The maximum width of the tooltip.
     */
    maxWidth = _b === void 0 ? 220 : _b, className = _a.className, 
    /**
     * The side to position the tooltip.
     *
     * @defaultValue top
     */
    side = _a.side, 
    /**
     * The distance in pixels between the tooltip and its trigger.
     *
     * @keep
     */
    _c = _a.sideOffset, 
    /**
     * The distance in pixels between the tooltip and its trigger.
     *
     * @keep
     */
    sideOffset = _c === void 0 ? 8 : _c, 
    /**
     * A function that is triggered when the tooltip is clicked.
     */
    onClick = _a.onClick, props = __rest(_a, ["children", "content", "open", "defaultOpen", "onOpenChange", "delayDuration", "maxWidth", "className", "side", "sideOffset", "onClick"]);
    return (<radix_ui_1.Tooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={delayDuration}>
        <radix_ui_1.Tooltip.Trigger onClick={onClick} asChild>
          {children}
        </radix_ui_1.Tooltip.Trigger>
        <radix_ui_1.Tooltip.Portal>
          <radix_ui_1.Tooltip.Content side={side} sideOffset={sideOffset} align="center" className={(0, clx_1.clx)("txt-compact-xsmall text-ui-fg-subtle bg-ui-bg-base shadow-elevation-tooltip rounded-lg px-2.5 py-1", "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} style={__assign(__assign({}, props.style), { maxWidth: maxWidth })}>
            {content}
          </radix_ui_1.Tooltip.Content>
        </radix_ui_1.Tooltip.Portal>
      </radix_ui_1.Tooltip.Root>);
};
exports.Tooltip = Tooltip;
var TooltipProvider = function (_a) {
    var children = _a.children, _b = _a.delayDuration, delayDuration = _b === void 0 ? 100 : _b, _c = _a.skipDelayDuration, skipDelayDuration = _c === void 0 ? 300 : _c, props = __rest(_a, ["children", "delayDuration", "skipDelayDuration"]);
    return (<radix_ui_1.Tooltip.TooltipProvider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props}>
      {children}
    </radix_ui_1.Tooltip.TooltipProvider>);
};
exports.TooltipProvider = TooltipProvider;
