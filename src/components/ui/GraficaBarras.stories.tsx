import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GraficaBarras } from "./GraficaBarras";
import { CONSUMO_MENSUAL_DASHBOARD, euros, kwh } from "@/mocks/aczo";

const meta = {
  title: "Sistema de diseño/GraficaBarras",
  component: GraficaBarras,
  tags: ["autodocs"],
  args: {
    unidad: "€",
    etiquetaValorReal: "Coste con Aczo",
    etiquetaValorEstimado: "Coste con Aczo (Estimado)",
    etiquetaFondo: "Coste sin Aczo (Estimado)",
    formatear: euros,
    datos: CONSUMO_MENSUAL_DASHBOARD.map((m) => ({
      id: m.mes,
      etiqueta: m.mes,
      valor: m.costeConAczo,
      valorFondo: m.costeSinAczo,
      real: false,
    })),
  },
  decorators: [
    (Story) => (
      <div className="w-[720px] bg-background-base p-04">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GraficaBarras>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Antes de la primera factura: los doce meses son una estimación. */
export const TodoEstimado: Story = {};

/** Con casi un año de cliente: los primeros ocho meses ya son factura real
 * (barra sólida) y solo quedan cuatro por estimar (con trama). */
export const MezclaRealYEstimado: Story = {
  args: {
    datos: CONSUMO_MENSUAL_DASHBOARD.map((m) => ({
      id: m.mes,
      etiqueta: m.mes,
      valor: m.costeConAczo,
      valorFondo: m.costeSinAczo,
      real: m.real,
    })),
  },
};

/** La misma gráfica en kWh, sin serie de comparación: el consumo del año. */
export const SoloConsumo: Story = {
  args: {
    unidad: " kWh",
    etiquetaValorReal: "Consumo",
    etiquetaValorEstimado: "Consumo (Estimado)",
    etiquetaFondo: undefined,
    formatear: kwh,
    datos: CONSUMO_MENSUAL_DASHBOARD.map((m) => ({
      id: m.mes,
      etiqueta: m.mes,
      valor: m.consumoKwh,
      real: m.real,
    })),
  },
};
