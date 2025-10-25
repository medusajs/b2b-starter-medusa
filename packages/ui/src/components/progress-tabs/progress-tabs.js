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
exports.ProgressTabs = void 0;
var icons_1 = require("@medusajs/icons");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Radix UI Tabs](https://radix-ui.com/primitives/docs/components/tabs) primitves.
 *
 */
var ProgressTabsRoot = function (props) {
    return <radix_ui_1.Tabs.Root {...props}/>;
};
ProgressTabsRoot.displayName = "ProgressTabs";
var ProgressIndicator = function (_a) {
    var status = _a.status, className = _a.className, props = __rest(_a, ["status", "className"]);
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
    return (<span className={(0, clx_1.clx)("text-ui-fg-muted group-data-[state=active]/trigger:text-ui-fg-interactive", className)} {...props}>
      <Icon />
    </span>);
};
ProgressIndicator.displayName = "ProgressTabs.ProgressIndicator";
var ProgressTabsTrigger = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, _b = _a.status, status = _b === void 0 ? "not-started" : _b, props = __rest(_a, ["className", "children", "status"]);
    return (<radix_ui_1.Tabs.Trigger ref={ref} className={(0, clx_1.clx)("txt-compact-small-plus transition-fg text-ui-fg-muted bg-ui-bg-subtle border-r-ui-border-base inline-flex h-[52px] w-full max-w-[200px] flex-1 items-center gap-x-2 border-r px-4 text-left outline-none", "group/trigger overflow-hidden text-ellipsis whitespace-nowrap", "disabled:bg-ui-bg-disabled disabled:text-ui-fg-muted", "hover:bg-ui-bg-subtle-hover", "focus-visible:bg-ui-bg-base focus:z-[1]", "data-[state=active]:text-ui-fg-base data-[state=active]:bg-ui-bg-base", className)} {...props}>
      <ProgressIndicator status={status}/>
      {children}
    </radix_ui_1.Tabs.Trigger>);
});
ProgressTabsTrigger.displayName = "ProgressTabs.Trigger";
var ProgressTabsList = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Tabs.List ref={ref} className={(0, clx_1.clx)("flex items-center", className)} {...props}/>);
});
ProgressTabsList.displayName = "ProgressTabs.List";
var ProgressTabsContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Tabs.Content ref={ref} className={(0, clx_1.clx)("outline-none", className)} {...props}/>);
});
ProgressTabsContent.displayName = "ProgressTabs.Content";
var ProgressTabs = Object.assign(ProgressTabsRoot, {
    Trigger: ProgressTabsTrigger,
    List: ProgressTabsList,
    Content: ProgressTabsContent,
});
exports.ProgressTabs = ProgressTabs;
