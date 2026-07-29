"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Text } from "@/components/ui/Text";
import { euros, OFERTAS, type Oferta } from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";

/**
 * ModalComparar — la ventana "Te mostramos lo que ofrecen otras compañías".
 *
 * Se abre desde el botón "Comparar" de cada comercializadora.
 *
 * ANIMACIONES:
 *   - El velo aparece con anim-aparece-simple (350 ms) y la ventana crece desde
 *     el 96% con anim-escala-entrada. Crecer poco es clave: si creciera desde el
 *     80% parecería un aviso de error.
 *   - Las cuatro tarjetas entran en cascada de 60 en 60 ms, así se recorren con
 *     la vista de izquierda a derecha en el orden en que hay que leerlas.
 *   - Al cerrar, el velo y la ventana se van con motion-micro-leave (250 ms):
 *     salir siempre es más rápido que entrar.
 *
 * Se cierra con la X, con Escape y pulsando fuera.
 *
 * OJO, DETALLE IMPORTANTE PARA PRODUCCIÓN: la ventana se pinta con un portal,
 * colgada directamente del <body>. Si se deja dentro del contenedor de la
 * pantalla, la animación de entrada de esa pantalla (que usa transform) crea un
 * nuevo contexto de posicionamiento y el "position: fixed" de la ventana deja de
 * referirse a la pantalla del navegador: la modal aparece descolocada y no se
 * centra. Es un fallo fácil de cometer y difícil de diagnosticar.
 */
export function ModalComparar({
  abierto,
  nombreComercializadora,
  onCerrar,
}: {
  abierto: boolean;
  /** Solo para el texto de ayuda; las ofertas son las mismas en el prototipo. */
  nombreComercializadora?: string;
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

  function iniciarCierre() {
    setCerrando(true);
    // Se espera a que termine la animación de salida antes de desmontar.
    setTimeout(() => {
      setCerrando(false);
      onCerrar();
    }, 250);
  }

  if (!abierto || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comparación de ofertas de otras compañías"
      className="fixed inset-00 z-50 flex items-center justify-center overflow-y-auto p-04"
    >
      {/* Velo */}
      <button
        type="button"
        aria-label="Cerrar la comparación"
        onClick={iniciarCierre}
        className={`fixed inset-00 cursor-default bg-background-overlay ${
          cerrando
            ? "opacity-00 transition-opacity motion-micro-leave"
            : "anim-aparece-simple"
        }`}
      />

      {/* Ventana. my-auto la centra si cabe y deja que la página del velo haga
          scroll si no cabe. */}
      <div
        className={[
          "relative my-auto flex w-full max-w-[1200px] flex-col gap-08 rounded-lg bg-background-low p-08 shadow-md",
          cerrando
            ? "scale-95 opacity-00 transition-[transform,opacity] motion-micro-leave"
            : "anim-escala-entrada",
        ].join(" ")}
      >
        <Button
          variant="tertiary"
          iconOnly="close"
          aria-label="Cerrar"
          onClick={iniciarCierre}
          className="absolute top-06 right-06"
        />

        <header className="flex flex-col items-center gap-02 px-09 text-center">
          <Text variant="heading-m" as="h2">
            Te mostramos lo que ofrecen otras compañías
          </Text>
          {nombreComercializadora && (
            <Text variant="body-m" color="mid">
              Comparado con tu propuesta actual en {nombreComercializadora}
            </Text>
          )}
        </header>

        <div className="grid gap-04 sm:grid-cols-2 xl:grid-cols-4">
          {OFERTAS.map((oferta, i) => (
            <TarjetaOferta
              key={oferta.id}
              oferta={oferta}
              style={retardo(i + 1)}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function TarjetaOferta({
  oferta,
  style,
}: {
  oferta: Oferta;
  style?: React.CSSProperties;
}) {
  const [elegida, setElegida] = useState(oferta.actual);

  return (
    <article
      className="anim-aparece flex flex-col gap-05 rounded-lg bg-background-base p-06"
      style={style}
    >
      <header className="flex items-start justify-between gap-03 border-b border-border-low pb-05">
        <span className="flex min-w-0 flex-col">
          <Text variant="title-m" as="h3" className="truncate">
            {oferta.nombre}
          </Text>
          <Text variant="body-m" color="mid">
            {oferta.tarifa}
          </Text>
        </span>
        <Checkbox
          checked={elegida}
          onChange={setElegida}
          className="shrink-0"
        />
      </header>

      <div className="flex flex-col gap-01">
        <p className="font-heading text-heading-m text-content-high">
          {euros(oferta.precioAnual)} €/año
        </p>
        <Text variant="body-s" color="mid">
          ~{euros(oferta.precioAnual / 12)} €/mes aproximado
        </Text>
      </div>

      <div className="flex flex-col gap-01 rounded-md bg-success-low p-04">
        <Text variant="body-s" color="mid" as="span">
          Ahorro estimado:
        </Text>
        <span className="text-title-m text-success-high">
          +{euros(oferta.ahorroAnual)} €/año
        </span>
      </div>

      <Text variant="body-s" color="mid" className="flex-1">
        {oferta.condiciones}
      </Text>

      <Button fullWidth disabled={oferta.actual}>
        {oferta.actual ? "Seleccionada" : "Cambiar"}
      </Button>
    </article>
  );
}
