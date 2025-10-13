"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
var React = require("react");
var container_1 = require("@/components/container");
var progress_accordion_1 = require("./progress-accordion");
var meta = {
    title: "Components/ProgressAccordion",
    component: progress_accordion_1.ProgressAccordion,
    parameters: {
        layout: "fullscreen",
    },
};
exports.default = meta;
var AccordionDemo = function () {
    var _a = React.useState(["1"]), value = _a[0], setValue = _a[1];
    return (<div className="flex items-center justify-center p-8">
      <container_1.Container className="p-0">
        <progress_accordion_1.ProgressAccordion value={value} onValueChange={setValue} type="multiple" className="w-full">
          <progress_accordion_1.ProgressAccordion.Item value="1">
            <progress_accordion_1.ProgressAccordion.Header>Trigger 1</progress_accordion_1.ProgressAccordion.Header>
            <progress_accordion_1.ProgressAccordion.Content>
              <div className="pb-6">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. A
                recusandae officiis aliquam quia, natus saepe obcaecati eligendi
                non animi fuga culpa, cum unde consequuntur architecto quos
                reiciendis deleniti eos iste!
              </div>
            </progress_accordion_1.ProgressAccordion.Content>
          </progress_accordion_1.ProgressAccordion.Item>
          <progress_accordion_1.ProgressAccordion.Item value="2">
            <progress_accordion_1.ProgressAccordion.Header>Trigger 2</progress_accordion_1.ProgressAccordion.Header>
            <progress_accordion_1.ProgressAccordion.Content>
              <div className="pb-6">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. A
                recusandae officiis aliquam quia, natus saepe obcaecati eligendi
                non animi fuga culpa, cum unde consequuntur architecto quos
                reiciendis deleniti eos iste!
              </div>
            </progress_accordion_1.ProgressAccordion.Content>
          </progress_accordion_1.ProgressAccordion.Item>
        </progress_accordion_1.ProgressAccordion>
      </container_1.Container>
    </div>);
};
exports.Default = {
    render: function () {
        return <AccordionDemo />;
    },
    args: {},
};
