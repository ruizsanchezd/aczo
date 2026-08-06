import type { ElementType, ReactNode } from "react";

/**
 * Text — aplica la escala tipográfica del sistema de diseño.
 *
 * No inventa nada: cada variante es exactamente un estilo de la página
 * "Typography" del Figma. Sirve para no tener que recordar qué clase toca.
 *
 *   <Text variant="heading-l">Titular de marca</Text>
 *   <Text variant="body-m" color="mid">Texto secundario</Text>
 *   <Text variant="label-m" as="span">Etiqueta</Text>
 *
 * Las cuatro familias:
 *   heading — Bradford, titulares de marca (los más grandes y expresivos)
 *   title   — Inter, títulos dentro de la interfaz
 *   label   — Inter 500, elementos de interfaz (botones, etiquetas)
 *   body    — Inter 400, texto corrido
 */

const variants = {
  "heading-xl": "font-heading text-heading-xl",
  "heading-l": "font-heading text-heading-l",
  "heading-m": "font-heading text-heading-m",
  "heading-s": "font-heading text-heading-s",
  "heading-xs": "font-heading text-heading-xs",
  "heading-xxs": "font-heading text-heading-xxs",
  "title-xl": "text-title-xl",
  "title-l": "text-title-l",
  "title-m": "text-title-m",
  "title-s": "text-title-s",
  "label-l": "text-label-l",
  "label-m": "text-label-m",
  "label-s": "text-label-s",
  "label-s-uppercase": "text-label-s uppercase",
  "body-l": "text-body-l",
  "body-m": "text-body-m",
  "body-s": "text-body-s",
} as const;

const colors = {
  high: "text-content-high",
  mid: "text-content-mid",
  low: "text-content-low",
  inverse: "text-content-inverse",
  "always-light": "text-content-always-light",
  "always-dark": "text-content-always-dark",
  disabled: "text-content-state-disabled",
} as const;

// Etiqueta HTML por defecto de cada variante, para que el documento tenga
// una jerarquía razonable sin tener que pasar `as` cada vez.
const defaultTags: Record<TextVariant, ElementType> = {
  "heading-xl": "h1",
  "heading-l": "h1",
  "heading-m": "h2",
  "heading-s": "h3",
  "heading-xs": "h4",
  "heading-xxs": "h5",
  "title-xl": "h2",
  "title-l": "h3",
  "title-m": "h4",
  "title-s": "h5",
  "label-l": "span",
  "label-m": "span",
  "label-s": "span",
  "label-s-uppercase": "span",
  "body-l": "p",
  "body-m": "p",
  "body-s": "p",
};

export type TextVariant = keyof typeof variants;
export type TextColor = keyof typeof colors;

type TextProps = {
  variant?: TextVariant;
  color?: TextColor;
  /** Cambia la etiqueta HTML sin cambiar el estilo. */
  as?: ElementType;
  className?: string;
  children?: ReactNode;
};

export function Text({
  variant = "body-m",
  color = "high",
  as,
  className = "",
  children,
}: TextProps) {
  const Tag = as ?? defaultTags[variant];

  return (
    <Tag className={`${variants[variant]} ${colors[color]} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
