import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TarjetaDato } from "./TarjetaDato";
import { PuntoEstado } from "./PuntoEstado";

const meta = {
  title: "Sistema de diseño/TarjetaDato",
  component: TarjetaDato,
  tags: ["autodocs"],
  args: {
    rotulo: "Sociedades",
    valor: 4,
  },
  decorators: [
    (Story) => (
      <div className="w-[240px] bg-background-mid p-04">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TarjetaDato>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ejemplo: Story = {};

/** Un rótulo largo parte en dos líneas y el número se queda abajo. */
export const RotuloLargo: Story = {
  args: { rotulo: "Ptos. de suministro (CUPS)", valor: 100 },
};

/** Con el distintivo de marca delante del rótulo: las cifras de ahorro de "Consumo y ahorro". */
export const Destacada: Story = {
  args: { rotulo: "Ahorro potencial (estimado)", valor: "8.300 €/año", destacado: true },
};

/** Con contenido a medida en vez del número: la tarjeta de "Estado". */
export const ContenidoAMedida: Story = {
  args: {
    rotulo: "Estado",
    children: (
      <div className="flex flex-col gap-01">
        <PuntoEstado color="bg-success-high" rotulo="Activas" cantidad={86} />
        <PuntoEstado color="bg-info-high" rotulo="En trámite" cantidad={11} />
        <PuntoEstado
          color="bg-warning-high"
          rotulo="En revisión"
          cantidad={3}
        />
      </div>
    ),
  },
};

/** Las cinco de la cabecera de "Mi cartera", estiradas a la misma altura. */
export const LaFilaEntera: Story = {
  decorators: [
    (Story) => (
      <div className="w-[880px] bg-background-mid p-04">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex items-stretch gap-05">
      <TarjetaDato rotulo="Sociedades" valor={4} />
      <TarjetaDato rotulo="Inmuebles" valor={54} />
      <TarjetaDato rotulo="Ptos. de suministro (CUPS)" valor={100} />
      <TarjetaDato rotulo="Comercializadoras" valor={3} />
      <TarjetaDato rotulo="Estado">
        <div className="flex flex-col gap-01">
          <PuntoEstado color="bg-success-high" rotulo="Activas" cantidad={86} />
          <PuntoEstado color="bg-info-high" rotulo="En trámite" cantidad={11} />
          <PuntoEstado
            color="bg-warning-high"
            rotulo="En revisión"
            cantidad={3}
          />
        </div>
      </TarjetaDato>
    </div>
  ),
};
