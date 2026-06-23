import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Badge from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "danger"],
      description: "Visual style of the badge, used to convey status",
    },
  },
  args: {
    children: "Badge",
    variant: "default",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    variant: "default",
    children: "Default",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Active",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Pending",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Failed",
  },
};

// Showcase all variants together
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Failed</Badge>
    </div>
  ),
};