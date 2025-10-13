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
exports.BottomLeft = exports.BottomCenter = exports.BottomRight = exports.TopLeft = exports.TopCenter = exports.TopRight = void 0;
var React = require("react");
var button_1 = require("@/components/button");
var toast_1 = require("@/utils/toast");
var toaster_1 = require("./toaster");
var meta = {
    title: "Components/Toaster",
    component: toaster_1.Toaster,
    parameters: {
        layout: "centered",
    },
    render: function (args) {
        var makeMessageToast = function () {
            (0, toast_1.toast)("This is a message toast.");
        };
        var makeInfoToast = function () {
            toast_1.toast.info("This is an info toast.");
        };
        var makeSuccessToast = function () {
            toast_1.toast.success("This is a success toast.");
        };
        var makeWarningToast = function () {
            toast_1.toast.warning("This is a warning toast.");
        };
        var makeErrorToast = function () {
            toast_1.toast.error("This is an error toast.");
        };
        var makeActionToast = function () {
            toast_1.toast.error("This is an error toast with an action.", {
                action: {
                    label: "Retry",
                    altText: "Retry the request",
                    onClick: function () {
                        console.log("Retrying the request...");
                    },
                },
            });
        };
        var doAsyncStuff = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            if (Math.random() > 0.2) {
                                resolve("Success!");
                            }
                            else {
                                reject("Failed!");
                            }
                        }, 3000);
                    })];
            });
        }); };
        var makeAsyncToast = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                toast_1.toast.promise(doAsyncStuff, {
                    loading: "Loading...",
                    success: "Success!",
                    error: "Failed!",
                });
                return [2 /*return*/];
            });
        }); };
        var makeUpdatingToast = function () {
            var id = Math.random();
            var retry = function () { return __awaiter(void 0, void 0, void 0, function () {
                var coinFlip;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            coinFlip = Math.random() > 0.5;
                            console.log("retrying", id);
                            toast_1.toast.loading("Request in progress", {
                                id: id,
                                description: "The request is in progress.",
                            });
                            // wait 3 seconds
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                        case 1:
                            // wait 3 seconds
                            _a.sent();
                            if (coinFlip) {
                                toast_1.toast.success("Request succeeded", {
                                    id: id,
                                    description: "The request succeeded.",
                                });
                            }
                            else {
                                toast_1.toast.error("Request failed", {
                                    id: id,
                                    description: "Insert the description here. Can be semi-long and still work.",
                                    action: {
                                        label: "Retry",
                                        altText: "Retry the request",
                                        onClick: retry,
                                    },
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            }); };
            toast_1.toast.error("Request failed", {
                id: id,
                description: "Insert the description here. Can be semi-long and still work.",
                action: {
                    label: "Retry",
                    altText: "Retry the request",
                    onClick: retry,
                },
            });
        };
        return (<div className="size-full">
        <div className="flex flex-col gap-y-2">
          <button_1.Button size="small" variant="secondary" onClick={makeMessageToast}>
            Make message toast
          </button_1.Button>
          <button_1.Button size="small" variant="secondary" onClick={makeInfoToast}>
            Make info toast
          </button_1.Button>
          <button_1.Button size="small" variant="secondary" onClick={makeSuccessToast}>
            Make success toast
          </button_1.Button>
          <button_1.Button size="small" variant="secondary" onClick={makeWarningToast}>
            Make warning toast
          </button_1.Button>
          <button_1.Button size="small" variant="secondary" onClick={makeErrorToast}>
            Make error toast
          </button_1.Button>
          <button_1.Button size="small" variant="secondary" onClick={makeActionToast}>
            Make action toast
          </button_1.Button>
          <button_1.Button size="small" variant="secondary" onClick={makeUpdatingToast}>
            Make toast
          </button_1.Button>
          <button_1.Button size="small" variant="secondary" onClick={makeAsyncToast}>
            Make async toast
          </button_1.Button>
        </div>
        <toaster_1.Toaster {...args}/>
      </div>);
    },
};
exports.default = meta;
exports.TopRight = {
    args: {
        position: "top-right",
    },
};
exports.TopCenter = {
    args: {
        position: "top-center",
    },
};
exports.TopLeft = {
    args: {
        position: "top-left",
    },
};
exports.BottomRight = {
    args: {
        position: "bottom-right",
    },
};
exports.BottomCenter = {
    args: {
        position: "bottom-center",
    },
};
exports.BottomLeft = {
    args: {
        position: "bottom-left",
    },
};
