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
exports.Table = void 0;
var icons_1 = require("@medusajs/icons");
var React = require("react");
var button_1 = require("@/components/button");
var clx_1 = require("@/utils/clx");
/**
 * This component is based on the table element and its various children:
 *
 * - `Table`: `table`
 * - `Table.Header`: `thead`
 * - `Table.Row`: `tr`
 * - `Table.HeaderCell`: `th`
 * - `Table.Body`: `tbody`
 * - `Table.Cell`: `td`
 *
 * Each component supports the props or attributes of its equivalent HTML element.
 */
var Root = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<table ref={ref} className={(0, clx_1.clx)("text-ui-fg-subtle txt-compact-small w-full", className)} {...props}/>);
});
Root.displayName = "Table";
var Row = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<tr ref={ref} className={(0, clx_1.clx)("bg-ui-bg-base hover:bg-ui-bg-base-hover border-ui-border-base transition-fg border-b", "[&_td:last-child]:pr-6 [&_th:last-child]:pr-6", "[&_td:first-child]:pl-6 [&_th:first-child]:pl-6", className)} {...props}/>);
});
Row.displayName = "Table.Row";
var Cell = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<td ref={ref} className={(0, clx_1.clx)("h-12 py-0 pl-0 pr-6", className)} {...props}/>);
});
Cell.displayName = "Table.Cell";
var Header = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<thead ref={ref} className={(0, clx_1.clx)("border-ui-border-base txt-compact-small-plus [&_tr]:bg-ui-bg-subtle [&_tr]:hover:bg-ui-bg-subtle border-y", className)} {...props}/>);
});
Header.displayName = "Table.Header";
var HeaderCell = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<th ref={ref} className={(0, clx_1.clx)("txt-compact-small-plus h-12 py-0 pl-0 pr-6 text-left", className)} {...props}/>);
});
HeaderCell.displayName = "Table.HeaderCell";
var Body = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<tbody ref={ref} className={(0, clx_1.clx)("border-ui-border-base border-b", className)} {...props}/>);
});
Body.displayName = "Table.Body";
/**
 * This component is based on the `div` element and supports all of its props
 */
var Pagination = React.forwardRef(function (_a, ref) {
    var className = _a.className, 
    /**
     * The total number of items.
     */
    count = _a.count, 
    /**
     * The number of items per page.
     */
    pageSize = _a.pageSize, 
    /**
     * The total number of pages.
     */
    pageCount = _a.pageCount, 
    /**
     * The current page index.
     */
    pageIndex = _a.pageIndex, 
    /**
     * Whether there's a previous page that can be navigated to.
     */
    canPreviousPage = _a.canPreviousPage, 
    /**
     * Whether there's a next page that can be navigated to.
     */
    canNextPage = _a.canNextPage, 
    /**
     * A function that handles navigating to the next page.
     * This function should handle retrieving data for the next page.
     */
    nextPage = _a.nextPage, 
    /**
     * A function that handles navigating to the previous page.
     * This function should handle retrieving data for the previous page.
     */
    previousPage = _a.previousPage, 
    /**
     * An optional object of words to use in the pagination component.
     * Use this to override the default words, or translate them into another language.
     */
    _b = _a.translations, 
    /**
     * An optional object of words to use in the pagination component.
     * Use this to override the default words, or translate them into another language.
     */
    translations = _b === void 0 ? {
        of: "of",
        results: "results",
        pages: "pages",
        prev: "Prev",
        next: "Next",
    } : _b, props = __rest(_a, ["className", "count", "pageSize", "pageCount", "pageIndex", "canPreviousPage", "canNextPage", "nextPage", "previousPage", "translations"]);
    var _c = React.useMemo(function () {
        var from = count === 0 ? count : pageIndex * pageSize + 1;
        var to = Math.min(count, (pageIndex + 1) * pageSize);
        return { from: from, to: to };
    }, [count, pageIndex, pageSize]), from = _c.from, to = _c.to;
    return (<div ref={ref} className={(0, clx_1.clx)("text-ui-fg-subtle txt-compact-small-plus flex w-full items-center justify-between px-3 py-4", className)} {...props}>
        <div className="inline-flex items-center gap-x-1 px-3 py-[5px]">
          <p>{from}</p>
          <icons_1.Minus className="text-ui-fg-muted"/>
          <p>{"".concat(to, " ").concat(translations.of, " ").concat(count, " ").concat(translations.results)}</p>
        </div>
        <div className="flex items-center gap-x-2">
          <div className="inline-flex items-center gap-x-1 px-3 py-[5px]">
            <p>
              {pageIndex + 1} {translations.of} {Math.max(pageCount, 1)}{" "}
              {translations.pages}
            </p>
          </div>
          <button_1.Button type="button" variant={"transparent"} onClick={previousPage} disabled={!canPreviousPage}>
            {translations.prev}
          </button_1.Button>
          <button_1.Button type="button" variant={"transparent"} onClick={nextPage} disabled={!canNextPage}>
            {translations.next}
          </button_1.Button>
        </div>
      </div>);
});
Pagination.displayName = "Table.Pagination";
var Table = Object.assign(Root, {
    Row: Row,
    Cell: Cell,
    Header: Header,
    HeaderCell: HeaderCell,
    Body: Body,
    Pagination: Pagination,
});
exports.Table = Table;
