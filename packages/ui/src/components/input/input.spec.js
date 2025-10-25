"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var input_1 = require("./input");
describe("Input", function () {
    it("should render the component", function () {
        (0, react_1.render)(<input_1.Input />);
        expect(react_1.screen.getByRole("textbox")).toBeInTheDocument();
    });
});
