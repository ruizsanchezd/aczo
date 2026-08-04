import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert } from "./Alert";

const meta = {
  title: "Sistema de diseño/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    tone: "plain",
    children: "Este suministro tiene una permanencia hasta el 12/2026.",
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["plain", "subtle", "info", "warning", "danger", "success"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {};
export const Subtle: Story = { args: { tone: "subtle" } };
export const Info: Story = { args: { tone: "info", icon: "info" } };
export const Warning: Story = { args: { tone: "warning" } };
export const Danger: Story = { args: { tone: "danger" } };
export const Success: Story = { args: { tone: "success", icon: "check-circle" } };
