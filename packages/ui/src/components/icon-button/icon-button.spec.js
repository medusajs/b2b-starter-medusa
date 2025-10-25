"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var React = require("react");
var icons_1 = require("@medusajs/icons");
var icon_button_1 = require("./icon-button");
describe("IconButton", function () {
    it("renders a IconButton", function () {
        (0, react_1.render)(<icon_button_1.IconButton>
        <icons_1.Plus />
      </icon_button_1.IconButton>);
        var button = react_1.screen.getByRole("button");
        expect(button).toBeInTheDocument();
    });
    it("renders a button as a link", function () {
        (0, react_1.render)(<icon_button_1.IconButton asChild>
        <a href="https://www.medusajs.com">
          <icons_1.Plus />
        </a>
      </icon_button_1.IconButton>);
        var button = react_1.screen.getByRole("link");
        expect(button).toBeInTheDocument();
    });
});
