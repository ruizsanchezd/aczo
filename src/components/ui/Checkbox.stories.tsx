import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Sistema de diseño/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    checked: false,
    children: "Acepto las condiciones",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Con estado propio, para poder marcarla y desmarcarla en el panel de controles. */
export const SinMarcar: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <Checkbox {...args} checked={checked} onChange={setChecked} />;
  },
};

export const Marcada: Story = {
  ...SinMarcar,
  args: { checked: true },
};

export const Indeterminada: Story = {
  ...SinMarcar,
  args: { indeterminate: true },
};

export const Desactivada: Story = {
  ...SinMarcar,
  args: { disabled: true },
};
