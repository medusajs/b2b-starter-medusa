"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var button_1 = require("@/components/button");
var drawer_1 = require("./drawer");
var meta = {
    title: "Components/Drawer",
    component: drawer_1.Drawer,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    render: function () {
        return (<drawer_1.Drawer>
        <drawer_1.Drawer.Trigger asChild>
          <button_1.Button>Edit Variant</button_1.Button>
        </drawer_1.Drawer.Trigger>
        <drawer_1.Drawer.Content>
          <drawer_1.Drawer.Header>
            <drawer_1.Drawer.Title>Edit Variant</drawer_1.Drawer.Title>
          </drawer_1.Drawer.Header>
          <drawer_1.Drawer.Body></drawer_1.Drawer.Body>
          <drawer_1.Drawer.Footer>
            <drawer_1.Drawer.Close asChild>
              <button_1.Button variant="secondary">Cancel</button_1.Button>
            </drawer_1.Drawer.Close>
            <button_1.Button>Save</button_1.Button>
          </drawer_1.Drawer.Footer>
        </drawer_1.Drawer.Content>
      </drawer_1.Drawer>);
    },
};
