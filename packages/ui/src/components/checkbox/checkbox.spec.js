"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var checkbox_1 = require("./checkbox");
describe("Checkbox", function () {
    it("renders a checkbox", function () {
        (0, react_1.render)(<checkbox_1.Checkbox />);
        expect(react_1.screen.getByRole("checkbox")).toBeInTheDocument();
    });
});
