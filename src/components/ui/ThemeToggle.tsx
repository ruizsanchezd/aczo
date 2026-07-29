"use client";

import { useEffect, useState } from "react";

/**
 * Interruptor de modo claro / oscuro.
 *
 * Lo único que hace es poner el atributo `data-theme` en <html>; de ahí en
 * adelante manda el CSS (ver la sección "MODO CLARO / OSCURO" en globals.css).
 *
 * "Sistema" quita el atributo, así que vuelve a mandar el ajuste del ordenador.
 *
 * Arranca en "Claro" porque es el modo en el que va el producto (lo fuerza
 * layout.tsx). El oscuro está aquí para poder verlo: sigue implementado, en la
 * recámara, por si algún día se activa.
 *
 * No guarda la elección: al recargar vuelve a "Claro". Es a propósito, para no
 * tener que lidiar con el parpadeo del primer pintado en un prototipo.
 */

type Mode = "system" | "light" | "dark";

const options: { value: Mode; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
  }, [mode]);

  return (
    <div
      role="group"
      aria-label="Modo de color"
      className="inline-flex gap-01 rounded-full border border-border-low p-01"
    >
      {options.map((option) => {
        const active = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setMode(option.value)}
            className={`cursor-pointer rounded-full px-04 py-02 text-label-s transition-colors motion-micro-states ${
              active
                ? "bg-background-inverse text-content-inverse"
                : "text-content-mid hover:bg-background-low"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
