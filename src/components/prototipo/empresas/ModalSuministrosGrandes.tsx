"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { POTENCIA_MANTENIMIENTO_AUTO, type Suministro } from "@/mocks/aczo";

/**
 * La frase que explica el mantenimiento automático, compartida por el aviso del
 * icono (`AvisoMantenimientoLuz`, en PantallaAhorroEmpresas.tsx) y por este
 * diálogo. Vive aquí, en un solo sitio, porque es LA MISMA frase en los dos: si
 * cada uno tuviera su copia, al retocar el texto se quedaría una a medias.
 *
 * `puestos` cambia solo el verbo, que es la única diferencia entre las dos
 * versiones del Figma: cuando el mantenimiento está puesto se cuenta lo que se
 * ha hecho ("lo activamos"), y cuando está apagado se recomienda.
 */
export function fraseMantenimientoAutomatico(automaticos: number, puestos: boolean) {
  return `Hemos detectado que tienes ${automaticos} ${
    automaticos === 1 ? "suministro" : "suministros"
  } con más de ${POTENCIA_MANTENIMIENTO_AUTO} kW. Para estos casos, ${
    puestos
      ? "activamos automáticamente el mantenimiento"
      : "recomendamos activar el mantenimiento"
  } ya que en instalaciones de este tamaño una incidencia eléctrica tiene más impacto y cubrirla compensa.`;
}

/**
 * ModalSuministrosGrandes — el diálogo "Suministros con más de X kW"
 * (Figma node 5359:36396).
 *
 * Se abre al pulsar el contador subrayado del interruptor "Mantenimiento Luz"
 * — el `(2/11)` — y enseña CUÁLES son esos suministros grandes, con su
 * potencia y su propio interruptor, para poder decidir uno por uno en vez de
 * todos a la vez como en el aviso del icono.
 *
 * MISMO PATRÓN QUE ModalComparar.tsx, que es la otra ventana del prototipo, y
 * por los mismos motivos (ahí están explicados con más detalle):
 *   - Se pinta con un portal colgado del `<body>`. Si se dejara dentro de la
 *     pantalla, la animación de entrada de ésta (que usa `transform`) crearía
 *     un contexto de posicionamiento nuevo y el `position: fixed` de la ventana
 *     dejaría de referirse al navegador: saldría descolocada.
 *   - El velo entra con `anim-aparece-simple` y la ventana crece desde el 96%
 *     con `anim-escala-entrada`. Crecer poco es lo que la hace sentir un
 *     detalle y no un aviso de error.
 *   - Al cerrar, las dos se van con `motion-micro-leave` (250 ms): salir
 *     siempre es más rápido que entrar.
 *   - Se cierra con la X, con Escape y pulsando fuera.
 *
 * MEDIDAS DEL FIGMA: ancho máximo 600 px (`ds/component/dialog/max-width`),
 * padding 20 (`p-05`), 16 de hueco entre cabecera, contenido y pie.
 */
export function ModalSuministrosGrandes({
  abierto,
  suministros,
  mantenimientoIds,
  onCambiarMantenimiento,
  onDesactivarTodos,
  onCerrar,
}: {
  abierto: boolean;
  /** Los puntos de luz que superan el umbral de potencia. */
  suministros: Suministro[];
  mantenimientoIds: Set<string>;
  onCambiarMantenimiento: (id: string, activo: boolean) => void;
  /** "Desactivar mantenimiento": los apaga todos de golpe y cierra. */
  onDesactivarTodos: () => void;
  onCerrar: () => void;
}) {
  const [cerrando, setCerrando] = useState(false);

  // Cerrar con Escape, y no dejar que la página de detrás haga scroll.
  useEffect(() => {
    if (!abierto) return;

    function alPulsarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") iniciarCierre();
    }

    document.addEventListener("keydown", alPulsarTecla);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPulsarTecla);
      document.body.style.overflow = overflowAnterior;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  function iniciarCierre(despues?: () => void) {
    setCerrando(true);
    // Se espera a que termine la animación de salida antes de desmontar.
    setTimeout(() => {
      setCerrando(false);
      despues?.();
      onCerrar();
    }, 250);
  }

  if (!abierto || typeof document === "undefined") return null;

  const puestos = suministros.some((s) => mantenimientoIds.has(s.id));

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Suministros con más de ${POTENCIA_MANTENIMIENTO_AUTO} kW`}
      className="fixed inset-00 z-50 flex items-center justify-center overflow-y-auto p-04"
    >
      {/* Velo */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => iniciarCierre()}
        className={`fixed inset-00 cursor-default bg-background-overlay ${
          cerrando ? "opacity-00 transition-opacity motion-micro-leave" : "anim-aparece-simple"
        }`}
      />

      {/* Ventana. my-auto la centra si cabe y deja que la página del velo haga
          scroll si no cabe. */}
      <div
        className={[
          // 600 px es el ancho máximo del diálogo en el Figma
          // (`ds/component/dialog/max-width`), no un valor inventado.
          "relative my-auto flex w-full max-w-[600px] flex-col gap-04 rounded-lg bg-background-base p-05 shadow-md",
          cerrando
            ? "scale-95 opacity-00 transition-[transform,opacity] motion-micro-leave"
            : "anim-escala-entrada",
        ].join(" ")}
      >
        <header className="flex items-center justify-between gap-04">
          <Text variant="heading-m" as="h2">
            Suministros con más de {POTENCIA_MANTENIMIENTO_AUTO} kW
          </Text>
          {/* Mismo botón de cierre que los paneles laterales: el icono a pelo,
              sin caja. Un `Button iconOnly` del sistema mide 40 px y no cabe en
              una cabecera de 32. */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => iniciarCierre()}
            className="shrink-0 cursor-pointer rounded-sm p-01 text-content-high transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="flex flex-col gap-04">
          <Text variant="body-m">
            {fraseMantenimientoAutomatico(suministros.length, puestos)}
          </Text>

          <div className="flex flex-col gap-04 rounded-md bg-background-low p-04">
            <Text variant="label-s-uppercase">Suministros</Text>

            {/* Las filas van pegadas, separadas por una línea (no por hueco). */}
            <div className="flex flex-col divide-y divide-border-low">
              {suministros.map((s) => (
                <FilaSuministroGrande
                  key={s.id}
                  suministro={s}
                  activo={mantenimientoIds.has(s.id)}
                  onCambiar={(activo) => onCambiarMantenimiento(s.id, activo)}
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-02">
          <Button variant="secondary" onClick={() => iniciarCierre()}>
            Descartar
          </Button>
          {/* En este diálogo la acción destacada es desactivar: quien lo abre
              viene a revisar unos mantenimientos que no pidió. */}
          <Button
            feedback="highlight"
            disabled={!puestos}
            onClick={() => iniciarCierre(onDesactivarTodos)}
          >
            Desactivar mantenimiento
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Una fila del diálogo: el punto de suministro, dónde está, su potencia y su
 * interruptor de mantenimiento.
 *
 * El cuadrado verde de la izquierda no es decorativo: dice que ese punto está
 * dentro de la propuesta. El alto de 56 px es el de la fila en el Figma y no
 * cuadra con ningún paso de la escala de espaciado, así que va tal cual.
 */
function FilaSuministroGrande({
  suministro,
  activo,
  onCambiar,
}: {
  suministro: Suministro;
  activo: boolean;
  onCambiar: (activo: boolean) => void;
}) {
  return (
    <div className="flex min-h-[56px] flex-wrap items-center justify-between gap-04 px-02 py-02">
      <span className="flex items-center gap-03">
        {/* La casa dice "esto es un punto de suministro". 28 px es el tamaño
            del indicador en el Figma; no hay token para él. */}
        <span className="flex size-[28px] shrink-0 items-center justify-center rounded-md bg-info-low text-info-high">
          <Icon name="home" />
        </span>
        <span className="flex flex-wrap items-center gap-02">
          <Text variant="label-l" as="span">
            {suministro.nombre}
          </Text>
          <Text variant="label-l" as="span">
            {suministro.detalle.ciudad}
          </Text>
          <Text variant="label-m" color="low" as="span">
            {suministro.detalle.potencia.toLocaleString("es-ES")} kW
          </Text>
        </span>
      </span>

      <span className="flex items-center gap-02">
        <span className="text-content-mid">
          <Icon name="wrench" />
        </span>
        <Switch
          checked={activo}
          onChange={onCambiar}
          label={`Añadir mantenimiento en ${suministro.nombre}`}
        />
      </span>
    </div>
  );
}
