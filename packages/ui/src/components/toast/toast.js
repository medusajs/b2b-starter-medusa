"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toast = void 0;
var icons_1 = require("@medusajs/icons");
var React = require("react");
var sonner_1 = require("sonner");
var icon_button_1 = require("@/components/icon-button");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the [Sonner](https://sonner.emilkowal.ski/toast) toast library.
 */
var Toast = function (_a) {
    var 
    /**
     * Optional ID of the toast.
     */
    id = _a.id, 
    /**
     * @ignore
     *
     * @privateRemarks
     * As the Toast component is created using
     * the `toast` utility functions, the variant is inferred
     * from the utility function.
     */
    _b = _a.variant, 
    /**
     * @ignore
     *
     * @privateRemarks
     * As the Toast component is created using
     * the `toast` utility functions, the variant is inferred
     * from the utility function.
     */
    variant = _b === void 0 ? "info" : _b, 
    /**
     * @ignore
     *
     * @privateRemarks
     * The `toast` utility functions accept this as a parameter.
     */
    title = _a.title, 
    /**
     * @ignore
     *
     * @privateRemarks
     * The `toast` utility functions accept this as a parameter.
     */
    _icon = _a.icon, 
    /**
     * The toast's text.
     */
    description = _a.description, 
    /**
     * The toast's action buttons.
     */
    action = _a.action, 
    /**
     * @ignore
     *
     * @privateRemarks
     * The `toast` utility functions accept this as a parameter.
     */
    _c = _a.dismissable, 
    /**
     * @ignore
     *
     * @privateRemarks
     * The `toast` utility functions accept this as a parameter.
     */
    dismissable = _c === void 0 ? true : _c;
    var icon = _icon;
    if (!_icon) {
        switch (variant) {
            case "success":
                icon = <icons_1.CheckCircleSolid className="text-ui-tag-green-icon"/>;
                break;
            case "warning":
                icon = <icons_1.ExclamationCircleSolid className="text-ui-tag-orange-icon"/>;
                break;
            case "error":
                icon = <icons_1.XCircleSolid className="text-ui-tag-red-icon"/>;
                break;
            case "loading":
                icon = <icons_1.Spinner className="text-ui-tag-blue-icon animate-spin"/>;
                break;
            case "info":
                icon = <icons_1.InformationCircleSolid className="text-ui-fg-base"/>;
                break;
            default:
                break;
        }
    }
    return (<div className="shadow-elevation-flyout bg-ui-bg-component flex w-fit min-w-[360px] max-w-[440px] gap-x-3 overflow-hidden rounded-lg p-3">
      <div className={(0, clx_1.clx)("grid flex-1 items-center gap-x-2", {
            "grid-cols-[20px_1fr]": !!icon,
            "grid-cols-1": !icon,
            "items-start": !!description,
        })}>
        {!!icon && (<span className="flex size-5 items-center justify-center" aria-hidden>
            {icon}
          </span>)}
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-col">
            <span className="txt-compact-small-plus text-ui-fg-base">
              {title}
            </span>
            {description && (<span className="txt-small text-ui-fg-subtle text-pretty">
                {description}
              </span>)}
          </div>
          {!!action && (<button type="button" className={(0, clx_1.clx)("txt-compact-small-plus text-ui-fg-base bg-ui-bg-base flex w-fit items-center rounded-[4px] transition-colors", "focus-visible:shadow-borders-focus", "hover:text-ui-fg-subtle", "disabled:text-ui-fg-disabled", {
                "text-ui-fg-error": action.variant === "destructive",
            })} onClick={action.onClick}>
              {action.label}
            </button>)}
        </div>
      </div>
      {!!dismissable && (<icon_button_1.IconButton size="2xsmall" variant="transparent" type="button" onClick={function () { return sonner_1.toast.dismiss(id); }}>
          <icons_1.XMark />
        </icon_button_1.IconButton>)}
    </div>);
};
exports.Toast = Toast;
