"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var textarea_1 = require("./textarea");
var meta = {
    title: "Components/Textarea",
    component: textarea_1.Textarea,
    parameters: {
        layout: "centered",
    },
    render: function (args) { return (<div className="w-[400px]">
      <textarea_1.Textarea {...args}/>
    </div>); },
};
exports.default = meta;
exports.Default = {
    args: {
        placeholder: "Placeholder",
    },
};
