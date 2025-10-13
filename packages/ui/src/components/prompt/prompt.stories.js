"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var button_1 = require("@/components/button");
var prompt_1 = require("./prompt");
var meta = {
    title: "Components/Prompt",
    component: prompt_1.Prompt,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    render: function () {
        return (<prompt_1.Prompt>
        <prompt_1.Prompt.Trigger asChild>
          <button_1.Button>Open</button_1.Button>
        </prompt_1.Prompt.Trigger>
        <prompt_1.Prompt.Content>
          <prompt_1.Prompt.Header>
            <prompt_1.Prompt.Title>Delete something</prompt_1.Prompt.Title>
            <prompt_1.Prompt.Description>
              Are you sure? This cannot be undone.
            </prompt_1.Prompt.Description>
          </prompt_1.Prompt.Header>
          <prompt_1.Prompt.Footer>
            <prompt_1.Prompt.Cancel>Cancel</prompt_1.Prompt.Cancel>
            <prompt_1.Prompt.Action>Delete</prompt_1.Prompt.Action>
          </prompt_1.Prompt.Footer>
        </prompt_1.Prompt.Content>
      </prompt_1.Prompt>);
    },
};
