import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FiltroSelect } from "./FiltroSelect";

const meta = {
  title: "Sistema de diseño/FiltroSelect",
  component: FiltroSelect,
  tags: ["autodocs"],
  args: {
    nombre: "Sociedad",
    valor: "",
    opciones: [
      { value: "mendesaltaren SL", label: "mendesaltaren SL" },
      { value: "Still SL", label: "Still SL" },
      { value: "Nocodehackers SL", label: "Nocodehackers SL" },
    ],
    onChange: () => {},
  },
} satisfies Meta<typeof FiltroSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sin nada elegido: borde y texto suaves. */
export const SinElegir: Story = {};

/** Con algo elegido: se oscurece para que se note que el filtro está puesto. */
export const Elegido: Story = {
  args: { valor: "Still SL" },
};

/** Vivo: elige y verás el cambio de borde. */
export const Vivo: Story = {
  render: (args) => {
    const [valor, setValor] = useState("");
    return <FiltroSelect {...args} valor={valor} onChange={setValor} />;
  },
};

/** La barra entera de "Mi cartera", con sus cuatro filtros. */
export const LaBarraEntera: Story = {
  render: () => {
    const [filtros, setFiltros] = useState({
      sociedad: "",
      tipo: "",
      direccion: "",
      estado: "",
    });
    const cambiar = (campo: string) => (valor: string) =>
      setFiltros((f) => ({ ...f, [campo]: valor }));

    return (
      <div className="flex flex-wrap items-center gap-02">
        <FiltroSelect
          nombre="Sociedad"
          valor={filtros.sociedad}
          onChange={cambiar("sociedad")}
          opciones={[
            { value: "mendesaltaren SL", label: "mendesaltaren SL" },
            { value: "Still SL", label: "Still SL" },
          ]}
        />
        <FiltroSelect
          nombre="Tipo de suministro"
          valor={filtros.tipo}
          onChange={cambiar("tipo")}
          opciones={[
            { value: "luz", label: "Luz" },
            { value: "gas", label: "Gas" },
          ]}
        />
        <FiltroSelect
          nombre="Dirección"
          valor={filtros.direccion}
          onChange={cambiar("direccion")}
          opciones={[
            { value: "Madrid", label: "Madrid" },
            { value: "Barcelona", label: "Barcelona" },
          ]}
        />
        <FiltroSelect
          nombre="Estado"
          valor={filtros.estado}
          onChange={cambiar("estado")}
          opciones={[
            { value: "activa", label: "Activas" },
            { value: "tramite", label: "En trámite" },
            { value: "revision", label: "En revisión" },
          ]}
        />
      </div>
    );
  },
};
