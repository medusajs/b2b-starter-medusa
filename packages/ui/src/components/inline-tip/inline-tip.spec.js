"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var inline_tip_1 = require("./inline-tip");
describe("InlineTip", function () {
    it("renders a InlineTip", function () {
        (0, react_1.render)(<inline_tip_1.InlineTip label="Test">This is a test</inline_tip_1.InlineTip>);
        expect(react_1.screen.getByText("This is a test")).toBeInTheDocument();
    });
    it("renders a InlineTip with a warning variant", function () {
        (0, react_1.render)(<inline_tip_1.InlineTip variant="warning" label="Test">
        This is a test
      </inline_tip_1.InlineTip>);
        expect(react_1.screen.getByText("This is a test")).toBeInTheDocument();
    });
    it("renders a InlineTip with an error variant", function () {
        (0, react_1.render)(<inline_tip_1.InlineTip variant="error" label="Test">
        This is a test
      </inline_tip_1.InlineTip>);
        expect(react_1.screen.getByText("This is a test")).toBeInTheDocument();
    });
    it("renders a InlineTip with a success variant", function () {
        (0, react_1.render)(<inline_tip_1.InlineTip variant="success" label="Test">
        This is a test
      </inline_tip_1.InlineTip>);
        expect(react_1.screen.getByText("This is a test")).toBeInTheDocument();
    });
});
