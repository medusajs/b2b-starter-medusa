"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var container_1 = require("../container");
var tabs_1 = require("./tabs");
var meta = {
    title: "Components/Tabs",
    component: tabs_1.Tabs,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
var Demo = function () {
    return (<div className="h-screen max-h-[500px] w-screen max-w-[700px]">
      <tabs_1.Tabs defaultValue="tab1">
        <tabs_1.Tabs.List>
          <tabs_1.Tabs.Trigger value="tab1">Tab 1</tabs_1.Tabs.Trigger>
          <tabs_1.Tabs.Trigger value="tab2">Tab 2</tabs_1.Tabs.Trigger>
          <tabs_1.Tabs.Trigger value="tab3">Tab 3</tabs_1.Tabs.Trigger>
        </tabs_1.Tabs.List>
        <container_1.Container className="txt-compact-medium text-ui-fg-base mt-4 h-full p-3">
          <tabs_1.Tabs.Content value="tab1">Tab 1 content</tabs_1.Tabs.Content>
          <tabs_1.Tabs.Content value="tab2">Tab 2 content</tabs_1.Tabs.Content>
          <tabs_1.Tabs.Content value="tab3">Tab 3 content</tabs_1.Tabs.Content>
        </container_1.Container>
      </tabs_1.Tabs>
    </div>);
};
exports.Default = {
    render: function () { return <Demo />; },
};
