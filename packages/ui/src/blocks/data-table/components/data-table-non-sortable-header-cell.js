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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableNonSortableHeaderCell = void 0;
var React = require("react");
var sortable_1 = require("@dnd-kit/sortable");
var utilities_1 = require("@dnd-kit/utilities");
var table_1 = require("@/components/table");
exports.DataTableNonSortableHeaderCell = React.forwardRef(function (_a, ref) {
    var id = _a.id, children = _a.children, className = _a.className, propStyle = _a.style, isFirstColumn = _a.isFirstColumn, props = __rest(_a, ["id", "children", "className", "style", "isFirstColumn"]);
    // Still use sortable hook but without listeners
    var _b = (0, sortable_1.useSortable)({
        id: id,
        disabled: true, // Disable dragging
    }), setNodeRef = _b.setNodeRef, transform = _b.transform, transition = _b.transition;
    // Only apply horizontal transform for smooth shifting
    var transformStyle = transform ? {
        x: transform.x,
        y: 0,
        scaleX: transform.scaleX,
        scaleY: transform.scaleY,
    } : null;
    var style = __assign(__assign({}, propStyle), { transform: transformStyle ? utilities_1.CSS.Transform.toString(transformStyle) : undefined, transition: transition });
    var combineRefs = function (element) {
        setNodeRef(element);
        if (ref) {
            if (typeof ref === 'function') {
                ref(element);
            }
            else {
                ref.current = element;
            }
        }
    };
    return (<table_1.Table.HeaderCell ref={combineRefs} style={style} className={className} {...props}>
      {children}
    </table_1.Table.HeaderCell>);
});
exports.DataTableNonSortableHeaderCell.displayName = "DataTableNonSortableHeaderCell";
