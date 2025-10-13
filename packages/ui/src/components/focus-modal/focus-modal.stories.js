"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var button_1 = require("@/components/button");
var focus_modal_1 = require("./focus-modal");
var meta = {
    title: "Components/FocusModal",
    component: focus_modal_1.FocusModal,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
exports.Default = {
    render: function () {
        return (<focus_modal_1.FocusModal>
        <focus_modal_1.FocusModal.Trigger asChild>
          <button_1.Button>Edit Variant</button_1.Button>
        </focus_modal_1.FocusModal.Trigger>
        <focus_modal_1.FocusModal.Content>
          <focus_modal_1.FocusModal.Header>
            <button_1.Button>Save</button_1.Button>
          </focus_modal_1.FocusModal.Header>
          <focus_modal_1.FocusModal.Body></focus_modal_1.FocusModal.Body>
        </focus_modal_1.FocusModal.Content>
      </focus_modal_1.FocusModal>);
    },
};
