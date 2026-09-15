import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { GrupoSegmentado } from "./GrupoSegmentado";
import { Text } from "./Text";

const meta = {
  title: "Sistema de diseño/GrupoSegmentado",
  component: GrupoSegmentado,
  tags: ["autodocs"],
  args: {
    etiqueta: "Agrupar por",
    valor: "sociedad",
    opciones: [
      { id: "ubicacion", rotulo: "Ubicación" },
      { id: "sociedad", rotulo: "Sociedad" },
      { id: "comercializadora", rotulo: "Comercializadora" },
    ],
    onChange: () => {},
  },
} satisfies Meta<typeof GrupoSegmentado>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estático, solo para ver el aspecto. La pastilla se desliza en "Vivo". */
export const Ejemplo: Story = {};

/** Con la primera opción seleccionada. */
export const PrimeraOpcion: Story = {
  args: { valor: "ubicacion" },
};

/**
 * Vivo: pulsa las opciones (o usa las flechas del teclado) para ver cómo la
 * pastilla oscura se DESLIZA de una a otra en vez de saltar.
 */
export const Vivo: Story = {
  render: (args) => {
    const [valor, setValor] = useState("sociedad");
    return (
      <GrupoSegmentado
        {...args}
        valor={valor}
        onChange={(id) => setValor(id)}
      />
    );
  },
};

/** Con el rótulo delante, como aparece en "Mi cartera". */
export const ConRotulo: Story = {
  render: (args) => {
    const [valor, setValor] = useState("sociedad");
    return (
      <div className="flex items-center gap-02">
        <Text variant="label-s" color="mid" as="span">
          Agrupar por
        </Text>
        <GrupoSegmentado {...args} valor={valor} onChange={setValor} />
      </div>
    );
  },
};

/** Dos opciones nada más: el control se adapta al ancho de cada rótulo. */
export const DosOpciones: Story = {
  args: {
    etiqueta: "Periodo",
    valor: "mes",
    opciones: [
      { id: "mes", rotulo: "Mes" },
      { id: "año", rotulo: "Año" },
    ],
  },
  render: (args) => {
    const [valor, setValor] = useState("mes");
    return <GrupoSegmentado {...args} valor={valor} onChange={setValor} />;
  },
};
