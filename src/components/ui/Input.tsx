"use client";

import { useId, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

/**
 * Input — el campo de formulario del sistema de diseño (DS Input).
 *
 * De la página "Input" de la librería de Figma:
 *
 *   Tipos     texto · área de texto · desplegable · contraseña · búsqueda
 *   Contenido etiqueta arriba · texto de ejemplo dentro · mensaje de ayuda debajo
 *   Estados   normal · error (borde y mensaje en rojo) · desactivado
 *
 * INTERACCIÓN:
 *   foco       anillo azul (teclado)
 *   escribiendo  el borde pasa de border-mid a border-high
 *   contraseña   el ojo alterna entre mostrar y ocultar (y cambia a ojo tachado)
 *   desplegable  el panel de opciones se despliega debajo (ver Select)
 *
 * Medidas del Figma: alto 40 px, radio 8, padding lateral 12, etiqueta label-s
 * en content-mid, y 4 px entre la etiqueta y el campo.
 */

type EstadoCampo = {
  label?: string;
  /** Mensaje de ayuda debajo del campo. En error se pinta en rojo. */
  helper?: string;
  error?: boolean;
  className?: string;
};

/** Clases compartidas por todos los controles, para que se vean iguales. */
function clasesControl(error: boolean, disabled: boolean) {
  return [
    "w-full rounded-md border bg-background-base px-03 text-body-m text-content-high",
    "placeholder:text-content-low",
    // El borde se oscurece al enfocar: es el estado "Active" del Figma.
    "transition-colors motion-micro-states",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
    error
      ? "border-danger-high"
      : "border-border-mid focus:border-border-high",
    disabled &&
      "cursor-not-allowed border-border-state-disabled bg-background-state-disabled text-content-state-disabled placeholder:text-content-state-disabled",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Envoltorio con etiqueta arriba y mensaje de ayuda debajo. */
function Campo({
  label,
  helper,
  error = false,
  htmlFor,
  className = "",
  children,
}: EstadoCampo & { htmlFor: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-01 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-label-s text-content-mid">
          {label}
        </label>
      )}
      {children}
      {helper && (
        <span
          className={`mt-01 flex items-center gap-01 text-body-s ${
            error ? "text-danger-high" : "text-content-mid"
          }`}
        >
          <Icon name="info" size={16} className="shrink-0" />
          {helper}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Campo de texto (y email, y cualquier tipo simple)                          */
/* -------------------------------------------------------------------------- */

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> &
  EstadoCampo & {
    /** Icono decorativo a la derecha, dentro del campo. */
    iconEnd?: IconName;
  };

export function Input({
  label,
  helper,
  error = false,
  className = "",
  iconEnd,
  disabled = false,
  id,
  ...rest
}: InputProps) {
  const generado = useId();
  const inputId = id ?? generado;

  return (
    <Campo
      label={label}
      helper={helper}
      error={error}
      htmlFor={inputId}
      className={className}
    >
      <div className="relative">
        <input
          id={inputId}
          disabled={disabled}
          className={`${clasesControl(error, disabled)} h-08 ${
            iconEnd ? "pr-09" : ""
          }`}
          {...rest}
        />
        {iconEnd && (
          <span className="pointer-events-none absolute top-1/2 right-03 -translate-y-1/2 text-content-mid">
            <Icon name={iconEnd} />
          </span>
        )}
      </div>
    </Campo>
  );
}

/* -------------------------------------------------------------------------- */
/* Campo de búsqueda — igual, pero con la lupa                                */
/* -------------------------------------------------------------------------- */

export function SearchInput(props: Omit<InputProps, "iconEnd">) {
  return <Input {...props} iconEnd="search" type="search" />;
}

/* -------------------------------------------------------------------------- */
/* Campo de contraseña — el ojo alterna mostrar/ocultar                       */
/* -------------------------------------------------------------------------- */

export function PasswordInput({
  label,
  helper,
  error = false,
  className = "",
  disabled = false,
  id,
  ...rest
}: Omit<InputProps, "iconEnd" | "type">) {
  const generado = useId();
  const inputId = id ?? generado;
  const [visible, setVisible] = useState(false);

  return (
    <Campo
      label={label}
      helper={helper}
      error={error}
      htmlFor={inputId}
      className={className}
    >
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          disabled={disabled}
          className={`${clasesControl(error, disabled)} h-08 pr-09`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute top-1/2 right-03 -translate-y-1/2 cursor-pointer text-content-mid transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
        >
          <Icon name={visible ? "eye-off" : "eye"} />
        </button>
      </div>
    </Campo>
  );
}

/* -------------------------------------------------------------------------- */
/* Área de texto                                                              */
/* -------------------------------------------------------------------------- */

type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> &
  EstadoCampo;

export function Textarea({
  label,
  helper,
  error = false,
  className = "",
  disabled = false,
  rows = 4,
  id,
  ...rest
}: TextareaProps) {
  const generado = useId();
  const inputId = id ?? generado;

  return (
    <Campo
      label={label}
      helper={helper}
      error={error}
      htmlFor={inputId}
      className={className}
    >
      <textarea
        id={inputId}
        rows={rows}
        disabled={disabled}
        className={`${clasesControl(error, disabled)} resize-none py-02`}
        {...rest}
      />
    </Campo>
  );
}

/* -------------------------------------------------------------------------- */
/* Desplegable                                                                */
/* -------------------------------------------------------------------------- */

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> &
  EstadoCampo & {
    options: readonly { value: string; label: string }[];
    placeholder?: string;
  };

/**
 * Select — usa el desplegable nativo del navegador.
 *
 * En el Figma el panel de opciones está dibujado a mano (con la opción actual
 * resaltada), pero para un prototipo el nativo se comporta mejor: funciona con
 * teclado, en móvil y no se sale de la pantalla. Lo que sí se replica es el
 * aspecto del campo cerrado y la flecha, que es lo que se ve el 99% del tiempo.
 */
export function Select({
  label,
  helper,
  error = false,
  className = "",
  disabled = false,
  options,
  placeholder,
  id,
  ...rest
}: SelectProps) {
  const generado = useId();
  const inputId = id ?? generado;

  return (
    <Campo
      label={label}
      helper={helper}
      error={error}
      htmlFor={inputId}
      className={className}
    >
      <div className="relative">
        <select
          id={inputId}
          disabled={disabled}
          className={`${clasesControl(error, disabled)} h-08 cursor-pointer appearance-none pr-09`}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-03 -translate-y-1/2 text-content-mid">
          <Icon name="chevron-down" />
        </span>
      </div>
    </Campo>
  );
}

/* -------------------------------------------------------------------------- */
/* Etiqueta suelta, para formularios que no usan el envoltorio                */
/* -------------------------------------------------------------------------- */

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text variant="label-s" color="mid" as="span">
      {children}
    </Text>
  );
}
