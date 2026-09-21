import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toast } from "./Toast";
import { Button } from "./Button";

const meta = {
  title: "Sistema de diseño/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    mensaje: "Nombre y tipo de activo añadido con éxito",
    abierto: false,
    onCerrar: () => {},
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Se retira sola a los 4 segundos. Pulsa el botón para volver a verla. */
export const Disparado: Story = {
  render: (args) => {
    const [abierto, setAbierto] = useState(false);
    return (
      <div className="flex h-[200px] items-start">
        <Button onClick={() => setAbierto(true)}>Guardar</Button>
        <Toast {...args} abierto={abierto} onCerrar={() => setAbierto(false)} />
      </div>
    );
  },
};
