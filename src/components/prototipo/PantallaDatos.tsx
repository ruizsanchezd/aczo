"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

/**
 * PantallaDatos — pantalla 2: los datos de contacto y el consentimiento.
 *
 * Es el segundo momento del paso 01: mismo titular que la pantalla anterior,
 * pero ya sin las ayudas ni la zona de arrastre.
 *
 * ANIMACIONES:
 *   - Entrada en cascada, igual que la pantalla anterior.
 *   - El titular NO se anima: es el mismo texto en la misma posición que en la
 *     pantalla de subida, así que se queda quieto y da continuidad. Lo que
 *     cambia es lo de debajo.
 *   - El botón "Continuar" pasa de desactivado a activo en cuanto se marca el
 *     consentimiento (200 ms). Aquí sí se bloquea: es un consentimiento legal y
 *     el prototipo debe reflejar que es obligatorio.
 */
export function PantallaDatos({ onContinuar }: { onContinuar: () => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[620px] flex-col gap-08 px-04 py-09 sm:px-00">
      <Text variant="heading-l">Subida masiva de facturas</Text>

      <div
        className="anim-aparece flex flex-col gap-06"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex flex-col gap-04 sm:flex-row">
          <Input
            label="Nombre"
            placeholder="Tu nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1"
          />
          <Input
            label="Email"
            type="email"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
        </div>

        <Checkbox checked={acepta} onChange={setAcepta}>
          <Text variant="body-m" color="mid" as="span">
            He leído y acepto la Política de Privacidad y Protección de Datos, y
            autorizo el tratamiento de mis facturas (incl. CIF e IBAN) para el
            análisis y la optimización energética.
          </Text>
        </Checkbox>
      </div>

      <div
        className="anim-aparece"
        style={{ animationDelay: "120ms" }}
      >
        <Button iconEnd="chevron-right" disabled={!acepta} onClick={onContinuar}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
