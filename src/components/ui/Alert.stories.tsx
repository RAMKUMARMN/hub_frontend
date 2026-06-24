import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Alert from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    message: {
      control: "text",
      description: "Error message displayed inside the alert box",
    },
  },
  args: {
    message: "Something went wrong. Please try again.",
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

export const LongMessage: Story = {
  args: {
    message:
      "Failed to upload document. The file format is not supported. Please upload a PDF, DOCX, TXT, or image file.",
  },
};