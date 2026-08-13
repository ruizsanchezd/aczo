"use client";

import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  ARCHIVOS_CON_ERROR_PARTICULARES,
  ARCHIVOS_CORRECTOS_MUESTRA,
  FACTURAS_VENCIDAS_PARTICULARES,
  PERMANENCIAS_PARTICULARES,
  TOTAL_ARCHIVOS_LEIDOS_PARTICULARES,
  type ArchivoConError,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import {
  PanelAlertasParticulares,
  type PestanaAlertaParticular,
} from "./PanelAlertasParticulares";

/**
 * PantallaResultadoParticulares — la misma pantalla "Sube tu factura", ya con
 * el resultado del análisis: errores de lectura (no bloquean) y alertas de
 * contratos (permanencia vigente, facturas vencidas).
 *
 * Calco de `PantallaResultadoEmpresas.tsx` — es la parte del flujo que se
 * pidió mantener con las MISMAS funcionalidades que empresas ("Revisar" abre
 * el panel de alertas, igual que allí), no una versión simplificada. Lo único
 * que cambia de verdad son los números, a la escala de una vivienda (una
 * factura con error, uno o dos avisos) en vez de la de una cartera de
 * sociedades.
 */
export function PantallaResultadoParticulares({
  onContinuar,
}: {
  onContinuar?: () => void;
}) {
  const [errores, setErrores] = useState<ArchivoConError[]>(
    ARCHIVOS_CON_ERROR_PARTICULARES,
  );
  const [salientes, setSalientes] = useState<Set<string>>(new Set());
  const [totalLeidos, setTotalLeidos] = useState(
    TOTAL_ARCHIVOS_LEIDOS_PARTICULARES,
  );
  const [correctosAbierto, setCorrectosAbierto] = useState(false);
  const [panel, setPanel] = useState<PestanaAlertaParticular | null>(null);

  const reemplazando = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const correctos = totalLeidos - errores.length;
  const totalAlertas = PERMANENCIAS_PARTICULARES.length + FACTURAS_VENCIDAS_PARTICULARES.length;
  const correctosMuestra = ARCHIVOS_CORRECTOS_MUESTRA.slice(0, correctos);

  function quitarError(id: string, { esSustitucion }: { esSustitucion: boolean }) {
    setSalientes((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setErrores((prev) => prev.filter((e) => e.id !== id));
      setSalientes((prev) => {
        const siguiente = new Set(prev);
        siguiente.delete(id);
        return siguiente;
      });
      if (!esSustitucion) setTotalLeidos((prev) => prev - 1);
    }, 250);
  }

  function alSeleccionarArchivo(lista: FileList | null) {
    if (!lista?.length) return;
    if (reemplazando.current) {
      quitarError(reemplazando.current, { esSustitucion: true });
      reemplazando.current = null;
    } else {
      setTotalLeidos((prev) => prev + lista.length);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-background-base px-06 pb-06">
      <div className="flex w-full flex-col rounded-md bg-background-low">
        <div className="flex flex-col items-center gap-10 px-[140px] pt-10 pb-07">
          <div className="anim-aparece flex flex-col items-center gap-04 text-center" style={retardo(0)}>
            <Text variant="heading-xl">Sube tu factura</Text>
            <Text variant="body-l" color="low" className="max-w-[800px]">
              Sube todas tus facturas de luz, gas o ambas. Puedes arrastrar una
              foto, un PDF o un ZIP. Cuantas más facturas de un mismo CUPS, más
              preciso será el cálculo de tu ahorro.
            </Text>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.zip"
            onChange={(e) => {
              alSeleccionarArchivo(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />

          <div className="flex w-full flex-col items-end gap-04">
            {/* Barra de "añadir más", ya reducida (los archivos ya están subidos). */}
            <button
              type="button"
              onClick={() => {
                reemplazando.current = null;
                inputRef.current?.click();
              }}
              className="anim-aparece flex w-full items-center gap-03 rounded-md border border-border-low bg-background-base p-06 text-left transition-colors motion-micro-states hover:bg-background-low"
              style={retardo(1)}
            >
              <span className="flex size-08 shrink-0 items-center justify-center rounded-sm bg-highlight-soft text-content-high">
                <Icon name="upload" size={20} />
              </span>
              <Text variant="label-m" as="span">
                Arrastra más facturas o haz clic para añadir
              </Text>
            </button>

            {/* Tarjeta de revisión ----------------------------------------- */}
            <div
              className="anim-aparece flex w-full flex-col gap-[44px] rounded-md border border-border-low bg-background-base p-06"
              style={retardo(2)}
            >
              <div className="flex flex-col gap-03">
                <div className="flex items-center justify-between gap-04">
                  <Text variant="label-l" as="span">
                    {totalLeidos} {totalLeidos === 1 ? "archivo leído" : "archivos leídos"}
                  </Text>
                  <div className="flex items-center gap-02">
                    {errores.length > 0 && (
                      <Tag tone="danger" icon="warning">
                        {errores.length} {errores.length === 1 ? "error" : "errores"}
                      </Tag>
                    )}
                    <Tag tone="warning" icon="info">
                      {totalAlertas} {totalAlertas === 1 ? "alerta" : "alertas"}
                    </Tag>
                  </div>
                </div>
                <Text variant="body-m" color="low" className="max-w-[600px]">
                  {errores.length > 0
                    ? "Los errores de lectura no bloquean el proceso. No se tendrán en cuenta y no impactará en el cálculo de ahorro."
                    : "Todos los archivos se han podido leer correctamente."}
                </Text>
              </div>

              <div className="flex flex-col gap-[44px]">
                {/* Errores y archivos correctos -------------------------------- */}
                <div className="flex flex-col gap-04">
                  {errores.length > 0 && (
                    <>
                      <Text variant="label-s-uppercase" color="low" as="span">
                        Errores
                      </Text>
                      <div className="flex flex-col">
                        {errores.map((archivo) => (
                          <div
                            key={archivo.id}
                            className={[
                              "flex items-center justify-between gap-03 py-03",
                              "transition-all motion-micro-leave",
                              salientes.has(archivo.id)
                                ? "scale-95 opacity-0"
                                : "scale-100 opacity-100",
                            ].join(" ")}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-03">
                              <span className="flex shrink-0 items-center justify-center rounded-md bg-background-mid p-[10px] text-content-mid">
                                <Icon name="warning" size={20} />
                              </span>
                              <Text variant="label-m" className="truncate">
                                {archivo.nombre}
                              </Text>
                            </div>
                            <div className="flex shrink-0 items-center gap-03">
                              <Text variant="body-s" color="low" as="span">
                                {archivo.motivo}
                              </Text>
                              <div className="flex items-center gap-02">
                                <Button
                                  size="small"
                                  onClick={() => {
                                    reemplazando.current = archivo.id;
                                    inputRef.current?.click();
                                  }}
                                >
                                  Sustituir
                                </Button>
                                <Button
                                  variant="tertiary"
                                  size="small"
                                  iconOnly="trash"
                                  aria-label={`Descartar ${archivo.nombre}`}
                                  onClick={() =>
                                    quitarError(archivo.id, { esSustitucion: false })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Acordeón "archivos correctos": rejilla 0fr → 1fr, sin animar height. */}
                  {correctos > 0 && (
                    <div className="border-b border-border-low">
                      <button
                        type="button"
                        onClick={() => setCorrectosAbierto((v) => !v)}
                        aria-expanded={correctosAbierto}
                        className="flex w-full items-center justify-center gap-03 py-03 text-left"
                      >
                        <Text variant="label-m" as="span" className="flex-1">
                          {correctos} {correctos === 1 ? "archivo correcto" : "archivos correctos"}
                        </Text>
                        <span
                          className={[
                            "text-content-mid transition-transform motion-micro-states",
                            correctosAbierto ? "rotate-180" : "rotate-0",
                          ].join(" ")}
                        >
                          <Icon name="chevron-down" />
                        </span>
                      </button>
                      <div
                        className="grid transition-[grid-template-rows] motion-macro-levelup"
                        style={{
                          gridTemplateRows: correctosAbierto ? "1fr" : "0fr",
                        }}
                      >
                        <div className="overflow-hidden">
                          <ul className="flex flex-col gap-02 pb-04">
                            {correctosMuestra.map((archivo) => (
                              <li
                                key={archivo.nombre}
                                className="flex items-center justify-between gap-03 py-01"
                              >
                                <Text
                                  variant="body-m"
                                  as="span"
                                  className="min-w-0 flex-1 truncate"
                                >
                                  {archivo.nombre}
                                </Text>
                                <Text variant="body-s" color="low" as="span">
                                  {archivo.tamano}
                                </Text>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alertas ---------------------------------------------------- */}
                <div className="flex flex-col gap-04">
                  <Text variant="label-s-uppercase" color="low" as="span">
                    Alertas
                  </Text>
                  <Alert tone="info">
                    Puedes continuar aunque existan alertas. Las revisaremos
                    juntos en los siguiente pasos para garantizarte la
                    recomendación más precisa.
                  </Alert>

                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-03 py-03">
                      <div className="flex min-w-0 flex-1 items-center gap-03">
                        <span className="flex shrink-0 items-center justify-center rounded-md bg-background-mid p-[10px] text-content-mid">
                          <Icon name="lightbulb" size={20} />
                        </span>
                        <Text variant="label-m">Permanencia vigente</Text>
                      </div>
                      <div className="flex shrink-0 items-center gap-03">
                        <Text variant="body-s" color="low" as="span">
                          {PERMANENCIAS_PARTICULARES.length}{" "}
                          {PERMANENCIAS_PARTICULARES.length === 1 ? "contrato" : "contratos"}
                        </Text>
                        <Button size="small" onClick={() => setPanel("permanencia")}>
                          Revisar
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-03 py-03">
                      <div className="flex min-w-0 flex-1 items-center gap-03">
                        <span className="flex shrink-0 items-center justify-center rounded-md bg-background-mid p-[10px] text-content-mid">
                          <Icon name="folder" size={20} />
                        </span>
                        <Text variant="label-m">Facturas vencidas</Text>
                      </div>
                      <div className="flex shrink-0 items-center gap-03">
                        <Text variant="body-s" color="low" as="span">
                          {FACTURAS_VENCIDAS_PARTICULARES.length}{" "}
                          {FACTURAS_VENCIDAS_PARTICULARES.length === 1 ? "contrato" : "contratos"}
                        </Text>
                        <Button size="small" onClick={() => setPanel("vencidas")}>
                          Revisar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-[140px] py-04">
          <Button iconEnd="chevron-right" onClick={onContinuar}>
            Calcular ahorro
          </Button>
        </div>
      </div>

      <PanelAlertasParticulares
        pestanaInicial={panel}
        abierto={panel !== null}
        onCerrar={() => setPanel(null)}
      />
    </div>
  );
}
