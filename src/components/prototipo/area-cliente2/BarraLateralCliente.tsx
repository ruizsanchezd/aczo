"use client";

import { Logo } from "@/components/brand/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

/**
 * BarraLateralCliente — la navegación del área de cliente.
 *
 * SUPERFICIE OSCURA, no modo oscuro: la barra es oscura SIEMPRE, también con
 * la interfaz en claro. Por eso va con `bg-highlight-deep` y los textos con
 * `content-always-light` en vez de `content-high` (ver CLAUDE.md).
 *
 * OJO con `<Text>`: por defecto pinta su propio `text-content-high` en el
 * mismo elemento, así que el color del botón que lo envuelve NO le llega por
 * herencia (un color puesto directamente en el elemento siempre gana al
 * heredado). Por eso el rótulo de cada sección NO usa `<Text>`: es un `<span>`
 * suelto con solo la utilidad tipográfica, para que el color le llegue del
 * `<button>` como toca. El lockup "Aczo" del logo también es un `<span>`
 * suelto en vez de `<Text>` (hereda `text-content-always-light` del `<span>`
 * que lo envuelve), porque su tamaño no coincide con ningún escalón de la
 * escala tipográfica — ver el comentario junto a él.
 *
 * En el Figma (nodo 788:9554) la barra es una tarjeta de 787 px de alto que
 * flota con 16 px de margen (`--ds/layout/size/04`) por arriba y por la
 * izquierda, con las esquinas redondeadas (`rounded-md`). No es una barra a
 * sangre que se estira con el alto de la pantalla: por eso va `fixed` — se
 * queda quieta en su sitio mientras el contenido de al lado hace scroll. El
 * `<main>` de `AreaCliente2` deja el hueco correspondiente (240 px de ancho +
 * 16 px de margen) con su propio `ml-[256px]`.
 *
 * ALTO: 787 px es el alto que mide en el Figma, pero es un tope, no un
 * mínimo — en una pantalla más baja (un portátil con poca altura, la ventana
 * del navegador reducida...) esos 787 px no caben y, al ser `fixed`, el
 * perfil y la campana del final se saldrían por debajo sin forma de llegar a
 * ellos. Por eso el alto real es `min(787px, 100vh - 32px)` (los 32 px son
 * los dos márgenes de 16 px, arriba y abajo) y la lista de secciones
 * (`<ul>`) lleva su propio scroll (`overflow-y-auto`) para el caso límite de
 * una pantalla tan baja que ni siquiera las secciones quepan enteras: así el
 * perfil y las notificaciones, que van fuera de esa lista, están SIEMPRE a
 * la vista, sea cual sea el alto de quien lo mira.
 *
 * INTERACCIÓN
 *   La sección donde estás se marca en amarillo de marca (highlight-vivid) —
 *   sin barrita a la izquierda ni nada más: en el Figma (nodo 788:9554) la
 *   única marca de la sección activa es el color del texto y el icono. El
 *   resto de secciones se aclaran al pasar por encima con la misma opacidad
 *   de hover que usan los botones del sistema (opacity-60), para que el gesto
 *   se sienta igual en toda la interfaz. Duración: motion-micro-states.
 */

type Seccion = { id: string; rotulo: string; icono: IconName };

const SECCIONES: Seccion[] = [
  { id: "dashboard", rotulo: "Dashboard", icono: "dashboard" },
  { id: "cartera", rotulo: "Mi cartera", icono: "wallet" },
  { id: "consumo", rotulo: "Consumo y ahorro", icono: "chart-line" },
  { id: "documentos", rotulo: "Documentos", icono: "folder" },
];

export function BarraLateralCliente({
  activa = "cartera",
  onNavegar,
  persona = "Ainhoa Martínez",
  onAbrirAvisos,
  avisosSinLeer = false,
}: {
  activa?: string;
  onNavegar?: (id: string) => void;
  persona?: string;
  /** Abre PanelAvisos ("Notificaciones y alertas"). */
  onAbrirAvisos?: () => void;
  /** Si hay alguna alerta o notificación sin leer en PanelAvisos: pinta el
   * puntito rojo sobre la campana, para que se note sin tener que abrirlo. */
  avisosSinLeer?: boolean;
}) {
  const inicial = persona.trim().charAt(0).toUpperCase();

  return (
    <nav
      aria-label="Secciones del área de cliente"
      className="fixed top-04 left-04 flex h-[min(787px,calc(100vh-2*var(--spacing-04)))] w-[240px] flex-col gap-10 rounded-md bg-highlight-deep px-04 py-06"
    >
      <span className="flex items-center gap-02 text-content-always-light">
        <Logo size={30.64} />
        {/* El lockup "Aczo" de esta barra es más grande que `heading-xs`
            (16px, el que usan las cabeceras normales) pero no llega a
            `heading-s`: en el Figma (nodo 878:9554) mide 26.934px con un
            interlineado de 0.9 y un tracking de -0.5387px, un tamaño propio
            del lockup de marca que no coincide con ningún escalón de la
            escala tipográfica. Por eso va a pelo, igual que el tamaño del
            icono de al lado (`Logo`), que tampoco es un token. */}
        <span className="font-heading text-[26.934px] leading-[0.9] tracking-[-0.5387px]">
          Aczo
        </span>
      </span>

      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <ul className="flex min-h-0 flex-col overflow-y-auto">
          {SECCIONES.map((seccion) => {
            const esActiva = seccion.id === activa;
            return (
              <li key={seccion.id}>
                <button
                  type="button"
                  aria-current={esActiva ? "page" : undefined}
                  onClick={() => onNavegar?.(seccion.id)}
                  className={`flex w-full cursor-pointer items-center gap-02 rounded-md py-03 transition-opacity motion-micro-states ${
                    esActiva
                      ? "text-highlight-vivid"
                      : "text-content-always-light hover:opacity-60"
                  }`}
                >
                  <Icon name={seccion.icono} />
                  {/* Un `<span>` suelto, no `<Text>`: así el color le llega
                      heredado del botón (amarillo si es la activa, blanco si
                      no) en vez de que `<Text>` lo pinte por su cuenta. */}
                  <span className="text-body-m">{seccion.rotulo}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between pr-03">
          <span className="flex items-center gap-03">
            <span className="flex size-07 items-center justify-center rounded-full bg-highlight-neutral">
              <Text
                variant="label-m"
                as="span"
                className="text-highlight-muted"
              >
                {inicial}
              </Text>
            </span>
            <Text variant="label-s" as="span" color="always-light">
              {persona}
            </Text>
          </span>
          <button
            type="button"
            aria-label={avisosSinLeer ? "Avisos (sin leer)" : "Avisos"}
            onClick={onAbrirAvisos}
            className="relative cursor-pointer text-content-always-light transition-opacity motion-micro-states hover:opacity-60"
          >
            <Icon name="bell" />
            {avisosSinLeer && (
              <span
                aria-hidden
                className="absolute top-00 right-00 size-02 rounded-full bg-danger-high"
              />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
