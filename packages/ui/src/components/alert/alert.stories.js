"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dismissible = exports.Warning = exports.Success = exports.Error = exports.Info = void 0;
var React = require("react");
var alert_1 = require("./alert");
var meta = {
    title: "Components/Alert",
    component: alert_1.Alert,
    argTypes: {
        variant: {
            control: {
                type: "select",
                options: ["info", "error", "success", "warning"],
            },
        },
        dismissible: {
            control: {
                type: "boolean",
            },
        },
    },
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
var Text = "We have sent you an email with instructions on how to reset your password. If you don't receive an email, please check your spam folder or try again.";
exports.Info = {
    args: {
        variant: "info",
        children: Text,
    },
    render: function (args) { return (<div className="max-w-[300px]">
      <alert_1.Alert {...args}/>
    </div>); },
};
exports.Error = {
    args: {
        variant: "error",
        children: Text,
    },
    render: function (args) { return (<div className="max-w-[300px]">
      <alert_1.Alert {...args}/>
    </div>); },
};
exports.Success = {
    args: {
        variant: "success",
        children: Text,
    },
    render: function (args) { return (<div className="max-w-[300px]">
      <alert_1.Alert {...args}/>
    </div>); },
};
exports.Warning = {
    args: {
        variant: "warning",
        children: Text,
    },
    render: function (args) { return (<div className="max-w-[300px]">
      <alert_1.Alert {...args}/>
    </div>); },
};
exports.Dismissible = {
    args: {
        dismissible: true,
        children: Text,
    },
    render: function (args) { return (<div className="max-w-[300px]">
      <alert_1.Alert {...args}/>
    </div>); },
};
