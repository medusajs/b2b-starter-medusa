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
exports.Drawer = void 0;
var icons_1 = require("@medusajs/icons");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var icon_button_1 = require("@/components/icon-button");
var kbd_1 = require("@/components/kbd");
var text_1 = require("@/components/text");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) primitives.
 */
var DrawerRoot = function (props) {
    return <radix_ui_1.Dialog.Root {...props}/>;
};
DrawerRoot.displayName = "Drawer";
/**
 * This component is used to create the trigger button that opens the drawer.
 * It accepts props from the [Radix UI Dialog Trigger](https://www.radix-ui.com/primitives/docs/components/dialog#trigger) component.
 */
var DrawerTrigger = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Dialog.Trigger ref={ref} className={(0, clx_1.clx)(className)} {...props}/>);
});
DrawerTrigger.displayName = "Drawer.Trigger";
/**
 * This component is used to create the close button for the drawer.
 * It accepts props from the [Radix UI Dialog Close](https://www.radix-ui.com/primitives/docs/components/dialog#close) component.
 */
var DrawerClose = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Dialog.Close ref={ref} className={(0, clx_1.clx)(className)} {...props}/>);
});
DrawerClose.displayName = "Drawer.Close";
/**
 * The `Drawer.Content` component uses this component to wrap the drawer content.
 * It accepts props from the [Radix UI Dialog Portal](https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.
 */
var DrawerPortal = function (props) {
    return <radix_ui_1.Dialog.DialogPortal {...props}/>;
};
DrawerPortal.displayName = "Drawer.Portal";
/**
 * This component is used to create the overlay for the drawer.
 * It accepts props from the [Radix UI Dialog Overlay](https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
 */
var DrawerOverlay = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Dialog.Overlay ref={ref} className={(0, clx_1.clx)("bg-ui-bg-overlay fixed inset-0", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props}/>);
});
DrawerOverlay.displayName = "Drawer.Overlay";
/**
 * This component wraps the content of the drawer.
 * It accepts props from the [Radix UI Dialog Content](https://www.radix-ui.com/primitives/docs/components/dialog#content) component.
 */
var DrawerContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, overlayProps = _a.overlayProps, portalProps = _a.portalProps, props = __rest(_a, ["className", "overlayProps", "portalProps"]);
    return (<DrawerPortal {...portalProps}>
      <DrawerOverlay {...overlayProps}/>
      <radix_ui_1.Dialog.Content ref={ref} className={(0, clx_1.clx)("bg-ui-bg-base shadow-elevation-modal border-ui-border-base fixed inset-y-2 flex w-full flex-1 flex-col rounded-lg border outline-none max-sm:inset-x-2 max-sm:w-[calc(100%-16px)] sm:right-2 sm:max-w-[560px]", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2 duration-200", className)} {...props}/>
    </DrawerPortal>);
});
DrawerContent.displayName = "Drawer.Content";
/**
 * This component is used to wrap the header content of the drawer.
 * This component is based on the `div` element and supports all of its props.
 */
var DrawerHeader = React.forwardRef(function (_a, ref) {
    var children = _a.children, className = _a.className, props = __rest(_a, ["children", "className"]);
    return (<div ref={ref} className="border-ui-border-base flex items-start justify-between gap-x-4 border-b px-6 py-4" {...props}>
      <div className={(0, clx_1.clx)("flex flex-col gap-y-1", className)}>{children}</div>
      <div className="flex items-center gap-x-2">
        <kbd_1.Kbd>esc</kbd_1.Kbd>
        <radix_ui_1.Dialog.Close asChild>
          <icon_button_1.IconButton size="small" type="button" variant="transparent">
            <icons_1.XMark />
          </icon_button_1.IconButton>
        </radix_ui_1.Dialog.Close>
      </div>
    </div>);
});
DrawerHeader.displayName = "Drawer.Header";
/**
 * This component is used to wrap the body content of the drawer.
 * This component is based on the `div` element and supports all of its props
 */
var DrawerBody = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={(0, clx_1.clx)("flex-1 px-6 py-4", className)} {...props}/>);
});
DrawerBody.displayName = "Drawer.Body";
/**
 * This component is used to wrap the footer content of the drawer.
 * This component is based on the `div` element and supports all of its props.
 */
var DrawerFooter = function (_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, clx_1.clx)("border-ui-border-base flex items-center justify-end space-x-2 overflow-y-auto border-t px-6 py-4", className)} {...props}/>);
};
DrawerFooter.displayName = "Drawer.Footer";
/**
 * This component adds an accessible title to the drawer.
 * It accepts props from the [Radix UI Dialog Title](https://www.radix-ui.com/primitives/docs/components/dialog#title) component.
 */
var DrawerTitle = radix_ui_1.Dialog.Title;
DrawerTitle.displayName = "Drawer.Title";
/**
 * This component adds accessible description to the drawer.
 * It accepts props from the [Radix UI Dialog Description](https://www.radix-ui.com/primitives/docs/components/dialog#description) component.
 */
var DrawerDescription = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<radix_ui_1.Dialog.Description ref={ref} className={(0, clx_1.clx)(className)} asChild {...props}>
    <text_1.Text>{children}</text_1.Text>
  </radix_ui_1.Dialog.Description>);
});
DrawerDescription.displayName = "Drawer.Description";
var Drawer = Object.assign(DrawerRoot, {
    Body: DrawerBody,
    Close: DrawerClose,
    Content: DrawerContent,
    Description: DrawerDescription,
    Footer: DrawerFooter,
    Header: DrawerHeader,
    Title: DrawerTitle,
    Trigger: DrawerTrigger,
});
exports.Drawer = Drawer;
