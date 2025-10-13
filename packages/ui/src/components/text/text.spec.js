"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var text_1 = require("./text");
describe("Text", function () {
    it("renders a text", function () {
        (0, react_1.render)(<text_1.Text>I am a paragraph</text_1.Text>);
        var text = react_1.screen.getByText("I am a paragraph");
        expect(text).toBeInTheDocument();
        expect(text.tagName).toBe("P");
    });
    it("renders a text as a child", function () {
        (0, react_1.render)(<text_1.Text asChild>
        <span>I am a span</span>
      </text_1.Text>);
        var text = react_1.screen.getByText("I am a span");
        expect(text).toBeInTheDocument();
        expect(text.tagName).toBe("SPAN");
    });
});
