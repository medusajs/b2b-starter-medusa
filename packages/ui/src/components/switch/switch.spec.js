"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var switch_1 = require("./switch");
describe("Switch", function () {
    it("should render successfully", function () {
        (0, react_1.render)(<switch_1.Switch />);
        expect(react_1.screen.getByRole("switch")).toBeInTheDocument();
    });
});
