"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDateComparisonOperator = isDateComparisonOperator;
function isDateComparisonOperator(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    var validOperators = ["$gte", "$lte", "$gt", "$lt"];
    var hasAtLeastOneOperator = validOperators.some(function (op) { return op in value; });
    var allPropertiesValid = Object.entries(value)
        .every(function (_a) {
        var key = _a[0], val = _a[1];
        return validOperators.includes(key) && (typeof val === "string" || val === undefined);
    });
    return hasAtLeastOneOperator && allPropertiesValid;
}
