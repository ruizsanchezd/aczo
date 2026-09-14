import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FiltroCasillas, type GrupoCasillas } from "./FiltroCasillas";
import { Button } from "./Button";
import { Text } from "./Text";

const llana = (...opciones: string[]): GrupoCasillas[] => [
  { opciones: opciones.map((o) => ({ value: o, label: o })) },
];

const POR_PROVINCIA: GrupoCasillas[] = [
  {
    rotulo: "Valencia",
    opciones: ["Calle Castellón 6", "Calle Moratines 12", "Calle Colón 1"].map(
      (o) => ({ value: o, label: o }),
    ),
  },
  {
    rotulo: "Madrid",
    opciones: [
      "Calle Nicasio Gallego 18",
      "Calle Velázquez 2",
      "Paseo de la Castellana 141",
      "Calle Orense 34",
    ].map((o) => ({ value: o, label: o })),
  },
  {
    rotulo: "Barcelona",
    opciones: ["Avinguda Diagonal 442", "Calle Bonanova 2"].map((o) => ({
      value: o,
      label: o,
    })),
  },
];

const meta = {
  title: "Sistema de diseño/FiltroCasillas",
  component: FiltroCasillas,
  tags: ["autodocs"],
  args: {
    nombre: "Dirección",
    grupos: POR_PROVINCIA,
    seleccion: [],
    onChange: () => {},
    abierto: true,
    onAbrir: () => {},
  },
  // El desplegable sale hacia abajo: hace falta sitio para verlo en Storybook.
  decorators: [
    (Story) => (
      <div className="flex h-[480px] justify-end">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FiltroCasillas>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cerrado y sin nada elegido: borde y texto suaves. */
export const Cerrado: Story = { args: { abierto: false } };

/** Agrupado por provincia. Es el filtro de "Dirección". */
export const Agrupado: Story = {};

/** Lista llana, sin encabezados. Es el filtro de "Tipo de suministro". */
export const Llano: Story = {
  args: { nombre: "Tipo de suministro", grupos: llana("Luz", "Gas") },
};

/** Con algo elegido: el botón se oscurece y lleva la cuenta. */
export const ConSeleccion: Story = {
  args: {
    abierto: false,
    seleccion: ["Calle Castellón 6", "Calle Colón 1", "Calle Orense 34"],
  },
};

/**
 * Con pie: el filtro de "Inmueble" cuando quedan inmuebles sin clasificar.
 * El bloque de abajo se pasa por `pie`.
 */
export const ConPie: Story = {
  args: {
    nombre: "Inmueble",
    grupos: llana("Oficinas Madrid"),
    pie: (
      <div className="flex flex-col items-center gap-04 p-04 text-center">
        <div className="flex flex-col gap-02">
          <Text variant="label-m" as="p">
            Organiza tu cartera
          </Text>
          <Text variant="body-s" color="mid" as="p">
            Todavía tienes 5 inmuebles sin clasificar. Identifícalos para poder
            localizarlos de forma más ágil o búscalos por ubicación
          </Text>
        </div>
        <div className="flex w-full flex-col gap-02">
          <Button variant="tertiary" fullWidth className="bg-background-mid">
            Organizar cartera
          </Button>
          <Button variant="tertiary" fullWidth>
            Filtrar por ubicación
          </Button>
        </div>
      </div>
    ),
  },
};

/** Solo el pie, sin lista: cuando no hay ningún inmueble clasificado. */
export const SoloPie: Story = {
  args: {
    nombre: "Inmueble",
    grupos: [{ opciones: [] }],
    pie: (
      <div className="flex flex-col items-center gap-04 p-04 text-center">
        <div className="flex flex-col gap-02">
          <Text variant="label-m" as="p">
            Organiza tu cartera
          </Text>
          <Text variant="body-s" color="mid" as="p">
            Tienes 6 inmuebles sin clasificar. Identifícalos para poder
            localizarlos de forma más ágil o búscalos por ubicación
          </Text>
        </div>
        <div className="flex w-full flex-col gap-02">
          <Button variant="tertiary" fullWidth className="bg-background-mid">
            Organizar cartera
          </Button>
          <Button variant="tertiary" fullWidth>
            Filtrar por ubicación
          </Button>
        </div>
      </div>
    ),
  },
};

/**
 * Vivo: marca direcciones. Prueba a marcar solo una de un grupo para ver el
 * encabezado en "indeterminado" (la rayita en vez del check), y a bajar la
 * lista para ver cómo se apaga el degradado del final.
 */
export const Vivo: Story = {
  render: (args) => {
    const [seleccion, setSeleccion] = useState<string[]>([]);
    const [abierto, setAbierto] = useState(true);
    return (
      <FiltroCasillas
        {...args}
        seleccion={seleccion}
        onChange={setSeleccion}
        abierto={abierto}
        onAbrir={setAbierto}
      />
    );
  },
};
