"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var button_1 = require("./button");
describe("Button", function () {
    it("renders a button", function () {
        (0, react_1.render)(<button_1.Button>Click me</button_1.Button>);
        var button = react_1.screen.getByRole("button", { name: "Click me" });
        expect(button).toBeInTheDocument();
    });
    it("renders a button as a link", function () {
        (0, react_1.render)(<button_1.Button asChild>
        <a href="https://www.medusajs.com">Go to website</a>
      </button_1.Button>);
        var button = react_1.screen.getByRole("link", { name: "Go to website" });
        expect(button).toBeInTheDocument();
    });
});
