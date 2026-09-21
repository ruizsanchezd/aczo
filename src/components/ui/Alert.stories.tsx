import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert } from "./Alert";

const meta = {
  title: "Sistema de diseño/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    tone: "neutral",
    children: "Este suministro tiene una permanencia hasta el 12/2026.",
  },
  argTypes: {
    tone: {
      control: "select",
      options: [
        "neutral",
        "subtle",
        "highlight",
        "info",
        "warning",
        "danger",
        "success",
      ],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Subtle: Story = { args: { tone: "subtle" } };
/** El verde pálido de marca, sobre una superficie que no cambia de modo. */
export const Highlight: Story = {
  args: {
    tone: "highlight",
    children:
      "Mientras llega tu primera factura, te mostramos una estimación.",
  },
};
export const Info: Story = { args: { tone: "info", icon: "info" } };
export const Warning: Story = { args: { tone: "warning" } };
export const Danger: Story = { args: { tone: "danger" } };
export const Success: Story = { args: { tone: "success", icon: "check-circle" } };
