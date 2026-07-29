"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/**
 * Button — el botón del sistema de diseño (DS Button).
 *
 * Todo sale de la página "Button" de la librería de Figma:
 *
 *   Estilo    primary (relleno) · secondary (contorno) · tertiary (solo texto)
 *   Color     neutral · highlight · danger  (+ estado desactivado)
 *   Tamaño    medium (40 px) · small (32 px)
 *   Contenido texto · icono + texto · texto + flecha · solo icono
 *   Ancho     se ajusta al contenido · 100% · fijo (con className)
 *
 * INTERACCIÓN — es lo que hay que replicar en el repo de producto:
 *   reposo    opacidad 100%
 *   hover     opacidad 60%   (opacity-60 = token style-opacity-hover)
 *   pulsado   opacidad 30%   (opacity-30 = token style-opacity-pressed)
 *   foco      anillo azul (teclado); Enter/Espacio activan
 *   duración  motion-micro-states (200 ms, lineal)
 *
 * La opacidad se aplica al botón COMPLETO, no solo al fondo: así está definido
 * en el Figma y así se comporta igual sobre cualquier superficie.
 *
 * Ojo: `highlight` en secondary y tertiary solo puede usarse sobre superficies
 * oscuras (lo avisa el propio Figma). Es el caso de la tarjeta "Ahorro Aczo" y
 * de la banda "Aczo garantiza".
 */

type ButtonStyle = "primary" | "secondary" | "tertiary";
type ButtonFeedback = "neutral" | "highlight" | "danger";
type ButtonSize = "medium" | "small";

const estilos: Record<ButtonStyle, Record<ButtonFeedback, string>> = {
  primary: {
    neutral: "bg-background-inverse text-content-inverse",
    highlight: "bg-highlight-vivid text-content-always-dark",
    danger: "bg-danger-high text-content-always-light",
  },
  secondary: {
    neutral: "border border-border-high text-content-high",
    highlight: "border border-highlight-vivid text-highlight-vivid",
    danger: "border border-danger-high text-danger-high",
  },
  tertiary: {
    neutral: "text-content-high",
    highlight: "text-highlight-vivid",
    danger: "text-danger-high",
  },
};

const desactivado: Record<ButtonStyle, string> = {
  primary: "bg-background-state-disabled text-content-state-disabled",
  secondary: "border border-border-state-disabled text-content-state-disabled",
  tertiary: "text-content-state-disabled",
};

// Alturas del Figma (tokens de componente): medium 40 px, small 32 px. Coinciden
// con la escala de espaciado, así que se usan h-08 y h-07 en lugar de valores.
const tamanos: Record<ButtonSize, string> = {
  medium: "h-08 text-label-m",
  small: "h-07 text-label-s",
};

const paddings: Record<ButtonSize, string> = {
  medium: "px-04",
  small: "px-03",
};

// Solo icono: cuadrado, sin padding lateral.
const cuadrados: Record<ButtonSize, string> = {
  medium: "w-08 px-00",
  small: "w-07 px-00",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonStyle;
  feedback?: ButtonFeedback;
  size?: ButtonSize;
  /** Icono a la izquierda del texto. */
  iconStart?: IconName;
  /** Icono a la derecha. En el Figma es la flecha de "Label and Chevron". */
  iconEnd?: IconName;
  /** Solo icono: hay que pasar `aria-label` para que se entienda. */
  iconOnly?: IconName;
  /** Ocupa todo el ancho disponible. */
  fullWidth?: boolean;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  feedback = "neutral",
  size = "medium",
  iconStart,
  iconEnd,
  iconOnly,
  fullWidth = false,
  disabled = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const iconSize = size === "small" ? 16 : 20;

  const clases = [
    // Estructura
    "inline-flex shrink-0 items-center justify-center gap-02 rounded-md",
    "select-none whitespace-nowrap",
    tamanos[size],
    iconOnly ? cuadrados[size] : paddings[size],
    fullWidth && "w-full",

    // Color
    disabled ? desactivado[variant] : estilos[variant][feedback],

    // Interacción: opacidad 100 → 60 (hover) → 30 (pulsado), 200 ms lineal.
    !disabled && [
      "cursor-pointer transition-opacity motion-micro-states",
      "hover:opacity-60 active:opacity-30",
    ],
    disabled && "cursor-not-allowed",

    // Foco de teclado: el anillo azul del Figma.
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",

    className,
  ]
    .flat()
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" disabled={disabled} className={clases} {...rest}>
      {iconOnly ? (
        <Icon name={iconOnly} size={iconSize} />
      ) : (
        <>
          {iconStart && <Icon name={iconStart} size={iconSize} />}
          {children}
          {iconEnd && <Icon name={iconEnd} size={iconSize} />}
        </>
      )}
    </button>
  );
}
