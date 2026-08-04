import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeToggle } from "./ThemeToggle";

const meta = {
  title: "Sistema de diseño/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * El producto va siempre en modo claro (ver CLAUDE.md): este interruptor solo
 * existe para probar que el modo oscuro, en la recámara, sigue sano.
 */
export const Ejemplo: Story = {};
