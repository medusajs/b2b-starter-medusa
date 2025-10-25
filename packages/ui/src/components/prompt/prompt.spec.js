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
var react_1 = require("@testing-library/react");
var React = require("react");
var prompt_1 = require("./prompt");
var button_1 = require("@/components/button");
var TRIGGER_TEXT = "Open";
var TITLE_TEXT = "Delete something";
var DESCRIPTION_TEXT = "Are you sure? This cannot be undone.";
var CANCEL_TEXT = "Cancel";
var CONFIRM_TEXT = "Confirm";
describe("Prompt", function () {
    var rendered;
    var trigger;
    beforeEach(function () {
        rendered = (0, react_1.render)(<prompt_1.Prompt>
        <prompt_1.Prompt.Trigger asChild>
          <button_1.Button>{TRIGGER_TEXT}</button_1.Button>
        </prompt_1.Prompt.Trigger>
        <prompt_1.Prompt.Content>
          <prompt_1.Prompt.Header>
            <prompt_1.Prompt.Title>{TITLE_TEXT}</prompt_1.Prompt.Title>
            <prompt_1.Prompt.Description>{DESCRIPTION_TEXT}</prompt_1.Prompt.Description>
          </prompt_1.Prompt.Header>
          <prompt_1.Prompt.Footer>
            <prompt_1.Prompt.Cancel>{CANCEL_TEXT}</prompt_1.Prompt.Cancel>
            <prompt_1.Prompt.Action>{CONFIRM_TEXT}</prompt_1.Prompt.Action>
          </prompt_1.Prompt.Footer>
        </prompt_1.Prompt.Content>
      </prompt_1.Prompt>);
        trigger = rendered.getByText(TRIGGER_TEXT);
    });
    afterEach(function () {
        (0, react_1.cleanup)();
    });
    it("renders a basic alert dialog when the trigger is clicked", function () { return __awaiter(void 0, void 0, void 0, function () {
        var title, description;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_1.fireEvent.click(trigger);
                    return [4 /*yield*/, rendered.findByText(TITLE_TEXT)];
                case 1:
                    title = _a.sent();
                    return [4 /*yield*/, rendered.findByText(DESCRIPTION_TEXT)];
                case 2:
                    description = _a.sent();
                    expect(title).toBeInTheDocument();
                    expect(description).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it("close the dialog when the cancel button is clicked", function () { return __awaiter(void 0, void 0, void 0, function () {
        var title, description, cancelButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_1.fireEvent.click(trigger);
                    title = rendered.queryByText(TITLE_TEXT);
                    description = rendered.queryByText(DESCRIPTION_TEXT);
                    expect(title).toBeInTheDocument();
                    expect(description).toBeInTheDocument();
                    return [4 /*yield*/, rendered.findByText(CANCEL_TEXT)];
                case 1:
                    cancelButton = _a.sent();
                    react_1.fireEvent.click(cancelButton);
                    expect(title).not.toBeInTheDocument();
                    expect(description).not.toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it("close the dialog when the confirm button is clicked", function () { return __awaiter(void 0, void 0, void 0, function () {
        var title, description, confirmButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_1.fireEvent.click(trigger);
                    title = rendered.queryByText(TITLE_TEXT);
                    description = rendered.queryByText(DESCRIPTION_TEXT);
                    expect(title).toBeInTheDocument();
                    expect(description).toBeInTheDocument();
                    return [4 /*yield*/, rendered.findByText(CONFIRM_TEXT)];
                case 1:
                    confirmButton = _a.sent();
                    react_1.fireEvent.click(confirmButton);
                    expect(title).not.toBeInTheDocument();
                    expect(description).not.toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
});
