import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PuntoEstado } from "./PuntoEstado";

const meta = {
  title: "Sistema de diseño/PuntoEstado",
  component: PuntoEstado,
  tags: ["autodocs"],
  args: {
    color: "bg-info-high",
    rotulo: "En trámite",
    cantidad: 11,
    estirado: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[180px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PuntoEstado>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ejemplo: Story = {};

/** Compacto: rótulo y cifra juntos. Es el de las filas de la lista. */
export const Compacto: Story = {
  args: { estirado: false },
};

/** Sin cifra: solo el punto y el rótulo, para leyendas. */
export const SinCifra: Story = {
  args: { cantidad: undefined, estirado: false },
};

/** Los tres estados de la cartera, uno debajo de otro. */
export const LosTresEstados: Story = {
  render: () => (
    <div className="flex flex-col gap-01">
      <PuntoEstado color="bg-success-high" rotulo="Activas" cantidad={86} />
      <PuntoEstado color="bg-info-high" rotulo="En trámite" cantidad={11} />
      <PuntoEstado color="bg-warning-high" rotulo="En revisión" cantidad={3} />
    </div>
  ),
};

/** Tamaño `m` (14px): el panel "Cartera" del Dashboard, más espacioso que
 * las tarjetas de "Mi cartera". */
export const TamanoM: Story = {
  args: { tamano: "m" },
};
