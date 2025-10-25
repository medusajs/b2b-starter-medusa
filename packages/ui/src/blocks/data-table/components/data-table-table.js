"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableTable = void 0;
var React = require("react");
var table_1 = require("@/components/table");
var react_table_1 = require("@tanstack/react-table");
var core_1 = require("@dnd-kit/core");
var sortable_1 = require("@dnd-kit/sortable");
var use_data_table_context_1 = require("@/blocks/data-table/context/use-data-table-context");
var skeleton_1 = require("@/components/skeleton");
var text_1 = require("@/components/text");
var clx_1 = require("@/utils/clx");
var types_1 = require("../types");
var data_table_sorting_icon_1 = require("./data-table-sorting-icon");
var data_table_sortable_header_cell_1 = require("./data-table-sortable-header-cell");
var data_table_non_sortable_header_cell_1 = require("./data-table-non-sortable-header-cell");
/**
 * This component renders the table in a data table, supporting advanced features.
 */
var DataTableTable = function (props) {
    var hoveredRowId = React.useRef(null);
    var isKeyDown = React.useRef(false);
    var _a = React.useState(false), showStickyBorder = _a[0], setShowStickyBorder = _a[1];
    var scrollableRef = React.useRef(null);
    var instance = (0, use_data_table_context_1.useDataTableContext)().instance;
    var pageIndex = instance.pageIndex;
    var columns = instance.getAllColumns();
    var hasSelect = columns.find(function (c) { return c.id === "select"; });
    var hasActions = columns.find(function (c) { return c.id === "action"; });
    // Create list of all column IDs for SortableContext
    // Use current order if available, otherwise use default order
    var sortableItems = React.useMemo(function () {
        if (instance.columnOrder && instance.columnOrder.length > 0) {
            return instance.columnOrder;
        }
        return columns.map(function (col) { return col.id; });
    }, [columns, instance.columnOrder]);
    // Setup drag-and-drop sensors
    var sensors = (0, core_1.useSensors)((0, core_1.useSensor)(core_1.PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }), (0, core_1.useSensor)(core_1.KeyboardSensor, {
        coordinateGetter: sortable_1.sortableKeyboardCoordinates,
    }));
    var handleDragEnd = function (event) {
        var active = event.active, over = event.over;
        if (active.id !== (over === null || over === void 0 ? void 0 : over.id) && (over === null || over === void 0 ? void 0 : over.id)) {
            var activeId = active.id;
            var overId = over.id;
            // Don't allow dragging fixed columns
            if (activeId === "select" || activeId === "action") {
                return;
            }
            // Don't allow dropping on fixed columns
            if (overId === "select" || overId === "action") {
                return;
            }
            // Use the current column order from the instance
            var currentOrder = instance.columnOrder && instance.columnOrder.length > 0
                ? instance.columnOrder
                : columns.map(function (col) { return col.id; });
            var oldIndex = currentOrder.indexOf(activeId);
            var newIndex = currentOrder.indexOf(overId);
            if (oldIndex !== -1 && newIndex !== -1) {
                var newOrder = (0, sortable_1.arrayMove)(currentOrder, oldIndex, newIndex);
                instance.setColumnOrderFromArray(newOrder);
            }
        }
    };
    React.useEffect(function () {
        var onKeyDownHandler = function (event) {
            // If an editable element is focused, we don't want to select a row
            var isEditableElementFocused = getIsEditableElementFocused();
            if (event.key.toLowerCase() === "x" &&
                hoveredRowId &&
                !isKeyDown.current &&
                !isEditableElementFocused) {
                isKeyDown.current = true;
                var row = instance
                    .getRowModel()
                    .rows.find(function (r) { return r.id === hoveredRowId.current; });
                if (row && row.getCanSelect()) {
                    row.toggleSelected();
                }
            }
        };
        var onKeyUpHandler = function (event) {
            if (event.key.toLowerCase() === "x") {
                isKeyDown.current = false;
            }
        };
        document.addEventListener("keydown", onKeyDownHandler);
        document.addEventListener("keyup", onKeyUpHandler);
        return function () {
            document.removeEventListener("keydown", onKeyDownHandler);
            document.removeEventListener("keyup", onKeyUpHandler);
        };
    }, [hoveredRowId, instance]);
    var handleHorizontalScroll = function (e) {
        var scrollLeft = e.currentTarget.scrollLeft;
        if (scrollLeft > 0) {
            setShowStickyBorder(true);
        }
        else {
            setShowStickyBorder(false);
        }
    };
    React.useEffect(function () {
        var _a;
        (_a = scrollableRef.current) === null || _a === void 0 ? void 0 : _a.scroll({ top: 0, left: 0 });
    }, [pageIndex]);
    if (instance.showSkeleton) {
        return <DataTableTableSkeleton pageSize={instance.pageSize}/>;
    }
    return (<div className="flex w-full flex-1 flex-col overflow-hidden">
      {instance.emptyState === types_1.DataTableEmptyState.POPULATED && (instance.enableColumnOrder ? (<core_1.DndContext sensors={sensors} collisionDetection={core_1.closestCenter} onDragEnd={handleDragEnd}>
            <div ref={scrollableRef} onScroll={handleHorizontalScroll} className="min-h-0 w-full flex-1 overflow-auto overscroll-none border-y">
              <table_1.Table className="relative isolate w-full">
                <table_1.Table.Header className="shadow-ui-border-base sticky inset-x-0 top-0 z-[1] w-full border-b-0 border-t-0 shadow-[0_1px_1px_0]" style={{ transform: "translate3d(0,0,0)" }}>
                  {instance.getHeaderGroups().map(function (headerGroup) { return (<table_1.Table.Row key={headerGroup.id} className={(0, clx_1.clx)("border-b-0", {
                    "[&_th:last-of-type]:w-[1%] [&_th:last-of-type]:whitespace-nowrap": hasActions,
                    "[&_th:first-of-type]:w-[1%] [&_th:first-of-type]:whitespace-nowrap": hasSelect,
                })}>
                      <sortable_1.SortableContext items={sortableItems} strategy={sortable_1.horizontalListSortingStrategy}>
                        {headerGroup.headers.map(function (header, idx) {
                    var _a, _b;
                    var canSort = header.column.getCanSort();
                    var sortDirection = header.column.getIsSorted();
                    var sortHandler = header.column.getToggleSortingHandler();
                    var isActionHeader = header.id === "action";
                    var isSelectHeader = header.id === "select";
                    var isSpecialHeader = isActionHeader || isSelectHeader;
                    var isDraggable = !isSpecialHeader;
                    var Wrapper = canSort ? "button" : "div";
                    var isFirstColumn = hasSelect ? idx === 1 : idx === 0;
                    // Get header alignment from column metadata
                    var headerAlign = ((_b = (_a = header.column.columnDef.meta) === null || _a === void 0 ? void 0 : _a.___alignMetaData) === null || _b === void 0 ? void 0 : _b.headerAlign) || 'left';
                    var isRightAligned = headerAlign === 'right';
                    var isCenterAligned = headerAlign === 'center';
                    var HeaderCellComponent = isDraggable ? data_table_sortable_header_cell_1.DataTableSortableHeaderCell : data_table_non_sortable_header_cell_1.DataTableNonSortableHeaderCell;
                    return (<HeaderCellComponent key={header.id} id={header.id} isFirstColumn={isFirstColumn} className={(0, clx_1.clx)("whitespace-nowrap", {
                            "w-[calc(20px+24px+24px)] min-w-[calc(20px+24px+24px)] max-w-[calc(20px+24px+24px)]": isSelectHeader,
                            "w-[calc(28px+24px+4px)] min-w-[calc(28px+24px+4px)] max-w-[calc(28px+24px+4px)]": isActionHeader,
                            "after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']": isFirstColumn,
                            "after:bg-ui-border-base": showStickyBorder && isFirstColumn,
                            "bg-ui-bg-subtle sticky": isFirstColumn || isSelectHeader,
                            "left-0": isSelectHeader || (isFirstColumn && !hasSelect),
                            "left-[calc(20px+24px+24px)]": isFirstColumn && hasSelect,
                        })} style={!isSpecialHeader
                            ? {
                                width: header.column.columnDef.size,
                                maxWidth: header.column.columnDef.maxSize,
                                minWidth: header.column.columnDef.minSize,
                            }
                            : undefined}>
                              <Wrapper type={canSort ? "button" : undefined} onClick={canSort ? sortHandler : undefined} onMouseDown={canSort ? function (e) { return e.stopPropagation(); } : undefined} className={(0, clx_1.clx)("group flex cursor-default items-center gap-2", {
                            "cursor-pointer": canSort,
                            "w-full": isRightAligned || isCenterAligned,
                            "w-fit": !isRightAligned && !isCenterAligned,
                            "justify-end": isRightAligned,
                            "justify-center": isCenterAligned,
                        })}>
                                {canSort && isRightAligned && (<data_table_sorting_icon_1.DataTableSortingIcon direction={sortDirection}/>)}
                                {(0, react_table_1.flexRender)(header.column.columnDef.header, header.getContext())}
                                {canSort && !isRightAligned && (<data_table_sorting_icon_1.DataTableSortingIcon direction={sortDirection}/>)}
                              </Wrapper>
                            </HeaderCellComponent>);
                })}
                      </sortable_1.SortableContext>
                    </table_1.Table.Row>); })}
                </table_1.Table.Header>
                <table_1.Table.Body className="border-b-0 border-t-0">
                  {instance.getRowModel().rows.map(function (row) {
                return (<table_1.Table.Row key={row.id} onMouseEnter={function () { return (hoveredRowId.current = row.id); }} onMouseLeave={function () { return (hoveredRowId.current = null); }} onClick={function (e) { var _a; return (_a = instance.onRowClick) === null || _a === void 0 ? void 0 : _a.call(instance, e, row); }} className={(0, clx_1.clx)("group/row last-of-type:border-b-0", {
                        "cursor-pointer": !!instance.onRowClick,
                    })}>
                        {row.getVisibleCells().map(function (cell, idx) {
                        var isSelectCell = cell.column.id === "select";
                        var isActionCell = cell.column.id === "action";
                        var isSpecialCell = isSelectCell || isActionCell;
                        var isFirstColumn = hasSelect ? idx === 1 : idx === 0;
                        return (<table_1.Table.Cell key={cell.id} className={(0, clx_1.clx)("items-stretch truncate whitespace-nowrap", {
                                "w-[calc(20px+24px+24px)] min-w-[calc(20px+24px+24px)] max-w-[calc(20px+24px+24px)]": isSelectCell,
                                "w-[calc(28px+24px+4px)] min-w-[calc(28px+24px+4px)] max-w-[calc(28px+24px+4px)]": isActionCell,
                                "bg-ui-bg-base group-hover/row:bg-ui-bg-base-hover transition-fg sticky h-full": isFirstColumn || isSelectCell,
                                "after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']": isFirstColumn,
                                "after:bg-ui-border-base": showStickyBorder && isFirstColumn,
                                "left-0": isSelectCell || (isFirstColumn && !hasSelect),
                                "left-[calc(20px+24px+24px)]": isFirstColumn && hasSelect,
                            })} style={!isSpecialCell
                                ? {
                                    width: cell.column.columnDef.size,
                                    maxWidth: cell.column.columnDef.maxSize,
                                    minWidth: cell.column.columnDef.minSize,
                                }
                                : undefined}>
                              {(0, react_table_1.flexRender)(cell.column.columnDef.cell, cell.getContext())}
                            </table_1.Table.Cell>);
                    })}
                      </table_1.Table.Row>);
            })}
                </table_1.Table.Body>
              </table_1.Table>
            </div>
          </core_1.DndContext>) : (<div ref={scrollableRef} onScroll={handleHorizontalScroll} className="min-h-0 w-full flex-1 overflow-auto overscroll-none border-y">
            <table_1.Table className="relative isolate w-full">
              <table_1.Table.Header className="shadow-ui-border-base sticky inset-x-0 top-0 z-[1] w-full border-b-0 border-t-0 shadow-[0_1px_1px_0]" style={{ transform: "translate3d(0,0,0)" }}>
                {instance.getHeaderGroups().map(function (headerGroup) { return (<table_1.Table.Row key={headerGroup.id} className={(0, clx_1.clx)("border-b-0", {
                    "[&_th:last-of-type]:w-[1%] [&_th:last-of-type]:whitespace-nowrap": hasActions,
                    "[&_th:first-of-type]:w-[1%] [&_th:first-of-type]:whitespace-nowrap": hasSelect,
                })}>
                    {headerGroup.headers.map(function (header, idx) {
                    var _a, _b;
                    var canSort = header.column.getCanSort();
                    var sortDirection = header.column.getIsSorted();
                    var sortHandler = header.column.getToggleSortingHandler();
                    var isActionHeader = header.id === "action";
                    var isSelectHeader = header.id === "select";
                    var isSpecialHeader = isActionHeader || isSelectHeader;
                    var Wrapper = canSort ? "button" : "div";
                    var isFirstColumn = hasSelect ? idx === 1 : idx === 0;
                    // Get header alignment from column metadata
                    var headerAlign = ((_b = (_a = header.column.columnDef.meta) === null || _a === void 0 ? void 0 : _a.___alignMetaData) === null || _b === void 0 ? void 0 : _b.headerAlign) || 'left';
                    var isRightAligned = headerAlign === 'right';
                    var isCenterAligned = headerAlign === 'center';
                    return (<table_1.Table.HeaderCell key={header.id} className={(0, clx_1.clx)("whitespace-nowrap", {
                            "w-[calc(20px+24px+24px)] min-w-[calc(20px+24px+24px)] max-w-[calc(20px+24px+24px)]": isSelectHeader,
                            "w-[calc(28px+24px+4px)] min-w-[calc(28px+24px+4px)] max-w-[calc(28px+24px+4px)]": isActionHeader,
                            "after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']": isFirstColumn,
                            "after:bg-ui-border-base": showStickyBorder && isFirstColumn,
                            "bg-ui-bg-subtle sticky": isFirstColumn || isSelectHeader,
                            "left-0": isSelectHeader || (isFirstColumn && !hasSelect),
                            "left-[calc(20px+24px+24px)]": isFirstColumn && hasSelect,
                        })} style={!isSpecialHeader
                            ? {
                                width: header.column.columnDef.size,
                                maxWidth: header.column.columnDef.maxSize,
                                minWidth: header.column.columnDef.minSize,
                            }
                            : undefined}>
                          <Wrapper type={canSort ? "button" : undefined} onClick={canSort ? sortHandler : undefined} onMouseDown={canSort ? function (e) { return e.stopPropagation(); } : undefined} className={(0, clx_1.clx)("group flex cursor-default items-center gap-2", {
                            "cursor-pointer": canSort,
                            "w-full": isRightAligned || isCenterAligned,
                            "w-fit": !isRightAligned && !isCenterAligned,
                            "justify-end": isRightAligned,
                            "justify-center": isCenterAligned,
                        })}>
                            {canSort && isRightAligned && (<data_table_sorting_icon_1.DataTableSortingIcon direction={sortDirection}/>)}
                            {(0, react_table_1.flexRender)(header.column.columnDef.header, header.getContext())}
                            {canSort && !isRightAligned && (<data_table_sorting_icon_1.DataTableSortingIcon direction={sortDirection}/>)}
                          </Wrapper>
                        </table_1.Table.HeaderCell>);
                })}
                  </table_1.Table.Row>); })}
              </table_1.Table.Header>
              <table_1.Table.Body className="border-b-0 border-t-0">
                {instance.getRowModel().rows.map(function (row) {
                return (<table_1.Table.Row key={row.id} onMouseEnter={function () { return (hoveredRowId.current = row.id); }} onMouseLeave={function () { return (hoveredRowId.current = null); }} onClick={function (e) { var _a; return (_a = instance.onRowClick) === null || _a === void 0 ? void 0 : _a.call(instance, e, row); }} className={(0, clx_1.clx)("group/row last-of-type:border-b-0", {
                        "cursor-pointer": !!instance.onRowClick,
                    })}>
                      {row.getVisibleCells().map(function (cell, idx) {
                        var isSelectCell = cell.column.id === "select";
                        var isActionCell = cell.column.id === "action";
                        var isSpecialCell = isSelectCell || isActionCell;
                        var isFirstColumn = hasSelect ? idx === 1 : idx === 0;
                        return (<table_1.Table.Cell key={cell.id} className={(0, clx_1.clx)("items-stretch truncate whitespace-nowrap", {
                                "w-[calc(20px+24px+24px)] min-w-[calc(20px+24px+24px)] max-w-[calc(20px+24px+24px)]": isSelectCell,
                                "w-[calc(28px+24px+4px)] min-w-[calc(28px+24px+4px)] max-w-[calc(28px+24px+4px)]": isActionCell,
                                "bg-ui-bg-base group-hover/row:bg-ui-bg-base-hover transition-fg sticky h-full": isFirstColumn || isSelectCell,
                                "after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']": isFirstColumn,
                                "after:bg-ui-border-base": showStickyBorder && isFirstColumn,
                                "left-0": isSelectCell || (isFirstColumn && !hasSelect),
                                "left-[calc(20px+24px+24px)]": isFirstColumn && hasSelect,
                            })} style={!isSpecialCell
                                ? {
                                    width: cell.column.columnDef.size,
                                    maxWidth: cell.column.columnDef.maxSize,
                                    minWidth: cell.column.columnDef.minSize,
                                }
                                : undefined}>
                            {(0, react_table_1.flexRender)(cell.column.columnDef.cell, cell.getContext())}
                          </table_1.Table.Cell>);
                    })}
                    </table_1.Table.Row>);
            })}
              </table_1.Table.Body>
            </table_1.Table>
          </div>))}
      <DataTableEmptyStateDisplay state={instance.emptyState} props={props.emptyState}/>
    </div>);
};
exports.DataTableTable = DataTableTable;
DataTableTable.displayName = "DataTable.Table";
var DefaultEmptyStateContent = function (_a) {
    var heading = _a.heading, description = _a.description;
    return (<div className="flex size-full flex-col items-center justify-center gap-2">
    <text_1.Text size="base" weight="plus">
      {heading}
    </text_1.Text>
    <text_1.Text>{description}</text_1.Text>
  </div>);
};
var DataTableEmptyStateDisplay = function (_a) {
    var _b;
    var state = _a.state, props = _a.props;
    if (state === types_1.DataTableEmptyState.POPULATED) {
        return null;
    }
    var content = state === types_1.DataTableEmptyState.EMPTY ? props === null || props === void 0 ? void 0 : props.empty : props === null || props === void 0 ? void 0 : props.filtered;
    return (<div className="flex min-h-[250px] w-full flex-1 flex-col items-center justify-center border-y px-6 py-4">
      {(_b = content === null || content === void 0 ? void 0 : content.custom) !== null && _b !== void 0 ? _b : (<DefaultEmptyStateContent heading={content === null || content === void 0 ? void 0 : content.heading} description={content === null || content === void 0 ? void 0 : content.description}/>)}
    </div>);
};
var DataTableTableSkeleton = function (_a) {
    var _b = _a.pageSize, pageSize = _b === void 0 ? 10 : _b;
    return (<div className="flex w-full flex-1 flex-col overflow-hidden">
      <div className="min-h-0 w-full flex-1 overscroll-none border-y">
        <div className="flex flex-col divide-y">
          <skeleton_1.Skeleton className="h-12 w-full"/>
          {Array.from({ length: pageSize }, function (_, i) { return i; }).map(function (row) { return (<skeleton_1.Skeleton key={row} className="h-12 w-full rounded-none"/>); })}
        </div>
      </div>
    </div>);
};
function getIsEditableElementFocused() {
    var activeElement = !!document ? document.activeElement : null;
    var isEditableElementFocused = activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement === null || activeElement === void 0 ? void 0 : activeElement.getAttribute("contenteditable")) === "true";
    return isEditableElementFocused;
}
