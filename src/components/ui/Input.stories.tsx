import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input, PasswordInput, SearchInput, Select, Textarea } from "./Input";

const meta = {
  title: "Sistema de diseño/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "Correo electrónico",
    placeholder: "nombre@ejemplo.com",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const ConAyuda: Story = {
  args: { helper: "Te enviaremos ahí la confirmación." },
};

export const Error: Story = {
  args: { error: true, helper: "Introduce un correo válido." },
};

export const Desactivado: Story = {
  args: { disabled: true, value: "nombre@ejemplo.com" },
};

export const Password: Story = {
  render: (args) => <PasswordInput {...args} label="Contraseña" placeholder="••••••••" />,
};

export const Busqueda: Story = {
  render: (args) => <SearchInput {...args} label={undefined} placeholder="Buscar suministro..." />,
};

export const AreaDeTexto: Story = {
  render: () => (
    <Textarea label="Comentario" placeholder="Cuéntanos qué te ha parecido..." />
  ),
};

export const Desplegable: Story = {
  render: () => (
    <Select
      label="Comercializadora"
      placeholder="Selecciona una opción"
      options={[
        { value: "totalenergies", label: "TotalEnergies" },
        { value: "repsol", label: "Repsol" },
        { value: "naturgy", label: "Naturgy" },
      ]}
    />
  ),
};
