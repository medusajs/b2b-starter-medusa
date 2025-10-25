// yello-solar-alert.tsx - Alert component com tom Hélio
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
exports.WarningAlert = exports.InfoAlert = exports.ErrorAlert = exports.SuccessAlert = exports.YelloSolarAlert = void 0;
var clx_1 = require("@/utils/clx");
var icons_1 = require("@medusajs/icons");
var React = require("react");
var icon_button_1 = require("@/components/icon-button");
/**
 * Alert component otimizado para Yello Solar Hub com tom de voz Hélio
 * Número primeiro, adjetivo depois. Sem drama, só resultado.
 */
exports.YelloSolarAlert = React.forwardRef(function (_a, ref) {
    var 
    /**
     * The variant of the alert
     */
    _b = _a.variant, 
    /**
     * The variant of the alert
     */
    variant = _b === void 0 ? "info" : _b, 
    /**
     * Whether the alert is dismissible
     */
    _c = _a.dismissible, 
    /**
     * Whether the alert is dismissible
     */
    dismissible = _c === void 0 ? false : _c, 
    /**
     * Whether to show the icon
     */
    _d = _a.showIcon, 
    /**
     * Whether to show the icon
     */
    showIcon = _d === void 0 ? true : _d, className = _a.className, children = _a.children, props = __rest(_a, ["variant", "dismissible", "showIcon", "className", "children"]);
    var _e = React.useState(false), dismissed = _e[0], setDismissed = _e[1];
    var Icon = {
        info: icons_1.InformationCircleSolid,
        error: icons_1.XCircleSolid,
        success: icons_1.CheckCircleSolid,
        warning: icons_1.ExclamationCircleSolid,
    }[variant];
    var handleDismiss = function () {
        setDismissed(true);
    };
    if (dismissed) {
        return null;
    }
    return (<div ref={ref} className={(0, clx_1.clx)("bg-ui-bg-subtle text-pretty txt-compact-small grid items-start gap-x-2 rounded-lg border p-3", {
            "grid-cols-[20px_1fr]": !dismissible && showIcon,
            "grid-cols-[1fr]": !showIcon,
            "grid-cols-[20px_1fr_20px]": dismissible && showIcon,
            "grid-cols-[1fr_20px]": dismissible && !showIcon,
        }, className)} {...props}>
        {showIcon && (<Icon className={(0, clx_1.clx)({
                "text-ui-tag-red-icon": variant === "error",
                "text-ui-tag-green-icon": variant === "success",
                "text-ui-tag-orange-icon": variant === "warning",
                "text-ui-tag-neutral-icon": variant === "info",
            })}/>)}
        <div>{children}</div>
        {dismissible && (<icon_button_1.IconButton size="2xsmall" variant="transparent" type="button" onClick={handleDismiss}>
            <icons_1.XMarkMini className="text-ui-fg-muted"/>
          </icon_button_1.IconButton>)}
      </div>);
});
exports.YelloSolarAlert.displayName = "YelloSolarAlert";
// Componentes pré-configurados para casos comuns
var SuccessAlert = function (props) { return (<exports.YelloSolarAlert variant="success" {...props}/>); };
exports.SuccessAlert = SuccessAlert;
var ErrorAlert = function (props) { return (<exports.YelloSolarAlert variant="error" {...props}/>); };
exports.ErrorAlert = ErrorAlert;
var InfoAlert = function (props) { return (<exports.YelloSolarAlert variant="info" {...props}/>); };
exports.InfoAlert = InfoAlert;
var WarningAlert = function (props) { return (<exports.YelloSolarAlert variant="warning" {...props}/>); };
exports.WarningAlert = WarningAlert;
