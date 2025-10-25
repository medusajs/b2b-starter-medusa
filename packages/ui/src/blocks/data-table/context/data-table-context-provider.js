"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableContextProvider = void 0;
var React = require("react");
var data_table_context_1 = require("./data-table-context");
var DataTableContextProvider = function (_a) {
    var instance = _a.instance, children = _a.children;
    return (<data_table_context_1.DataTableContext.Provider value={{
            instance: instance,
            enableColumnVisibility: instance.enableColumnVisibility,
            enableColumnOrder: instance.enableColumnOrder
        }}>
      {children}
    </data_table_context_1.DataTableContext.Provider>);
};
exports.DataTableContextProvider = DataTableContextProvider;
