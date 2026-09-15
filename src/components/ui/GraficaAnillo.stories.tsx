import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { GraficaAnillo } from "./GraficaAnillo";

const SOCIEDADES = [
  { id: "mendesaltaren", etiqueta: "mendesaltaren SL", valor: 35, color: "#20270F" },
  { id: "still", etiqueta: "Still SL", valor: 21, color: "#898A35" },
  { id: "nocodehackers", etiqueta: "Nocodehackers SL", valor: 22, color: "#7B6EEB" },
  { id: "tailorhub", etiqueta: "Tailor Hub SL", valor: 22, color: "#E85AB0" },
];

const meta = {
  title: "Sistema de diseño/GraficaAnillo",
  component: GraficaAnillo,
  tags: ["autodocs"],
  args: {
    segmentos: SOCIEDADES,
    unidad: "Ptos de suministro",
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GraficaAnillo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Las cuatro sociedades de la cartera. Recarga la historia para ver cómo se
 * dibujan los tramos uno detrás de otro, y pasa el ratón por encima de uno.
 */
export const Ejemplo: Story = {};

/** Con un tramo marcado: los demás se apagan. */
export const ConUnoMarcado: Story = {
  args: { seleccionado: "still" },
};

/** Dos tramos nada más: se ve bien el hueco entre ellos. */
export const DosTramos: Story = {
  args: {
    segmentos: SOCIEDADES.slice(0, 2),
    unidad: "Ptos de suministro",
  },
};

/** Muchos tramos pequeños, como al agrupar por inmueble. */
export const MuchosTramos: Story = {
  args: {
    segmentos: Array.from({ length: 12 }, (_, i) => ({
      id: `inmueble-${i}`,
      etiqueta: `Inmueble ${i + 1}`,
      valor: 1 + ((i * 3) % 5),
      color: ["#20270F", "#898A35", "#7B6EEB", "#E85AB0"][i % 4],
    })),
    unidad: "Ptos de suministro",
  },
};

/** Vivo: pulsa un tramo para marcarlo, y vuelve a pulsarlo para soltarlo. */
export const Vivo: Story = {
  render: (args) => {
    const [marcado, setMarcado] = useState<string | null>(null);
    return (
      <GraficaAnillo
        {...args}
        seleccionado={marcado}
        onSeleccionar={(id) => setMarcado(marcado === id ? null : id)}
      />
    );
  },
};
