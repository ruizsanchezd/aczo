import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tooltip } from "./Tooltip";
import { Icon } from "./Icon";

const meta = {
  title: "Sistema de diseño/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  args: {
    content: "Texto de ayuda que explica el icono.",
    children: (
      <span className="text-content-mid">
        <Icon name="info" size={16} />
      </span>
    ),
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Se abre hacia arriba: para cuando el disparador tiene contenido debajo. */
export const Arriba: Story = {
  render: (args) => (
    <div className="pt-08">
      <Tooltip {...args} />
    </div>
  ),
};

/** Se abre hacia abajo: para cuando el disparador está al principio de una tabla. */
export const Abajo: Story = {
  args: { position: "bottom" },
};

/** El ancho máximo hace que los textos largos salten de línea en vez de desbordar. */
export const TextoLargo: Story = {
  args: {
    content:
      "Tienes permanencia con Iberdrola hasta Marzo 2027. Si cambias ahora, la penalización estimada sería de 320-400 €.",
  },
  render: (args) => (
    <div className="pt-08">
      <Tooltip {...args} />
    </div>
  ),
};
