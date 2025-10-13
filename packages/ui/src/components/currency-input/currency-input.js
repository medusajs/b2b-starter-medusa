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
exports.CurrencyInput = void 0;
var React = require("react");
var react_currency_input_field_1 = require("react-currency-input-field");
var text_1 = require("@/components/text");
var clx_1 = require("@/utils/clx");
var cva_1 = require("cva");
var currencyInputVariants = (0, cva_1.cva)({
    base: (0, clx_1.clx)("flex items-center gap-x-1", "bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-buttons-neutral placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full rounded-md", "focus-within:shadow-borders-interactive-with-active"),
    variants: {
        size: {
            base: "txt-compact-medium h-8",
            small: "txt-compact-small h-7",
        },
    },
    defaultVariants: {
        size: "base",
    },
});
/**
 * This component is based on the input element and supports all of its props
 *
 * @excludeExternal
 */
var CurrencyInput = React.forwardRef(function (_a, ref) {
    var 
    /**
     * The input's size.
     */
    _b = _a.size, 
    /**
     * The input's size.
     */
    size = _b === void 0 ? "base" : _b, 
    /**
     * The symbol to show in the input.
     */
    symbol = _a.symbol, 
    /**
     * The currency code to show in the input.
     */
    code = _a.code, 
    /**
     * Whether the input is disabled.
     *
     * @keep
     * @defaultValue false
     */
    disabled = _a.disabled, 
    /**
     * A function that is triggered when the input is invalid.
     *
     * @keep
     */
    onInvalid = _a.onInvalid, className = _a.className, props = __rest(_a, ["size", "symbol", "code", "disabled", "onInvalid", "className"]);
    var innerRef = React.useRef(null);
    React.useImperativeHandle(ref, function () { return innerRef.current; });
    var _c = React.useState(true), valid = _c[0], setValid = _c[1];
    var onInnerInvalid = React.useCallback(function (event) {
        setValid(event.currentTarget.validity.valid);
        if (onInvalid) {
            onInvalid(event);
        }
    }, [onInvalid]);
    return (<div onClick={function () {
            if (innerRef.current) {
                innerRef.current.focus();
            }
        }} className={(0, clx_1.clx)("w-full cursor-text justify-between overflow-hidden", currencyInputVariants({ size: size }), {
            "text-ui-fg-disabled !bg-ui-bg-disabled !shadow-buttons-neutral !placeholder-ui-fg-disabled cursor-not-allowed": disabled,
            "!shadow-borders-error invalid:!shadow-borders-error": props["aria-invalid"] || !valid,
        }, className)}>
        <span className={(0, clx_1.clx)("w-fit min-w-[32px] border-r px-2", {
            "py-[9px]": size === "base",
            "py-[5px]": size === "small",
        })} role="presentation">
          <text_1.Text size="small" leading="compact" className={(0, clx_1.clx)("text-ui-fg-muted pointer-events-none select-none uppercase", {
            "text-ui-fg-disabled": disabled,
        })}>
            {code}
          </text_1.Text>
        </span>
        <react_currency_input_field_1.default className="h-full min-w-0 flex-1 appearance-none bg-transparent text-right outline-none disabled:cursor-not-allowed" disabled={disabled} onInvalid={onInnerInvalid} ref={innerRef} {...props}/>
        <span className={(0, clx_1.clx)("flex w-fit min-w-[32px] items-center justify-center border-l px-2 text-right", {
            "py-[9px]": size === "base",
            "py-[5px]": size === "small",
        })} role="presentation">
          <text_1.Text size="small" leading="compact" className={(0, clx_1.clx)("text-ui-fg-muted pointer-events-none select-none", {
            "text-ui-fg-disabled": disabled,
        })}>
            {symbol}
          </text_1.Text>
        </span>
      </div>);
});
exports.CurrencyInput = CurrencyInput;
CurrencyInput.displayName = "CurrencyInput";
