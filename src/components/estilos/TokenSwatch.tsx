import { Text } from "@/components/ui/Text";
import type { TextVariant } from "@/components/ui/Text";

/**
 * Piezas para enseñar los tokens del sistema de diseño. Las usa la página
 * `/estilos` y también la documentación de "Fundamentos" en Storybook, para
 * no mantener dos copias de lo mismo: si un token cambia, se actualiza aquí y
 * se ve igual en los dos sitios.
 */

/**
 * Fuerza el modo claro en los tokens `light-dark()` de dentro. Hace falta en
 * Storybook: las páginas de "Fundamentos" son MDX puro (sin `<Story>`), así
 * que el decorador de `.storybook/preview.tsx` —que fuerza `data-theme` en
 * el `<html>`— nunca llega a ejecutarse, y los tokens seguirían el modo del
 * sistema en vez del claro fijo del producto. `color-scheme` se hereda, así
 * que basta con fijarlo aquí para que todo lo de dentro use la rama clara.
 */
export function ModoClaro({ children }: { children: React.ReactNode }) {
  return <div style={{ colorScheme: "light" }}>{children}</div>;
}

export function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div>
      <div
        className={`h-10 w-full rounded-md border border-border-low ${className}`}
      />
      <Text variant="body-s" color="mid" className="mt-02 break-all">
        {name}
      </Text>
    </div>
  );
}

export function SwatchGrid({
  label,
  swatches,
}: {
  label: string;
  swatches: { name: string; className: string }[];
}) {
  return (
    <div className="mb-07">
      <Text variant="label-m" color="mid" className="mb-03">
        {label}
      </Text>
      <div className="grid grid-cols-2 gap-04 sm:grid-cols-3 md:grid-cols-5">
        {swatches.map((s) => (
          <Swatch key={s.name} {...s} />
        ))}
      </div>
    </div>
  );
}

/** Escala de espaciado (`layout-size-00`…`10`), token → píxeles. */
export const spacing: [string, string][] = [
  ["00", "0"],
  ["01", "4"],
  ["02", "8"],
  ["03", "12"],
  ["04", "16"],
  ["05", "20"],
  ["06", "24"],
  ["07", "32"],
  ["08", "40"],
  ["09", "48"],
  ["10", "64"],
];

/** Escala tipográfica completa, en el mismo orden que en el Figma. */
export const typeScale: TextVariant[] = [
  "heading-xl",
  "heading-l",
  "heading-m",
  "heading-s",
  "heading-xs",
  "title-xl",
  "title-l",
  "title-m",
  "title-s",
  "label-l",
  "label-m",
  "label-s",
  "label-s-uppercase",
  "body-l",
  "body-m",
  "body-s",
];
