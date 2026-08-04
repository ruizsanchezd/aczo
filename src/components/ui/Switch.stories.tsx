import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Switch } from "./Switch";

const meta = {
  title: "Sistema de diseño/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: {
    label: "Recibir notificaciones",
    checked: false,
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Apagado: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
};

export const Encendido: Story = {
  ...Apagado,
  args: { checked: true },
};

export const Desactivado: Story = {
  ...Apagado,
  args: { disabled: true },
};
