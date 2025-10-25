"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paginated = exports.Default = void 0;
var React = require("react");
var table_1 = require("./table");
var meta = {
    title: "Components/Table",
    component: table_1.Table,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
var firstNames = [
    "Charles",
    "Cooper",
    "Johhny",
    "Elvis",
    "John",
    "Jane",
    "Joe",
    "Jack",
    "Jill",
    "Jenny",
];
var lastNames = [
    "Brown",
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Rodriguez",
    "Wilson",
];
var currencies = ["USD", "EUR", "GBP", "JPY"];
function makeDate(x) {
    // get random name
    var getRandomName = function () {
        var firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        var lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return "".concat(firstName, " ").concat(lastName);
    };
    var getRandomId = function () {
        return "order_".concat(Math.floor(Math.random() * 100000));
    };
    var getRandomDisplayId = function () {
        return Math.floor(Math.random() * 100000);
    };
    var getRandomAmount = function () {
        return Math.floor(Math.random() * 1000);
    };
    var getRandomCurrency = function () {
        return currencies[Math.floor(Math.random() * currencies.length)];
    };
    var getRandomEmail = function () {
        return "".concat(Math.floor(Math.random() * 100000), "@gmail.com");
    };
    // Create x random orders and resolve them after 1 second
    var orders = Array.from({ length: x }, function () { return ({
        id: getRandomId(),
        displayId: getRandomDisplayId(),
        customer: getRandomName(),
        email: getRandomEmail(),
        amount: getRandomAmount(),
        currency: getRandomCurrency(),
    }); });
    return orders;
}
var useFakeOrders = function (_a) {
    var offset = _a.offset, limit = _a.limit;
    var COUNT = 1000;
    var _b = React.useState(makeDate(limit)), orders = _b[0], setOrders = _b[1];
    var _c = React.useState(0), offsetState = _c[0], setOffsetState = _c[1];
    var _d = React.useState(false), isLoading = _d[0], setIsLoading = _d[1];
    // Fake API call
    React.useEffect(function () {
        var fetchOrders = function () { return __awaiter(void 0, void 0, void 0, function () {
            var newOrders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (offset === offsetState) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 1:
                        _a.sent();
                        if (offset > COUNT) {
                            return [2 /*return*/];
                        }
                        newOrders = makeDate(limit);
                        setOrders(newOrders);
                        setOffsetState(offset);
                        return [2 /*return*/];
                }
            });
        }); };
        setIsLoading(true);
        fetchOrders().then(function () {
            setIsLoading(false);
        });
    }, [offset, limit, orders, offsetState]);
    return {
        orders: orders,
        isLoading: isLoading,
        count: COUNT,
    };
};
var fakeData = makeDate(10);
console.log(JSON.stringify(fakeData, null, 2));
var formatCurrency = function (amount, currency) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        signDisplay: "always",
    }).format(amount);
};
exports.Default = {
    render: function () {
        return (<div className="flex w-[80vw] items-center justify-center">
        <table_1.Table>
          <table_1.Table.Header>
            <table_1.Table.Row>
              <table_1.Table.HeaderCell>#</table_1.Table.HeaderCell>
              <table_1.Table.HeaderCell>Customer</table_1.Table.HeaderCell>
              <table_1.Table.HeaderCell>Email</table_1.Table.HeaderCell>
              <table_1.Table.HeaderCell className="text-right">Amount</table_1.Table.HeaderCell>
              <table_1.Table.HeaderCell></table_1.Table.HeaderCell>
            </table_1.Table.Row>
          </table_1.Table.Header>
          <table_1.Table.Body>
            {fakeData.map(function (order) {
                return (<table_1.Table.Row key={order.id} className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap">
                  <table_1.Table.Cell>{order.displayId}</table_1.Table.Cell>
                  <table_1.Table.Cell>{order.customer}</table_1.Table.Cell>
                  <table_1.Table.Cell>{order.email}</table_1.Table.Cell>
                  <table_1.Table.Cell className="text-right">
                    {formatCurrency(order.amount, order.currency)}
                  </table_1.Table.Cell>
                  <table_1.Table.Cell className="text-ui-fg-muted">
                    {order.currency}
                  </table_1.Table.Cell>
                </table_1.Table.Row>);
            })}
          </table_1.Table.Body>
        </table_1.Table>
      </div>);
    },
};
var PaginatedDemo = function () {
    var _a = React.useState(0), pageIndex = _a[0], setPageIndex = _a[1];
    var pageSize = 10;
    var _b = useFakeOrders({
        offset: pageIndex * pageSize,
        limit: pageSize,
    }), orders = _b.orders, isLoading = _b.isLoading, count = _b.count;
    var pageCount = Math.ceil(count / pageSize);
    var canNextPage = pageIndex < pageCount - 1 && !isLoading;
    var canPreviousPage = pageIndex > 0 && !isLoading;
    var nextPage = function () {
        if (canNextPage) {
            setPageIndex(pageIndex + 1);
        }
    };
    var previousPage = function () {
        if (canPreviousPage) {
            setPageIndex(pageIndex - 1);
        }
    };
    return (<div className="flex w-[80vw] flex-col items-center justify-center">
      <table_1.Table>
        <table_1.Table.Header>
          <table_1.Table.Row>
            <table_1.Table.HeaderCell>#</table_1.Table.HeaderCell>
            <table_1.Table.HeaderCell>Customer</table_1.Table.HeaderCell>
            <table_1.Table.HeaderCell>Email</table_1.Table.HeaderCell>
            <table_1.Table.HeaderCell className="text-right">Amount</table_1.Table.HeaderCell>
            <table_1.Table.HeaderCell></table_1.Table.HeaderCell>
          </table_1.Table.Row>
        </table_1.Table.Header>
        <table_1.Table.Body>
          {orders.map(function (order) {
            return (<table_1.Table.Row key={order.id} className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap">
                <table_1.Table.Cell>{order.displayId}</table_1.Table.Cell>
                <table_1.Table.Cell>{order.customer}</table_1.Table.Cell>
                <table_1.Table.Cell>{order.email}</table_1.Table.Cell>
                <table_1.Table.Cell className="text-right">{order.amount}</table_1.Table.Cell>
                <table_1.Table.Cell className="text-ui-fg-muted">
                  {order.currency}
                </table_1.Table.Cell>
              </table_1.Table.Row>);
        })}
        </table_1.Table.Body>
      </table_1.Table>
      <table_1.Table.Pagination pageCount={pageCount} canNextPage={canNextPage} canPreviousPage={canPreviousPage} count={count} pageSize={pageSize} pageIndex={pageIndex} nextPage={nextPage} previousPage={previousPage}/>
      <div className="mt-12 flex flex-col items-center gap-y-4 font-mono text-xs">
        <div className="flex items-center gap-x-4">
          <p>Page Index: {pageIndex}</p>
          <p>Page Count: {pageCount}</p>
          <p>Count: {count}</p>
          <p>Page Size: {pageSize}</p>
        </div>
        <div className="flex items-center gap-x-4">
          <p>Can Next Page: {canNextPage ? "true" : "false"}</p>
          <p>Can Previous Page: {canPreviousPage ? "true" : "false"}</p>
          <p>Is Loading: {isLoading ? "true" : "false"}</p>
        </div>
      </div>
    </div>);
};
exports.Paginated = {
    render: function () {
        return <PaginatedDemo />;
    },
};
