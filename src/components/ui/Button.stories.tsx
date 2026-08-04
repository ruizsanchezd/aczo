import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta = {
  title: "Sistema de diseño/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Continuar",
    variant: "primary",
    feedback: "neutral",
    size: "medium",
  },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "tertiary"] },
    feedback: { control: "select", options: ["neutral", "highlight", "danger"] },
    size: { control: "select", options: ["medium", "small"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary" },
};

export const ConIcono: Story = {
  args: { iconEnd: "arrow-right" },
};

export const SoloIcono: Story = {
  args: { iconOnly: "close", "aria-label": "Cerrar", children: undefined },
};

export const Desactivado: Story = {
  args: { disabled: true },
};
