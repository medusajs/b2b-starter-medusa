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
exports.Prompt = void 0;
var radix_ui_1 = require("radix-ui");
var React = require("react");
var button_1 = require("@/components/button");
var heading_1 = require("@/components/heading");
var clx_1 = require("@/utils/clx");
var PromptContext = React.createContext({
    variant: "danger",
});
var usePromptContext = function () {
    var context = React.useContext(PromptContext);
    if (!context) {
        throw new Error("usePromptContext must be used within a PromptProvider");
    }
    return context;
};
var PromptProvider = function (_a) {
    var variant = _a.variant, children = _a.children;
    return (<PromptContext.Provider value={{ variant: variant }}>
      {children}
    </PromptContext.Provider>);
};
/**
 * This component is based on the [Radix UI Alert Dialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog) primitives.
 */
var Root = function (_a) {
    var 
    /**
     * The variant of the prompt.
     */
    _b = _a.variant, 
    /**
     * The variant of the prompt.
     */
    variant = _b === void 0 ? "danger" : _b, props = __rest(_a, ["variant"]);
    return (<PromptProvider variant={variant}>
      <radix_ui_1.AlertDialog.Root {...props}/>
    </PromptProvider>);
};
Root.displayName = "Prompt";
var Trigger = radix_ui_1.AlertDialog.Trigger;
Trigger.displayName = "Prompt.Trigger";
var Portal = function (props) {
    return <radix_ui_1.AlertDialog.AlertDialogPortal {...props}/>;
};
Portal.displayName = "Prompt.Portal";
var Overlay = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.AlertDialog.Overlay ref={ref} className={(0, clx_1.clx)("bg-ui-bg-overlay fixed inset-0", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props}/>);
});
Overlay.displayName = "Prompt.Overlay";
var Title = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<radix_ui_1.AlertDialog.Title ref={ref} className={(0, clx_1.clx)(className)} {...props} asChild>
      <heading_1.Heading level="h2" className="text-ui-fg-base">
        {children}
      </heading_1.Heading>
    </radix_ui_1.AlertDialog.Title>);
});
Title.displayName = "Prompt.Title";
var Content = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<Portal>
      <Overlay />
      <radix_ui_1.AlertDialog.Content ref={ref} className={(0, clx_1.clx)("bg-ui-bg-base shadow-elevation-flyout fixed left-[50%] top-[50%] flex w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] flex-col rounded-lg border focus-visible:outline-none", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200", className)} {...props}/>
    </Portal>);
});
Content.displayName = "Prompt.Content";
var Description = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<radix_ui_1.AlertDialog.Description ref={ref} className={(0, clx_1.clx)("text-ui-fg-subtle txt-compact-medium", className)} {...props}/>);
});
Description.displayName = "Prompt.Description";
var Action = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, type = _a.type, props = __rest(_a, ["className", "children", "type"]);
    var variant = usePromptContext().variant;
    return (<radix_ui_1.AlertDialog.Action ref={ref} className={className} {...props} asChild>
      <button_1.Button size="small" type={type} variant={variant === "danger" ? "danger" : "primary"}>
        {children}
      </button_1.Button>
    </radix_ui_1.AlertDialog.Action>);
});
Action.displayName = "Prompt.Action";
var Cancel = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<radix_ui_1.AlertDialog.Cancel ref={ref} className={(0, clx_1.clx)(className)} {...props} asChild>
      <button_1.Button size="small" variant="secondary">
        {children}
      </button_1.Button>
    </radix_ui_1.AlertDialog.Cancel>);
});
Cancel.displayName = "Prompt.Cancel";
/**
 * This component is based on the `div` element and supports all of its props
 */
var Header = function (_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, clx_1.clx)("flex flex-col gap-y-1 px-6 pt-6", className)} {...props}/>);
};
Header.displayName = "Prompt.Header";
/**
 * This component is based on the `div` element and supports all of its props
 */
var Footer = function (_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, clx_1.clx)("flex items-center justify-end gap-x-2 p-6", className)} {...props}/>);
};
Footer.displayName = "Prompt.Footer";
var Prompt = Object.assign(Root, {
    Trigger: Trigger,
    Content: Content,
    Title: Title,
    Description: Description,
    Action: Action,
    Cancel: Cancel,
    Header: Header,
    Footer: Footer,
});
exports.Prompt = Prompt;
