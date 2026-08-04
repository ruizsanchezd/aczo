import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text, type TextVariant } from "./Text";

const meta = {
  title: "Sistema de diseño/Text",
  component: Text,
  tags: ["autodocs"],
  args: {
    variant: "body-m",
    color: "high",
    children: "Aczo te ayuda a cambiar de comercializadora sin líos.",
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ejemplo: Story = {};

const variantes: TextVariant[] = [
  "heading-xl",
  "heading-l",
  "heading-m",
  "heading-s",
  "title-xl",
  "title-l",
  "title-m",
  "title-s",
  "label-l",
  "label-m",
  "label-s",
  "body-l",
  "body-m",
  "body-s",
];

/** Todas las variantes de la escala tipográfica, una debajo de otra. */
export const Escala: Story = {
  args: { children: undefined },
  render: () => (
    <div className="flex flex-col gap-04">
      {variantes.map((variante) => (
        <Text key={variante} variant={variante}>
          {variante} — Aczo garantiza tu ahorro
        </Text>
      ))}
    </div>
  ),
};
