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
exports.Select = void 0;
var icons_1 = require("@medusajs/icons");
var cva_1 = require("cva");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
var SelectContext = React.createContext(null);
var useSelectContext = function () {
    var context = React.useContext(SelectContext);
    if (context === null) {
        throw new Error("useSelectContext must be used within a SelectProvider");
    }
    return context;
};
/**
 * This component is based on [Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select).
 * It also accepts all props of the HTML `select` component.
 */
var Root = function (_a) {
    var children = _a.children, 
    /**
     * The select's size.
     */
    _b = _a.size, 
    /**
     * The select's size.
     */
    size = _b === void 0 ? "base" : _b, props = __rest(_a, ["children", "size"]);
    return (<SelectContext.Provider value={React.useMemo(function () { return ({ size: size }); }, [size])}>
      <radix_ui_1.Select.Root {...props}>{children}</radix_ui_1.Select.Root>
    </SelectContext.Provider>);
};
Root.displayName = "Select";
/**
 * Groups multiple items together.
 */
var Group = radix_ui_1.Select.Group;
Group.displayName = "Select.Group";
/**
 * Displays the selected value, or a placeholder if no value is selected.
 * It's based on [Radix UI Select Value](https://www.radix-ui.com/primitives/docs/components/select#value).
 */
var Value = radix_ui_1.Select.Value;
Value.displayName = "Select.Value";
var triggerVariants = (0, cva_1.cva)({
    base: (0, clx_1.clx)("bg-ui-bg-field shadow-buttons-neutral transition-fg flex w-full select-none items-center justify-between rounded-md outline-none", "data-[placeholder]:text-ui-fg-muted text-ui-fg-base", "hover:bg-ui-bg-field-hover", "focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active", "aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error", "invalid:border-ui-border-error invalid:shadow-borders-error", "disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled", "group/trigger"),
    variants: {
        size: {
            base: "h-8 px-2 py-1.5 txt-compact-small",
            small: "h-7 px-2 py-1 txt-compact-small",
        },
    },
});
/**
 * The trigger that toggles the select.
 * It's based on [Radix UI Select Trigger](https://www.radix-ui.com/primitives/docs/components/select#trigger).
 */
var Trigger = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    var size = useSelectContext().size;
    return (<radix_ui_1.Select.Trigger ref={ref} className={(0, clx_1.clx)(triggerVariants({ size: size }), className)} {...props}>
      {children}
      <radix_ui_1.Select.Icon asChild>
        <icons_1.TrianglesMini className="text-ui-fg-muted group-disabled/trigger:text-ui-fg-disabled"/>
      </radix_ui_1.Select.Icon>
    </radix_ui_1.Select.Trigger>);
});
Trigger.displayName = "Select.Trigger";
/**
 * The content that appears when the select is open.
 * It's based on [Radix UI Select Content](https://www.radix-ui.com/primitives/docs/components/select#content).
 */
var Content = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, onScroll = _a.onScroll, 
    /**
     * Whether to show the select items below (`popper`) or over (`item-aligned`) the select input.
     */
    _b = _a.position, 
    /**
     * Whether to show the select items below (`popper`) or over (`item-aligned`) the select input.
     */
    position = _b === void 0 ? "popper" : _b, 
    /**
     * The distance of the content pop-up in pixels from the select input. Only available when position is set to popper.
     */
    _c = _a.sideOffset, 
    /**
     * The distance of the content pop-up in pixels from the select input. Only available when position is set to popper.
     */
    sideOffset = _c === void 0 ? 8 : _c, 
    /**
     * The distance in pixels from the boundary edges where collision detection should occur. Only available when position is set to popper.
     */
    _d = _a.collisionPadding, 
    /**
     * The distance in pixels from the boundary edges where collision detection should occur. Only available when position is set to popper.
     */
    collisionPadding = _d === void 0 ? 24 : _d, props = __rest(_a, ["className", "children", "onScroll", "position", "sideOffset", "collisionPadding"]);
    return (<radix_ui_1.Select.Portal>
      <radix_ui_1.Select.Content ref={ref} className={(0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout relative max-h-[200px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg", "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", {
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1": position === "popper",
        }, className)} position={position} sideOffset={sideOffset} collisionPadding={collisionPadding} {...props}>
        <radix_ui_1.Select.Viewport className={(0, clx_1.clx)("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")} onScroll={onScroll}>
          {children}
        </radix_ui_1.Select.Viewport>
      </radix_ui_1.Select.Content>
    </radix_ui_1.Select.Portal>);
});
Content.displayName = "Select.Content";
/**
 * Used to label a group of items.
 * It's based on [Radix UI Select Label](https://www.radix-ui.com/primitives/docs/components/select#label).
 */
var Label = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Select.Label ref={ref} className={(0, clx_1.clx)("txt-compact-xsmall-plus text-ui-fg-muted px-2 py-1.5", className)} {...props}/>);
});
Label.displayName = "Select.Label";
/**
 * An item in the select. It's based on [Radix UI Select Item](https://www.radix-ui.com/primitives/docs/components/select#item)
 * and accepts its props.
 */
var Item = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<radix_ui_1.Select.Item ref={ref} className={(0, clx_1.clx)("bg-ui-bg-component txt-compact-small grid cursor-pointer grid-cols-[15px_1fr] items-center gap-x-2 rounded-[4px] px-2 py-1.5 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover", "active:bg-ui-bg-component-pressed", "data-[state=checked]:txt-compact-small-plus", "disabled:text-ui-fg-disabled", className)} {...props}>
      <span className="flex h-[15px] w-[15px] items-center justify-center">
        <radix_ui_1.Select.ItemIndicator className="flex items-center justify-center">
          <icons_1.Check />
        </radix_ui_1.Select.ItemIndicator>
      </span>
      <radix_ui_1.Select.ItemText className="flex-1 truncate">
        {children}
      </radix_ui_1.Select.ItemText>
    </radix_ui_1.Select.Item>);
});
Item.displayName = "Select.Item";
var Separator = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Select.Separator ref={ref} className={(0, clx_1.clx)("bg-ui-border-component border-t-ui-border-menu-top border-b-ui-border-menu-bot -mx-1 my-1 h-0.5 border-b border-t", className)} {...props}/>);
});
Separator.displayName = "Select.Separator";
var Select = Object.assign(Root, {
    Group: Group,
    Value: Value,
    Trigger: Trigger,
    Content: Content,
    Label: Label,
    Item: Item,
    Separator: Separator,
});
exports.Select = Select;
