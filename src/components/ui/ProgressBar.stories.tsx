import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressBar, SegmentedProgress } from "./ProgressBar";

const meta = {
  title: "Sistema de diseño/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  args: {
    value: 60,
    label: "Analizando tus facturas",
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const SinPorcentaje: Story = {
  args: { showValue: false },
};

/** La variante por tramos de la pantalla de "Alta en tramitación". */
export const PorTramos: Story = {
  args: { value: 0, label: undefined },
  render: () => (
    <SegmentedProgress
      steps={["Solicitado", "En tramitación", "Aceptado", "Activado"]}
      current={1}
    />
  ),
};
