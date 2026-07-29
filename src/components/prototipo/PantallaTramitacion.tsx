"use client";

import { useEffect, useState } from "react";
import { BrandPattern } from "@/components/brand/BrandPattern";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SegmentedProgress } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { retardo } from "@/lib/prototipo";

/**
 * PantallaTramitacion — pantalla 6: "Alta en tramitación".
 *
 * Media pantalla es el patrón de marca, esta vez con los colores al revés que en
 * la pantalla de carga (fondo claro, cruces oscuras) y las cruces mucho más
 * grandes.
 *
 * ANIMACIONES:
 *   - La barra de cuatro tramos se llena al entrar, no aparece ya llena. Se
 *     consigue montándola en cero y pasándola al estado real un instante después
 *     (ver el useEffect). Es lo que hace que se lea "vas por aquí" en vez de
 *     "esto es un gráfico".
 *   - El resto entra en cascada.
 */

const TRAMOS = ["Solicitado", "En tramitación", "Aceptado", "Activado"] as const;

/** El tramo en el que está ahora mismo el trámite. */
const TRAMO_ACTUAL = 1;

export function PantallaTramitacion() {
  // Arranca sin ningún tramo hecho para que la barra se vea llenarse.
  const [tramo, setTramo] = useState(-1);

  useEffect(() => {
    const id = setTimeout(() => setTramo(TRAMO_ACTUAL), 200);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row">
      {/* Patrón de marca: en móvil se queda como una banda arriba. */}
      <BrandPattern
        variant="grande"
        className="h-[200px] shrink-0 lg:h-auto lg:w-1/2"
      />

      <div className="flex flex-1 items-center bg-background-low">
        <div className="flex w-full max-w-[624px] flex-col gap-08 p-08">
          <div className="anim-aparece flex flex-col gap-03">
            <Text variant="heading-m">Alta en tramitación</Text>
            <Text variant="body-l" color="mid">
              Para tramitar el cambio en nombre de las sociedades necesitamos al
              apoderado, su firma y el poder que lo acredite.
            </Text>
          </div>

          {/* Seguimiento ------------------------------------------------- */}
          <div
            className="anim-aparece flex flex-col gap-05 rounded-lg bg-background-base p-06"
            style={retardo(1)}
          >
            <Text variant="label-l" as="h2">
              Activación estimada: 1-3 semanas
            </Text>
            <SegmentedProgress steps={TRAMOS} current={tramo} />
          </div>

          {/* Acceso al área de cliente ---------------------------------- */}
          <div
            className="anim-aparece flex flex-col gap-05 rounded-lg bg-background-base p-06"
            style={retardo(2)}
          >
            <span className="flex size-09 items-center justify-center rounded-md bg-highlight-neutral text-highlight-muted">
              <Icon name="mail" size={24} />
            </span>

            <div className="flex flex-col gap-02">
              <Text variant="title-s" as="h2">
                Acceso al área de cliente
              </Text>
              <Text variant="body-m" color="mid">
                Se ha enviado un usuario y contraseña temporal por SMS y email a
                los contactos autorizados.
              </Text>
            </div>

            <div className="flex flex-col gap-02 rounded-md bg-background-low p-04">
              <Text variant="body-s" color="mid">
                Te hemos enviado tu acceso por SMS al ••••••456 y por email a
                co•••@empresa.es
              </Text>
              <Text variant="label-s" as="span">
                Usuario: contacto · Contraseña temporal: ••••
              </Text>
            </div>

            <Button fullWidth>Iniciar sesión</Button>
          </div>

          <button
            type="button"
            className="anim-aparece cursor-pointer self-start text-body-m text-content-high underline transition-opacity motion-micro-states hover:opacity-60"
            style={retardo(3)}
          >
            Descargar mandato (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
