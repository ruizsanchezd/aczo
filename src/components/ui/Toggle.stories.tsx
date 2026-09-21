import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Toggle } from "./Toggle";

const meta = {
  title: "Sistema de diseño/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: {
    etiqueta: "Ver por",
    valor: "coste",
    opciones: [
      { id: "coste", rotulo: "Coste (€)" },
      { id: "consumo", rotulo: "Consumo (kWh)" },
    ],
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] bg-background-base p-04">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estático, solo para ver el aspecto. La pastilla se desliza en "Vivo". */
export const Ejemplo: Story = {};

/**
 * Vivo: pulsa las opciones (o usa las flechas del teclado) para ver cómo la
 * pastilla BLANCA se desliza de una a otra en vez de saltar.
 */
export const Vivo: Story = {
  render: (args) => {
    const [valor, setValor] = useState("coste");
    return <Toggle {...args} valor={valor} onChange={setValor} />;
  },
};

/** Como en el panel "Cartera" del Dashboard. */
export const EstadoODetalle: Story = {
  args: {
    etiqueta: "Ver cartera por",
    valor: "estado",
    opciones: [
      { id: "estado", rotulo: "Estado cartera" },
      { id: "detalle", rotulo: "Detalle cartera" },
    ],
  },
  render: (args) => {
    const [valor, setValor] = useState("estado");
    return <Toggle {...args} valor={valor} onChange={setValor} />;
  },
};
