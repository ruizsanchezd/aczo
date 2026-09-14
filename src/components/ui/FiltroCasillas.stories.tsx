import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FiltroCasillas } from "./FiltroCasillas";

const GRUPOS = [
  {
    rotulo: "Valencia",
    opciones: ["Calle Castellón 6", "Calle Moratines 12", "Calle Colón 1"],
  },
  {
    rotulo: "Madrid",
    opciones: [
      "Calle Nicasio Gallego 18",
      "Calle Velázquez 2",
      "Paseo de la Castellana 141",
      "Calle Orense 34",
    ],
  },
  {
    rotulo: "Barcelona",
    opciones: ["Avinguda Diagonal 442", "Calle Bonanova 2"],
  },
];

const meta = {
  title: "Sistema de diseño/FiltroCasillas",
  component: FiltroCasillas,
  tags: ["autodocs"],
  args: {
    nombre: "Dirección",
    grupos: GRUPOS,
    seleccion: [],
    onChange: () => {},
  },
  // El desplegable sale hacia abajo: hace falta sitio para verlo en Storybook.
  decorators: [
    (Story) => (
      <div className="flex h-[420px] justify-end">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FiltroCasillas>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cerrado y sin nada elegido: borde y texto suaves. */
export const Cerrado: Story = {};

/** Con tres direcciones elegidas: el botón se oscurece y lleva la cuenta. */
export const ConSeleccion: Story = {
  args: { seleccion: ["Calle Castellón 6", "Calle Colón 1", "Calle Orense 34"] },
};

/**
 * Vivo: ábrelo y marca direcciones. Prueba a marcar solo una de un grupo para
 * ver el encabezado en "indeterminado" (la rayita en vez del check), y a bajar
 * la lista para ver cómo se apaga el degradado del final.
 */
export const Vivo: Story = {
  render: (args) => {
    const [seleccion, setSeleccion] = useState<string[]>([]);
    return (
      <FiltroCasillas
        {...args}
        seleccion={seleccion}
        onChange={setSeleccion}
      />
    );
  },
};

/** Un solo grupo corto: sin degradado, porque no queda lista por debajo. */
export const ListaCorta: Story = {
  args: { grupos: [GRUPOS[2]] },
  render: (args) => {
    const [seleccion, setSeleccion] = useState<string[]>([]);
    return (
      <FiltroCasillas
        {...args}
        seleccion={seleccion}
        onChange={setSeleccion}
      />
    );
  },
};
