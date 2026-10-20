"use client";

import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  ARCHIVOS_NO_VALIDOS_EMPRESAS,
  REQUISITOS_FACTURA_VALIDA,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";

/**
 * PantallaSinFacturasValidasEmpresas — el "error fatal" del análisis: NINGUNA
 * de las facturas subidas sirve para hacer el estudio. Sustituye a
 * PantallaResultadoEmpresas justo después de la pantalla de carga, y sigue en
 * el paso 01 del indicador (no se ha avanzado).
 *
 * A diferencia del resultado normal, aquí SÍ se bloquea el avance: no hay
 * "Calcular ahorro". La única salida es subir facturas nuevas (o hablar con
 * un asesor). Por eso la pantalla se ordena así, de arriba abajo:
 *   1. Qué ha pasado (titular + aviso en rojo, sin culpar a la persona).
 *   2. Por qué no vale cada archivo (lista con su motivo).
 *   3. Qué tiene que tener una factura para que sirva (para acertar a la segunda).
 *   4. La zona de arrastre, otra vez grande: es la acción principal.
 *
 * ANIMACIONES:
 *
 * 1. Entrada en cascada (anim-aparece + retardo) de titular, tarjeta y zona de
 *    arrastre, igual que el resultado normal, para que no se sienta como un
 *    "pantallazo" de error sino como un paso más del recorrido.
 * 2. Las filas de archivos no válidos entran también en cascada, una detrás de
 *    otra: se leen como "hemos revisado uno a uno", no como un bloque de golpe.
 * 3. Zona de arrastre: mismo comportamiento que en la subida (borde y fondo
 *    oliva al pasar un archivo por encima, icono un 5% más grande,
 *    motion-micro-states).
 * 4. Las facturas nuevas aparecen bajo la zona con anim-aparece; quitarlas las
 *    desvanece con motion-micro-leave antes de salir de la lista.
 * 5. "Volver a analizar" está desactivado hasta que hay al menos una factura
 *    nueva; el paso a activo lleva transición de color (motion-micro-states).
 *    Al pulsarlo se vuelve a la pantalla de carga y de ahí al resultado normal.
 */

type ArchivoNuevo = { id: string; nombre: string; tamano: string; saliendo: boolean };

function formatoTamano(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function PantallaSinFacturasValidasEmpresas({
  onReintentar,
}: {
  /** Vuelve a la pantalla de carga con las facturas nuevas. */
  onReintentar?: () => void;
}) {
  const [nuevos, setNuevos] = useState<ArchivoNuevo[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = ARCHIVOS_NO_VALIDOS_EMPRESAS.length;
  const hayNuevos = nuevos.some((a) => !a.saliendo);

  function anadir(lista: FileList | null) {
    if (!lista?.length) return;
    const recibidos = Array.from(lista).map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      nombre: f.name,
      tamano: formatoTamano(f.size),
      saliendo: false,
    }));
    setNuevos((prev) => [...prev, ...recibidos]);
  }

  function quitar(id: string) {
    setNuevos((prev) => prev.map((a) => (a.id === id ? { ...a, saliendo: true } : a)));
    setTimeout(() => setNuevos((prev) => prev.filter((a) => a.id !== id)), 250);
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-background-base px-06 pb-06">
      <div className="flex w-full flex-col rounded-md bg-background-low">
        <div className="flex flex-col items-center gap-10 px-[140px] pt-10 pb-07">
          <div className="anim-aparece flex flex-col items-center gap-04 text-center" style={retardo(0)}>
            <Text variant="heading-xl">No hemos podido usar tus facturas</Text>
            <Text variant="body-l" color="low" className="max-w-[800px]">
              Ninguno de los archivos que has subido sirve para calcular tu
              ahorro. No te preocupes: no se ha perdido nada. Sube de nuevo tus
              facturas y lo volvemos a intentar.
            </Text>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.zip"
            onChange={(e) => {
              anadir(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />

          <div className="flex w-full flex-col gap-04">
            {/* Tarjeta de revisión ------------------------------------------- */}
            <div
              className="anim-aparece flex w-full flex-col gap-[44px] rounded-md border border-border-low bg-background-base p-06"
              style={retardo(1)}
            >
              <div className="flex flex-col gap-04">
                <div className="flex items-center justify-between gap-04">
                  <Text variant="label-l" as="span">
                    {total} archivos leídos
                  </Text>
                  <Tag tone="danger" icon="warning">
                    {total} no válidos
                  </Tag>
                </div>
                <Alert tone="danger" icon="warning">
                  No podemos calcular tu ahorro con estos archivos. Necesitamos
                  al menos una factura válida para continuar.
                </Alert>
              </div>

              {/* Por qué no vale cada archivo -------------------------------- */}
              <div className="flex flex-col gap-04">
                <Text variant="label-s-uppercase" color="low" as="span">
                  Archivos no válidos
                </Text>
                <ul className="flex flex-col">
                  {ARCHIVOS_NO_VALIDOS_EMPRESAS.map((archivo, i) => (
                    <li
                      key={archivo.id}
                      className="anim-aparece flex items-center justify-between gap-03 py-03"
                      style={retardo(i + 2)}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-03">
                        <span className="flex shrink-0 items-center justify-center rounded-md bg-danger-low p-[10px] text-danger-high">
                          <Icon name="warning" size={20} />
                        </span>
                        <Text variant="label-m" className="truncate">
                          {archivo.nombre}
                        </Text>
                      </div>
                      <Text variant="body-s" color="low" as="span" className="shrink-0">
                        {archivo.motivo}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Qué necesitamos ------------------------------------------- */}
              <div className="flex flex-col gap-04">
                <Text variant="label-s-uppercase" color="low" as="span">
                  Para que una factura sirva
                </Text>
                <ul className="grid grid-cols-2 gap-x-06 gap-y-03">
                  {REQUISITOS_FACTURA_VALIDA.map((requisito) => (
                    <li key={requisito} className="flex items-start gap-02">
                      <Icon
                        name="check-circle-outline"
                        size={20}
                        className="shrink-0 text-highlight-muted"
                      />
                      <Text variant="body-m" as="span">
                        {requisito}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Zona de arrastre: vuelve a ser grande, es la acción principal. */}
            <div className="anim-aparece flex w-full flex-col gap-02" style={retardo(2)}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setArrastrando(false);
                  anadir(e.dataTransfer.files);
                }}
                className={[
                  "flex w-full cursor-pointer flex-col items-center justify-center gap-05 rounded-md border px-09 py-08",
                  "transition-colors motion-micro-states",
                  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
                  arrastrando
                    ? "border-highlight-muted bg-highlight-soft"
                    : "border-border-low bg-background-base",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-[56px] items-center justify-center rounded-md bg-highlight-soft text-content-high",
                    "transition-transform motion-micro-states",
                    arrastrando ? "scale-105" : "scale-100",
                  ].join(" ")}
                >
                  <Icon name="upload" size={24} />
                </span>
                <span className="flex flex-col items-center gap-02">
                  <Text variant="label-l" as="span">
                    Arrastra tus facturas aquí o haz clic para seleccionar archivos
                  </Text>
                  <Text variant="body-m" color="low" as="span">
                    Una foto, un PDF o ZIP con varias facturas
                  </Text>
                </span>
              </button>

              {nuevos.length > 0 && (
                <ul className="flex flex-col gap-02 rounded-md border border-border-low bg-background-base p-04">
                  {nuevos.map((archivo) => (
                    <li
                      key={archivo.id}
                      className={[
                        "flex items-center justify-between gap-03 rounded-md bg-background-low p-03",
                        "transition-all motion-micro-leave",
                        archivo.saliendo ? "scale-95 opacity-0" : "anim-aparece scale-100 opacity-100",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-03">
                        <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-soft text-content-high">
                          <Icon name="document" size={20} />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-01">
                          <Text variant="body-m" className="truncate">
                            {archivo.nombre}
                          </Text>
                          <Text variant="body-s" color="low">
                            {archivo.tamano}
                          </Text>
                        </div>
                      </div>
                      <Button
                        variant="tertiary"
                        size="small"
                        iconOnly="close"
                        aria-label={`Quitar ${archivo.nombre}`}
                        onClick={() => quitar(archivo.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-[140px] py-04">
          <Button variant="tertiary" iconStart="call">
            Hablar con un asesor
          </Button>
          <Button
            iconEnd="chevron-right"
            disabled={!hayNuevos}
            onClick={onReintentar}
            className="transition-colors motion-micro-states"
          >
            Volver a analizar
          </Button>
        </div>
      </div>
    </div>
  );
}
