"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Small = exports.Disabled = exports.Default = void 0;
var React = require("react");
var select_1 = require("./select");
var meta = {
    title: "Components/Select",
    component: select_1.Select,
    parameters: {
        layout: "centered",
    },
};
exports.default = meta;
var data = [
    {
        label: "Shirts",
        items: [
            {
                value: "dress-shirt-striped",
                label: "Striped Dress Shirt",
            },
            {
                value: "relaxed-button-down",
                label: "Relaxed Fit Button Down",
            },
            {
                value: "slim-button-down",
                label: "Slim Fit Button Down",
            },
            {
                value: "dress-shirt-solid",
                label: "Solid Dress Shirt",
            },
            {
                value: "dress-shirt-check",
                label: "Check Dress Shirt",
            },
        ],
    },
    {
        label: "T-Shirts",
        items: [
            {
                value: "v-neck",
                label: "V-Neck",
            },
            {
                value: "crew-neck",
                label: "Crew Neck",
            },
            {
                value: "henley",
                label: "Henley",
            },
            {
                value: "polo",
                label: "Polo",
            },
            {
                value: "mock-neck",
                label: "Mock Neck",
            },
            {
                value: "turtleneck",
                label: "Turtleneck",
            },
            {
                value: "scoop-neck",
                label: "Scoop Neck",
            },
        ],
    },
];
exports.Default = {
    render: function () {
        return (<div className="w-[250px]">
        <select_1.Select open>
          <select_1.Select.Trigger>
            <select_1.Select.Value placeholder="Select"/>
          </select_1.Select.Trigger>
          <select_1.Select.Content>
            {data.map(function (group) { return (<select_1.Select.Group key={group.label}>
                <select_1.Select.Label>{group.label}</select_1.Select.Label>
                {group.items.map(function (item) { return (<select_1.Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </select_1.Select.Item>); })}
              </select_1.Select.Group>); })}
          </select_1.Select.Content>
        </select_1.Select>
      </div>);
    },
};
exports.Disabled = {
    render: function () {
        return (<div className="w-[250px]">
        <select_1.Select>
          <select_1.Select.Trigger disabled={true}>
            <select_1.Select.Value placeholder="Select"/>
          </select_1.Select.Trigger>
          <select_1.Select.Content>
            {data.map(function (group) { return (<select_1.Select.Group key={group.label}>
                <select_1.Select.Label>{group.label}</select_1.Select.Label>
                {group.items.map(function (item) { return (<select_1.Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </select_1.Select.Item>); })}
              </select_1.Select.Group>); })}
          </select_1.Select.Content>
        </select_1.Select>
      </div>);
    },
};
exports.Small = {
    render: function () {
        return (<div className="w-[250px]">
        <select_1.Select size="small">
          <select_1.Select.Trigger>
            <select_1.Select.Value placeholder="Select"/>
          </select_1.Select.Trigger>
          <select_1.Select.Content>
            {data.map(function (group) { return (<select_1.Select.Group key={group.label}>
                <select_1.Select.Label>{group.label}</select_1.Select.Label>
                {group.items.map(function (item) { return (<select_1.Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </select_1.Select.Item>); })}
              </select_1.Select.Group>); })}
          </select_1.Select.Content>
        </select_1.Select>
      </div>);
    },
};
// const InModalDemo = () => {
//   const [open, setOpen] = React.useState(false)
//   const prompt = usePrompt()
//   const onClose = async () => {
//     const res = await prompt({
//       title: "Are you sure?",
//       description: "You have unsaved changes. Are you sure you want to close?",
//       confirmText: "Yes",
//       cancelText: "Cancel",
//     })
//     if (!res) {
//       return
//     }
//     setOpen(false)
//   }
//   return (
//     <Drawer open={open} onOpenChange={setOpen}>
//       <Drawer.Trigger asChild>
//         <Button>Edit Variant</Button>
//       </Drawer.Trigger>
//       <Drawer.Content>
//         <Drawer.Header>
//           <Drawer.Title>Edit Variant</Drawer.Title>
//         </Drawer.Header>
//         <Drawer.Body>
//           <Select size="small">
//             <Select.Trigger>
//               <Select.Value placeholder="Select" />
//             </Select.Trigger>
//             <Select.Content>
//               {data.map((group) => (
//                 <Select.Group key={group.label}>
//                   <Select.Label>{group.label}</Select.Label>
//                   {group.items.map((item) => (
//                     <Select.Item key={item.value} value={item.value}>
//                       {item.label}
//                     </Select.Item>
//                   ))}
//                 </Select.Group>
//               ))}
//             </Select.Content>
//           </Select>
//         </Drawer.Body>
//         <Drawer.Footer>
//           <Button variant="secondary" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button>Save</Button>
//         </Drawer.Footer>
//       </Drawer.Content>
//     </Drawer>
//   )
// }
// export const InModal: Story = {
//   render: () => {
//     return <InModalDemo />
//   },
// }
