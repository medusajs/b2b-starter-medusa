"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Success = exports.Error = exports.Warning = exports.Info = void 0;
var React = require("react");
var inline_tip_1 = require("./inline-tip");
var meta = {
    title: "Components/InlineTip",
    component: inline_tip_1.InlineTip,
    parameters: {
        layout: "centered",
    },
    render: function (args) {
        return (<div className="flex max-w-md">
        <inline_tip_1.InlineTip {...args}/>
      </div>);
    },
};
exports.default = meta;
exports.Info = {
    args: {
        variant: "info",
        label: "Info",
        children: "You can always install the storefront at a later point. Medusa is a headless backend, so it operates without a storefront by default. You can connect any storefront to it. The Next.js Starter storefront is a good option to use, but you can also build your own storefront later on.",
    },
};
exports.Warning = {
    args: {
        variant: "warning",
        label: "Warning",
        children: "If you have multiple storage plugins configured, the last plugin declared in the medusa-config.js file will be used.",
    },
};
exports.Error = {
    args: {
        variant: "error",
        label: "Don'ts",
        children: "Don’t use data models if you want to store simple key-value pairs related to a Medusa data model. Instead, use the metadata field that modles have, which is an object of custom key-value pairs.",
    },
};
exports.Success = {
    args: {
        variant: "success",
        label: "Do's",
        children: "Use data models when you want to store data related to your customization in the database.",
    },
};
