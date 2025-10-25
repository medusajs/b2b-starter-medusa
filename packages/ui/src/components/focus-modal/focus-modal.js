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
exports.FocusModal = void 0;
var icons_1 = require("@medusajs/icons");
var radix_ui_1 = require("radix-ui");
var React = require("react");
var icon_button_1 = require("@/components/icon-button");
var kbd_1 = require("@/components/kbd");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) primitives.
 */
var FocusModalRoot = function (props) {
    return <radix_ui_1.Dialog.Root {...props}/>;
};
FocusModalRoot.displayName = "FocusModal";
/**
 * This component is used to create the trigger button that opens the modal.
 * It accepts props from the [Radix UI Dialog Trigger](https://www.radix-ui.com/primitives/docs/components/dialog#trigger) component.
 */
var FocusModalTrigger = React.forwardRef(function (props, ref) {
    return <radix_ui_1.Dialog.Trigger ref={ref} {...props}/>;
});
FocusModalTrigger.displayName = "FocusModal.Trigger";
/**
 * This component is used to create the close button for the modal.
 * It accepts props from the [Radix UI Dialog Close](https://www.radix-ui.com/primitives/docs/components/dialog#close) component.
 */
var FocusModalClose = radix_ui_1.Dialog.Close;
FocusModalClose.displayName = "FocusModal.Close";
/**
 * The `FocusModal.Content` component uses this component to wrap the modal content.
 * It accepts props from the [Radix UI Dialog Portal](https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.
 */
var FocusModalPortal = function (props) {
    return (<radix_ui_1.Dialog.DialogPortal {...props}/>);
};
FocusModalPortal.displayName = "FocusModal.Portal";
/**
 * This component is used to create the overlay for the modal.
 * It accepts props from the [Radix UI Dialog Overlay](https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
 */
var FocusModalOverlay = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Dialog.Overlay ref={ref} className={(0, clx_1.clx)("bg-ui-bg-overlay fixed inset-0", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props}/>);
});
FocusModalOverlay.displayName = "FocusModal.Overlay";
/**
 * This component wraps the content of the modal.
 * It accepts props from the [Radix UI Dialog Content](https://www.radix-ui.com/primitives/docs/components/dialog#content) component.
 */
var FocusModalContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, overlayProps = _a.overlayProps, portalProps = _a.portalProps, props = __rest(_a, ["className", "overlayProps", "portalProps"]);
    return (<FocusModalPortal {...portalProps}>
      <FocusModalOverlay {...overlayProps}/>
      <radix_ui_1.Dialog.Content ref={ref} className={(0, clx_1.clx)("bg-ui-bg-base shadow-elevation-modal fixed inset-2 flex flex-col overflow-hidden rounded-lg border outline-none", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-in-from-bottom-2  duration-200", className)} {...props}/>
    </FocusModalPortal>);
});
FocusModalContent.displayName = "FocusModal.Content";
/**
 * This component is used to wrap the header content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
var FocusModalHeader = React.forwardRef(function (_a, ref) {
    var children = _a.children, className = _a.className, props = __rest(_a, ["children", "className"]);
    return (<div ref={ref} className={(0, clx_1.clx)("border-ui-border-base flex items-center justify-between gap-x-4 border-b px-4 py-2", className)} {...props}>
      <div className="flex items-center gap-x-2">
        <radix_ui_1.Dialog.Close asChild>
          <icon_button_1.IconButton size="small" type="button" variant="transparent">
            <icons_1.XMark />
          </icon_button_1.IconButton>
        </radix_ui_1.Dialog.Close>
        <kbd_1.Kbd>esc</kbd_1.Kbd>
      </div>
      {children}
    </div>);
});
FocusModalHeader.displayName = "FocusModal.Header";
/**
 * This component is used to wrap the footer content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
var FocusModalFooter = React.forwardRef(function (_a, ref) {
    var children = _a.children, className = _a.className, props = __rest(_a, ["children", "className"]);
    return (<div ref={ref} className={(0, clx_1.clx)("border-ui-border-base flex items-center justify-end gap-x-2 border-t p-4", className)} {...props}>
      {children}
    </div>);
});
FocusModalFooter.displayName = "FocusModal.Footer";
/**
 * This component adds an accessible title to the modal.
 * It accepts props from the [Radix UI Dialog Title](https://www.radix-ui.com/primitives/docs/components/dialog#title) component.
 */
var FocusModalTitle = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.Dialog.Title ref={ref} {...props}/>);
});
FocusModalTitle.displayName = "FocusModal.Title";
/**
 * This component adds accessible description to the modal.
 * It accepts props from the [Radix UI Dialog Description](https://www.radix-ui.com/primitives/docs/components/dialog#description) component.
 */
var FocusModalDescription = radix_ui_1.Dialog.Description;
FocusModalDescription.displayName = "FocusModal.Description";
/**
 * This component is used to wrap the body content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
var FocusModalBody = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return <div ref={ref} className={(0, clx_1.clx)("flex-1", className)} {...props}/>;
});
FocusModalBody.displayName = "FocusModal.Body";
var FocusModal = Object.assign(FocusModalRoot, {
    Trigger: FocusModalTrigger,
    Title: FocusModalTitle,
    Description: FocusModalDescription,
    Content: FocusModalContent,
    Header: FocusModalHeader,
    Body: FocusModalBody,
    Close: FocusModalClose,
    Footer: FocusModalFooter,
});
exports.FocusModal = FocusModal;
