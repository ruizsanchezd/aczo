"use client";

import { useState } from "react";
import { Text } from "@/components/ui/Text";
import { motion, type MotionToken } from "@/lib/motion";

/**
 * Demo de los tokens de motion: al pulsar "Reproducir" el cuadrado hace el
 * movimiento con la duración y la curva del token, para poder comparar
 * cómo se sienten unos y otros.
 */

const tokens: { key: MotionToken; name: string; uso: string }[] = [
  { key: "microStates", name: "motion-micro-states", uso: "Hover, pressed, focus" },
  { key: "microLeave", name: "motion-micro-leave", uso: "Algo desaparece" },
  { key: "microAppear", name: "motion-micro-appear", uso: "Algo aparece" },
  { key: "macroLevelUp", name: "motion-macro-levelup", uso: "Abrir un detalle" },
  { key: "macroLevelDown", name: "motion-macro-leveldown", uso: "Volver atrás" },
  { key: "macroStructure", name: "motion-macro-structure", uso: "El layout se recoloca" },
];

/**
 * Medidas del carril de la demo. Van a pelo a propósito: NO son valores de
 * diseño del Figma, son el andamio de esta demostración (el ancho que recorre
 * el cuadrado para que se aprecie la diferencia entre curvas). El cuadrado y su
 * margen sí usan tokens (size-07 = 32px, spacing-01 = 4px).
 */
const RAIL_WIDTH = 160;
const SQUARE_SIZE = 32; // size-07
const RAIL_PADDING = 4; // spacing-01
const TRAVEL = RAIL_WIDTH - SQUARE_SIZE - RAIL_PADDING * 2;

function Row({ token }: { token: (typeof tokens)[number] }) {
  const [playing, setPlaying] = useState(false);
  const { duration, easing } = motion[token.key];

  return (
    <div className="flex items-center gap-04 border-b border-border-low py-04">
      <div className="min-w-0 flex-1">
        <Text variant="label-m">{token.name}</Text>
        <Text variant="body-s" color="low">
          {token.uso} · {duration}ms
        </Text>
      </div>

      {/* Carril por el que se desplaza el cuadrado */}
      <div
        className="relative h-08 shrink-0 rounded-md bg-background-low"
        style={{ width: `${RAIL_WIDTH}px` }}
      >
        <div
          className="absolute top-01 left-01 size-07 rounded-sm bg-highlight-vivid"
          style={{
            transform: playing ? `translateX(${TRAVEL}px)` : "translateX(0)",
            transition: `transform ${duration}ms ${easing}`,
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="shrink-0 cursor-pointer rounded-full border border-border-high px-04 py-02 text-label-s transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
      >
        {playing ? "Volver" : "Reproducir"}
      </button>
    </div>
  );
}

export function MotionDemo() {
  return (
    <div>
      {tokens.map((token) => (
        <Row key={token.key} token={token} />
      ))}
    </div>
  );
}
