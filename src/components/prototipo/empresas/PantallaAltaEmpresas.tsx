"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SegmentedProgress } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { retardo } from "@/lib/prototipo";

/**
 * PantallaAltaEmpresas — pantalla 04 del flujo de empresas: la confirmación
 * final, tras pulsar "Activar cambio" en "Cambio de compañía"
 * (`PantallaCambioCompaniaEmpresas.tsx`).
 *
 * DOS CONTENIDOS, según cómo haya terminado el paso anterior
 * (`pendienteAprobacion`, que viaja desde `RecorridoEmpresas.tsx`):
 *
 *   FALSE ("Alta completada") — la propia persona autorizó el cambio (firma
 *   propia, o poderes ya subidos y firmados): no queda nada pendiente.
 *   TRUE  ("Alta en tramitación") — se eligió "No tengo el poder, enviar
 *   solicitud de firma...": todavía falta que la persona representante
 *   confirme, así que aquí se repite el enlace con su botón "Copiar" para
 *   no perderlo de vista.
 *
 * ANIMACIÓN DE ENTRADA — el "chispazo" que anuncia que el proceso terminó:
 *   - Las cruces de las esquinas (la misma cruz que gira en la pantalla de
 *     carga, `Icon name="spark"`) entran a modo de chispazo
 *     (`anim-estrella-entra`: arrancan giradas y a tamaño cero, "aterrizan"
 *     a su sitio), una tras otra con un escalonado rápido (50 ms, más rápido
 *     que la cascada normal de 60 ms del resto del contenido — así se leen
 *     como una salva, no como una lista).
 *   - El color de las cruces cuenta el estado: `highlight-neutral` (el
 *     mismo tono apagado de siempre) cuando ya no hace falta nada más,
 *     `highlight-vivid` (el amarillo de marca) cuando todavía hay una
 *     acción pendiente — mismo lenguaje que el resto del sistema (el
 *     "Recomendado" de las tarjetas de plan también es vivid).
 *   - La barra de cuatro tramos se llena al entrar en vez de aparecer ya
 *     llena (arranca en -1 y pasa a 1 un instante después): se lee "vas por
 *     aquí" en vez de "esto es un gráfico" — mismo truco que
 *     `PantallaTramitacion.tsx` (recorrido particular).
 */

const TRAMOS = ["Solicitado", "En tramitación", "Aceptado", "Activado"] as const;
const TRAMO_ACTUAL = 1;

const TAMANO_ESTRELLA = 56;
// Las dos esquinas, en celdas (columna, fila) — transcritas del Figma, no
// aleatorias: la de arriba-izquierda es un tresillo apretado, la de
// abajo-derecha una "pirámide" de 6, más ancha por abajo.
const ESQUINA_SUPERIOR: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [1, 1],
];
const ESQUINA_INFERIOR: Array<[number, number]> = [
  [0, 1],
  [1, 1],
  [1, 0],
  [2, 1],
  [2, 0],
  [3, 1],
];

export function PantallaAltaEmpresas({
  pendienteAprobacion,
}: {
  pendienteAprobacion: boolean;
}) {
  // Arranca sin ningún tramo hecho para que la barra se vea llenarse.
  const [tramo, setTramo] = useState(-1);

  useEffect(() => {
    const id = setTimeout(() => setTramo(TRAMO_ACTUAL), 200);
    return () => clearTimeout(id);
  }, []);

  const tono = pendienteAprobacion ? "vivid" : "neutral";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center bg-background-base px-06 pb-06">
        <div className="relative flex w-full flex-1 flex-col items-center overflow-hidden rounded-md bg-highlight-deep">
          <EstrellasEsquina posicion="superior-izquierda" tono={tono} />
          <EstrellasEsquina posicion="inferior-derecha" tono={tono} />

          <div className="layout-section relative z-10 flex flex-1 flex-col items-center justify-center gap-08 py-10 text-center">
            <div className="anim-aparece flex flex-col items-center gap-03" style={retardo(6)}>
              <Text
                variant={pendienteAprobacion ? "heading-xl" : "heading-l"}
                color="always-light"
                className="max-w-[700px]"
              >
                {pendienteAprobacion
                  ? "¡Genial! Tu alta está en tramitación."
                  : "¡Listo! Tu cambio está en proceso y tu alta ha sido completada."}
              </Text>
              {pendienteAprobacion && (
                <Text variant="body-l" color="low" className="max-w-[600px]">
                  Para tramitar el cambio en nombre de las sociedades
                  necesitamos al apoderado, su firma y el poder que lo
                  acredite. Asegúrate de enviarle el link para que confirme
                  la solicitud.
                </Text>
              )}
            </div>

            <div className="flex w-full max-w-[800px] flex-col items-start gap-06">
              <div
                className="anim-aparece flex w-full flex-col gap-05 rounded-md bg-background-base p-05 text-left"
                style={retardo(7)}
              >
                <Text variant="label-s-uppercase" color="low">
                  Activación estimada: 1-3 semanas
                </Text>
                <SegmentedProgress steps={TRAMOS} current={tramo} />
                {pendienteAprobacion && <EnlaceFirma />}
              </div>

              <div
                className="anim-aparece flex w-full flex-col gap-04 rounded-md bg-background-base p-06 text-left"
                style={retardo(8)}
              >
                <span className="flex size-09 items-center justify-center rounded-md bg-highlight-soft text-content-high">
                  <Icon name="mail" size={24} />
                </span>

                <div className="flex flex-col gap-01">
                  <Text variant="heading-m" as="h2">
                    Acceso al área de cliente
                  </Text>
                  <Text variant="body-m" color="low">
                    Se ha enviado un usuario y contraseña temporal por SMS y
                    email a los contactos autorizados.
                  </Text>
                </div>

                <div className="flex flex-col gap-01 rounded-md border border-border-low bg-background-low p-04">
                  <Text variant="body-s" color="low">
                    Te hemos enviado tu acceso por SMS al ••••••456 y por
                    email a co•••@empresa.es
                  </Text>
                  <Text variant="body-m" as="span">
                    Usuario: contacto · Contraseña temporal: ••••
                  </Text>
                </div>

                <Button fullWidth>Iniciar sesión</Button>
              </div>

              <button
                type="button"
                className="anim-aparece cursor-pointer text-body-m text-content-always-light underline transition-opacity motion-micro-states hover:opacity-60"
                style={retardo(9)}
              >
                Descargar mandato (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Piezas de esta pantalla                                                    */
/* -------------------------------------------------------------------------- */

/**
 * EstrellasEsquina — el chispazo de cruces en una esquina del panel oscuro.
 *
 * Reutiliza `Icon name="spark"` (la misma cruz de 4 puntas que gira en la
 * pantalla de carga y que dibuja `BrandPattern`) en vez de inventar un SVG
 * nuevo. Cada cruz entra con su propio retardo, más rápido que la cascada
 * normal del resto del contenido (50 ms en vez de 60 ms) para que se lea
 * como una salva de chispas, no como una lista.
 */
function EstrellasEsquina({
  posicion,
  tono,
}: {
  posicion: "superior-izquierda" | "inferior-derecha";
  tono: "neutral" | "vivid";
}) {
  const celdas = posicion === "superior-izquierda" ? ESQUINA_SUPERIOR : ESQUINA_INFERIOR;
  // Un poco de solape entre cruces, como en el Figma (no van a rejilla suelta).
  const paso = TAMANO_ESTRELLA - 8;
  const columnas = Math.max(...celdas.map(([c]) => c)) + 1;
  const filas = Math.max(...celdas.map(([, f]) => f)) + 1;

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute text-highlight-neutral",
        tono === "vivid" && "text-highlight-vivid",
        posicion === "superior-izquierda" ? "top-0 left-0" : "bottom-0 right-0",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: (columnas - 1) * paso + TAMANO_ESTRELLA,
        height: (filas - 1) * paso + TAMANO_ESTRELLA,
      }}
    >
      {celdas.map(([col, fila], i) => (
        <span
          key={`${col}-${fila}`}
          className="anim-estrella-entra absolute"
          style={{ ...retardo(i, 50), left: col * paso, top: fila * paso }}
        >
          <Icon name="spark" size={TAMANO_ESTRELLA} />
        </span>
      ))}
    </div>
  );
}

/** Enlace de firma con botón de copiar — mismo patrón que
 * `PantallaCambioCompaniaEmpresas.tsx` (duplicado aquí porque no está
 * exportado de allí): se repite en esta pantalla para no perder de vista el
 * enlace mientras la persona representante no haya firmado. */
function EnlaceFirma() {
  const [copiado, setCopiado] = useState(false);
  const enlace = "https://aczo.com/firma-representante-cambio.com";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
    } catch {
      // Sin permiso de portapapeles: el enlace sigue ahí, se puede
      // seleccionar y copiar a mano — no bloquea nada.
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex w-full flex-col gap-04 rounded-md bg-background-low p-04">
      <Text variant="label-s-uppercase" color="low" as="span">
        Link
      </Text>
      <div className="flex items-center justify-between gap-04 rounded-sm bg-background-base p-03">
        <Text variant="body-m" as="span" className="min-w-0 truncate text-extended-five-dark">
          {enlace}
        </Text>
        <Button variant="tertiary" size="small" onClick={copiar} className="shrink-0">
          {copiado ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}
