import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { InlineTip } from "./inline-tip"

const meta: Meta<typeof InlineTip> = {
  title: "Components/InlineTip",
  component: InlineTip,
  parameters: {
    layout: "centered",
  },
  render: (args) => {
    return (
      <div className="flex max-w-md">
        <InlineTip {...args} />
      </div>
    )
  },
}

export default meta

type Story = StoryObj<typeof InlineTip>

export const Info: Story = {
  args: {
    variant: "info",
    label: "Info",
    children:
      "You can always install the storefront at a later point. Medusa is a headless backend, so it operates without a storefront by default. You can connect any storefront to it. The Next.js Starter storefront is a good option to use, but you can also build your own storefront later on.",
  },
}

export const Warning: Story = {
  args: {
    variant: "warning",
    label: "Warning",
    children:
      "If you have multiple storage plugins configured, the last plugin declared in the medusa-config.js file will be used.",
  },
}

export const Error: Story = {
  args: {
    variant: "error",
    label: "Don'ts",
    children:
      "Don’t use data models if you want to store simple key-value pairs related to a Medusa data model. Instead, use the metadata field that modles have, which is an object of custom key-value pairs.",
  },
}

export const Success: Story = {
  args: {
    variant: "success",
    label: "Do's",
    children:
      "Use data models when you want to store data related to your customization in the database.",
  },
}
