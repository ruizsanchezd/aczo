import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { TextoRecortado } from "./TextoRecortado";

const meta = {
  title: "Sistema de diseño/TextoRecortado",
  component: TextoRecortado,
  tags: ["autodocs"],
  args: {
    children: "Calle Velázquez nº 10, Alcobendas, Madrid",
    variant: "label-s",
    color: "mid",
  },
  decorators: [
    (Story) => (
      <div className="w-[200px] rounded-md border border-border-low p-03">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextoRecortado>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * El texto no cabe: se corta y, al pasar por encima, sale la burbuja con el
 * texto entero.
 */
export const Recortado: Story = {};

/**
 * El mismo componente con un texto que sí cabe: no se corta y **no** sale
 * ninguna burbuja. Es lo que evita llenar la pantalla de globos que repiten lo
 * que ya se lee.
 */
export const Entero: Story = {
  args: { children: "Planta 3" },
};

/** Como se usa en la tabla: el nombre de un punto de suministro. */
export const NombreDePunto: Story = {
  args: { children: "Planta 1 Puerta Derecha", color: "high" },
  decorators: [
    (Story) => (
      <div className="w-[110px] rounded-md border border-border-low p-03">
        <Story />
      </div>
    ),
  ],
};

/** Un rótulo de columna, en mayúsculas. */
export const RotuloDeColumna: Story = {
  args: {
    children: "Mantenimiento",
    variant: "label-s-uppercase",
    color: "low",
  },
  decorators: [
    (Story) => (
      <div className="w-[90px] rounded-md border border-border-low p-03">
        <Story />
      </div>
    ),
  ],
};

/**
 * Vivo: mueve el tirador para estrechar y ensanchar la caja. La burbuja
 * aparece y desaparece sola, porque el texto se vuelve a medir cada vez que
 * cambia el tamaño.
 */
export const AlCambiarDeAncho: Story = {
  decorators: [(Story) => <Story />],
  render: (args) => {
    const [ancho, setAncho] = useState(200);
    return (
      <div className="flex flex-col gap-04">
        <input
          type="range"
          min={80}
          max={420}
          value={ancho}
          onChange={(e) => setAncho(Number(e.target.value))}
          aria-label="Ancho de la caja"
        />
        <div
          className="rounded-md border border-border-low p-03"
          style={{ width: ancho }}
        >
          <TextoRecortado {...args} />
        </div>
      </div>
    );
  },
};
