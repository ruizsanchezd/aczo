"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Text } from "./Text";

/**
 * Toast — el aviso que confirma una acción y se retira solo (DS Toast).
 *
 * Va abajo a la derecha, sobre `success-high` — verde de acierto, no modo
 * oscuro (ver CLAUDE.md): es un solo valor sin pareja `light-dark`, así que
 * se lee igual pase lo que pase con el tema, porque es una confirmación
 * puntual, no parte del contenido de la pantalla.
 *
 * Se queda `duracionMs` (10 s) y se retira sola con `motion-micro-leave`: es
 * un "hecho", no una pregunta, así que nadie debería tener que cerrarla a
 * mano para seguir con lo que estaba haciendo.
 */
const DURACION_MS_POR_DEFECTO = 10000;

export function Toast({
  mensaje,
  abierto,
  onCerrar,
  duracionMs = DURACION_MS_POR_DEFECTO,
}: {
  mensaje: string;
  abierto: boolean;
  onCerrar: () => void;
  duracionMs?: number;
}) {
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const salir = setTimeout(() => setSaliendo(true), duracionMs);
    return () => clearTimeout(salir);
  }, [abierto, duracionMs]);

  useEffect(() => {
    if (!saliendo) return;
    const cerrar = setTimeout(onCerrar, 250);
    return () => clearTimeout(cerrar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saliendo]);

  if (!abierto || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-04 bottom-04 z-50 max-w-[360px] rounded-md bg-success-high px-04 py-03 shadow-md ${
        saliendo
          ? "opacity-00 transition-opacity motion-micro-leave"
          : "anim-aparece-simple"
      }`}
    >
      <Text variant="label-m" color="always-light" as="p">
        {mensaje}
      </Text>
    </div>,
    document.body,
  );
}
