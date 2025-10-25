import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"

import { Divider } from "./divider"

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <div className="flex h-[200px] w-[200px] items-center justify-center">
      <Divider {...args} />
    </div>
  ),
}

export default meta

type Story = StoryObj<typeof Divider>

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
}

export const Dashed: Story = {
  args: {
    variant: "dashed",
  },
}
