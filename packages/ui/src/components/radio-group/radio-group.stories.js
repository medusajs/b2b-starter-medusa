"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoiceBoxDisabledSelected = exports.ChoiceBox = exports.Disabled = exports.WithLabelAndDescription = exports.WithLabel = exports.Default = void 0;
var React = require("react");
var label_1 = require("@/components/label");
var text_1 = require("@/components/text");
var radio_group_1 = require("./radio-group");
var meta = {
    title: "Components/RadioGroup",
    component: radio_group_1.RadioGroup,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    render: function () {
        return (<radio_group_1.RadioGroup>
        <radio_group_1.RadioGroup.Item value="1"/>
        <radio_group_1.RadioGroup.Item value="2"/>
        <radio_group_1.RadioGroup.Item value="3"/>
      </radio_group_1.RadioGroup>);
    },
};
exports.WithLabel = {
    render: function () {
        return (<radio_group_1.RadioGroup>
        <div className="flex items-center gap-x-3">
          <radio_group_1.RadioGroup.Item value="1" id="radio_1"/>
          <label_1.Label htmlFor="radio_1" weight="plus">
            Radio 1
          </label_1.Label>
        </div>
        <div className="flex items-center gap-x-3">
          <radio_group_1.RadioGroup.Item value="2" id="radio_2"/>
          <label_1.Label htmlFor="radio_2" weight="plus">
            Radio 2
          </label_1.Label>
        </div>
        <div className="flex items-center gap-x-3">
          <radio_group_1.RadioGroup.Item value="3" id="radio_3"/>
          <label_1.Label htmlFor="radio_3" weight="plus">
            Radio 3
          </label_1.Label>
        </div>
      </radio_group_1.RadioGroup>);
    },
};
exports.WithLabelAndDescription = {
    render: function () {
        return (<radio_group_1.RadioGroup>
        <div className="flex items-start gap-x-3">
          <radio_group_1.RadioGroup.Item value="1" id="radio_1"/>
          <div className="flex flex-col gap-y-0.5">
            <label_1.Label htmlFor="radio_1" weight="plus">
              Radio 1
            </label_1.Label>
            <text_1.Text className="text-ui-fg-subtle">
              The quick brown fox jumps over a lazy dog.
            </text_1.Text>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <radio_group_1.RadioGroup.Item value="2" id="radio_2"/>
          <div className="flex flex-col gap-y-0.5">
            <label_1.Label htmlFor="radio_2" weight="plus">
              Radio 2
            </label_1.Label>
            <text_1.Text className="text-ui-fg-subtle">
              The quick brown fox jumps over a lazy dog.
            </text_1.Text>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <radio_group_1.RadioGroup.Item value="3" id="radio_3"/>
          <div className="flex flex-col gap-y-0.5">
            <label_1.Label htmlFor="radio_3" weight="plus">
              Radio 3
            </label_1.Label>
            <text_1.Text className="text-ui-fg-subtle">
              The quick brown fox jumps over a lazy dog.
            </text_1.Text>
          </div>
        </div>
      </radio_group_1.RadioGroup>);
    },
};
exports.Disabled = {
    render: function () {
        return (<radio_group_1.RadioGroup>
        <radio_group_1.RadioGroup.Item value="1" disabled/>
        <radio_group_1.RadioGroup.Item value="2"/>
        <radio_group_1.RadioGroup.Item value="3" disabled checked/>
      </radio_group_1.RadioGroup>);
    },
};
exports.ChoiceBox = {
    render: function () {
        return (<radio_group_1.RadioGroup>
        <radio_group_1.RadioGroup.ChoiceBox value="1" label="One" description="The quick brown fox jumps over a lazy dog."/>
        <radio_group_1.RadioGroup.ChoiceBox value="2" label="Two" description="The quick brown fox jumps over a lazy dog."/>
        <radio_group_1.RadioGroup.ChoiceBox value="3" label="Three" description="The quick brown fox jumps over a lazy dog." disabled/>
      </radio_group_1.RadioGroup>);
    },
};
exports.ChoiceBoxDisabledSelected = {
    render: function () {
        return (<radio_group_1.RadioGroup defaultValue={"3"}>
        <radio_group_1.RadioGroup.ChoiceBox value="1" label="One" description="The quick brown fox jumps over a lazy dog."/>
        <radio_group_1.RadioGroup.ChoiceBox value="2" label="Two" description="The quick brown fox jumps over a lazy dog."/>
        <radio_group_1.RadioGroup.ChoiceBox value="3" label="Three" description="The quick brown fox jumps over a lazy dog." disabled/>
      </radio_group_1.RadioGroup>);
    },
};
