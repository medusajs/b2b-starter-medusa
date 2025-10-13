"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexMenu = exports.SimpleMenu = exports.SelectMenu = exports.SortingMenu = void 0;
var icons_1 = require("@medusajs/icons");
var React = require("react");
var button_1 = require("@/components/button");
var icon_button_1 = require("@/components/icon-button");
var select_1 = require("@/components/select");
var date_picker_1 = require("../date-picker");
var focus_modal_1 = require("../focus-modal");
var dropdown_menu_1 = require("./dropdown-menu");
var meta = {
    title: "Components/DropdownMenu",
    component: dropdown_menu_1.DropdownMenu,
};
exports.default = meta;
var SortingDemo = function () {
    var _a = React.useState("none"), sort = _a[0], setSort = _a[1];
    return (<div className="flex flex-col gap-y-2">
      <dropdown_menu_1.DropdownMenu>
        <dropdown_menu_1.DropdownMenu.Trigger asChild>
          <icon_button_1.IconButton variant="primary">
            <icons_1.EllipsisHorizontal />
          </icon_button_1.IconButton>
        </dropdown_menu_1.DropdownMenu.Trigger>
        <dropdown_menu_1.DropdownMenu.Content className="w-[300px]">
          <dropdown_menu_1.DropdownMenu.RadioGroup value={sort} onValueChange={function (v) { return setSort(v); }}>
            <dropdown_menu_1.DropdownMenu.RadioItem value="none">
              No Sorting
            </dropdown_menu_1.DropdownMenu.RadioItem>
            <dropdown_menu_1.DropdownMenu.Separator />
            <dropdown_menu_1.DropdownMenu.RadioItem value="alpha">
              Alphabetical
              <dropdown_menu_1.DropdownMenu.Hint>A-Z</dropdown_menu_1.DropdownMenu.Hint>
            </dropdown_menu_1.DropdownMenu.RadioItem>
            <dropdown_menu_1.DropdownMenu.RadioItem value="alpha-reverse">
              Reverse Alphabetical
              <dropdown_menu_1.DropdownMenu.Hint>Z-A</dropdown_menu_1.DropdownMenu.Hint>
            </dropdown_menu_1.DropdownMenu.RadioItem>
            <dropdown_menu_1.DropdownMenu.RadioItem value="asc">
              Created At - Ascending
              <dropdown_menu_1.DropdownMenu.Hint>1 - 30</dropdown_menu_1.DropdownMenu.Hint>
            </dropdown_menu_1.DropdownMenu.RadioItem>
            <dropdown_menu_1.DropdownMenu.RadioItem value="desc">
              Created At - Descending
              <dropdown_menu_1.DropdownMenu.Hint>30 - 1</dropdown_menu_1.DropdownMenu.Hint>
            </dropdown_menu_1.DropdownMenu.RadioItem>
          </dropdown_menu_1.DropdownMenu.RadioGroup>
        </dropdown_menu_1.DropdownMenu.Content>
      </dropdown_menu_1.DropdownMenu>
      <div>
        <pre>Sorting by: {sort}</pre>
      </div>
    </div>);
};
exports.SortingMenu = {
    render: function () {
        return <SortingDemo />;
    },
};
var SelectDemo = function () {
    var _a = React.useState([]), currencies = _a[0], setCurrencies = _a[1];
    var _b = React.useState([]), regions = _b[0], setRegions = _b[1];
    var onSelectCurrency = function (currency) {
        if (currencies.includes(currency)) {
            setCurrencies(currencies.filter(function (c) { return c !== currency; }));
        }
        else {
            setCurrencies(__spreadArray(__spreadArray([], currencies, true), [currency], false));
        }
    };
    var onSelectRegion = function (region) {
        if (regions.includes(region)) {
            setRegions(regions.filter(function (r) { return r !== region; }));
        }
        else {
            setRegions(__spreadArray(__spreadArray([], regions, true), [region], false));
        }
    };
    return (<div className="flex flex-col gap-y-2">
      <dropdown_menu_1.DropdownMenu>
        <dropdown_menu_1.DropdownMenu.Trigger asChild>
          <icon_button_1.IconButton>
            <icons_1.EllipsisHorizontal />
          </icon_button_1.IconButton>
        </dropdown_menu_1.DropdownMenu.Trigger>
        <dropdown_menu_1.DropdownMenu.Content className="w-[300px]">
          <dropdown_menu_1.DropdownMenu.Group>
            <dropdown_menu_1.DropdownMenu.Label>Currencies</dropdown_menu_1.DropdownMenu.Label>
            <dropdown_menu_1.DropdownMenu.CheckboxItem checked={currencies.includes("EUR")} onSelect={function (e) {
            e.preventDefault();
            onSelectCurrency("EUR");
        }}>
              EUR
              <dropdown_menu_1.DropdownMenu.Hint>Euro</dropdown_menu_1.DropdownMenu.Hint>
            </dropdown_menu_1.DropdownMenu.CheckboxItem>
            <dropdown_menu_1.DropdownMenu.CheckboxItem checked={currencies.includes("USD")} onSelect={function (e) {
            e.preventDefault();
            onSelectCurrency("USD");
        }}>
              USD
              <dropdown_menu_1.DropdownMenu.Hint>US Dollar</dropdown_menu_1.DropdownMenu.Hint>
            </dropdown_menu_1.DropdownMenu.CheckboxItem>
            <dropdown_menu_1.DropdownMenu.CheckboxItem checked={currencies.includes("DKK")} onSelect={function (e) {
            e.preventDefault();
            onSelectCurrency("DKK");
        }}>
              DKK
              <dropdown_menu_1.DropdownMenu.Hint>Danish Krone</dropdown_menu_1.DropdownMenu.Hint>
            </dropdown_menu_1.DropdownMenu.CheckboxItem>
          </dropdown_menu_1.DropdownMenu.Group>
          <dropdown_menu_1.DropdownMenu.Separator />
          <dropdown_menu_1.DropdownMenu.Group>
            <dropdown_menu_1.DropdownMenu.Label>Regions</dropdown_menu_1.DropdownMenu.Label>
            <dropdown_menu_1.DropdownMenu.CheckboxItem checked={regions.includes("NA")} onSelect={function (e) {
            e.preventDefault();
            onSelectRegion("NA");
        }}>
              North America
            </dropdown_menu_1.DropdownMenu.CheckboxItem>
            <dropdown_menu_1.DropdownMenu.CheckboxItem checked={regions.includes("EU")} onSelect={function (e) {
            e.preventDefault();
            onSelectRegion("EU");
        }}>
              Europe
            </dropdown_menu_1.DropdownMenu.CheckboxItem>
            <dropdown_menu_1.DropdownMenu.CheckboxItem checked={regions.includes("DK")} onSelect={function (e) {
            e.preventDefault();
            onSelectRegion("DK");
        }}>
              Denmark
            </dropdown_menu_1.DropdownMenu.CheckboxItem>
          </dropdown_menu_1.DropdownMenu.Group>
        </dropdown_menu_1.DropdownMenu.Content>
      </dropdown_menu_1.DropdownMenu>
      <div>
        <pre>Currencies: {currencies.join(", ")}</pre>
        <pre>Regions: {regions.join(", ")}</pre>
      </div>
    </div>);
};
exports.SelectMenu = {
    render: function () {
        return <SelectDemo />;
    },
};
exports.SimpleMenu = {
    render: function () {
        return (<dropdown_menu_1.DropdownMenu>
        <dropdown_menu_1.DropdownMenu.Trigger asChild>
          <icon_button_1.IconButton>
            <icons_1.EllipsisHorizontal />
          </icon_button_1.IconButton>
        </dropdown_menu_1.DropdownMenu.Trigger>
        <dropdown_menu_1.DropdownMenu.Content>
          <dropdown_menu_1.DropdownMenu.Item className="gap-x-2">
            <icons_1.PencilSquare className="text-ui-fg-subtle"/>
            Edit
          </dropdown_menu_1.DropdownMenu.Item>
          <dropdown_menu_1.DropdownMenu.Item className="gap-x-2">
            <icons_1.Plus className="text-ui-fg-subtle"/>
            Add
          </dropdown_menu_1.DropdownMenu.Item>
          <dropdown_menu_1.DropdownMenu.Separator />
          <dropdown_menu_1.DropdownMenu.Item className="gap-x-2">
            <icons_1.Trash className="text-ui-fg-subtle"/>
            Delete
          </dropdown_menu_1.DropdownMenu.Item>
        </dropdown_menu_1.DropdownMenu.Content>
      </dropdown_menu_1.DropdownMenu>);
    },
};
var ComplexMenuDemo = function () {
    return (<focus_modal_1.FocusModal>
      <focus_modal_1.FocusModal.Trigger asChild>
        <button_1.Button>Open</button_1.Button>
      </focus_modal_1.FocusModal.Trigger>
      <focus_modal_1.FocusModal.Content>
        <focus_modal_1.FocusModal.Header>
          <button_1.Button>Save</button_1.Button>
        </focus_modal_1.FocusModal.Header>
        <focus_modal_1.FocusModal.Body className="item-center flex justify-center">
          <div>
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenu.Trigger asChild>
                <button_1.Button>View</button_1.Button>
              </dropdown_menu_1.DropdownMenu.Trigger>
              <dropdown_menu_1.DropdownMenu.Content>
                <dropdown_menu_1.DropdownMenu.Item className="gap-x-2">
                  <icons_1.PencilSquare className="text-ui-fg-subtle"/>
                  Edit
                </dropdown_menu_1.DropdownMenu.Item>
                <dropdown_menu_1.DropdownMenu.Item className="gap-x-2">
                  <icons_1.Plus className="text-ui-fg-subtle"/>
                  Add
                </dropdown_menu_1.DropdownMenu.Item>
                <dropdown_menu_1.DropdownMenu.Separator />
                <dropdown_menu_1.DropdownMenu.Item className="gap-x-2">
                  <icons_1.Trash className="text-ui-fg-subtle"/>
                  Delete
                </dropdown_menu_1.DropdownMenu.Item>
                <dropdown_menu_1.DropdownMenu.Separator />
                <div className="flex flex-col gap-y-2 p-2">
                  <select_1.Select>
                    <select_1.Select.Trigger>
                      <select_1.Select.Value placeholder="Select"/>
                    </select_1.Select.Trigger>
                    <select_1.Select.Content>
                      <select_1.Select.Item value="1">One</select_1.Select.Item>
                      <select_1.Select.Item value="2">Two</select_1.Select.Item>
                      <select_1.Select.Item value="3">Three</select_1.Select.Item>
                    </select_1.Select.Content>
                  </select_1.Select>
                  <date_picker_1.DatePicker />
                </div>
                <div className="border-ui-border-base flex items-center gap-x-2 border-t p-2">
                  <button_1.Button variant="secondary">Clear</button_1.Button>
                  <button_1.Button>Apply</button_1.Button>
                </div>
              </dropdown_menu_1.DropdownMenu.Content>
            </dropdown_menu_1.DropdownMenu>
          </div>
        </focus_modal_1.FocusModal.Body>
      </focus_modal_1.FocusModal.Content>
    </focus_modal_1.FocusModal>);
};
exports.ComplexMenu = {
    render: function () {
        return <ComplexMenuDemo />;
    },
};
