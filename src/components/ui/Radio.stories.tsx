import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Radio } from "./Radio";

const meta = {
  title: "Sistema de diseño/Radio",
  component: Radio,
  tags: ["autodocs"],
  args: {
    name: "radio",
    checked: false,
    onChange: () => {},
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Grupo completo, porque un radio suelto no dice nada por sí solo. */
export const Grupo: Story = {
  render: () => {
    const [elegido, setElegido] = useState("mensual");
    const opciones = [
      { value: "mensual", label: "Pago mensual" },
      { value: "anual", label: "Pago anual (2 meses gratis)" },
    ];
    return (
      <div className="flex flex-col gap-03">
        {opciones.map((o) => (
          <Radio
            key={o.value}
            name="plan"
            checked={elegido === o.value}
            onChange={() => setElegido(o.value)}
          >
            {o.label}
          </Radio>
        ))}
      </div>
    );
  },
};

export const Desactivado: Story = {
  render: () => (
    <Radio name="desactivado" checked={false} onChange={() => {}} disabled>
      Opción no disponible
    </Radio>
  ),
};
