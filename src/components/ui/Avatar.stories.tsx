import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Avatar from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the avatar circle",
    },
    name: {
      control: "text",
      description: "Full name — first letter is shown as the initial",
    },
  },
  args: {
    name: "Akshith",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: "sm" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const AllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Avatar name="Akshith" size="sm" />
      <Avatar name="Akshith" size="md" />
      <Avatar name="Akshith" size="lg" />
    </div>
  ),
};