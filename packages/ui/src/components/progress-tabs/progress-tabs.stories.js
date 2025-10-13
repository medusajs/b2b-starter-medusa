"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var container_1 = require("../container");
var progress_tabs_1 = require("./progress-tabs");
var meta = {
    title: "Components/ProgressTabs",
    component: progress_tabs_1.ProgressTabs,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
var Demo = function () {
    return (<div className="h-screen max-h-[500px] w-screen max-w-[700px] overflow-hidden p-4">
      <container_1.Container className="h-full w-full overflow-hidden p-0">
        <progress_tabs_1.ProgressTabs defaultValue="tab1">
          <progress_tabs_1.ProgressTabs.List>
            <progress_tabs_1.ProgressTabs.Trigger value="tab1">Tab 1</progress_tabs_1.ProgressTabs.Trigger>
            <progress_tabs_1.ProgressTabs.Trigger value="tab2">Tab 2</progress_tabs_1.ProgressTabs.Trigger>
            <progress_tabs_1.ProgressTabs.Trigger value="tab3" disabled>
              Tab 3
            </progress_tabs_1.ProgressTabs.Trigger>
          </progress_tabs_1.ProgressTabs.List>
          <div className="txt-compact-medium text-ui-fg-base border-ui-border-base h-full border-t p-3">
            <progress_tabs_1.ProgressTabs.Content value="tab1">
              Tab 1 content
            </progress_tabs_1.ProgressTabs.Content>
            <progress_tabs_1.ProgressTabs.Content value="tab2">
              Tab 2 content
            </progress_tabs_1.ProgressTabs.Content>
            <progress_tabs_1.ProgressTabs.Content value="tab3">
              Tab 3 content
            </progress_tabs_1.ProgressTabs.Content>
          </div>
        </progress_tabs_1.ProgressTabs>
      </container_1.Container>
    </div>);
};
exports.Default = {
    render: function () { return <Demo />; },
};
