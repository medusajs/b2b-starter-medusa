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
exports.CommandBar = void 0;
var radix_ui_1 = require("radix-ui");
var React = require("react");
var kbd_1 = require("@/components/kbd");
var clx_1 = require("@/utils/clx");
var is_input_element_1 = require("@/utils/is-input-element");
/**
 * The root component of the command bar. This component manages the state of the command bar.
 */
var Root = function (_a) {
    var 
    /**
     * Whether to open (show) the command bar.
     */
    _b = _a.open, 
    /**
     * Whether to open (show) the command bar.
     */
    open = _b === void 0 ? false : _b, 
    /**
     * Specify a function to handle the change of `open`'s value.
     */
    onOpenChange = _a.onOpenChange, 
    /**
     * Whether the command bar is open by default.
     */
    _c = _a.defaultOpen, 
    /**
     * Whether the command bar is open by default.
     */
    defaultOpen = _c === void 0 ? false : _c, 
    /**
     * Whether to disable focusing automatically on the command bar when it's opened.
     */
    _d = _a.disableAutoFocus, 
    /**
     * Whether to disable focusing automatically on the command bar when it's opened.
     */
    disableAutoFocus = _d === void 0 ? true : _d, children = _a.children;
    return (<radix_ui_1.Popover.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
      <radix_ui_1.Portal.Root>
        <radix_ui_1.Popover.Anchor className={(0, clx_1.clx)("fixed bottom-8 left-1/2 h-px w-px -translate-x-1/2")}/>
      </radix_ui_1.Portal.Root>
      <radix_ui_1.Popover.Portal>
        <radix_ui_1.Popover.Content side="top" sideOffset={0} onOpenAutoFocus={function (e) {
            if (disableAutoFocus) {
                e.preventDefault();
            }
        }} className={(0, clx_1.clx)("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2")}>
          {children}
        </radix_ui_1.Popover.Content>
      </radix_ui_1.Popover.Portal>
    </radix_ui_1.Popover.Root>);
};
Root.displayName = "CommandBar";
/**
 * The value component of the command bar. This component is used to display a value,
 * such as the number of selected items which the commands will act on.
 */
var Value = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={(0, clx_1.clx)("txt-compact-small-plus text-ui-contrast-fg-secondary px-3 py-2.5", className)} {...props}/>);
});
Value.displayName = "CommandBar.Value";
/**
 * The bar component of the command bar. This component is used to display the commands.
 */
var Bar = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={(0, clx_1.clx)("bg-ui-contrast-bg-base relative flex items-center overflow-hidden rounded-full px-1", "after:shadow-elevation-flyout after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:content-['']", className)} {...props}/>);
});
Bar.displayName = "CommandBar.Bar";
/**
 * The seperator component of the command bar. This component is used to display a seperator between commands.
 */
var Seperator = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={(0, clx_1.clx)("bg-ui-contrast-border-base h-10 w-px", className)} {...props}/>);
});
Seperator.displayName = "CommandBar.Seperator";
/**
 * The command component of the command bar. This component is used to display a command, as well as registering the keyboad shortcut.
 */
var Command = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * @ignore
     */
    _b = _a.type, 
    /**
     * @ignore
     */
    type = _b === void 0 ? "button" : _b, 
    /**
     * The command's label.
     */
    label = _a.label, 
    /**
     * The function to execute when the command is triggered.
     */
    action = _a.action, 
    /**
     * The command's shortcut
     */
    shortcut = _a.shortcut, disabled = _a.disabled, props = __rest(_a, ["className", "type", "label", "action", "shortcut", "disabled"]);
    React.useEffect(function () {
        var handleKeyDown = function (event) {
            if ((0, is_input_element_1.isInputElement)(document.activeElement)) {
                return;
            }
            if (event.key.toLowerCase() === shortcut.toLowerCase()) {
                event.preventDefault();
                event.stopPropagation();
                action();
            }
        };
        if (!disabled) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return function () {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [action, shortcut, disabled]);
    return (<button ref={ref} className={(0, clx_1.clx)("bg-ui-contrast-bg-base txt-compact-small-plus transition-fg text-ui-contrast-fg-primary flex items-center gap-x-2 px-3 py-2.5 outline-none", "focus-visible:bg-ui-contrast-bg-highlight focus-visible:hover:bg-ui-contrast-bg-base-hover hover:bg-ui-contrast-bg-base-hover active:bg-ui-contrast-bg-base-pressed focus-visible:active:bg-ui-contrast-bg-base-pressed disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled", "last-of-type:-mr-1 last-of-type:pr-4", className)} type={type} onClick={action} {...props}>
        <span>{label}</span>
        <kbd_1.Kbd className="bg-ui-contrast-bg-subtle border-ui-contrast-border-base text-ui-contrast-fg-secondary">
          {shortcut.toUpperCase()}
        </kbd_1.Kbd>
      </button>);
});
Command.displayName = "CommandBar.Command";
var CommandBar = Object.assign(Root, {
    Command: Command,
    Value: Value,
    Bar: Bar,
    Seperator: Seperator,
});
exports.CommandBar = CommandBar;
