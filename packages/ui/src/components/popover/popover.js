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
exports.Popover = void 0;
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover) primitves.
 */
var Root = function (props) {
    return <radix_ui_1.Popover.Root {...props}/>;
};
Root.displayName = "Popover";
var Trigger = React.forwardRef(function (props, ref) {
    return <radix_ui_1.Popover.Trigger ref={ref} {...props}/>;
});
Trigger.displayName = "Popover.Trigger";
var Anchor = React.forwardRef(function (props, ref) {
    return <radix_ui_1.Popover.Anchor ref={ref} {...props}/>;
});
Anchor.displayName = "Popover.Anchor";
var Close = React.forwardRef(function (props, ref) {
    return <radix_ui_1.Popover.Close ref={ref} {...props}/>;
});
Close.displayName = "Popover.Close";
/**
 * @excludeExternal
 */
var Content = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * The distance in pixels from the anchor.
     */
    _b = _a.sideOffset, 
    /**
     * The distance in pixels from the anchor.
     */
    sideOffset = _b === void 0 ? 8 : _b, 
    /**
     * The preferred side of the anchor to render against when open.
     * Will be reversed when collisions occur and `avoidCollisions` is enabled.
     */
    _c = _a.side, 
    /**
     * The preferred side of the anchor to render against when open.
     * Will be reversed when collisions occur and `avoidCollisions` is enabled.
     */
    side = _c === void 0 ? "bottom" : _c, 
    /**
     * The preferred alignment against the anchor. May change when collisions occur.
     */
    _d = _a.align, 
    /**
     * The preferred alignment against the anchor. May change when collisions occur.
     */
    align = _d === void 0 ? "start" : _d, collisionPadding = _a.collisionPadding, props = __rest(_a, ["className", "sideOffset", "side", "align", "collisionPadding"]);
    return (<radix_ui_1.Popover.Portal>
        <radix_ui_1.Popover.Content ref={ref} sideOffset={sideOffset} side={side} align={align} collisionPadding={collisionPadding} className={(0, clx_1.clx)("bg-ui-bg-base text-ui-fg-base shadow-elevation-flyout max-h-[var(--radix-popper-available-height)] min-w-[220px] overflow-hidden rounded-lg p-1", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props}/>
      </radix_ui_1.Popover.Portal>);
});
Content.displayName = "Popover.Content";
var Seperator = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={(0, clx_1.clx)("bg-ui-border-base -mx-1 my-1 h-px", className)} {...props}/>);
});
Seperator.displayName = "Popover.Seperator";
var Popover = Object.assign(Root, {
    Trigger: Trigger,
    Anchor: Anchor,
    Close: Close,
    Content: Content,
    Seperator: Seperator,
});
exports.Popover = Popover;
