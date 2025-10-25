"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoDescription = exports.WithAction = exports.Message = exports.Loading = exports.Success = exports.Error = exports.Warning = exports.Information = void 0;
var React = require("react");
var icons_1 = require("@medusajs/icons");
var kbd_1 = require("../kbd");
var toast_1 = require("./toast");
var meta = {
    title: "Components/Toast",
    component: toast_1.Toast,
    parameters: {
        layout: "centered",
    },
    render: function (args) {
        return <toast_1.Toast {...args}/>;
    },
};
exports.default = meta;
exports.Information = {
    args: {
        title: "Label",
        description: "The quick brown fox jumps over a lazy dog.",
        variant: "info",
    },
};
exports.Warning = {
    args: {
        title: "Label",
        description: "The quick brown fox jumps over a lazy dog.",
        variant: "warning",
    },
};
exports.Error = {
    args: {
        title: "Label",
        description: "The quick brown fox jumps over a lazy dog.",
        variant: "error",
    },
};
exports.Success = {
    args: {
        title: "Label",
        description: "The quick brown fox jumps over a lazy dog.",
        variant: "success",
    },
};
exports.Loading = {
    args: {
        title: "Label",
        description: "The quick brown fox jumps over a lazy dog.",
        variant: "loading",
    },
};
exports.Message = {
    args: {
        title: <span>Next time hit <kbd_1.Kbd>G</kbd_1.Kbd> then <kbd_1.Kbd>O</kbd_1.Kbd> to go to orders.</span>,
        icon: <icons_1.Keyboard className="text-ui-fg-subtle"/>,
    }
};
exports.WithAction = {
    args: {
        title: "Scheduled meeting",
        description: "The meeting has been added to your calendar.",
        variant: "success",
        action: {
            altText: "Undo adding meeting to calendar",
            onClick: function () { },
            label: "Undo",
        },
    },
};
exports.NoDescription = {
    args: {
        title: "Label",
        variant: "info",
    },
};
