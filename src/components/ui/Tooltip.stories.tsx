import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";
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

/**
 * Se abre a la derecha del icono y centrada verticalmente con él. Para cuando
 * arriba y abajo hay contenido que no se puede tapar — es el caso del aviso
 * del mantenimiento en "Tu ahorro potencial" (empresas), con las tarjetas de
 * plan arriba y las comercializadoras abajo.
 */
export const Derecha: Story = {
  args: { position: "right" },
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

/**
 * Con acciones dentro (`interactive`). Deja de ser un texto de ayuda y pasa a
 * ser un aviso: la burbuja recibe el ratón (para poder pulsar los botones) y
 * ya no se cierra al salir de ella — se cierra con Escape, pulsando fuera o
 * desde sus propios botones. El icono la abre y la cierra al pulsarlo, no al
 * pasar por encima. Con acciones el ancho es el fijo del Figma (320 px).
 *
 * Es el aviso del mantenimiento de "Tu ahorro potencial" (empresas), que tiene
 * dos versiones según cómo esté el mantenimiento: ésta es la de cuando está
 * puesto ("lo hemos activado").
 */
export const ConAcciones: Story = {
  args: {
    interactive: true,
    position: "right",
    label: "Mantenimiento activado automáticamente",
  },
  render: (args) => (
    <div className="flex h-[220px] items-center">
      <Tooltip
        {...args}
        content={
          <span className="flex flex-col gap-04">
            <span>
              Hemos detectado que tienes 2 suministros con más de 30 kW. Para
              estos casos, activamos automáticamente el mantenimiento ya que en
              instalaciones de este tamaño una incidencia eléctrica tiene más
              impacto y cubrirla compensa.
            </span>
            <span className="flex flex-wrap gap-02">
              <Button size="small" feedback="highlight">
                Mantener activos
              </Button>
              <Button
                size="small"
                variant="secondary"
                className="text-content-inverse!"
              >
                Desactivar
              </Button>
            </span>
          </span>
        }
      />
    </div>
  ),
};

/**
 * La otra versión del mismo aviso: cuando el mantenimiento está apagado, ya no
 * dice "lo hemos activado" sino "lo recomendamos", y el botón principal sirve
 * para volver a ponerlo.
 */
export const ConAccionesRecomendando: Story = {
  args: {
    interactive: true,
    position: "right",
    label: "Mantenimiento recomendado",
  },
  render: (args) => (
    <div className="flex h-[220px] items-center">
      <Tooltip
        {...args}
        content={
          <span className="flex flex-col gap-04">
            <span>
              Hemos detectado que tienes 2 suministros con más de 30 kW. Para
              estos casos, recomendamos activar el mantenimiento ya que en
              instalaciones de este tamaño una incidencia eléctrica tiene más
              impacto y cubrirla compensa.
            </span>
            <span className="flex flex-wrap gap-02">
              <Button size="small" feedback="highlight">
                Activar mantenimiento
              </Button>
              <Button
                size="small"
                variant="secondary"
                className="text-content-inverse!"
              >
                Desactivar
              </Button>
            </span>
          </span>
        }
      />
    </div>
  ),
};

/**
 * Abierta desde fuera (`open` + `onOpenChange`). Es lo que permite que un
 * aviso se abra solo cuando su sección asoma por la pantalla, como en "Tu
 * ahorro potencial" del flujo de empresas. Aquí se dispara con el botón para
 * poder verlo en Storybook.
 */
export const AbiertaDesdeFuera: Story = {
  render: (args) => {
    const [abierta, setAbierta] = useState(false);
    return (
      <div className="flex h-[160px] items-end gap-04">
        <Tooltip {...args} open={abierta} onOpenChange={setAbierta} />
        <Button size="small" onClick={() => setAbierta(!abierta)}>
          {abierta ? "Cerrar" : "Abrir"} la burbuja
        </Button>
      </div>
    );
  },
};
