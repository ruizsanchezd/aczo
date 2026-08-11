import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

const meta = {
  title: "Sistema de diseño/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: {
    name: "check-circle",
    size: 20,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ejemplo: Story = {};

const nombres: IconName[] = [
  "spark",
  "check-circle",
  "check-circle-outline",
  "upload",
  "chevron-down",
  "chevron-up",
  "chevron-right",
  "chevron-left",
  "arrow-right",
  "info",
  "mail",
  "search",
  "eye",
  "eye-off",
  "clock",
  "close",
  "shield",
  "compare",
  "document",
  "trophy",
  "check",
  "warning",
  "folder",
  "trash",
  "zap",
  "lightbulb",
  "fire",
  "wrench",
];

/** Todo el set de iconos del prototipo, en `currentColor` (text-content-high). */
export const Todos: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-04">
      {nombres.map((nombre) => (
        <div key={nombre} className="flex flex-col items-center gap-02">
          <Icon name={nombre} className="text-content-high" />
          <Text variant="body-s" color="mid">
            {nombre}
          </Text>
        </div>
      ))}
    </div>
  ),
};
