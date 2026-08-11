"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { PASOS_CARGA_EMPRESAS } from "@/mocks/aczo";

/**
 * PantallaCargaEmpresas — pantalla de carga entre la subida y el resultado del
 * análisis, a pantalla completa (sin barra superior).
 *
 * Es la versión sencilla del Figma de empresas: logo, una barra de progreso y
 * un aviso de conexión segura. No confundir con "Analizando documentación..."
 * del recorrido particular (PantallaAnalizando.tsx), que tiene su propia
 * lista de pasos y las cruces girando — esta pantalla es un splash más
 * simple, fiel a ese Figma.
 *
 * El mensaje bajo la barra va cambiando con el progreso (PASOS_CARGA_EMPRESAS,
 * en mocks/aczo.ts): cada mensaje entra con anim-aparece-simple, igual que el
 * check de un paso completado en "Analizando documentación...", para que el
 * cambio de texto se note como un paso nuevo y no como un parpadeo.
 *
 * Al llegar al 100% pasa sola a la pantalla siguiente (con un pequeño respiro
 * para que se llegue a leer el 100%, igual que en PantallaAnalizando).
 */

const DURACION_TOTAL = 3000;
const REFRESCO = 40;

export function PantallaCargaEmpresas({
  onTerminar,
}: {
  onTerminar: () => void;
}) {
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const inicio = Date.now();
    const id = setInterval(() => {
      const transcurrido = Date.now() - inicio;
      const nuevo = Math.min(100, (transcurrido / DURACION_TOTAL) * 100);
      setProgreso(nuevo);

      if (nuevo >= 100) {
        clearInterval(id);
        setTimeout(onTerminar, 500);
      }
    }, REFRESCO);

    return () => clearInterval(id);
  }, [onTerminar]);

  // Qué mensaje toca según el progreso: el último tramo se queda en el último
  // mensaje en vez de pasarse de índice.
  const indiceMensaje = Math.min(
    PASOS_CARGA_EMPRESAS.length - 1,
    Math.floor((progreso / 100) * PASOS_CARGA_EMPRESAS.length),
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-background-base pt-[80px] pb-09">
      <div aria-hidden className="h-[40px]" />

      <div className="flex flex-col items-center gap-08">
        <div className="flex flex-col items-center gap-04">
          <Logo size={72} />
          <Text variant="heading-l" as="span">
            Aczo
          </Text>
        </div>

        <div className="flex w-[320px] flex-col items-center gap-05">
          <ProgressBar value={progreso} showValue={false} className="w-full" />
          <Text
            key={indiceMensaje}
            variant="body-m"
            color="mid"
            className="anim-aparece-simple text-center"
          >
            {PASOS_CARGA_EMPRESAS[indiceMensaje]}
          </Text>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-02 rounded-md bg-highlight-soft px-04 py-03">
        <Icon name="shield" size={16} className="text-content-high" />
        <Text variant="body-s" color="low" as="span">
          Conexión encriptada segura (SSL)
        </Text>
      </div>
    </div>
  );
}
