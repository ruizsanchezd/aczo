"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PuntoEstado } from "@/components/ui/PuntoEstado";
import { Radio } from "@/components/ui/Radio";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  CIF_NUEVO_SUMINISTRO,
  COMERCIALIZADORAS_NUEVO_SUMINISTRO,
  conMantenimientoMixto,
  DIRECCION_NUEVO_SUMINISTRO,
  ERROR_LECTURA_NUEVO_SUMINISTRO,
  euros,
  OFERTAS_NUEVO_SUMINISTRO,
  PERMANENCIA_NUEVO_SUMINISTRO,
  RESUMEN_ANALISIS_NUEVO_SUMINISTRO,
  SOCIEDAD_NUEVO_SUMINISTRO,
  suministrosDe,
  type Comercializadora,
  type Plan,
  type Suministro,
} from "@/mocks/aczo";
import { motionSafe, retardo } from "@/lib/prototipo";
import { motion } from "@/lib/motion";
import { DetalleTecnicoSuministro } from "../DetalleTecnicoSuministro";
import { Bloque, CabeceraBloque, FilaResumen, FirmaCanvas } from "../PiezasCambioCompania";
import { HuecoLogo, LogoComercializadora, tieneLogoComercializadora } from "../TarjetaPlan";

/**
 * NuevoSuministroCliente — el asistente "Añadir nuevos suministros" del área
 * de cliente (/area-cliente2). Se abre desde el botón del mismo nombre que ya
 * existe en la cabecera de Dashboard, Mi cartera, Consumo y ahorro y
 * Documentos, y vive DENTRO de `<main>` como una sección más del `seccion`
 * state de AreaCliente2.tsx — no es un modal ni una ruta aparte.
 *
 * Del Figma (fileKey hrMu2uv5cg2Bznl43Jukrr, sección "Nuevo suministro",
 * nodeId 860:36724): un asistente de 4 pasos con su propio stepper interno
 * ("01 Sube tu factura" → "02 Ahorro y recomendación" → "03 Confirma tus
 * datos" → "04 Solicitud enviada"), reutilizando el mismo patrón visual que
 * el recorrido de alta de empresas (`src/components/prototipo/empresas/`),
 * pero adaptado a que aquí quien entra YA es cliente:
 *
 *   - No se piden nombre/email en la subida (ya se conocen: hay sesión
 *     iniciada) — a diferencia de `PantallaSubidaEmpresas`.
 *   - Solo se comparan DOS ofertas en el paso 02 (no tres), y sobre una única
 *     sociedad que ya está en la cartera (`SOCIEDAD_NUEVO_SUMINISTRO`, en
 *     mocks/aczo.ts) en vez de varias sociedades nuevas.
 *   - El paso 03 no repite el bloque de verificación de identidad completo
 *     de empresas (ya se ha verificado al hacerse cliente): banner "La
 *     sociedad detectada ya existe en tu cartera" + formulario ya rellenado.
 *   - El paso 04 se queda DENTRO de esta misma tarjeta blanca (a diferencia
 *     de `PantallaAltaEmpresas`, que es una pantalla oscura de celebración a
 *     pantalla completa: esa es para un alta nueva, esta es un cliente que
 *     ya tiene acceso al área de cliente).
 *
 * SUSTITUCIÓN DE LA SOCIEDAD DEL FIGMA: ese diseño usa "Restaurante
 * Mediterráneo S.L", una sociedad de mentira que no existe en el resto del
 * prototipo. Aquí se usa `SOCIEDAD_NUEVO_SUMINISTRO` (mendesaltaren SL, la
 * primera de `SOCIEDADES_CARTERA`) — mismo criterio ya aplicado en
 * `CONTRATOS_CLIENTE`/`OTROS_DOCUMENTOS_CLIENTE` (ver mocks/aczo.ts).
 *
 * SIN PANTALLA DE CARGA A PANTALLA COMPLETA: el Figma de este asistente no
 * incluye una pantalla de carga entre "Sube tu factura" y "Revisión de tus
 * facturas" (a diferencia de `PantallaCargaEmpresas`, que sí es a pantalla
 * completa y apagaría la barra lateral fija del área de cliente, que aquí
 * tiene que seguir siempre visible). En su lugar, "Analizar facturas" pasa
 * directamente al estado de revisión — decisión tomada aquí, no del Figma.
 *
 * NAVEGACIÓN: la flecha de "atrás" de la cabecera es la misma en los 4 pasos
 * (fiel al Figma, que la dibuja siempre en el mismo sitio): en el paso 01
 * vuelve a la sección desde la que se abrió el asistente (simplificado a
 * "volver siempre al Dashboard", ver `onVolver`); en el resto, retrocede un
 * paso — igual que el botón "Atrás" de la barra inferior de los pasos 02 y 03.
 */

type Vista = "subida" | "revision" | "ahorro" | "cambio" | "enviado";

const PASOS_NUEVO_SUMINISTRO = [
  { numero: "01", nombre: "Sube tu factura" },
  { numero: "02", nombre: "Ahorro y recomendación" },
  { numero: "03", nombre: "Confirma tus datos" },
  { numero: "04", nombre: "Solicitud enviada" },
] as const;

const PASO_DE_VISTA: Record<Vista, number> = {
  subida: 0,
  revision: 0,
  ahorro: 1,
  cambio: 2,
  enviado: 3,
};

/** A qué vista vuelve la flecha/el botón "Atrás" desde cada vista. La subida
 * no tiene una vista anterior dentro del asistente: ahí manda `onVolver`. */
const VISTA_ANTERIOR: Partial<Record<Vista, Vista>> = {
  revision: "subida",
  ahorro: "revision",
  cambio: "ahorro",
};

/** La posición vertical de `el` en el documento, SIN contar transforms de
 * animación (a diferencia de `getBoundingClientRect`, que sí los cuenta): el
 * contenido de cada paso entra con `anim-entra-adelante`
 * (`translateY(24px)` → `0`), así que medirlo con `getBoundingClientRect`
 * justo al montarse da una posición movediza según en qué fotograma de esa
 * animación se mida. `offsetTop` es una propiedad de layout, no de pintado:
 * no le afecta el transform, así que da siempre la posición final de
 * verdad. */
function posicionEnDocumento(el: HTMLElement): number {
  let y = 0;
  let nodo: HTMLElement | null = el;
  while (nodo) {
    y += nodo.offsetTop;
    nodo = nodo.offsetParent as HTMLElement | null;
  }
  return y;
}

/** Desliza el scroll de la ventana `distancia` píxeles hacia abajo desde
 * donde esté, en `duracion` ms con una curva de salida (ease-out) — para la
 * transición de "Sube tu factura" a "Ahorro y recomendación", ver más abajo.
 * `window.scrollTo({behavior:"smooth"})` no sirve para esto: su curva y
 * duración las decide el navegador, y para una distancia corta la resuelve
 * casi de golpe. */
function animarScroll(distancia: number, duracion: number) {
  const inicio = window.scrollY;
  const t0 = performance.now();

  function paso(ahora: number) {
    const t = Math.min(1, (ahora - t0) / duracion);
    const salida = 1 - (1 - t) ** 3;
    window.scrollTo(0, inicio + distancia * salida);
    if (t < 1) requestAnimationFrame(paso);
  }

  requestAnimationFrame(paso);
}

export function NuevoSuministroCliente({
  onVolver,
  onIrACartera,
}: {
  /** El paso 01 no tiene vista anterior dentro del asistente: vuelve a la
   * sección desde la que se abrió. Se simplifica a "volver siempre al
   * Dashboard" (ver la nota de cabecera) en vez de recordar el origen exacto,
   * que habría obligado a cablear un dato más entre AreaCliente2 y las
   * cuatro pantallas de entrada. */
  onVolver: () => void;
  /** El botón final "Ir a mi cartera" del paso 04. */
  onIrACartera: () => void;
}) {
  const [vista, setVista] = useState<Vista>("subida");
  // Foto del plan elegido en el paso 02 al pulsar "Completar tus datos", para
  // el resumen del paso 03 — mismo patrón que `ResumenCambioEmpresas`.
  const [resumen, setResumen] = useState<ResumenNuevoSuministro | null>(null);
  const contenidoRef = useRef<HTMLDivElement>(null);

  function ir(destino: Vista) {
    setVista(destino);
  }

  // Al entrar en "Ahorro y recomendación" (desde "Analizar facturas" de la
  // revisión de facturas) el scroll no se queda arriba del todo: sube de
  // golpe hasta el principio y de ahí BAJA deslizándose hasta quedar justo
  // encima de "Tu ahorro potencial" — así se ve el gesto de saltarse la
  // cabecera y el stepper (que no aportan nada nuevo, ya se han visto en el
  // paso anterior) en vez de que el contenido cambie sin más. El salto
  // inicial a 0 es instantáneo (si no, con la revisión de facturas scrollada
  // se vería un deslizamiento larguísimo y raro); solo el tramo final hasta
  // el nuevo paso es el que se anima — con un tween propio en vez del
  // `scrollIntoView({behavior:"smooth"})` nativo, porque para una distancia
  // tan corta (la altura de la cabecera) el navegador lo resuelve casi de
  // golpe y no llega a notarse el gesto. Va en un efecto (no dentro de `ir`)
  // porque necesita que el contenido del paso ya esté pintado para medir
  // dónde está, y un `requestAnimationFrame` de por medio para que el
  // navegador llegue a pintar el salto a 0 antes de arrancar la animación.
  useEffect(() => {
    if (vista === "ahorro") {
      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => {
        if (!contenidoRef.current) return;
        // -16: para que el borde de arriba de la tarjeta quede a la misma
        // altura que el borde de arriba de la barra lateral (`top-04`, fija
        // a 16 px de la ventana), no pegado del todo al borde de la ventana.
        const destino = posicionEnDocumento(contenidoRef.current) - 16;
        if (motionSafe()) {
          animarScroll(destino, motion.macroLevelUp.duration);
        } else {
          window.scrollTo({ top: destino, behavior: "instant" });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [vista]);

  function alPulsarAtras() {
    const anterior = VISTA_ANTERIOR[vista];
    if (anterior) ir(anterior);
    else onVolver();
  }

  return (
    <div className="flex flex-col gap-06">
      <header className="flex flex-col gap-05">
        <button
          type="button"
          onClick={alPulsarAtras}
          aria-label="Volver"
          className="flex size-07 w-fit items-center justify-center rounded-md text-content-high outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
        >
          <Icon name="chevron-left" size={24} />
        </button>

        <div className="flex flex-col gap-01">
          <Text variant="heading-l" as="h1">
            Nuevo suministro
          </Text>
          <Text variant="body-m" color="low">
            Sube tus facturas anteriores para que nuestro motor calcule tu
            ahorro óptimo
          </Text>
        </div>

        <StepperNuevoSuministro pasoActual={PASO_DE_VISTA[vista]} />
      </header>

      <div
        key={vista}
        ref={contenidoRef}
        className="anim-entra-adelante flex flex-col rounded-md bg-background-low p-06"
      >
        {vista === "subida" && (
          <PasoSubida onContinuar={() => ir("revision")} />
        )}
        {vista === "revision" && (
          <PasoRevision onContinuar={() => ir("ahorro")} />
        )}
        {vista === "ahorro" && (
          <PasoAhorro
            onContinuar={(r) => {
              setResumen(r);
              ir("cambio");
            }}
          />
        )}
        {vista === "cambio" && resumen && (
          <PasoCambio resumen={resumen} onContinuar={() => ir("enviado")} />
        )}
        {vista === "enviado" && (
          <PasoEnviado onIrACartera={onIrACartera} />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stepper                                                                    */
/* -------------------------------------------------------------------------- */

/** El indicador "01 Sube tu factura" → ... → "04 Solicitud enviada", con el
 * paso activo en oscuro y los futuros en un tono apagado, y una barra
 * separadora debajo — calcado del patrón visual de las capturas del Figma. */
function StepperNuevoSuministro({ pasoActual }: { pasoActual: number }) {
  return (
    <nav
      aria-label="Progreso de Nuevo suministro"
      className="flex flex-col gap-04"
    >
      <div className="flex flex-wrap items-center gap-07">
        {PASOS_NUEVO_SUMINISTRO.map((paso, i) => {
          const activo = i === pasoActual;
          return (
            <div key={paso.numero} className="flex items-center gap-02">
              <span
                className={[
                  "flex items-center justify-center rounded-sm px-01 py-[2px] text-label-m tabular-nums",
                  "transition-colors motion-micro-states",
                  activo
                    ? "bg-highlight-deep text-content-always-light"
                    : "bg-highlight-soft text-content-mid",
                ].join(" ")}
              >
                {paso.numero}
              </span>
              <span
                aria-current={activo ? "step" : undefined}
                className={[
                  "text-body-m",
                  activo ? "text-content-high" : "text-content-mid",
                ].join(" ")}
              >
                {paso.nombre}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-px w-full bg-border-low" />
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 01a — Sube tu factura                                                 */
/* -------------------------------------------------------------------------- */

type EstadoArchivo = "subiendo" | "listo" | "saliendo";
type Archivo = {
  id: string;
  nombre: string;
  extension: string;
  tamanoBytes: number;
  progreso: number;
  estado: EstadoArchivo;
};

function formatoTamano(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function BadgeArchivo({ extension }: { extension: string }) {
  return (
    <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-soft text-body-s text-highlight-muted">
      {extension}
    </span>
  );
}

/**
 * PasoSubida — "Adjunta tus facturas": la zona de arrastrar/soltar y los dos
 * checkboxes legales. Mismo patrón simulado que `PantallaSubidaEmpresas`
 * (progreso a saltos aleatorios, sin backend real), pero SIN los campos de
 * nombre/email: quien entra a este asistente ya tiene sesión iniciada en el
 * área de cliente, así que esos datos ya se conocen.
 */
function PasoSubida({ onContinuar }: { onContinuar: () => void }) {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [confirmaDatos, setConfirmaDatos] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!archivos.some((a) => a.estado === "subiendo")) return;

    const intervalo = setInterval(() => {
      setArchivos((prev) =>
        prev.map((a) => {
          if (a.estado !== "subiendo") return a;
          const siguiente = a.progreso + 8 + Math.random() * 20;
          return siguiente >= 100
            ? { ...a, progreso: 100, estado: "listo" as const }
            : { ...a, progreso: siguiente };
        }),
      );
    }, 180);

    return () => clearInterval(intervalo);
  }, [archivos]);

  function anadir(lista: FileList | null) {
    if (!lista?.length) return;
    const nuevos: Archivo[] = [...lista].map((f, i) => ({
      id: `${f.name}-${Date.now()}-${i}`,
      nombre: f.name,
      extension: (f.name.split(".").pop() || "").toUpperCase().slice(0, 4) || "DOC",
      tamanoBytes: f.size,
      progreso: 0,
      estado: "subiendo" as const,
    }));
    setArchivos((prev) => [...prev, ...nuevos]);
  }

  function quitar(id: string) {
    setArchivos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: "saliendo" as const } : a)),
    );
    setTimeout(() => {
      setArchivos((prev) => prev.filter((a) => a.id !== id));
    }, 250);
  }

  const hayArchivos = archivos.length > 0;
  const todosListos = hayArchivos && archivos.every((a) => a.estado !== "subiendo");
  const listoParaContinuar = todosListos && aceptaPrivacidad && confirmaDatos;

  return (
    <div className="flex flex-col gap-08">
      <div className="anim-aparece flex flex-col gap-01" style={retardo(0)}>
        <Text variant="heading-m" as="h2">
          Adjunta tus facturas
        </Text>
        <Text variant="body-m" color="low">
          Sube al menos 2 facturas (luz, gas o ambas) de los últimos 12 meses
          para un cálculo más preciso del perfil de consumo anual. Más
          facturas de un mismo punto de suministro, más precisión.
        </Text>
      </div>

      <div className="flex flex-col gap-06">
        {!hayArchivos && (
          <div className="anim-aparece" style={retardo(1)}>
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
                "flex h-[266px] w-full cursor-pointer flex-col items-center justify-center gap-06 rounded-md border px-09",
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
                  Arrastra tus facturas aquí o haz clic para seleccionar
                  archivos
                </Text>
                <Text variant="body-m" color="low" as="span">
                  Una foto, un PDF o ZIP con varias facturas
                </Text>
              </span>
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.zip"
          onChange={(e) => anadir(e.target.files)}
          className="hidden"
        />

        {hayArchivos && (
          <div className="anim-aparece flex w-full flex-col gap-02 rounded-md border border-border-low bg-background-base p-04">
            {archivos.map((archivo, i) => (
              <div
                key={archivo.id}
                className={[
                  "flex items-center justify-between gap-03 rounded-md bg-background-low p-03",
                  "transition-all motion-micro-leave",
                  archivo.estado === "saliendo"
                    ? "scale-95 opacity-0"
                    : "anim-aparece scale-100 opacity-100",
                ].join(" ")}
                style={archivo.estado === "saliendo" ? undefined : retardo(i)}
              >
                <div className="flex min-w-0 flex-1 items-center gap-03">
                  <BadgeArchivo extension={archivo.extension} />
                  <div className="flex min-w-0 flex-1 flex-col gap-01">
                    <Text variant="body-m" className="truncate">
                      {archivo.nombre}
                    </Text>
                    {archivo.estado === "subiendo" ? (
                      <>
                        <Text variant="body-s" as="span" className="text-highlight-muted">
                          Subiendo… {Math.round(archivo.progreso)}%
                        </Text>
                        <ProgressBar value={archivo.progreso} showValue={false} />
                      </>
                    ) : (
                      <Text variant="body-s" color="low">
                        {formatoTamano(archivo.tamanoBytes)}
                      </Text>
                    )}
                  </div>
                </div>
                <Button
                  variant="tertiary"
                  size="small"
                  iconOnly="close"
                  aria-label={`Quitar ${archivo.nombre}`}
                  onClick={() => quitar(archivo.id)}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center justify-center rounded-md border border-dashed border-border-mid py-03 text-body-m text-highlight-muted transition-colors motion-micro-states hover:bg-highlight-soft"
            >
              + Agregar más archivos
            </button>
          </div>
        )}

        <div className="anim-aparece flex flex-col gap-04" style={retardo(2)}>
          <Checkbox checked={aceptaPrivacidad} onChange={setAceptaPrivacidad}>
            He leído y acepto la Política de Privacidad y Protección de Datos,
            y autorizo el tratamiento de mis facturas (incl. CIF e IBAN) para
            el análisis y la optimización energética.
          </Checkbox>
          <Checkbox checked={confirmaDatos} onChange={setConfirmaDatos}>
            Confirmo que los datos aportados corresponden a mi empresa y
            autorizo su tratamiento confidencial por parte de ACZO, sin
            cesión a terceros salvo para ejecutar el cambio de suministro.
          </Checkbox>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          iconEnd="chevron-right"
          disabled={!listoParaContinuar}
          onClick={onContinuar}
          className="transition-colors motion-micro-states"
        >
          Analizar facturas
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 01b — Revisión de tus facturas                                       */
/* -------------------------------------------------------------------------- */

type TipoRevisar = "errores" | "permanencia";

/**
 * PasoRevision — "Revisión de tus facturas": el resumen del análisis y las
 * dos categorías que hay que revisar (errores de lectura, permanencia
 * vigente). Más simple que `PantallaResultadoEmpresas` (que enseña cada
 * error uno a uno): este Figma agrupa por categoría con un contador y un
 * botón "Revisar" que abre el detalle en un panel lateral.
 */
function PasoRevision({ onContinuar }: { onContinuar: () => void }) {
  const [incluirPermanencia, setIncluirPermanencia] = useState(true);
  const [panelAbierto, setPanelAbierto] = useState<TipoRevisar | null>(null);

  return (
    <div className="flex flex-col gap-08">
      <div className="anim-aparece flex flex-col gap-01" style={retardo(0)}>
        <Text variant="heading-m" as="h2">
          Revisión de tus facturas
        </Text>
        <Text variant="body-m" color="low">
          Hemos analizado todas tus facturas y hemos detectado algunas
          anomalías que pueden impactar el estudio del ahorro. Te
          recomendamos que los revises antes de continuar.
        </Text>
      </div>

      <div
        className="anim-aparece flex flex-col gap-06 rounded-md border border-border-low bg-background-base p-06"
        style={retardo(1)}
      >
        <div className="flex w-fit items-center rounded-md border border-border-low px-04 py-03">
          <Text variant="label-s-uppercase" color="low" as="span">
            Resumen de tu análisis · {RESUMEN_ANALISIS_NUEVO_SUMINISTRO.totalArchivos}{" "}
            archivos leídos · {RESUMEN_ANALISIS_NUEVO_SUMINISTRO.correctos} correctos ·{" "}
            2 alertas
          </Text>
        </div>

        <div className="flex flex-col gap-04">
          <div className="flex items-center gap-02 text-content-mid">
            <Icon name="info" size={16} />
            <Text variant="label-m" as="span">
              1 alerta
            </Text>
          </div>
          <Alert tone="warning" icon="warning">
            <div className="flex flex-col gap-01">
              <Text variant="label-m" as="span">
                Puedes continuar con el estudio, pero podrías perder parte
                del ahorro
              </Text>
              <Text variant="body-m" color="mid" as="span">
                Estas facturas no entrarán en tu estudio de ahorro.
                Resuélvelas ahora para una recomendación más precisa y
                maximizar tu ahorro.
              </Text>
            </div>
          </Alert>

          <div className="flex items-center justify-between gap-03 py-02">
            <div className="flex min-w-0 flex-1 items-center gap-03">
              <span className="flex shrink-0 items-center justify-center rounded-md bg-warning-low p-[10px] text-warning-high">
                <Icon name="warning" size={20} />
              </span>
              <Text variant="label-m">Errores de lectura</Text>
              <Text variant="body-s" color="low" as="span">
                1 facturas
              </Text>
            </div>
            <Button size="small" onClick={() => setPanelAbierto("errores")}>
              Revisar
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-04 border-t border-border-low pt-06">
          <div className="flex items-center gap-02 text-content-mid">
            <Icon name="shield" size={16} />
            <Text variant="label-m" as="span">
              1 permanencias
            </Text>
          </div>

          <div className="flex items-center justify-between gap-03 py-02">
            <div className="flex min-w-0 flex-1 items-center gap-03">
              <span className="flex shrink-0 items-center justify-center rounded-md bg-info-low p-[10px] text-info-high">
                <Icon name="shield" size={20} />
              </span>
              <Text variant="label-m">Permanencia vigente</Text>
              <Text variant="body-s" color="low" as="span">
                1 facturas
              </Text>
            </div>
            <div className="flex shrink-0 items-center gap-03">
              <Switch
                checked={incluirPermanencia}
                onChange={setIncluirPermanencia}
                label="Incluir de todos modos el contrato con permanencia"
              />
              <Text variant="label-m" as="span">
                Incluir de todos modos
              </Text>
              <Button size="small" onClick={() => setPanelAbierto("permanencia")}>
                Revisar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button iconEnd="chevron-right" onClick={onContinuar}>
          Analizar facturas
        </Button>
      </div>

      <PanelRevisarNuevoSuministro
        tipo={panelAbierto}
        onCerrar={() => setPanelAbierto(null)}
        incluirPermanencia={incluirPermanencia}
        onCambiarIncluirPermanencia={setIncluirPermanencia}
      />
    </div>
  );
}

/**
 * PanelRevisarNuevoSuministro — el detalle de "Revisar", en un panel lateral.
 * Versión simplificada (sin pestañas, ni de empresas) de `PanelAlertasEmpresas`:
 * como aquí cada botón "Revisar" ya sabe qué categoría abre, no hace falta
 * conmutar entre "Permanencia"/"Vencidas" dentro del panel.
 */
function PanelRevisarNuevoSuministro({
  tipo,
  onCerrar,
  incluirPermanencia,
  onCambiarIncluirPermanencia,
}: {
  tipo: TipoRevisar | null;
  onCerrar: () => void;
  incluirPermanencia: boolean;
  onCambiarIncluirPermanencia: (incluir: boolean) => void;
}) {
  useEffect(() => {
    if (!tipo) return;
    function alPulsarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPulsarTecla);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alPulsarTecla);
      document.body.style.overflow = overflowAnterior;
    };
  }, [tipo, onCerrar]);

  if (!tipo) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Revisar" className="fixed inset-00 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="fixed inset-00 cursor-default bg-background-overlay anim-aparece-simple"
      />
      <aside className="anim-entra-lateral relative flex h-full w-full max-w-[440px] flex-col border-l border-border-low bg-background-base">
        <header className="flex shrink-0 items-center justify-between gap-04 border-b border-border-low px-06 py-05">
          <h2 className="font-heading text-[24px] leading-[32px] tracking-[-2px] text-content-high">
            {tipo === "errores" ? "Errores de lectura" : "Permanencia vigente"}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onCerrar}
            className="cursor-pointer rounded-sm p-01 text-content-high transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-05 overflow-y-auto p-06">
          {tipo === "errores" ? (
            <article className="flex flex-col gap-04 rounded-md border border-border-low bg-background-low p-05">
              <div className="flex items-center gap-03">
                <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-warning-low text-warning-high">
                  <Icon name="warning" size={20} />
                </span>
                <Text variant="label-m" as="h3" className="min-w-0 truncate">
                  {ERROR_LECTURA_NUEVO_SUMINISTRO.nombre}
                </Text>
              </div>
              <Text variant="body-m" color="low">
                {ERROR_LECTURA_NUEVO_SUMINISTRO.motivo}. Puedes sustituir el
                archivo o descartarlo; no bloquea el resto del proceso.
              </Text>
              <div className="flex justify-end">
                <Button size="small">Sustituir archivo</Button>
              </div>
            </article>
          ) : (
            <article className="flex flex-col gap-05 rounded-md border border-border-low bg-background-low p-06">
              <header className="flex items-center gap-03">
                <span className="flex size-[52px] shrink-0 items-center justify-center rounded-md bg-highlight-deep text-content-always-light">
                  <Icon name="document" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <h3 className="truncate font-heading text-[24px] leading-[32px] tracking-[-2px] text-content-high">
                    {PERMANENCIA_NUEVO_SUMINISTRO.comercializadora}
                  </h3>
                  <Text variant="body-m" color="low" className="truncate">
                    {PERMANENCIA_NUEVO_SUMINISTRO.archivo}
                  </Text>
                </span>
              </header>

              <div className="flex flex-wrap gap-04">
                <Dato etiqueta="Sociedad">{PERMANENCIA_NUEVO_SUMINISTRO.sociedad}</Dato>
                <Dato etiqueta="CIF">{PERMANENCIA_NUEVO_SUMINISTRO.cif}</Dato>
                <Dato etiqueta="CUPS">{PERMANENCIA_NUEVO_SUMINISTRO.cups}</Dato>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-04 rounded-[12px] bg-background-base p-04">
                <span className="flex flex-col gap-01">
                  <Text variant="body-s" color="low" as="span">
                    {PERMANENCIA_NUEVO_SUMINISTRO.etiquetaFecha}
                  </Text>
                  <Text variant="body-m" as="span">
                    {PERMANENCIA_NUEVO_SUMINISTRO.fecha}
                  </Text>
                </span>
                {PERMANENCIA_NUEVO_SUMINISTRO.importe && (
                  <span className="text-title-m whitespace-nowrap text-content-high">
                    {euros(PERMANENCIA_NUEVO_SUMINISTRO.importe.min)} –{" "}
                    {euros(PERMANENCIA_NUEVO_SUMINISTRO.importe.max)} €
                  </span>
                )}
              </div>

              <div className="flex items-center gap-03">
                <Switch
                  checked={incluirPermanencia}
                  onChange={onCambiarIncluirPermanencia}
                  label="Incluir de todos modos"
                />
                <Text variant="label-m" as="span">
                  Incluir de todos modos
                </Text>
              </div>
            </article>
          )}
        </div>
      </aside>
    </div>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col gap-01">
      <Text variant="body-s" color="low" as="span">
        {etiqueta}
      </Text>
      <Text variant="body-m" as="span" className="truncate">
        {children}
      </Text>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 02 — Ahorro y recomendación                                          */
/* -------------------------------------------------------------------------- */

/** Lo que este paso le pasa a "Confirma tus datos" al pulsar "Completar tus
 * datos": la foto del plan elegido en ese momento — mismo patrón que
 * `ResumenCambioEmpresas`, simplificado a una única sociedad. */
export type ResumenNuevoSuministro = {
  plan: Plan;
  totalPuntos: number;
  puntosConMantenimiento: number;
  ahorroAnual: number;
};

function PasoAhorro({
  onContinuar,
}: {
  onContinuar: (resumen: ResumenNuevoSuministro) => void;
}) {
  const [mensual, setMensual] = useState(false);
  const [planId, setPlanId] = useState(
    () => OFERTAS_NUEVO_SUMINISTRO.find((p) => p.recomendado)?.id ?? OFERTAS_NUEVO_SUMINISTRO[0].id,
  );

  // Qué comercializadoras RECOMIENDA cada oferta — no todas incluyen las
  // mismas: "Ahorro Confort" es solo TotalEnergies, "Ahorro Aczo" es
  // TotalEnergies + Repsol (mismo criterio que `PantallaAhorroEmpresas`, ver
  // `resolverComercializadoras`).
  function comercializadorasDelPlan(plan: Plan) {
    return COMERCIALIZADORAS_NUEVO_SUMINISTRO.filter((c) =>
      plan.comercializadoras.includes(c.nombre),
    );
  }

  // El ahorro de cada oferta ES la suma de sus comercializadoras (antes de
  // aplicar el descuento de mantenimiento): así la cifra grande de la
  // tarjeta cuadra siempre con lo que se ve debajo al elegirla, en vez de
  // salir de un `ahorroAnual` suelto en `PLANES` que no tiene por qué sumar
  // igual con estos puntos de suministro.
  function ahorroBaseDelPlan(plan: Plan) {
    return comercializadorasDelPlan(plan)
      .flatMap(suministrosDe)
      .reduce((total, s) => total + s.ahorro, 0);
  }

  const todosLosSuministros = COMERCIALIZADORAS_NUEVO_SUMINISTRO.flatMap(suministrosDe);

  // Qué comercializadora es cada punto, para saber si pertenece o no a una
  // oferta concreta (una oferta solo incluye SUS comercializadoras).
  const comercializadoraDelSuministro = new Map(
    COMERCIALIZADORAS_NUEVO_SUMINISTRO.flatMap((c) =>
      suministrosDe(c).map((s) => [s.id, c.nombre] as const),
    ),
  );

  // El descuento de mantenimiento de cada oferta es el suyo: depende de los
  // puntos de SUS propias comercializadoras (mismo criterio que
  // `PantallaAhorroEmpresas`) — si no, "Ahorro Aczo" y "Ahorro Confort"
  // enseñarían la misma cifra.
  function puntosConMantenimientoDelPlan(plan: Plan) {
    return todosLosSuministros.filter(
      (s) =>
        mantenimientoIds.has(s.id) &&
        plan.comercializadoras.includes(comercializadoraDelSuministro.get(s.id) ?? ""),
    ).length;
  }

  const planSeleccionado = OFERTAS_NUEVO_SUMINISTRO.find((p) => p.id === planId) ?? OFERTAS_NUEVO_SUMINISTRO[0];

  // El resumen, los interruptores de mantenimiento y las filas de
  // comercializadora de abajo reflejan SOLO las comercializadoras de la
  // oferta elegida (ver el aviso de arriba en `comercializadorasDelPlan`).
  const comercializadorasSeleccionadas = comercializadorasDelPlan(planSeleccionado);
  const suministrosSeleccionados = comercializadorasSeleccionadas.flatMap(suministrosDe);
  const idsLuz = suministrosSeleccionados.filter((s) => s.tipo === "Luz").map((s) => s.id);
  const idsGas = suministrosSeleccionados.filter((s) => s.tipo === "Gas").map((s) => s.id);

  // El gas llega con el mantenimiento ya incluido (mismo criterio que
  // `PantallaAhorroEmpresas`); la luz empieza apagada.
  const [mantenimientoIds, setMantenimientoIds] = useState<Set<string>>(
    () => new Set(todosLosSuministros.filter((s) => s.tipo === "Gas").map((s) => s.id)),
  );

  const ahorro = conMantenimientoMixto(
    ahorroBaseDelPlan(planSeleccionado),
    puntosConMantenimientoDelPlan(planSeleccionado),
  );

  function alCambiarMantenimientoEnBloque(ids: string[], activo: boolean) {
    setMantenimientoIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (activo ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  function alCambiarMantenimiento(id: string, activo: boolean) {
    setMantenimientoIds((prev) => {
      const next = new Set(prev);
      if (activo) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-08">
      <div className="anim-aparece flex flex-wrap items-center justify-between gap-04" style={retardo(0)}>
        <Text variant="heading-m" as="h2">
          Tu ahorro potencial
        </Text>
        <SelectorPeriodo mensual={mensual} onChange={setMensual} />
      </div>

      <div role="radiogroup" aria-label="Elige una oferta" className="grid gap-04 sm:grid-cols-2">
        {OFERTAS_NUEVO_SUMINISTRO.map((plan, i) => (
          <div key={plan.id} className="anim-aparece" style={retardo(i + 1)}>
            <TarjetaOfertaNuevoSuministro
              plan={plan}
              mensual={mensual}
              ahorroBase={ahorroBaseDelPlan(plan)}
              puntosConMantenimiento={puntosConMantenimientoDelPlan(plan)}
              seleccionada={plan.id === planId}
              onSeleccionar={() => setPlanId(plan.id)}
            />
          </div>
        ))}
      </div>

      <div key={planId} className="anim-aparece flex flex-col gap-06" style={retardo(3)}>
        <div className="flex flex-wrap items-center justify-between gap-04">
          <Text variant="label-m" color="mid" as="span">
            1 Sociedad · 1 activo ·{" "}
            {suministrosSeleccionados.length}{" "}
            {suministrosSeleccionados.length === 1 ? "punto" : "puntos"} de suministro
          </Text>

          <div className="flex flex-wrap items-center gap-04">
            <InterruptorMantenimientoNuevoSuministro
              etiqueta="Luz"
              icono="lightbulb"
              ids={idsLuz}
              mantenimientoIds={mantenimientoIds}
              onCambiarTodos={(activo) => alCambiarMantenimientoEnBloque(idsLuz, activo)}
            />
            <Text variant="label-m" color="mid" as="span">
              ·
            </Text>
            <InterruptorMantenimientoNuevoSuministro
              etiqueta="Gas"
              icono="fire"
              ids={idsGas}
              mantenimientoIds={mantenimientoIds}
              onCambiarTodos={(activo) => alCambiarMantenimientoEnBloque(idsGas, activo)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-04">
          {comercializadorasSeleccionadas.map((c) => (
            <FilaComercializadoraNuevoSuministro
              key={c.id}
              comercializadora={c}
              mensual={mensual}
              mantenimientoIds={mantenimientoIds}
              onCambiarMantenimiento={alCambiarMantenimiento}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-03">
        <Button
          iconEnd="chevron-right"
          onClick={() =>
            onContinuar({
              plan: planSeleccionado,
              totalPuntos: suministrosSeleccionados.length,
              puntosConMantenimiento: puntosConMantenimientoDelPlan(planSeleccionado),
              ahorroAnual: ahorro,
            })
          }
        >
          Completar tus datos
        </Button>
      </div>
    </div>
  );
}

function SelectorPeriodo({
  mensual,
  onChange,
}: {
  mensual: boolean;
  onChange: (mensual: boolean) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Periodo del ahorro"
      className="flex items-center gap-00 rounded-sm border border-border-low p-02"
    >
      {[
        { label: "Ver ahorro anual", activo: !mensual, valor: false },
        { label: "Ver ahorro mensual", activo: mensual, valor: true },
      ].map((seg) => (
        <button
          key={seg.label}
          type="button"
          role="tab"
          aria-selected={seg.activo}
          onClick={() => onChange(seg.valor)}
          className={[
            "cursor-pointer rounded-sm px-04 py-02 text-label-s whitespace-nowrap",
            "transition-colors motion-micro-states",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
            seg.activo ? "bg-background-high text-content-inverse" : "text-content-mid",
          ].join(" ")}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}

function TarjetaOfertaNuevoSuministro({
  plan,
  mensual,
  ahorroBase,
  puntosConMantenimiento,
  seleccionada,
  onSeleccionar,
}: {
  plan: Plan;
  mensual: boolean;
  /** Suma del ahorro de las comercializadoras de esta oferta — ver
   * `ahorroBaseDelPlan` en `PasoAhorro`, más arriba: la cifra de la tarjeta
   * tiene que cuadrar con lo que se ve debajo al elegirla. */
  ahorroBase: number;
  puntosConMantenimiento: number;
  seleccionada: boolean;
  onSeleccionar: () => void;
}) {
  const ahorro = conMantenimientoMixto(ahorroBase, puntosConMantenimiento);
  const cifra = mensual ? ahorro / 12 : ahorro;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionada}
      aria-label={`Elegir ${plan.nombre}`}
      onClick={onSeleccionar}
      className={[
        "flex h-full w-full flex-col justify-between gap-06 rounded-md p-07 text-left",
        "cursor-pointer outline-none transition-colors motion-micro-states",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
        seleccionada ? "bg-highlight-deep" : "bg-background-base hover:bg-background-mid",
      ].join(" ")}
    >
      <div className="flex flex-col gap-04">
        <Text
          variant="label-s-uppercase"
          color={seleccionada ? "always-light" : "low"}
          className={seleccionada ? "opacity-60" : ""}
          as="h3"
        >
          {plan.nombre === "Ahorro Aczo" ? "Ahorro Aczo" : "Ahorro Confort"}
        </Text>

        <p
          className={`font-heading text-heading-m ${
            seleccionada ? "text-content-always-light" : "text-content-high"
          }`}
        >
          {euros(cifra)} €/{mensual ? "mes" : "año"}
        </p>

        {plan.recomendado ? (
          <Tag tone="vivid" icon="zap" className="w-fit">
            Recomendado
          </Tag>
        ) : (
          <Text variant="label-m" color={seleccionada ? "always-light" : "high"} as="span">
            Máxima simplicidad en la gestión
          </Text>
        )}

        <Text
          variant="body-m"
          color={seleccionada ? "always-light" : "mid"}
          as="span"
        >
          {plan.ventajas[0]?.texto}
        </Text>
      </div>

      <div className="flex flex-col gap-03">
        <Text
          variant="body-s"
          color={seleccionada ? "always-light" : "mid"}
          as="span"
          className={seleccionada ? "opacity-60" : ""}
        >
          Comercializadoras seleccionadas:
        </Text>
        <div className="flex flex-wrap gap-02">
          {plan.comercializadoras.map((nombre) => (
            <HuecoLogo key={nombre} nombre={nombre} sobreOscuro={seleccionada} />
          ))}
        </div>
      </div>

      <span
        className={[
          "flex items-center justify-center rounded-md py-03 text-label-m",
          "transition-colors motion-micro-states",
          seleccionada
            ? "bg-background-state-disabled text-content-state-disabled"
            : "bg-background-high text-content-inverse",
        ].join(" ")}
      >
        {seleccionada ? "Oferta seleccionada" : "Seleccionar oferta"}
      </span>
    </button>
  );
}

function InterruptorMantenimientoNuevoSuministro({
  icono,
  etiqueta,
  ids,
  mantenimientoIds,
  onCambiarTodos,
}: {
  icono: "lightbulb" | "fire";
  etiqueta: string;
  ids: string[];
  mantenimientoIds: Set<string>;
  onCambiarTodos: (activo: boolean) => void;
}) {
  const total = ids.length;
  const activos = ids.filter((id) => mantenimientoIds.has(id)).length;

  return (
    <span className="flex items-center gap-03">
      <span className="flex items-center gap-[2px] text-content-mid">
        <Icon name="wrench" size={20} />
        <Icon name={icono} size={20} />
      </span>
      <Text variant="label-m" color="mid" as="span">
        Mantenimiento {etiqueta} ({activos}/{total})
      </Text>
      <Switch
        checked={total > 0 && activos === total}
        onChange={onCambiarTodos}
        label={`Añadir mantenimiento a todos los puntos de ${etiqueta}`}
      />
    </span>
  );
}

function FlechaPlegar({ abierto }: { abierto: boolean }) {
  return (
    <span
      className={[
        "flex size-07 shrink-0 items-center justify-center rounded-md",
        "transition-transform motion-micro-states",
        abierto ? "rotate-180" : "rotate-0",
      ].join(" ")}
    >
      <Icon name="chevron-down" />
    </span>
  );
}

function FilaComercializadoraNuevoSuministro({
  comercializadora,
  mensual,
  mantenimientoIds,
  onCambiarMantenimiento,
}: {
  comercializadora: Comercializadora;
  mensual: boolean;
  mantenimientoIds: Set<string>;
  onCambiarMantenimiento: (id: string, activo: boolean) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const todosSuministros = suministrosDe(comercializadora);
  const tiposPresentes = Array.from(new Set(todosSuministros.map((s) => s.tipo)));
  const ahorro = todosSuministros.reduce((total, s) => total + s.ahorro, 0);
  const cifra = mensual ? ahorro / 12 : ahorro;

  return (
    <article className="overflow-hidden rounded-md border border-border-low bg-background-base">
      <div className="flex flex-wrap items-center gap-04 p-04">
        {tieneLogoComercializadora(comercializadora.nombre) ? (
          <LogoComercializadora nombre={comercializadora.nombre} className="size-08" />
        ) : (
          <HuecoLogo nombre={comercializadora.nombre} />
        )}

        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-04">
          <Text variant="label-m" as="h3">
            {comercializadora.nombre}
          </Text>
          <span className="flex gap-02">
            {tiposPresentes.map((tipo) => (
              <Tag key={tipo} icon={tipo === "Luz" ? "lightbulb" : "fire"}>
                {tipo}
              </Tag>
            ))}
          </span>
          <Text variant="body-m" color="mid" as="span">
            {todosSuministros.length}{" "}
            {todosSuministros.length === 1 ? "punto" : "puntos"} de suministro
          </Text>
        </span>

        {/* Botón visual, como el resto del prototipo (ver "Ver desglose" en
            PantallaCambioCompaniaEmpresas.tsx): no abre nada, deja el gesto
            del Figma a la vista sin construir un panel de comparación nuevo
            solo para este asistente — ya existe uno completo en
            PanelCompararEmpresas.tsx para cuando haga falta cablearlo. */}
        <Button variant="secondary" size="small" iconEnd="compare">
          Comparar comercializadoras
        </Button>

        <span className="flex items-center gap-03">
          <span className="flex w-[150px] shrink-0 flex-col items-end">
            <Text variant="label-s" color="low" as="span">
              Ahorro potencial
            </Text>
            <span className="font-heading text-heading-s whitespace-nowrap text-content-high">
              {euros(cifra)} €/{mensual ? "mes" : "año"}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setAbierto((a) => !a)}
            aria-expanded={abierto}
            aria-label={`${abierto ? "Cerrar" : "Ver"} el detalle de ${comercializadora.nombre}`}
            className="cursor-pointer rounded-md bg-background-low text-content-mid outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
          >
            <FlechaPlegar abierto={abierto} />
          </button>
        </span>
      </div>

      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
        aria-hidden={!abierto}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col px-04 pb-04">
            {todosSuministros.map((s) => (
              <FilaPuntoSuministroNuevoSuministro
                key={s.id}
                suministro={s}
                activo={mantenimientoIds.has(s.id)}
                onCambiarMantenimiento={(activo) => onCambiarMantenimiento(s.id, activo)}
              />
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function FilaPuntoSuministroNuevoSuministro({
  suministro,
  activo,
  onCambiarMantenimiento,
}: {
  suministro: Suministro;
  activo: boolean;
  onCambiarMantenimiento: (activo: boolean) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <li className="border-b border-border-low last:border-b-00">
      <div className="flex items-center gap-03 py-04">
        <span className="flex min-w-0 flex-1 flex-col gap-02 md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center md:gap-04">
          <Text variant="label-m" as="span" className="truncate">
            {suministro.nombre}
          </Text>
          <span>
            <Tag icon={suministro.tipo === "Luz" ? "lightbulb" : "fire"}>
              {suministro.tipo}
            </Tag>
          </span>
          <span>
            <Tag tone="success">€{euros(suministro.ahorro)}/año</Tag>
          </span>
          <span className="flex items-center gap-02">
            <span className="text-content-mid">
              <Icon name="wrench" size={20} />
            </span>
            <Switch
              checked={activo}
              onChange={onCambiarMantenimiento}
              label={`Añadir mantenimiento en ${suministro.nombre}`}
            />
          </span>
        </span>

        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-label={`${abierto ? "Cerrar" : "Ver"} el detalle de ${suministro.nombre}`}
          className="shrink-0 cursor-pointer rounded-md text-content-mid outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
        >
          <FlechaPlegar abierto={abierto} />
        </button>
      </div>

      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
        aria-hidden={!abierto}
      >
        <div className="overflow-hidden">
          <DetalleTecnicoSuministro suministro={suministro} />
        </div>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 03 — Confirma tus datos                                              */
/* -------------------------------------------------------------------------- */

type FormaAutorizar = "tengo-poderes" | "que-firme-otro";

function PasoCambio({
  resumen,
  onContinuar,
}: {
  resumen: ResumenNuevoSuministro;
  onContinuar: () => void;
}) {
  const [enNombreDeOtro, setEnNombreDeOtro] = useState(false);
  const [razonSocial, setRazonSocial] = useState(SOCIEDAD_NUEVO_SUMINISTRO.nombre);
  const [cif, setCif] = useState(CIF_NUEVO_SUMINISTRO);
  const [titular, setTitular] = useState("");
  const [dni, setDni] = useState("");
  const [iban, setIban] = useState("");
  const [firmado, setFirmado] = useState(false);
  const [declaracionAceptada, setDeclaracionAceptada] = useState(false);
  const [formaAutorizar, setFormaAutorizar] = useState<FormaAutorizar>("tengo-poderes");
  const [poderArchivo, setPoderArchivo] = useState<string | null>(null);
  const poderInputRef = useRef<HTMLInputElement>(null);

  const datosCompletos =
    razonSocial.trim() !== "" && cif.trim() !== "" && titular.trim() !== "" &&
    dni.trim() !== "" && iban.trim() !== "";
  const autorizacionCompleta = enNombreDeOtro
    ? formaAutorizar === "tengo-poderes"
      ? poderArchivo !== null
      : true
    : firmado && declaracionAceptada;
  const todoCompleto = datosCompletos && autorizacionCompleta;
  const enviaSolicitudDeFirma = enNombreDeOtro && formaAutorizar === "que-firme-otro";

  return (
    <div className="flex flex-col gap-08">
      <div className="anim-aparece flex flex-col gap-03 rounded-md bg-info-low p-04 text-info-high" style={retardo(0)}>
        <div className="flex items-start gap-03">
          <Icon name="info" size={20} className="mt-[2px] shrink-0" />
          <div className="flex flex-col gap-01">
            <Text variant="label-m" as="span" className="text-info-high">
              La sociedad detectada ya existe en tu cartera
            </Text>
            <Text variant="body-m" as="span" className="text-info-high">
              Si necesitas modificar algún dato, puedes editarlos a
              continuación y se actualizarán automáticamente. Recuerda que si
              modificas el IBAN, se pasarán los cobros de todos los
              suministros a la cuenta corriente actualizada.
            </Text>
          </div>
        </div>
      </div>

      <div className="anim-aparece flex items-center gap-03" style={retardo(1)}>
        <Switch
          checked={enNombreDeOtro}
          onChange={setEnNombreDeOtro}
          label="Tramitas este proceso en nombre de otra persona"
        />
        <Text variant="body-m" as="span">
          ¿Tramitas este proceso en nombre de otra persona?
        </Text>
      </div>

      <div className="flex flex-col gap-06 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-06">
          <Bloque style={retardo(2)}>
            <CabeceraBloque
              titulo="Confirma tus datos"
              descripcion={`${SOCIEDAD_NUEVO_SUMINISTRO.nombre} · CIF ${CIF_NUEVO_SUMINISTRO}`}
            />

            <div className="grid w-full gap-04 sm:grid-cols-2">
              <Input
                label="Razón Social"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
              />
              <Input label="CIF" value={cif} onChange={(e) => setCif(e.target.value)} />
              <Input
                label="Nombre del titular"
                placeholder="Ej: Laura Rodríguez"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
              />
              <Input
                label="DNI"
                placeholder="Ej: 04950573P"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
            </div>
            <Input
              label="IBAN"
              placeholder="ES00 0000 0000 0000"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
          </Bloque>

          {!enNombreDeOtro ? (
            <Bloque style={retardo(3)}>
              <CabeceraBloque
                titulo="Firma de autorización"
                descripcion="Dibuja tu firma en el recuadro para validar la autorización de todas las sociedades."
              />
              <FirmaCanvas firmado={firmado} onCambiarFirmado={setFirmado} />
              <Checkbox checked={declaracionAceptada} onChange={setDeclaracionAceptada}>
                Declaro que ostento poderes suficientes para representar a{" "}
                {SOCIEDAD_NUEVO_SUMINISTRO.nombre}, y autorizo el cambio de
                comercializadora y la domiciliación en el IBAN facilitado.
              </Checkbox>
            </Bloque>
          ) : (
            <Bloque style={retardo(3)}>
              <Text variant="heading-s" as="h3">
                ¿Cómo quieres autorizar el cambio?
              </Text>

              <div className="grid w-full gap-04 sm:grid-cols-2">
                <div className="flex flex-col gap-04 rounded-md border border-border-low bg-background-low p-05">
                  <Radio
                    name="forma-autorizar-nuevo-suministro"
                    checked={formaAutorizar === "tengo-poderes"}
                    onChange={() => setFormaAutorizar("tengo-poderes")}
                    className="[&_label]:text-label-m"
                  >
                    Tengo los poderes
                  </Radio>
                  <Text variant="body-m" color="mid">
                    Sube uno o varios poderes de representación, los
                    emparejaremos automáticamente con la sociedad según el CIF
                    que detectemos en el documento.
                  </Text>
                </div>
                <div className="flex flex-col gap-04 rounded-md border border-border-low bg-background-low p-05">
                  <Radio
                    name="forma-autorizar-nuevo-suministro"
                    checked={formaAutorizar === "que-firme-otro"}
                    onChange={() => setFormaAutorizar("que-firme-otro")}
                    className="[&_label]:text-label-m"
                  >
                    No tengo el poder, enviar solicitud de firma a la persona
                    representante
                  </Radio>
                  <Text variant="body-m" color="mid">
                    Enviaremos un enlace de firma al administrador o
                    apoderado de la sociedad para que autorice el cambio
                    directamente.
                  </Text>
                </div>
              </div>

              {formaAutorizar === "tengo-poderes" ? (
                poderArchivo ? (
                  <div className="anim-aparece flex items-center gap-02 rounded-md border border-border-low bg-background-base p-04">
                    <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-soft text-content-high">
                      <Icon name="document" size={20} />
                    </span>
                    <Text variant="body-m" as="span" className="min-w-0 flex-1 truncate">
                      {poderArchivo}
                    </Text>
                    <Tag tone="success">Subido</Tag>
                    <button
                      type="button"
                      onClick={() => setPoderArchivo(null)}
                      aria-label="Quitar poder de representación"
                      className="flex shrink-0 items-center justify-center rounded-sm p-01 text-content-mid transition-opacity motion-micro-states hover:opacity-60"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => poderInputRef.current?.click()}
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-02 rounded-sm border border-dashed border-content-low bg-background-low p-05 transition-colors motion-micro-states outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high"
                  >
                    <Icon name="document" size={20} />
                    <Text variant="body-s" as="span" className="text-center">
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </Text>
                    <Text variant="body-s" color="low" as="span" className="text-center">
                      PDF, JPG, PNG — máx. 10 MB
                    </Text>
                    <input
                      ref={poderInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const archivo = e.target.files?.[0];
                        if (archivo) setPoderArchivo(archivo.name);
                      }}
                    />
                  </button>
                )
              ) : (
                <EnlaceFirmaNuevoSuministro />
              )}
            </Bloque>
          )}
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-04 lg:w-[320px]">
          <Bloque style={retardo(2)}>
            <Text variant="heading-s" as="h3">
              Resumen de tu cambio
            </Text>

            <div className="flex w-full flex-col gap-03">
              <Text variant="body-s" color="mid" as="span">
                Comercializadoras:
              </Text>
              <div className="flex flex-wrap gap-02">
                {resumen.plan.comercializadoras.map((nombre) => (
                  <HuecoLogo key={nombre} nombre={nombre} />
                ))}
              </div>
            </div>

            <dl className="flex w-full flex-col gap-02">
              <FilaResumen etiqueta="Sociedades incluidas">1</FilaResumen>
              <FilaResumen etiqueta="Puntos de suministro">
                {resumen.totalPuntos}
              </FilaResumen>
              <FilaResumen etiqueta="Mantenimiento incluido">
                {resumen.puntosConMantenimiento} puntos
              </FilaResumen>
            </dl>

            <div className="flex w-full flex-col gap-01 border-t border-border-low pt-04">
              <Text variant="body-s" color="mid" as="span">
                Ahorro estimado total
              </Text>
              <span className="font-heading text-heading-m text-content-high">
                +{euros(resumen.ahorroAnual)} €/año
              </span>
            </div>
          </Bloque>

          <div className="anim-aparece flex flex-col gap-01 rounded-md bg-warning-low p-04 text-warning-high" style={retardo(3)}>
            <div className="flex items-center gap-02">
              <Icon name="info" size={16} />
              <Text variant="label-m" as="span" className="text-warning-high">
                La oferta caduca en 40h
              </Text>
            </div>
            <Text variant="body-s" as="span" className="text-warning-high">
              Podemos mantener esta oferta solo 48h. Confirma el cambio
              dentro de este plazo para no perderla.
            </Text>
          </div>
        </aside>
      </div>

      <div className="flex items-center justify-end">
        <Button iconEnd="chevron-right" disabled={!todoCompleto} onClick={onContinuar}>
          {enviaSolicitudDeFirma ? "Confirmar solicitud" : "Confirmar cambio"}
        </Button>
      </div>
    </div>
  );
}

/** Enlace de firma con botón de copiar — mismo patrón que
 * `PantallaCambioCompaniaEmpresas.tsx` (duplicado aquí porque no está
 * exportado de allí, ver el comentario de esa pantalla). */
function EnlaceFirmaNuevoSuministro() {
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

/* -------------------------------------------------------------------------- */
/* Paso 04 — Solicitud enviada                                               */
/* -------------------------------------------------------------------------- */

/**
 * PasoEnviado — "Tu solicitud ha sido enviada". A diferencia de
 * `PantallaAltaEmpresas` (fondo oscuro, cruces de marca, pantalla completa),
 * este contenido se queda DENTRO de la tarjeta blanca del asistente: aquí
 * quien lo ve ya es cliente, así que no hace falta el "chispazo" de
 * bienvenida — solo la confirmación y el resumen de lo que se ha dado de
 * alta (ver la nota de cabecera del archivo).
 */
function PasoEnviado({ onIrACartera }: { onIrACartera: () => void }) {
  const todosLosSuministros = COMERCIALIZADORAS_NUEVO_SUMINISTRO.flatMap((c) =>
    suministrosDe(c).map((s) => ({ suministro: s, comercializadora: c.nombre })),
  );
  const enRevisionId = todosLosSuministros[0]?.suministro.id;
  const activos = todosLosSuministros.length - (enRevisionId ? 1 : 0);

  return (
    <div className="flex flex-col items-center gap-08">
      <div className="anim-aparece flex flex-col items-center gap-04 text-center" style={retardo(0)}>
        <span className="flex size-09 items-center justify-center rounded-md bg-success-low text-success-high">
          <Icon name="check-circle" size={24} />
        </span>
        <div className="flex flex-col gap-02">
          <Text variant="heading-m" as="h2">
            Tu solicitud ha sido enviada
          </Text>
          <Text variant="body-m" color="low">
            Tu solicitud está en revisión. Se estima que la activación se
            hará en un plazo de 1-3 semanas.
          </Text>
        </div>
      </div>

      <div className="anim-aparece flex w-full flex-col gap-01 rounded-md bg-warning-low p-04 text-warning-high" style={retardo(1)}>
        <div className="flex items-center gap-02">
          <Icon name="info" size={16} />
          <Text variant="label-m" as="span" className="text-warning-high">
            Confirma el código para empezar la tramitación
          </Text>
        </div>
        <Text variant="body-s" as="span" className="text-warning-high">
          En breve recibirás un mensaje de tu comercializadora para confirmar
          el cambio. Revísalo y confírmalo para que podamos continuar con la
          tramitación.
        </Text>
      </div>

      <div className="anim-aparece flex w-full flex-col rounded-md border border-border-low" style={retardo(2)}>
        <div className="flex flex-wrap items-center justify-between gap-03 border-b border-border-low p-04">
          <div className="flex items-center gap-02">
            <Text variant="label-m" as="span">
              {SOCIEDAD_NUEVO_SUMINISTRO.nombre}
            </Text>
            <Tag>CIF {CIF_NUEVO_SUMINISTRO}</Tag>
          </div>
          <Text variant="body-s" color="low" as="span">
            1 ubicación · {todosLosSuministros.length} puntos de suministro
          </Text>
          <div className="flex items-center gap-04">
            <PuntoEstado
              color="bg-success-high"
              rotulo="Activo"
              cantidad={activos}
              estirado={false}
            />
            <PuntoEstado
              color="bg-warning-high"
              rotulo="En revisión"
              cantidad={enRevisionId ? 1 : 0}
              estirado={false}
            />
          </div>
        </div>

        <div className="flex items-center gap-02 border-b border-border-low bg-background-low px-04 py-03">
          <Icon name="location" size={16} className="text-content-mid" />
          <Text variant="body-m" as="span">
            {DIRECCION_NUEVO_SUMINISTRO}
          </Text>
        </div>

        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-04 px-04 py-02 text-label-s text-content-mid md:grid">
          <span>Punto de suministro</span>
          <span>Tipo de suministro</span>
          <span>Comercializadora</span>
          <span>Mantenimiento</span>
          <span>Estado</span>
        </div>

        <ul>
          {todosLosSuministros.map(({ suministro: s, comercializadora }) => {
            const enRevision = s.id === enRevisionId;
            return (
              <li
                key={s.id}
                className="grid grid-cols-2 gap-02 border-t border-border-low px-04 py-03 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:items-center md:gap-04"
              >
                <Text variant="label-m" as="span" className="truncate">
                  {s.nombre}
                </Text>
                <span>
                  <Tag icon={s.tipo === "Luz" ? "lightbulb" : "fire"}>{s.tipo}</Tag>
                </span>
                <Text variant="body-m" color="mid" as="span">
                  {comercializadora}
                </Text>
                <span className="flex items-center gap-01 text-body-m text-content-mid">
                  <Icon name="wrench" size={16} />
                  {s.detalle.mantenimiento ? "Sí" : "No"}
                </span>
                <PuntoEstado
                  color={enRevision ? "bg-warning-high" : "bg-success-high"}
                  rotulo={enRevision ? "En revisión" : "Activo"}
                  estirado={false}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex w-full justify-end">
        <Button onClick={onIrACartera}>Ir a mi cartera</Button>
      </div>
    </div>
  );
}
