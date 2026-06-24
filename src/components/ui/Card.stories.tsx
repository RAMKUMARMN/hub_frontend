import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Card from "./Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ background: "#F4F7FF", padding: "40px", minWidth: "400px" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: {
      control: "text",
      description: "Optional heading shown at the top of the card",
    },
  },
  args: {
    title: "Card Title",
    children: "This is the card content. You can put any text, components, or layout inside here.",
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
    children: "A card without a title — just plain content inside the cixio card styling.",
  },
};

export const WithRichContent: Story = {
  args: {
    title: "Document Summary",
    children: (
      <div>
        <p style={{ marginBottom: "8px" }}>This document contains 12 pages covering RAG architecture.</p>
        <p style={{ fontSize: "13px", color: "#6B88D4" }}>Uploaded 2 days ago</p>
      </div>
    ),
  },
};