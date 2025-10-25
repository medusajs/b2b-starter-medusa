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
exports.Checkbox = void 0;
var icons_1 = require("@medusajs/icons");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Radix UI Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox) primitive.
 */
var Checkbox = React.forwardRef(function (_a, ref) {
    var className = _a.className, checked = _a.checked, props = __rest(_a, ["className", "checked"]);
    return (<radix_ui_1.Checkbox.Root {...props} ref={ref} checked={checked} className={(0, clx_1.clx)("group inline-flex h-5 w-5 items-center justify-center outline-none ", className)}>
      <div className={(0, clx_1.clx)("text-ui-fg-on-inverted bg-ui-bg-base shadow-borders-base [&_path]:shadow-details-contrast-on-bg-interactive transition-fg h-[15px] w-[15px] rounded-[3px]", "group-disabled:cursor-not-allowed group-disabled:opacity-50", "group-focus-visible:!shadow-borders-interactive-with-focus", "group-hover:group-enabled:group-data-[state=unchecked]:bg-ui-bg-base-hover", "group-data-[state=checked]:bg-ui-bg-interactive group-data-[state=checked]:shadow-borders-interactive-with-shadow", "group-data-[state=indeterminate]:bg-ui-bg-interactive group-data-[state=indeterminate]:shadow-borders-interactive-with-shadow")}>
        <radix_ui_1.Checkbox.Indicator>
          {checked === "indeterminate" ? <icons_1.MinusMini /> : <icons_1.CheckMini />}
        </radix_ui_1.Checkbox.Indicator>
      </div>
    </radix_ui_1.Checkbox.Root>);
});
exports.Checkbox = Checkbox;
Checkbox.displayName = "Checkbox";
