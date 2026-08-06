"use client";

import { useEffect, useState } from "react";
import { BrandPattern } from "@/components/brand/BrandPattern";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { PASOS_ANALISIS } from "@/mocks/aczo";

/**
 * PantallaAnalizando — pantalla 3: "Analizando documentación...".
 *
 * LA ANIMACIÓN PRINCIPAL DEL PROTOTIPO. Tres cosas a la vez:
 *
 * 1. LAS CRUCES GIRAN, A SALTOS.
 *    La cruz de la marca tiene 4 puntas simétricas: al girar 90° vuelve a estar
 *    exactamente igual que al empezar. Por eso el ciclo de la animación es de
 *    90° y no de 360°: el giro se ve continuo y nunca se aprecia un salto al
 *    reiniciarse. El ciclo dura 800 ms (motion-timing-6).
 *
 *    El giro va a saltos —steps(3), tres tirones por cuarto de vuelta— y no
 *    continuo. Es una decisión tomada: se siente mecánico, "una máquina
 *    trabajando", y encaja con el carácter de la marca mejor que un giro suave.
 *
 *    Las tres giran SINCRONIZADAS, como se pidió. Si en algún momento se quiere
 *    en cascada, basta con darle a cada una un animationDelay distinto.
 *
 * 2. LOS PASOS SE COMPLETAN. Cuando un paso termina, su cruz deja de girar y se
 *    convierte en un check, y el texto pasa de gris a negro. Así la lista cuenta
 *    el progreso, no solo lo acompaña.
 *
 * 3. LA BARRA SUBE, por su cuenta, con motion-macro-structure (500 ms) en cada
 *    salto, que es lo que hace que se vea fluida y no a tirones.
 *
 * Al llegar al 100% se pasa solo a la pantalla siguiente.
 */

/** Lo que tarda cada paso en completarse, en milisegundos. */
const DURACION_PASO = 1600;
/** Cada cuánto se refresca la barra. Más bajo = más fluido. */
const REFRESCO = 40;

export function PantallaAnalizando({ onTerminar }: { onTerminar: () => void }) {
  const [progreso, setProgreso] = useState(0);

  const total = DURACION_PASO * PASOS_ANALISIS.length;

  useEffect(() => {
    const inicio = Date.now();
    const id = setInterval(() => {
      const transcurrido = Date.now() - inicio;
      const nuevo = Math.min(100, (transcurrido / total) * 100);
      setProgreso(nuevo);

      if (nuevo >= 100) {
        clearInterval(id);
        // Un respiro al llegar al 100% antes de cambiar de pantalla: si se salta
        // de golpe, no se llega a leer que ha terminado.
        setTimeout(onTerminar, 500);
      }
    }, REFRESCO);

    return () => clearInterval(id);
  }, [onTerminar, total]);

  // Cuántos pasos han terminado ya.
  const completados = Math.floor((progreso / 100) * PASOS_ANALISIS.length);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Fondo de marca: cruces claras sobre verde oscuro. */}
      <BrandPattern
        variant="densa"
        className="absolute inset-00 flex items-start justify-start"
      />

      <div className="anim-escala-entrada relative z-10 mx-04 flex w-full max-w-[560px] flex-col gap-07 rounded-lg bg-background-low p-08 shadow-md">
        <div className="flex flex-col gap-03">
          <Text variant="heading-xs">Analizando documentación...</Text>
          <Text variant="body-m" color="mid">
            Esto puede tardar unos segundos. No cierres esta ventana.
          </Text>
        </div>

        <ul className="flex flex-col gap-04">
          {PASOS_ANALISIS.map((paso, i) => {
            const hecho = i < completados;

            return (
              <li key={paso} className="flex items-center gap-03">
                <span className="flex size-05 shrink-0 items-center justify-center text-highlight-muted">
                  {hecho ? (
                    // Terminado: la cruz para y se convierte en check.
                    <span className="anim-aparece-simple">
                      <Icon name="check-circle" />
                    </span>
                  ) : (
                    <span className="anim-gira-saltos">
                      <Icon name="spark" />
                    </span>
                  )}
                </span>

                <Text
                  variant="body-m"
                  color={hecho ? "high" : "mid"}
                  as="span"
                  className="transition-colors motion-micro-states"
                >
                  {paso}
                </Text>
              </li>
            );
          })}
        </ul>

        <ProgressBar value={progreso} label="Análisis de documentación" />
      </div>
    </div>
  );
}
