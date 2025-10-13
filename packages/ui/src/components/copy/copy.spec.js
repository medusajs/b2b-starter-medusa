"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var tooltip_1 = require("../tooltip");
var copy_1 = require("./copy");
describe("Copy", function () {
    it("should render", function () {
        (0, react_1.render)(<tooltip_1.TooltipProvider><copy_1.Copy content="Hello world"/></tooltip_1.TooltipProvider>);
        expect(react_1.screen.getByRole("button")).toBeInTheDocument();
    });
});
