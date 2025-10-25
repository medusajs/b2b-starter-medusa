"use strict";
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
exports.KitchenSink = void 0;
var faker_1 = require("@faker-js/faker");
var React = require("react");
var container_1 = require("@/components/container");
var icons_1 = require("@medusajs/icons");
var button_1 = require("../../components/button");
var heading_1 = require("../../components/heading");
var tooltip_1 = require("../../components/tooltip");
var data_table_1 = require("./data-table");
var use_data_table_1 = require("./use-data-table");
var create_data_table_column_helper_1 = require("./utils/create-data-table-column-helper");
var create_data_table_command_helper_1 = require("./utils/create-data-table-command-helper");
var create_data_table_filter_helper_1 = require("./utils/create-data-table-filter-helper");
var is_date_comparison_operator_1 = require("./utils/is-date-comparison-operator");
var meta = {
    title: "Blocks/DataTable",
    component: data_table_1.DataTable,
};
exports.default = meta;
var generateEmployees = function (count) {
    return Array.from({ length: count }, function (_, i) {
        var age = faker_1.faker.number.int({ min: 18, max: 65 });
        var birthday = faker_1.faker.date.birthdate({
            mode: "age",
            min: age,
            max: age,
        });
        return {
            id: i.toString(),
            name: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email(),
            position: faker_1.faker.person.jobTitle(),
            age: age,
            birthday: birthday,
            relationshipStatus: faker_1.faker.helpers.arrayElement([
                "single",
                "married",
                "divorced",
                "widowed",
            ]),
        };
    });
};
var data = generateEmployees(100);
var usePeople = function (_a) {
    var q = _a.q, order = _a.order, filters = _a.filters, offset = _a.offset, limit = _a.limit;
    return React.useMemo(function () {
        var results = __spreadArray([], data, true);
        if (q) {
            results = results.filter(function (person) {
                return person.name.toLowerCase().includes(q.toLowerCase());
            });
        }
        if (filters && Object.keys(filters).length > 0) {
            results = results.filter(function (person) {
                return Object.entries(filters).every(function (_a) {
                    var key = _a[0], filter = _a[1];
                    if (!filter)
                        return true;
                    var value = person[key];
                    if (key === "birthday") {
                        if ((0, is_date_comparison_operator_1.isDateComparisonOperator)(filter)) {
                            if (!(value instanceof Date)) {
                                return false;
                            }
                            if (filter.$gte) {
                                var compareDate = new Date(filter.$gte);
                                if (value < compareDate) {
                                    return false;
                                }
                            }
                            if (filter.$lte) {
                                var compareDate = new Date(filter.$lte);
                                if (value > compareDate) {
                                    return false;
                                }
                            }
                            if (filter.$gt) {
                                var compareDate = new Date(filter.$gt);
                                if (value <= compareDate) {
                                    return false;
                                }
                            }
                            if (filter.$lt) {
                                var compareDate = new Date(filter.$lt);
                                if (value >= compareDate) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                    if (Array.isArray(filter)) {
                        if (filter.length === 0)
                            return true;
                        return filter.includes(value);
                    }
                    return filter === value;
                });
            });
        }
        // Apply sorting
        if (order) {
            var key_1 = order.id;
            var desc_1 = order.desc;
            results.sort(function (a, b) {
                var aVal = a[key_1];
                var bVal = b[key_1];
                if (aVal instanceof Date && bVal instanceof Date) {
                    return desc_1
                        ? bVal.getTime() - aVal.getTime()
                        : aVal.getTime() - bVal.getTime();
                }
                if (aVal < bVal)
                    return desc_1 ? 1 : -1;
                if (aVal > bVal)
                    return desc_1 ? -1 : 1;
                return 0;
            });
        }
        if (offset) {
            results = results.slice(offset);
        }
        if (limit) {
            results = results.slice(0, limit);
        }
        return {
            data: results,
            count: data.length,
        };
    }, [q, order, filters, offset, limit]); // Add filters to dependencies
};
var columnHelper = (0, create_data_table_column_helper_1.createDataTableColumnHelper)();
var columns = [
    columnHelper.select(),
    columnHelper.accessor("name", {
        header: "Name",
        enableSorting: true,
        sortAscLabel: "A-Z",
        sortDescLabel: "Z-A",
    }),
    columnHelper.accessor("email", {
        header: "Email",
        enableSorting: true,
        sortAscLabel: "A-Z",
        sortDescLabel: "Z-A",
        maxSize: 200,
    }),
    columnHelper.accessor("position", {
        header: "Position",
        enableSorting: true,
        sortAscLabel: "A-Z",
        sortDescLabel: "Z-A",
    }),
    columnHelper.accessor("age", {
        header: "Age",
        enableSorting: true,
        sortAscLabel: "Low to High",
        sortDescLabel: "High to Low",
        sortLabel: "Age",
    }),
    columnHelper.accessor("birthday", {
        header: "Birthday",
        cell: function (_a) {
            var row = _a.row;
            return (<div>
          {row.original.birthday.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
        </div>);
        },
        enableSorting: true,
        sortAscLabel: "Oldest to Youngest",
        sortDescLabel: "Youngest to Oldest",
    }),
    columnHelper.accessor("relationshipStatus", {
        header: "Relationship Status",
        cell: function (_a) {
            var row = _a.row;
            return (<div>
          {row.original.relationshipStatus.charAt(0).toUpperCase() +
                    row.original.relationshipStatus.slice(1)}
        </div>);
        },
        enableSorting: true,
        sortAscLabel: "A-Z",
        sortDescLabel: "Z-A",
    }),
    columnHelper.action({
        actions: function (ctx) {
            var actions = [
                [
                    {
                        label: "Edit",
                        onClick: function () { },
                        icon: <icons_1.PencilSquare />,
                    },
                    {
                        label: "Edit",
                        onClick: function () { },
                        icon: <icons_1.PencilSquare />,
                    },
                    {
                        label: "Edit",
                        onClick: function () { },
                        icon: <icons_1.PencilSquare />,
                    },
                ],
                [
                    {
                        label: "Delete",
                        onClick: function () { },
                        icon: <icons_1.Trash />,
                    },
                ],
            ];
            return actions;
        },
    }),
];
var filterHelper = (0, create_data_table_filter_helper_1.createDataTableFilterHelper)();
var filters = [
    filterHelper.accessor("birthday", {
        label: "Birthday",
        type: "date",
        format: "date",
        options: [
            {
                label: "18 - 25 years old",
                value: {
                    $lte: new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString(),
                    $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 25)).toISOString(),
                },
            },
            {
                label: "26 - 35 years old",
                value: {
                    $lte: new Date(new Date().setFullYear(new Date().getFullYear() - 26)).toISOString(),
                    $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 35)).toISOString(),
                },
            },
            {
                label: "36 - 45 years old",
                value: {
                    $lte: new Date(new Date().setFullYear(new Date().getFullYear() - 36)).toISOString(),
                    $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 45)).toISOString(),
                },
            },
            {
                label: "46 - 55 years old",
                value: {
                    $lte: new Date(new Date().setFullYear(new Date().getFullYear() - 46)).toISOString(),
                    $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 55)).toISOString(),
                },
            },
            {
                label: "Over 55 years old",
                value: {
                    $lt: new Date(new Date().setFullYear(new Date().getFullYear() - 55)).toISOString(),
                },
            },
        ],
    }),
    filterHelper.accessor("relationshipStatus", {
        label: "Relationship Status",
        type: "select",
        options: [
            { label: "Single", value: "single" },
            { label: "Married", value: "married" },
            { label: "Divorced", value: "divorced" },
            { label: "Widowed", value: "widowed" },
        ],
    }),
];
var commandHelper = (0, create_data_table_command_helper_1.createDataTableCommandHelper)();
var commands = [
    commandHelper.command({
        label: "Archive",
        action: function (selection) {
            alert("Archive ".concat(Object.keys(selection).length, " items"));
        },
        shortcut: "A",
    }),
    commandHelper.command({
        label: "Delete",
        action: function (selection) {
            alert("Delete ".concat(Object.keys(selection).length, " items"));
        },
        shortcut: "D",
    }),
];
var KitchenSinkDemo = function () {
    var _a = React.useState(""), search = _a[0], setSearch = _a[1];
    var _b = React.useState({}), rowSelection = _b[0], setRowSelection = _b[1];
    var _c = React.useState(null), sorting = _c[0], setSorting = _c[1];
    var _d = React.useState({
        birthday: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString(),
        },
    }), filtering = _d[0], setFiltering = _d[1];
    var handleFilteringChange = function (state) {
        console.log("Filtering changed:", state);
        setFiltering(state);
    };
    var _e = React.useState({
        pageIndex: 0,
        pageSize: 10,
    }), pagination = _e[0], setPagination = _e[1];
    var _f = usePeople({
        q: search,
        order: sorting,
        filters: filtering,
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
    }), data = _f.data, count = _f.count;
    var table = (0, use_data_table_1.useDataTable)({
        data: data,
        columns: columns,
        filters: filters,
        commands: commands,
        rowCount: count,
        getRowId: function (row) { return row.id; },
        onRowClick: function (_event, row) {
            alert("Navigate to ".concat(row.id));
        },
        search: {
            state: search,
            onSearchChange: setSearch,
        },
        filtering: {
            state: filtering,
            onFilteringChange: handleFilteringChange,
        },
        rowSelection: {
            state: rowSelection,
            onRowSelectionChange: setRowSelection,
            enableRowSelection: function (row) { return Number(row.original.id) > 4; },
        },
        sorting: {
            state: sorting,
            onSortingChange: setSorting,
        },
        pagination: {
            state: pagination,
            onPaginationChange: setPagination,
        },
    });
    return (<tooltip_1.TooltipProvider>
      <container_1.Container className="flex flex-col overflow-hidden p-0">
        <data_table_1.DataTable instance={table}>
          <data_table_1.DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <heading_1.Heading>Employees</heading_1.Heading>
            <div className="flex w-full items-center gap-2 md:w-auto">
              <data_table_1.DataTable.Search placeholder="Search" autoFocus/>
              <data_table_1.DataTable.FilterMenu tooltip="Filter"/>
              <data_table_1.DataTable.SortingMenu tooltip="Sort"/>
              <button_1.Button size="small" variant="secondary">
                Create
              </button_1.Button>
            </div>
          </data_table_1.DataTable.Toolbar>
          <data_table_1.DataTable.Table emptyState={{
            empty: {
                heading: "No employees",
                description: "There are no employees to display.",
            },
            filtered: {
                heading: "No results",
                description: "No employees match the current filter criteria. Try adjusting your filters.",
            },
        }}/>
          <data_table_1.DataTable.Pagination />
          <data_table_1.DataTable.CommandBar selectedLabel={function (count) { return "".concat(count, " selected"); }}/>
        </data_table_1.DataTable>
      </container_1.Container>
    </tooltip_1.TooltipProvider>);
};
exports.KitchenSink = {
    render: function () { return <KitchenSinkDemo />; },
};
