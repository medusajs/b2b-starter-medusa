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
exports.DropdownMenu = void 0;
var icons_1 = require("@medusajs/icons");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Radix UI Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) primitive.
 */
var Root = radix_ui_1.DropdownMenu.Root;
Root.displayName = "DropdownMenu";
/**
 * This component is based on the [Radix UI Dropdown Menu Trigger](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#trigger) primitive.
 */
var Trigger = radix_ui_1.DropdownMenu.Trigger;
Trigger.displayName = "DropdownMenu.Trigger";
/**
 * This component is based on the [Radix UI Dropdown Menu Group](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#group) primitive.
 */
var Group = radix_ui_1.DropdownMenu.Group;
Group.displayName = "DropdownMenu.Group";
/**
 * This component is based on the [Radix UI Dropdown Menu Sub](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#sub) primitive.
 */
var SubMenu = radix_ui_1.DropdownMenu.Sub;
SubMenu.displayName = "DropdownMenu.SubMenu";
/**
 * This component is based on the [Radix UI Dropdown Menu RadioGroup](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#radiogroup) primitive.
 */
var RadioGroup = radix_ui_1.DropdownMenu.RadioGroup;
RadioGroup.displayName = "DropdownMenu.RadioGroup";
/**
 * This component is based on the [Radix UI Dropdown Menu SubTrigger](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#subtrigger) primitive.
 */
var SubMenuTrigger = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<radix_ui_1.DropdownMenu.SubTrigger ref={ref} className={(0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover", "active:bg-ui-bg-component-hover", "data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none", "data-[state=open]:!bg-ui-bg-component-hover", className)} {...props}>
    {children}
    <icons_1.ChevronRightMini className="text-ui-fg-muted ml-auto"/>
  </radix_ui_1.DropdownMenu.SubTrigger>);
});
SubMenuTrigger.displayName = "DropdownMenu.SubMenuTrigger";
/**
 * This component is based on the [Radix UI Dropdown Menu SubContent](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#subcontent) primitive.
 */
var SubMenuContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, _b = _a.collisionPadding, collisionPadding = _b === void 0 ? 8 : _b, props = __rest(_a, ["className", "collisionPadding"]);
    return (<radix_ui_1.DropdownMenu.Portal>
    <radix_ui_1.DropdownMenu.SubContent ref={ref} collisionPadding={collisionPadding} className={(0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout max-h-[var(--radix-popper-available-height)] min-w-[220px] overflow-hidden rounded-lg p-1", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props}/>
  </radix_ui_1.DropdownMenu.Portal>);
});
SubMenuContent.displayName = "DropdownMenu.SubMenuContent";
/**
 * This component is based on the [Radix UI Dropdown Menu Content](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#content) primitive.
 */
var Content = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * The space in pixels between the dropdown menu and its trigger element.
     */
    _b = _a.sideOffset, 
    /**
     * The space in pixels between the dropdown menu and its trigger element.
     */
    sideOffset = _b === void 0 ? 8 : _b, 
    /**
     * The distance in pixels from the boundary edges where collision detection should occur.
     */
    _c = _a.collisionPadding, 
    /**
     * The distance in pixels from the boundary edges where collision detection should occur.
     */
    collisionPadding = _c === void 0 ? 8 : _c, 
    /**
     * The alignment of the dropdown menu relative to its trigger element.
     *
     * @defaultValue center
     */
    _d = _a.align, 
    /**
     * The alignment of the dropdown menu relative to its trigger element.
     *
     * @defaultValue center
     */
    align = _d === void 0 ? "center" : _d, props = __rest(_a, ["className", "sideOffset", "collisionPadding", "align"]);
    return (<radix_ui_1.DropdownMenu.Portal>
      <radix_ui_1.DropdownMenu.Content ref={ref} sideOffset={sideOffset} align={align} collisionPadding={collisionPadding} className={(0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout max-h-[var(--radix-popper-available-height)] min-w-[220px] overflow-hidden rounded-lg p-1", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props}/>
    </radix_ui_1.DropdownMenu.Portal>);
});
Content.displayName = "DropdownMenu.Content";
/**
 * This component is based on the [Radix UI Dropdown Menu Item](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#item) primitive.
 */
var Item = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.DropdownMenu.Item ref={ref} className={(0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover", "active:bg-ui-bg-component-hover", "data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none", className)} {...props}/>);
});
Item.displayName = "DropdownMenu.Item";
/**
 * This component is based on the [Radix UI Dropdown Menu CheckboxItem](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#checkboxitem) primitive.
 */
var CheckboxItem = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, checked = _a.checked, props = __rest(_a, ["className", "children", "checked"]);
    return (<radix_ui_1.DropdownMenu.CheckboxItem ref={ref} className={(0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-[31px] pr-2 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover", "active:bg-ui-bg-component-hover", "data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none", "data-[state=checked]:txt-compact-small-plus", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex size-[15px] items-center justify-center">
      <radix_ui_1.DropdownMenu.ItemIndicator>
        <icons_1.CheckMini />
      </radix_ui_1.DropdownMenu.ItemIndicator>
    </span>
    {children}
  </radix_ui_1.DropdownMenu.CheckboxItem>);
});
CheckboxItem.displayName = "DropdownMenu.CheckboxItem";
/**
 * This component is based on the [Radix UI Dropdown Menu RadioItem](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#radioitem) primitive.
 */
var RadioItem = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<radix_ui_1.DropdownMenu.RadioItem ref={ref} className={(0, clx_1.clx)("bg-ui-bg-component txt-compact-small relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-[31px] pr-2 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover", "active:bg-ui-bg-component-hover", "data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none", "data-[state=checked]:txt-compact-small-plus", className)} {...props}>
    <span className="absolute left-2 flex size-[15px] items-center justify-center">
      <radix_ui_1.DropdownMenu.ItemIndicator>
        <icons_1.EllipseMiniSolid className="text-ui-fg-base"/>
      </radix_ui_1.DropdownMenu.ItemIndicator>
    </span>
    {children}
  </radix_ui_1.DropdownMenu.RadioItem>);
});
RadioItem.displayName = "DropdownMenu.RadioItem";
/**
 * This component is based on the [Radix UI Dropdown Menu Label](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#label) primitive.
 */
var Label = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.DropdownMenu.Label ref={ref} className={(0, clx_1.clx)("text-ui-fg-subtle txt-compact-xsmall-plus", className)} {...props}/>);
});
Label.displayName = "DropdownMenu.Label";
/**
 * This component is based on the [Radix UI Dropdown Menu Separator](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#separator) primitive.
 */
var Separator = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.DropdownMenu.Separator ref={ref} className={(0, clx_1.clx)("bg-ui-border-component border-t-ui-border-menu-top border-b-ui-border-menu-bot -mx-1 my-1 h-0.5 border-b border-t", className)} {...props}/>);
});
Separator.displayName = "DropdownMenu.Separator";
/**
 * This component is based on the `span` element and supports all of its props
 */
var Shortcut = function (_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<span className={(0, clx_1.clx)("text-ui-fg-subtle txt-compact-small ml-auto tracking-widest", className)} {...props}/>);
};
Shortcut.displayName = "DropdownMenu.Shortcut";
/**
 * This component is based on the `span` element and supports all of its props
 */
var Hint = function (_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<span className={(0, clx_1.clx)("text-ui-fg-subtle txt-compact-small ml-auto tracking-widest", className)} {...props}/>);
};
Hint.displayName = "DropdownMenu.Hint";
var DropdownMenu = Object.assign(Root, {
    Trigger: Trigger,
    Group: Group,
    SubMenu: SubMenu,
    SubMenuContent: SubMenuContent,
    SubMenuTrigger: SubMenuTrigger,
    Content: Content,
    Item: Item,
    CheckboxItem: CheckboxItem,
    RadioGroup: RadioGroup,
    RadioItem: RadioItem,
    Label: Label,
    Separator: Separator,
    Shortcut: Shortcut,
    Hint: Hint,
});
exports.DropdownMenu = DropdownMenu;
