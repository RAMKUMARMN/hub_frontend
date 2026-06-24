import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import Checkbox from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    label: {
      control: "text",
      description: "Text label shown next to the checkbox",
    },
    checked: {
      control: false,
      description: "Controlled checked state (managed by parent)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// Checkbox is a controlled component, so we wrap it with useState
// to make it interactive inside Storybook's preview.
export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        {...args}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        label="Accept terms and conditions"
      />
    );
  },
};

export const PreChecked: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true);
    return (
      <Checkbox
        {...args}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        label="Subscribe to notifications"
      />
    );
  },
};