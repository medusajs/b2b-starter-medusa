"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var label_1 = require("./label");
test("renders a label", function () {
    (0, react_1.render)(<label_1.Label>I am a label</label_1.Label>);
    var text = react_1.screen.getByText("I am a label");
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("LABEL");
});
