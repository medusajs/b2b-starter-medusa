"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableFilter = void 0;
var icons_1 = require("@medusajs/icons");
var React = require("react");
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
var is_date_comparison_operator_1 = require("@/blocks/data-table/utils/is-date-comparison-operator");
var date_picker_1 = require("@/components/date-picker");
var label_1 = require("@/components/label");
var popover_1 = require("@/components/popover");
var input_1 = require("@/components/input");
var select_1 = require("@/components/select");
var checkbox_1 = require("@/components/checkbox");
var clx_1 = require("@/utils/clx");
var DEFAULT_FORMAT_DATE_VALUE = function (d) {
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
var DEFAULT_RANGE_OPTION_LABEL = "Custom";
var DEFAULT_RANGE_OPTION_START_LABEL = "Starting";
var DEFAULT_RANGE_OPTION_END_LABEL = "Ending";
var DataTableFilter = function (_a) {
    var id = _a.id, filter = _a.filter, _b = _a.isNew, isNew = _b === void 0 ? false : _b, onUpdate = _a.onUpdate, onRemove = _a.onRemove;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    // Initialize open state based on isNew prop
    var _c = React.useState(isNew), open = _c[0], setOpen = _c[1];
    var _d = React.useState(false), hasInteracted = _d[0], setHasInteracted = _d[1];
    var meta = instance.getFilterMeta(id);
    if (!meta) {
        return null;
    }
    var type = meta.type, label = meta.label, rest = __rest(meta, ["type", "label"]);
    var options = meta.options;
    // Helper to check if filter has a meaningful value
    var hasValue = React.useMemo(function () {
        if (filter === null || filter === undefined)
            return false;
        if (typeof filter === "string" && filter === "")
            return false;
        if (Array.isArray(filter) && filter.length === 0)
            return false;
        if (typeof filter === "number")
            return true;
        if ((0, is_date_comparison_operator_1.isDateComparisonOperator)(filter)) {
            return !!(filter.$gte || filter.$lte || filter.$gt || filter.$lt);
        }
        if (typeof filter === "object" && filter !== null) {
            // For number comparison operators
            var keys = Object.keys(filter);
            return keys.length > 0 && filter[keys[0]] !== null && filter[keys[0]] !== undefined;
        }
        return true;
    }, [filter]);
    var onOpenChange = React.useCallback(function (newOpen) {
        setOpen(newOpen);
        // Mark as interacted when user closes
        if (!newOpen && open) {
            setHasInteracted(true);
        }
        // If closing without a value, remove filter
        // For new filters that haven't been interacted with, remove immediately
        if (!newOpen && !hasValue) {
            // Only remove if it's a new filter being closed without interaction,
            // or if it's an existing filter with no value
            if ((isNew && !hasInteracted) || !isNew) {
                if (onRemove) {
                    onRemove();
                }
                else {
                    instance.removeFilter(id);
                }
            }
        }
    }, [instance, id, open, hasInteracted, isNew, hasValue, onRemove]);
    var removeFilter = React.useCallback(function () {
        if (onRemove) {
            onRemove();
        }
        else {
            instance.removeFilter(id);
        }
    }, [instance, id, onRemove]);
    var _e = React.useMemo(function () {
        var _a, _b, _c, _d, _e;
        var displayValue = null;
        var isCustomRange = false;
        if (typeof filter === "string") {
            // For string filters without options, just show the value
            if (!options || options.length === 0) {
                displayValue = filter;
            }
            else {
                displayValue = (_b = (_a = options === null || options === void 0 ? void 0 : options.find(function (o) { return o.value === filter; })) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : null;
            }
        }
        if (typeof filter === "number") {
            displayValue = String(filter);
        }
        if (Array.isArray(filter)) {
            displayValue =
                (_c = filter
                    .map(function (v) { var _a; return (_a = options === null || options === void 0 ? void 0 : options.find(function (o) { return o.value === v; })) === null || _a === void 0 ? void 0 : _a.label; })
                    .join(", ")) !== null && _c !== void 0 ? _c : null;
        }
        if ((0, is_date_comparison_operator_1.isDateComparisonOperator)(filter)) {
            // First check if it matches a predefined option
            displayValue =
                (_e = (_d = options === null || options === void 0 ? void 0 : options.find(function (o) {
                    if (!(0, is_date_comparison_operator_1.isDateComparisonOperator)(o.value)) {
                        return false;
                    }
                    return ((filter.$gte === o.value.$gte || (!filter.$gte && !o.value.$gte)) &&
                        (filter.$lte === o.value.$lte || (!filter.$lte && !o.value.$lte)) &&
                        (filter.$gt === o.value.$gt || (!filter.$gt && !o.value.$gt)) &&
                        (filter.$lt === o.value.$lt || (!filter.$lt && !o.value.$lt)));
                })) === null || _d === void 0 ? void 0 : _d.label) !== null && _e !== void 0 ? _e : null;
            // If no match found, it's a custom range
            if (!displayValue && isDateFilterProps(meta)) {
                isCustomRange = true;
                var formatDateValue = meta.formatDateValue
                    ? meta.formatDateValue
                    : DEFAULT_FORMAT_DATE_VALUE;
                if (filter.$gte && !filter.$lte) {
                    displayValue = "".concat(meta.rangeOptionStartLabel || DEFAULT_RANGE_OPTION_START_LABEL, " ").concat(formatDateValue(new Date(filter.$gte)));
                }
                if (filter.$lte && !filter.$gte) {
                    displayValue = "".concat(meta.rangeOptionEndLabel || DEFAULT_RANGE_OPTION_END_LABEL, " ").concat(formatDateValue(new Date(filter.$lte)));
                }
                if (filter.$gte && filter.$lte) {
                    displayValue = "".concat(formatDateValue(new Date(filter.$gte)), " - ").concat(formatDateValue(new Date(filter.$lte)));
                }
            }
        }
        // Handle number comparison operators
        if (typeof filter === "object" && filter !== null && !Array.isArray(filter) && !(0, is_date_comparison_operator_1.isDateComparisonOperator)(filter)) {
            var operators = {
                $eq: "=",
                $gt: ">",
                $gte: "≥",
                $lt: "<",
                $lte: "≤",
            };
            var op = Object.keys(filter)[0];
            var opLabel = operators[op] || op;
            var value = filter[op];
            if (typeof value === "number") {
                displayValue = "".concat(opLabel, " ").concat(value);
            }
        }
        return { displayValue: displayValue, isCustomRange: isCustomRange };
    }, [filter, options, meta]), displayValue = _e.displayValue, isCustomRange = _e.isCustomRange;
    return (<popover_1.Popover open={open} onOpenChange={onOpenChange} modal>
      <div className={(0, clx_1.clx)("bg-ui-bg-field flex flex-shrink-0 items-stretch overflow-hidden rounded-md", "txt-compact-small-plus shadow-borders-base")}>
        {!hasValue && isNew && <popover_1.Popover.Anchor />}
        <div className={(0, clx_1.clx)("flex items-center px-2 py-1 text-ui-fg-muted", {
            "border-r": hasValue
        })}>
          {label || id}
        </div>
        {hasValue && (<>
            {(type === "select" || type === "multiselect" || type === "radio") && (<div className="flex items-center border-r px-2 py-1 text-ui-fg-muted">
                is
              </div>)}
            <popover_1.Popover.Trigger asChild>
              <button className={(0, clx_1.clx)("flex flex-1 items-center px-2 py-1 outline-none", "hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed transition-fg", {
                "text-ui-fg-subtle": displayValue,
                "text-ui-fg-muted": !displayValue,
                "min-w-[80px] justify-center": !displayValue,
                "border-r": true
            })}>
                {displayValue || "\u00A0"}
              </button>
            </popover_1.Popover.Trigger>
            <button type="button" className="flex size-7 items-center justify-center text-ui-fg-muted outline-none hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed transition-fg" onClick={removeFilter}>
              <icons_1.XMark />
            </button>
          </>)}
      </div>
      <popover_1.Popover.Content align="start" sideOffset={8} collisionPadding={16} hideWhenDetached className="bg-ui-bg-component p-0 outline-none" onOpenAutoFocus={function (e) {
            if (isNew) {
                // For new filters, ensure the first input gets focus
                var target = e.currentTarget;
                if (target) {
                    var firstInput = target.querySelector('input:not([type="hidden"]), [role="list"][tabindex="0"]');
                    firstInput === null || firstInput === void 0 ? void 0 : firstInput.focus();
                }
            }
        }} onCloseAutoFocus={function (e) {
            // Prevent focus from going to the trigger when closing
            e.preventDefault();
        }} onInteractOutside={function (e) {
            // Check if the click is on a filter menu item
            var target = e.target;
            if (target.closest('[role="menuitem"]')) {
                e.preventDefault();
            }
        }}>
        {(function () {
            switch (type) {
                case "select":
                    return (<DataTableFilterSelectContent id={id} filter={filter} options={options} isNew={isNew} onUpdate={onUpdate}/>);
                case "radio":
                    return (<DataTableFilterRadioContent id={id} filter={filter} options={options} onUpdate={onUpdate}/>);
                case "date":
                    var dateRest = rest;
                    return (<DataTableFilterDateContent id={id} filter={filter} options={options} isCustomRange={isCustomRange} format={dateRest.format} rangeOptionLabel={dateRest.rangeOptionLabel} disableRangeOption={dateRest.disableRangeOption} rangeOptionStartLabel={dateRest.rangeOptionStartLabel} rangeOptionEndLabel={dateRest.rangeOptionEndLabel} onUpdate={onUpdate}/>);
                case "multiselect":
                    var multiselectRest = rest;
                    return (<DataTableFilterMultiselectContent id={id} filter={filter} options={options} searchable={multiselectRest.searchable} onUpdate={onUpdate}/>);
                case "string":
                    var stringRest = rest;
                    return (<DataTableFilterStringContent id={id} filter={filter} placeholder={stringRest.placeholder} onUpdate={onUpdate}/>);
                case "number":
                    var numberRest = rest;
                    return (<DataTableFilterNumberContent id={id} filter={filter} placeholder={numberRest.placeholder} includeOperators={numberRest.includeOperators} onUpdate={onUpdate}/>);
                case "custom":
                    var customRest = rest;
                    return (<DataTableFilterCustomContent id={id} filter={filter} onRemove={removeFilter} render={customRest.render} onUpdate={onUpdate}/>);
                default:
                    return null;
            }
        })()}
      </popover_1.Popover.Content>
    </popover_1.Popover>);
};
exports.DataTableFilter = DataTableFilter;
DataTableFilter.displayName = "DataTable.Filter";
var DataTableFilterDateContent = function (_a) {
    var id = _a.id, filter = _a.filter, options = _a.options, _b = _a.format, format = _b === void 0 ? "date" : _b, _c = _a.rangeOptionLabel, rangeOptionLabel = _c === void 0 ? DEFAULT_RANGE_OPTION_LABEL : _c, _d = _a.rangeOptionStartLabel, rangeOptionStartLabel = _d === void 0 ? DEFAULT_RANGE_OPTION_START_LABEL : _d, _e = _a.rangeOptionEndLabel, rangeOptionEndLabel = _e === void 0 ? DEFAULT_RANGE_OPTION_END_LABEL : _e, _f = _a.disableRangeOption, disableRangeOption = _f === void 0 ? false : _f, isCustomRange = _a.isCustomRange, onUpdate = _a.onUpdate;
    var currentValue = filter;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var _g = React.useState(isCustomRange), isCustom = _g[0], setIsCustom = _g[1];
    // Sync isCustom state when isCustomRange changes
    React.useEffect(function () {
        setIsCustom(isCustomRange);
    }, [isCustomRange]);
    var selectedValue = React.useMemo(function () {
        if (!currentValue || isCustom) {
            return undefined;
        }
        return JSON.stringify(currentValue);
    }, [currentValue, isCustom]);
    var onValueChange = React.useCallback(function (valueStr) {
        setIsCustom(false);
        var value = JSON.parse(valueStr);
        if (onUpdate) {
            onUpdate(value);
        }
        else {
            instance.updateFilter({ id: id, value: value });
        }
    }, [instance, id, onUpdate]);
    var onSelectCustom = React.useCallback(function () {
        setIsCustom(true);
        // Don't clear the value when selecting custom - keep the current value
    }, []);
    var onCustomValueChange = React.useCallback(function (input, value) {
        var newCurrentValue = __assign({}, currentValue);
        newCurrentValue[input] = value ? value.toISOString() : undefined;
        if (onUpdate) {
            onUpdate(newCurrentValue);
        }
        else {
            instance.updateFilter({ id: id, value: newCurrentValue });
        }
    }, [instance, id, currentValue, onUpdate]);
    var _h = useKeyboardNavigation(options, function (index) {
        if (index === options.length && !disableRangeOption) {
            onSelectCustom();
        }
        else {
            onValueChange(JSON.stringify(options[index].value));
        }
    }, disableRangeOption ? 0 : 1), focusedIndex = _h.focusedIndex, setFocusedIndex = _h.setFocusedIndex;
    var granularity = format === "date-time" ? "minute" : "day";
    var maxDate = (currentValue === null || currentValue === void 0 ? void 0 : currentValue.$lte)
        ? granularity === "minute"
            ? new Date(currentValue.$lte)
            : new Date(new Date(currentValue.$lte).setHours(23, 59, 59, 999))
        : undefined;
    var minDate = (currentValue === null || currentValue === void 0 ? void 0 : currentValue.$gte)
        ? granularity === "minute"
            ? new Date(currentValue.$gte)
            : new Date(new Date(currentValue.$gte).setHours(0, 0, 0, 0))
        : undefined;
    var initialFocusedIndex = isCustom ? options.length : 0;
    var onListFocus = React.useCallback(function () {
        if (focusedIndex === -1) {
            setFocusedIndex(initialFocusedIndex);
        }
    }, [focusedIndex, initialFocusedIndex]);
    return (<React.Fragment>
      <div className="flex flex-col p-1 outline-none" tabIndex={0} role="list" onFocus={onListFocus} autoFocus>
        {options.map(function (option, idx) {
            var value = JSON.stringify(option.value);
            var isSelected = selectedValue === value;
            return (<OptionButton key={idx} index={idx} option={option} isSelected={isSelected} isFocused={focusedIndex === idx} onClick={function () { return onValueChange(value); }} onMouseEvent={setFocusedIndex} icon={icons_1.EllipseMiniSolid}/>);
        })}
        {!disableRangeOption && (<OptionButton index={options.length} option={{
                label: rangeOptionLabel,
                value: "__custom",
            }} icon={icons_1.EllipseMiniSolid} isSelected={isCustom} isFocused={focusedIndex === options.length} onClick={onSelectCustom} onMouseEvent={setFocusedIndex}/>)}
      </div>
      {!disableRangeOption && isCustom && (<React.Fragment>
          <div className="flex flex-col py-[3px]">
            <div className="bg-ui-border-menu-top h-px w-full"/>
            <div className="bg-ui-border-menu-bot h-px w-full"/>
          </div>
          <div className="flex flex-col gap-2 px-2 pb-3 pt-1">
            <div className="flex flex-col gap-1">
              <label_1.Label id="custom-start-date-label" size="xsmall" weight="plus">
                {rangeOptionStartLabel}
              </label_1.Label>
              <date_picker_1.DatePicker aria-labelledby="custom-start-date-label" granularity={granularity} maxValue={maxDate} value={(currentValue === null || currentValue === void 0 ? void 0 : currentValue.$gte) ? new Date(currentValue.$gte) : null} onChange={function (value) { return onCustomValueChange("$gte", value); }}/>
            </div>
            <div className="flex flex-col gap-1">
              <label_1.Label id="custom-end-date-label" size="xsmall" weight="plus">
                {rangeOptionEndLabel}
              </label_1.Label>
              <date_picker_1.DatePicker aria-labelledby="custom-end-date-label" granularity={granularity} minValue={minDate} value={(currentValue === null || currentValue === void 0 ? void 0 : currentValue.$lte) ? new Date(currentValue.$lte) : null} onChange={function (value) { return onCustomValueChange("$lte", value); }}/>
            </div>
          </div>
        </React.Fragment>)}
    </React.Fragment>);
};
var DataTableFilterSelectContent = function (_a) {
    var id = _a.id, _b = _a.filter, filter = _b === void 0 ? [] : _b, options = _a.options, _c = _a.isNew, isNew = _c === void 0 ? false : _c, onUpdate = _a.onUpdate;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var _d = React.useState(""), search = _d[0], setSearch = _d[1];
    var filteredOptions = React.useMemo(function () {
        if (!search)
            return options;
        var searchLower = search.toLowerCase();
        return options.filter(function (opt) {
            return opt.label.toLowerCase().includes(searchLower);
        });
    }, [options, search]);
    var onValueChange = React.useCallback(function (value) {
        if (filter === null || filter === void 0 ? void 0 : filter.includes(value)) {
            var newValues = filter === null || filter === void 0 ? void 0 : filter.filter(function (v) { return v !== value; });
            var newValue = newValues.length > 0 ? newValues : undefined;
            if (onUpdate) {
                onUpdate(newValue);
            }
            else {
                instance.updateFilter({
                    id: id,
                    value: newValue,
                });
            }
        }
        else {
            var newValue = __spreadArray(__spreadArray([], (filter !== null && filter !== void 0 ? filter : []), true), [value], false);
            if (onUpdate) {
                onUpdate(newValue);
            }
            else {
                instance.updateFilter({
                    id: id,
                    value: newValue,
                });
            }
        }
    }, [instance, id, filter, onUpdate]);
    return (<div className="w-[250px]">
      <div className="flex items-center gap-x-2 border-b px-3 py-1.5">
        <icons_1.MagnifyingGlass className="h-4 w-4 text-ui-fg-muted"/>
        <input value={search} onChange={function (e) { return setSearch(e.target.value); }} placeholder="Search..." className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-ui-fg-muted" autoFocus/>
        {search && (<button onClick={function () { return setSearch(""); }} className="text-ui-fg-muted hover:text-ui-fg-subtle">
            <icons_1.XMarkMini className="h-4 w-4"/>
          </button>)}
      </div>

      <div className="max-h-[300px] overflow-auto p-1">
        {filteredOptions.length === 0 && (<div className="py-6 text-center text-sm text-ui-fg-muted">
            No results found
          </div>)}

        {filteredOptions.map(function (option) {
            var isSelected = filter === null || filter === void 0 ? void 0 : filter.includes(option.value);
            return (<button key={String(option.value)} onClick={function () { return onValueChange(option.value); }} className={(0, clx_1.clx)("flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1.5 text-sm text-left", "hover:bg-ui-bg-base-hover")}>
              <div className="flex size-[15px] items-center justify-center">
                {isSelected && <icons_1.CheckMini />}
              </div>
              <span>{option.label}</span>
            </button>);
        })}
      </div>
    </div>);
};
var DataTableFilterRadioContent = function (_a) {
    var id = _a.id, filter = _a.filter, options = _a.options, onUpdate = _a.onUpdate;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var onValueChange = React.useCallback(function (value) {
        if (onUpdate) {
            onUpdate(value);
        }
        else {
            instance.updateFilter({ id: id, value: value });
        }
    }, [instance, id, onUpdate]);
    var _b = useKeyboardNavigation(options, function (index) { return onValueChange(options[index].value); }), focusedIndex = _b.focusedIndex, setFocusedIndex = _b.setFocusedIndex;
    var onListFocus = React.useCallback(function () {
        if (focusedIndex === -1) {
            setFocusedIndex(0);
        }
    }, [focusedIndex]);
    return (<div className="flex flex-col p-1 outline-none" role="list" tabIndex={0} onFocus={onListFocus} autoFocus>
      {options.map(function (option, idx) {
            var isSelected = filter === option.value;
            return (<OptionButton key={idx} index={idx} option={option} isSelected={isSelected} isFocused={focusedIndex === idx} onClick={function () { return onValueChange(option.value); }} onMouseEvent={setFocusedIndex} icon={icons_1.EllipseMiniSolid}/>);
        })}
    </div>);
};
function isDateFilterProps(props) {
    if (!props) {
        return false;
    }
    return props.type === "date";
}
function isMultiselectFilterProps(props) {
    if (!props) {
        return false;
    }
    return props.type === "multiselect";
}
function isStringFilterProps(props) {
    if (!props) {
        return false;
    }
    return props.type === "string";
}
function isNumberFilterProps(props) {
    if (!props) {
        return false;
    }
    return props.type === "number";
}
function isCustomFilterProps(props) {
    if (!props) {
        return false;
    }
    return props.type === "custom";
}
var OptionButton = React.memo(function (_a) {
    var index = _a.index, option = _a.option, isSelected = _a.isSelected, isFocused = _a.isFocused, onClick = _a.onClick, onMouseEvent = _a.onMouseEvent, Icon = _a.icon;
    return (<button type="button" role="listitem" className={(0, clx_1.clx)("bg-ui-bg-component txt-compact-small transition-fg flex items-center gap-2 rounded px-2 py-1 outline-none", { "bg-ui-bg-component-hover": isFocused })} onClick={onClick} onMouseEnter={function () { return onMouseEvent(index); }} onMouseLeave={function () { return onMouseEvent(-1); }} tabIndex={-1}>
      <div className="flex size-[15px] items-center justify-center">
        {isSelected && <Icon />}
      </div>
      <span>{option.label}</span>
    </button>);
});
function useKeyboardNavigation(options, onSelect, extraItems) {
    if (extraItems === void 0) { extraItems = 0; }
    var _a = React.useState(-1), focusedIndex = _a[0], setFocusedIndex = _a[1];
    var onKeyDown = React.useCallback(function (e) {
        var totalLength = options.length + extraItems;
        if (document.activeElement.contentEditable === "true") {
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setFocusedIndex(function (prev) { return (prev < totalLength - 1 ? prev + 1 : prev); });
                break;
            case "ArrowUp":
                e.preventDefault();
                setFocusedIndex(function (prev) { return (prev > 0 ? prev - 1 : prev); });
                break;
            case " ":
            case "Enter":
                e.preventDefault();
                if (focusedIndex >= 0) {
                    onSelect(focusedIndex);
                }
                break;
        }
    }, [options.length, extraItems, focusedIndex, onSelect]);
    React.useEffect(function () {
        window.addEventListener("keydown", onKeyDown);
        return function () {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onKeyDown]);
    return { focusedIndex: focusedIndex, setFocusedIndex: setFocusedIndex };
}
var DataTableFilterMultiselectContent = function (_a) {
    var id = _a.id, _b = _a.filter, filter = _b === void 0 ? [] : _b, options = _a.options, _c = _a.searchable, searchable = _c === void 0 ? true : _c, onUpdate = _a.onUpdate;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var _d = React.useState(""), search = _d[0], setSearch = _d[1];
    var filteredOptions = React.useMemo(function () {
        if (!searchable || !search)
            return options;
        var searchLower = search.toLowerCase();
        return options.filter(function (opt) {
            return opt.label.toLowerCase().includes(searchLower);
        });
    }, [options, search, searchable]);
    var onValueChange = React.useCallback(function (value) {
        if (filter === null || filter === void 0 ? void 0 : filter.includes(value)) {
            var newValues = filter === null || filter === void 0 ? void 0 : filter.filter(function (v) { return v !== value; });
            var newValue = newValues.length > 0 ? newValues : undefined;
            if (onUpdate) {
                onUpdate(newValue);
            }
            else {
                instance.updateFilter({
                    id: id,
                    value: newValue,
                });
            }
        }
        else {
            var newValue = __spreadArray(__spreadArray([], (filter !== null && filter !== void 0 ? filter : []), true), [value], false);
            if (onUpdate) {
                onUpdate(newValue);
            }
            else {
                instance.updateFilter({
                    id: id,
                    value: newValue,
                });
            }
        }
    }, [instance, id, filter, onUpdate]);
    if (!searchable) {
        return (<div className="w-[250px]">
        <div className="max-h-[300px] overflow-auto p-1">
          {options.map(function (option) {
                var isSelected = filter === null || filter === void 0 ? void 0 : filter.includes(option.value);
                return (<button key={String(option.value)} onClick={function () { return onValueChange(option.value); }} className={(0, clx_1.clx)("flex w-full items-center gap-x-2 rounded-md px-2 py-1.5 text-sm", "hover:bg-ui-bg-base-hover cursor-pointer text-left")}>
                <checkbox_1.Checkbox checked={isSelected} className="pointer-events-none"/>
                <span>{option.label}</span>
              </button>);
            })}
        </div>
      </div>);
    }
    return (<div className="w-[250px]">
      <div className="flex items-center gap-x-2 border-b px-3 py-1.5">
        <icons_1.MagnifyingGlass className="h-4 w-4 text-ui-fg-muted"/>
        <input value={search} onChange={function (e) { return setSearch(e.target.value); }} placeholder="Search..." className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-ui-fg-muted" autoFocus/>
        {search && (<button onClick={function () { return setSearch(""); }} className="text-ui-fg-muted hover:text-ui-fg-subtle">
            <icons_1.XMarkMini className="h-4 w-4"/>
          </button>)}
      </div>

      <div className="max-h-[300px] overflow-auto p-1">
        {filteredOptions.length === 0 && (<div className="py-6 text-center text-sm text-ui-fg-muted">
            No results found
          </div>)}

        {filteredOptions.map(function (option) {
            var isSelected = filter === null || filter === void 0 ? void 0 : filter.includes(option.value);
            return (<button key={String(option.value)} onClick={function () { return onValueChange(option.value); }} className={(0, clx_1.clx)("flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1.5 text-sm text-left", "hover:bg-ui-bg-base-hover")}>
              <checkbox_1.Checkbox checked={isSelected} className="pointer-events-none"/>
              <span>{option.label}</span>
            </button>);
        })}
      </div>
    </div>);
};
var DataTableFilterStringContent = function (_a) {
    var id = _a.id, filter = _a.filter, _b = _a.placeholder, placeholder = _b === void 0 ? "Enter value..." : _b, onUpdate = _a.onUpdate;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var _c = React.useState(filter || ""), value = _c[0], setValue = _c[1];
    var timeoutRef = React.useRef(null);
    var handleChange = React.useCallback(function (newValue) {
        setValue(newValue);
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Debounce the update
        timeoutRef.current = setTimeout(function () {
            var updateValue = newValue.trim() || undefined;
            if (onUpdate) {
                onUpdate(updateValue);
            }
            else {
                instance.updateFilter({
                    id: id,
                    value: updateValue,
                });
            }
        }, 500);
    }, [instance, id, onUpdate]);
    // Cleanup timeout on unmount
    React.useEffect(function () {
        return function () {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    var handleKeyDown = React.useCallback(function (e) {
        if (e.key === "Enter") {
            // Clear timeout and apply immediately
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            var updateValue = value.trim() || undefined;
            if (onUpdate) {
                onUpdate(updateValue);
            }
            else {
                instance.updateFilter({
                    id: id,
                    value: updateValue,
                });
            }
        }
    }, [instance, id, value, onUpdate]);
    return (<div className="p-3 w-[250px]">
      <input_1.Input placeholder={placeholder} value={value} onChange={function (e) { return handleChange(e.target.value); }} onKeyDown={handleKeyDown} autoFocus/>
    </div>);
};
var DataTableFilterNumberContent = function (_a) {
    var id = _a.id, filter = _a.filter, _b = _a.placeholder, placeholder = _b === void 0 ? "Enter number..." : _b, _c = _a.includeOperators, includeOperators = _c === void 0 ? true : _c, onUpdate = _a.onUpdate;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var _d = React.useState("eq"), operator = _d[0], setOperator = _d[1];
    var _e = React.useState(""), value = _e[0], setValue = _e[1];
    var timeoutRef = React.useRef(null);
    React.useEffect(function () {
        if (filter) {
            if (typeof filter === "number") {
                setOperator("eq");
                setValue(String(filter));
            }
            else if (typeof filter === "object") {
                var op = Object.keys(filter)[0];
                setOperator(op.replace("$", ""));
                setValue(String(filter[op]));
            }
        }
    }, [filter]);
    var handleValueChange = React.useCallback(function (newValue) {
        setValue(newValue);
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Debounce the update
        timeoutRef.current = setTimeout(function () {
            var _a;
            var num = parseFloat(newValue);
            if (!isNaN(num)) {
                var filterValue = includeOperators && operator !== "eq"
                    ? (_a = {}, _a["$".concat(operator)] = num, _a) : num;
                if (onUpdate) {
                    onUpdate(filterValue);
                }
                else {
                    instance.updateFilter({
                        id: id,
                        value: filterValue,
                    });
                }
            }
            else if (newValue === "") {
                if (onUpdate) {
                    onUpdate(undefined);
                }
                else {
                    instance.updateFilter({
                        id: id,
                        value: undefined,
                    });
                }
            }
        }, 500);
    }, [instance, id, operator, includeOperators, onUpdate]);
    var handleOperatorChange = React.useCallback(function (newOperator) {
        var _a;
        setOperator(newOperator);
        // If we have a value, update immediately with new operator
        var num = parseFloat(value);
        if (!isNaN(num)) {
            var filterValue = includeOperators && newOperator !== "eq"
                ? (_a = {}, _a["$".concat(newOperator)] = num, _a) : num;
            if (onUpdate) {
                onUpdate(filterValue);
            }
            else {
                instance.updateFilter({
                    id: id,
                    value: filterValue,
                });
            }
        }
    }, [instance, id, value, includeOperators, onUpdate]);
    // Cleanup timeout on unmount
    React.useEffect(function () {
        return function () {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    var handleKeyDown = React.useCallback(function (e) {
        var _a;
        if (e.key === "Enter") {
            // Clear timeout and apply immediately
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            var num = parseFloat(value);
            if (!isNaN(num)) {
                var filterValue = includeOperators && operator !== "eq"
                    ? (_a = {}, _a["$".concat(operator)] = num, _a) : num;
                if (onUpdate) {
                    onUpdate(filterValue);
                }
                else {
                    instance.updateFilter({
                        id: id,
                        value: filterValue,
                    });
                }
            }
        }
    }, [instance, id, value, operator, includeOperators, onUpdate]);
    var operators = [
        { value: "eq", label: "Equals" },
        { value: "gt", label: "Greater than" },
        { value: "gte", label: "Greater than or equal" },
        { value: "lt", label: "Less than" },
        { value: "lte", label: "Less than or equal" },
    ];
    return (<div className="p-3 space-y-3 w-[250px]">
      {includeOperators && (<select_1.Select value={operator} onValueChange={handleOperatorChange}>
          <select_1.Select.Trigger>
            <select_1.Select.Value />
          </select_1.Select.Trigger>
          <select_1.Select.Content>
            {operators.map(function (op) { return (<select_1.Select.Item key={op.value} value={op.value}>
                {op.label}
              </select_1.Select.Item>); })}
          </select_1.Select.Content>
        </select_1.Select>)}

      <input_1.Input type="number" placeholder={placeholder} value={value} onChange={function (e) { return handleValueChange(e.target.value); }} onKeyDown={handleKeyDown} autoFocus={!includeOperators}/>
    </div>);
};
var DataTableFilterCustomContent = function (_a) {
    var id = _a.id, filter = _a.filter, onRemove = _a.onRemove, render = _a.render, onUpdate = _a.onUpdate;
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var handleChange = React.useCallback(function (value) {
        if (onUpdate) {
            onUpdate(value);
        }
        else {
            instance.updateFilter({
                id: id,
                value: value,
            });
        }
    }, [instance, id, onUpdate]);
    return (<>
      {render({
            value: filter,
            onChange: handleChange,
            onRemove: onRemove,
        })}
    </>);
};
