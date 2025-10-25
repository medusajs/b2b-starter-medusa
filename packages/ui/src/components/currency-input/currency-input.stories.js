"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InGrid = exports.Default = void 0;
var React = require("react");
var currency_input_1 = require("./currency-input");
var meta = {
    title: "Components/CurrencyInput",
    component: currency_input_1.CurrencyInput,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    args: {
        symbol: "$",
        code: "usd",
    },
};
exports.InGrid = {
    render: function (args) {
        return (<div className="grid w-full grid-cols-3">
        <currency_input_1.CurrencyInput {...args}/>
        <currency_input_1.CurrencyInput {...args}/>
        <currency_input_1.CurrencyInput {...args}/>
      </div>);
    },
    args: {
        symbol: "$",
        code: "usd",
    },
};
