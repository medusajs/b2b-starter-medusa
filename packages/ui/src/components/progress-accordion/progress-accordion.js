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
exports.ProgressAccordion = void 0;
var icons_1 = require("@medusajs/icons");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var icon_button_1 = require("../icon-button");
/**
 * This component is based on the [Radix UI Accordion](https://radix-ui.com/primitives/docs/components/accordion) primitves.
 */
var Root = function (props) {
    return <radix_ui_1.Accordion.Root {...props}/>;
};
Root.displayName = "ProgressAccordion";
var Item = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Accordion.Item ref={ref} className={(0, clx_1.clx)("border-ui-border-base border-b last-of-type:border-b-0", className)} {...props}/>);
});
Item.displayName = "ProgressAccordion.Item";
var ProgressIndicator = function (_a) {
    var 
    /**
     * The current status.
     */
    status = _a.status, props = __rest(_a, ["status"]);
    var Icon = React.useMemo(function () {
        switch (status) {
            case "not-started":
                return icons_1.CircleDottedLine;
            case "in-progress":
                return icons_1.CircleHalfSolid;
            case "completed":
                return icons_1.CheckCircleSolid;
            default:
                return icons_1.CircleDottedLine;
        }
    }, [status]);
    return (<span className="text-ui-fg-muted group-data-[state=open]:text-ui-fg-interactive flex h-12 w-12 items-center justify-center" {...props}>
      <Icon />
    </span>);
};
ProgressIndicator.displayName = "ProgressAccordion.ProgressIndicator";
var Header = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * The current status.
     */
    _b = _a.status, 
    /**
     * The current status.
     */
    status = _b === void 0 ? "not-started" : _b, children = _a.children, props = __rest(_a, ["className", "status", "children"]);
    return (<radix_ui_1.Accordion.Header ref={ref} className={(0, clx_1.clx)("h3-core text-ui-fg-base group flex w-full flex-1 items-center gap-4 px-6", className)} {...props}>
        <ProgressIndicator status={status}/>
        {children}
        <radix_ui_1.Accordion.Trigger asChild className="ml-auto">
          <icon_button_1.IconButton variant="transparent">
            <icons_1.Plus className="transform transition-transform group-data-[state=open]:rotate-45"/>
          </icon_button_1.IconButton>
        </radix_ui_1.Accordion.Trigger>
      </radix_ui_1.Accordion.Header>);
});
Header.displayName = "ProgressAccordion.Header";
var Content = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Accordion.Content ref={ref} className={(0, clx_1.clx)("overflow-hidden", "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down pl-[88px] pr-6", className)} {...props}/>);
});
Content.displayName = "ProgressAccordion.Content";
var ProgressAccordion = Object.assign(Root, {
    Item: Item,
    Header: Header,
    Content: Content,
});
exports.ProgressAccordion = ProgressAccordion;
