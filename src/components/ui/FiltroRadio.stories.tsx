import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FiltroRadio } from "./FiltroRadio";

const OPCIONES_TIPO_SUMINISTRO = [
  { value: "luz", label: "Luz" },
  { value: "gas", label: "Gas" },
  { value: "luz-y-gas", label: "Luz y gas" },
];

const meta = {
  title: "Sistema de diseño/FiltroRadio",
  component: FiltroRadio,
  tags: ["autodocs"],
  args: {
    nombre: "Tipo de suministro",
    opciones: OPCIONES_TIPO_SUMINISTRO,
    valor: "luz-y-gas",
    onChange: () => {},
    abierto: true,
    onAbrir: () => {},
  },
  // El desplegable sale hacia abajo: hace falta sitio para verlo en Storybook.
  decorators: [
    (Story) => (
      <div className="flex h-[240px] justify-end">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FiltroRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Con "Luz y gas" elegida (el valor por defecto). */
export const LuzYGas: Story = {};

/** Con "Luz" elegida. */
export const Luz: Story = { args: { valor: "luz" } };

/** Cerrado: siempre enseña la opción elegida, nunca queda "vacío". */
export const Cerrado: Story = { args: { abierto: false } };

/** Vivo: prueba a cambiar de opción y a cerrar el desplegable con Escape. */
export const Vivo: Story = {
  render: (args) => {
    const [valor, setValor] = useState("luz-y-gas");
    const [abierto, setAbierto] = useState(true);
    return (
      <FiltroRadio
        {...args}
        valor={valor}
        onChange={setValor}
        abierto={abierto}
        onAbrir={setAbierto}
      />
    );
  },
};
