"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InLayout = exports.Default = void 0;
var React = require("react");
var heading_1 = require("@/components/heading");
var text_1 = require("@/components/text");
var container_1 = require("./container");
var meta = {
    title: "Components/Container",
    component: container_1.Container,
};
exports.default = meta;
exports.Default = {
    args: {
        children: <text_1.Text>Hello World</text_1.Text>,
    },
    parameters: {
        layout: "centered",
    },
};
exports.InLayout = {
    render: function () { return (<div className="flex h-screen w-screen">
      <div className="border-ui-border-base w-full max-w-[216px] border-r p-4">
        <heading_1.Heading level="h3">Menubar</heading_1.Heading>
      </div>
      <div className="flex w-full flex-col gap-y-3 px-8 pb-8 pt-6">
        <container_1.Container>
          <heading_1.Heading>Section 1</heading_1.Heading>
        </container_1.Container>
        <container_1.Container>
          <heading_1.Heading>Section 2</heading_1.Heading>
        </container_1.Container>
        <container_1.Container>
          <heading_1.Heading>Section 3</heading_1.Heading>
        </container_1.Container>
      </div>
    </div>); },
    parameters: {
        layout: "fullscreen",
    },
};
