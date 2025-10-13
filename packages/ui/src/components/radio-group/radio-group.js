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
exports.RadioGroup = void 0;
var radix_ui_1 = require("radix-ui");
var React = require("react");
var hint_1 = require("@/components/hint");
var label_1 = require("@/components/label");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Radix UI Radio Group](https://www.radix-ui.com/primitives/docs/components/radio-group) primitives.
 */
var Root = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.RadioGroup.Root className={(0, clx_1.clx)("grid gap-2", className)} {...props} ref={ref}/>);
});
Root.displayName = "RadioGroup";
var Indicator = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.RadioGroup.Indicator ref={ref} className={(0, clx_1.clx)("flex items-center justify-center", className)} {...props}>
      <div className={(0, clx_1.clx)("bg-ui-bg-base shadow-details-contrast-on-bg-interactive h-1.5 w-1.5 rounded-full")}/>
    </radix_ui_1.RadioGroup.Indicator>);
});
Indicator.displayName = "RadioGroup.Indicator";
var Item = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.RadioGroup.Item ref={ref} className={(0, clx_1.clx)("group relative flex h-5 w-5 items-center justify-center outline-none", className)} {...props}>
      <div className={(0, clx_1.clx)("shadow-borders-base bg-ui-bg-base transition-fg flex h-[14px] w-[14px] items-center justify-center rounded-full", "group-hover:group-enabled:group-data-[state=unchecked]:bg-ui-bg-base-hover", "group-data-[state=checked]:bg-ui-bg-interactive group-data-[state=checked]:shadow-borders-interactive-with-shadow", "group-focus-visible:!shadow-borders-interactive-with-focus", "group-disabled:cursor-not-allowed group-disabled:opacity-50")}>
        <Indicator />
      </div>
    </radix_ui_1.RadioGroup.Item>);
});
Item.displayName = "RadioGroup.Item";
/**
 * This component is based on the [Radix UI Radio Group Item](https://www.radix-ui.com/primitives/docs/components/radio-group#item) primitives.
 */
var ChoiceBox = React.forwardRef(function (_a, ref) {
    var className = _a.className, id = _a.id, 
    /**
     * The label for the radio button.
     */
    label = _a.label, 
    /**
     * The description for the radio button.
     */
    description = _a.description, 
    /**
     * The value of the radio button.
     */
    value = _a.value, props = __rest(_a, ["className", "id", "label", "description", "value"]);
    var generatedId = React.useId();
    if (!id) {
        id = generatedId;
    }
    var descriptionId = "".concat(id, "-description");
    return (<radix_ui_1.RadioGroup.Item ref={ref} className={(0, clx_1.clx)("shadow-borders-base bg-ui-bg-base focus-visible:shadow-borders-interactive-with-focus transition-fg group flex items-start gap-x-2 rounded-lg p-3 outline-none", "hover:enabled:bg-ui-bg-base-hover", "data-[state=checked]:shadow-borders-interactive-with-shadow", "group-disabled:cursor-not-allowed group-disabled:opacity-50", className)} {...props} value={value} id={id} aria-describedby={descriptionId}>
      <div className="flex h-5 w-5 items-center justify-center">
        <div className={(0, clx_1.clx)("shadow-borders-base bg-ui-bg-base group-data-[state=checked]:bg-ui-bg-interactive group-data-[state=checked]:shadow-borders-interactive-with-shadow transition-fg flex h-3.5 w-3.5 items-center justify-center rounded-full", "group-hover:group-enabled:group-data-[state=unchecked]:bg-ui-bg-base-hover")}>
          <Indicator />
        </div>
      </div>
      <div className="flex flex-col items-start">
        <label_1.Label htmlFor={id} size="small" weight="plus" className="group-disabled:text-ui-fg-disabled cursor-pointer group-disabled:cursor-not-allowed">
          {label}
        </label_1.Label>
        <hint_1.Hint className="txt-small text-ui-fg-subtle group-disabled:text-ui-fg-disabled text-left" id={descriptionId}>
          {description}
        </hint_1.Hint>
      </div>
    </radix_ui_1.RadioGroup.Item>);
});
ChoiceBox.displayName = "RadioGroup.ChoiceBox";
var RadioGroup = Object.assign(Root, { Item: Item, ChoiceBox: ChoiceBox });
exports.RadioGroup = RadioGroup;
