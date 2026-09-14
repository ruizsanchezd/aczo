"use client";

import { useId } from "react";
import { Icon } from "./Icon";

/**
 * FiltroSelect — el desplegable pequeño de una barra de filtros.
 *
 * Es el hermano compacto de `Select` (el de los formularios): mide 32 px de
 * alto en vez de 40, no lleva etiqueta encima y enseña el nombre del filtro
 * como opción "todos". Es lo que hay en "Mi cartera": Sociedad, Tipo de
 * suministro, Dirección y Estado, uno al lado de otro.
 *
 * Cuando hay algo elegido, el borde y el texto se oscurecen para que se vea
 * de un vistazo qué filtros están puestos y cuáles no.
 * Transición: motion-micro-states (200 ms, lineal).
 */

export function FiltroSelect({
  nombre,
  valor,
  opciones,
  onChange,
}: {
  /** El rótulo del filtro. También hace de opción "todos". */
  nombre: string;
  valor: string;
  opciones: { value: string; label: string }[];
  onChange: (valor: string) => void;
}) {
  const id = useId();
  const puesto = valor !== "";

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        {nombre}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={`h-07 cursor-pointer appearance-none rounded-md border bg-background-base pr-08 pl-03 text-body-s transition-colors motion-micro-states ${
          puesto
            ? "border-border-high text-content-high"
            : "border-border-low text-content-mid"
        }`}
      >
        <option value="">{nombre}</option>
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-03 -translate-y-1/2 text-content-mid">
        <Icon name="chevron-down" size={16} />
      </span>
    </div>
  );
}
