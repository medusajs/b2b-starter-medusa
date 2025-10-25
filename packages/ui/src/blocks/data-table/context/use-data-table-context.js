"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDataTableContext = void 0;
var React = require("react");
var data_table_context_1 = require("./data-table-context");
var useDataTableContext = function () {
    var context = React.useContext(data_table_context_1.DataTableContext);
    if (!context) {
        throw new Error("useDataTableContext must be used within a DataTableContextProvider");
    }
    return context;
};
exports.useDataTableContext = useDataTableContext;
