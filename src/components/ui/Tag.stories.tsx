import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from "./Tag";

const meta = {
  title: "Sistema de diseño/Tag",
  component: Tag,
  tags: ["autodocs"],
  args: {
    tone: "outline",
    children: "2.0TD",
  },
  argTypes: {
    tone: {
      control: "select",
      options: [
        "outline",
        "success",
        "inverse",
        "solid",
        "always-light",
        "danger",
        "warning",
        "vivid",
        "highlight",
      ],
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {};

export const Success: Story = {
  args: { tone: "success", children: "€1.650/año" },
};

export const ConIcono: Story = {
  args: { icon: "shield", children: "Recomendado" },
};

/** Para avisos que no bloquean: errores de lectura de archivo. */
export const Danger: Story = {
  args: { tone: "danger", icon: "warning", children: "2 errores" },
};

/** Para avisos que se pueden revisar más tarde: permanencias, facturas vencidas. */
export const Warning: Story = {
  args: { tone: "warning", icon: "info", children: "8 alertas" },
};

/** La insignia "Recomendado" de una tarjeta de plan. */
export const Vivid: Story = {
  args: { tone: "vivid", icon: "zap", children: "Recomendado" },
};

/** Contadores de progreso: "0/3 completados" en los formularios por sociedad. */
export const Highlight: Story = {
  args: { tone: "highlight", children: "0/3 completados" },
};

/** `inverse` solo se usa sobre superficies oscuras (ver highlight-deep en CLAUDE.md). */
export const SobreSuperficieOscura: Story = {
  render: () => (
    <div className="flex gap-02 rounded-md bg-highlight-deep p-04">
      <Tag tone="inverse">Recomendado</Tag>
      <Tag tone="always-light">1/3 Completados</Tag>
    </div>
  ),
};
