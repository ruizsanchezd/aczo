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

/**
 * Se abre hacia arriba: para cuando el disparador tiene contenido debajo.
 * Ojo: "arriba" da por hecho que hay sitio arriba — si el icono está pegado
 * al borde superior, conviene usar `position="bottom"`.
 */
export const Arriba: Story = {
  render: (args) => (
    // La altura es solo el andamio de la demo, para dejar sitio a la burbuja:
    // no es un valor de diseño del Figma.
    <div className="flex h-[160px] items-end">
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
    <div className="flex h-[160px] items-end">
      <Tooltip {...args} />
    </div>
  ),
};

/**
 * Dentro de una caja que recorta su contenido. La burbuja se dibuja al final
 * del documento, así que sale entera por encima de la caja en vez de quedarse
 * cortada por el borde — que es lo que pasaba en las tablas plegables.
 */
export const DentroDeUnaCajaQueRecorta: Story = {
  args: { position: "bottom" },
  render: (args) => (
    <div className="h-09 w-[240px] overflow-hidden rounded-md border border-border-low bg-background-low p-03">
      <Tooltip {...args} />
    </div>
  ),
};
