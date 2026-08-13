"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { conMantenimiento, TOTAL_PUNTOS, type Plan } from "@/mocks/aczo";
import { NumeroAnimado } from "./NumeroAnimado";

/**
 * TarjetaPlan — una de las tres tarjetas de la pantalla de recomendación.
 *
 * La recomendada ("Ahorro Aczo") va sobre superficie oscura: fondo
 * highlight-deep, checks en el amarillo de marca y botón de contorno claro. Es
 * el caso que el propio sistema de diseño avisa que solo puede usarse sobre
 * fondos oscuros, y es exactamente este.
 *
 * ANIMACIONES:
 *   - Al pasar por encima, la tarjeta se eleva 2 px y coge la sombra del sistema
 *     (shadow-md). Es sutil a propósito: son tres tarjetas de decisión, no deben
 *     competir entre ellas ni "saltar".
 *   - La cifra cuenta al cambiar entre anual y mensual, y también al activar el
 *     mantenimiento (ver NumeroAnimado).
 *   - El logo de cada comercializadora es un hueco reservado con el tamaño
 *     exacto del Figma (80 × 40). Cuando lleguen los archivos, se sustituye el
 *     contenido de ese hueco y no hay que tocar nada más.
 */
export function TarjetaPlan({
  plan,
  mensual,
  mantenimiento = false,
  onElegir,
}: {
  plan: Plan;
  /** true = enseñar el ahorro por mes en vez de por año. */
  mensual: boolean;
  /** true = el mantenimiento está contratado, así que su cuota resta ahorro. */
  mantenimiento?: boolean;
  /** "Hacer switching": lleva al paso de firma. */
  onElegir: () => void;
}) {
  const destacada = plan.recomendado;
  // El mantenimiento se cobra por punto de suministro, y los planes cubren
  // todos los puntos de la propuesta: la cuota es la misma en las tres
  // tarjetas, así que la comparación entre planes no cambia.
  const ahorro = conMantenimiento(plan.ahorroAnual, TOTAL_PUNTOS, mantenimiento);
  const cifra = mensual ? ahorro / 12 : ahorro;

  return (
    <article
      className={[
        // h-full para que las tres tarjetas midan lo mismo aunque una tenga más
        // texto que otra: si no, la destacada queda más baja y canta.
        "group flex h-full flex-col justify-between gap-07 rounded-lg p-07",
        "transition-[transform,box-shadow] motion-micro-states",
        "hover:-translate-y-[2px] hover:shadow-md",
        destacada
          ? "bg-highlight-deep"
          : "border border-border-low bg-background-base",
      ].join(" ")}
    >
      <div className="flex flex-col gap-07">
        <header className="flex items-start justify-between gap-03">
          <Text
            variant="title-l"
            color={destacada ? "always-light" : "high"}
            as="h3"
          >
            {plan.nombre}
          </Text>
          {destacada && <Tag tone="inverse">Recomendado</Tag>}
        </header>

        <p
          className={`font-heading text-heading-m ${
            destacada ? "text-content-always-light" : "text-content-high"
          }`}
        >
          <NumeroAnimado value={cifra} /> €/{mensual ? "mes" : "año"}
        </p>

        <ul className="flex flex-col gap-02">
          {plan.ventajas.map((v) => (
            <li key={v.texto} className="flex items-start gap-03">
              <span
                className={`shrink-0 ${
                  destacada ? "text-highlight-vivid" : "text-highlight-muted"
                }`}
              >
                <Icon name="check-circle" />
              </span>
              <span className="flex flex-col">
                <Text
                  variant="body-m"
                  color={destacada ? "always-light" : "high"}
                  as="span"
                >
                  {v.texto}
                </Text>
                {v.nota && (
                  <Text
                    variant="body-s"
                    color={destacada ? "always-light" : "low"}
                    as="span"
                    className={destacada ? "opacity-60" : ""}
                  >
                    {v.nota}
                  </Text>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-03">
          <Text
            variant="body-s"
            color={destacada ? "always-light" : "mid"}
            as="span"
            className={destacada ? "opacity-60" : ""}
          >
            Comercializadora recomendada:
          </Text>
          <div className="flex flex-wrap gap-02">
            {plan.comercializadoras.map((nombre) => (
              <HuecoLogo key={nombre} nombre={nombre} sobreOscuro={destacada} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <Button
          variant={destacada ? "secondary" : "primary"}
          feedback={destacada ? "highlight" : "neutral"}
          onClick={onElegir}
        >
          Hacer switching
        </Button>
      </div>
    </article>
  );
}

/**
 * Logos ya disponibles, exportados del Figma (ver LogoComercializadora). El
 * resto de comercializadoras sigue sin archivo: HuecoLogo enseña su nombre
 * mientras tanto.
 */
const LOGOS: Record<string, string> = {
  totalenergies: "/logos/totalenergies.png",
  repsol: "/logos/repsol.png",
};

/** true si ya hay un logo real para esta comercializadora (ver LOGOS arriba). */
export function tieneLogoComercializadora(nombre: string): boolean {
  return nombre.toLowerCase() in LOGOS;
}

/**
 * LogoComercializadora — la marca de una comercializadora en una caja blanca
 * con borde, del tamaño que le pida quien la usa (80 × 40 en las tarjetas de
 * plan, 40 × 40 en la fila de detalle de la pantalla de empresas). Blanca
 * siempre, también sobre la tarjeta oscura "Ahorro Aczo": así está en el
 * Figma, con independencia de la superficie de alrededor.
 */
export function LogoComercializadora({
  nombre,
  className = "",
}: {
  nombre: string;
  className?: string;
}) {
  const logo = LOGOS[nombre.toLowerCase()];
  if (!logo) return null;

  return (
    <span
      title={nombre}
      className={`flex shrink-0 items-center justify-center rounded-md border border-border-low bg-background-base p-02 ${className}`}
    >
      <img src={logo} alt={nombre} className="h-full w-full object-contain" />
    </span>
  );
}

/**
 * HuecoLogo — el sitio reservado para el logo de una comercializadora en las
 * tarjetas de plan. Mide 80 × 40, como en el Figma. Si ya hay un archivo real
 * (ver LOGOS arriba) se enseña ese; si no, se enseña el nombre mientras llega.
 */
export function HuecoLogo({
  nombre,
  sobreOscuro = false,
}: {
  nombre: string;
  sobreOscuro?: boolean;
}) {
  if (LOGOS[nombre.toLowerCase()]) {
    return <LogoComercializadora nombre={nombre} className="h-08 w-[80px]" />;
  }

  return (
    <span
      title={nombre}
      className={[
        // 80 × 40: medida del hueco en el Figma. 40 es de la escala (h-08); 80
        // es el ancho de la caja del logo, y aquí funciona como mínimo para que
        // el nombre se lea entero mientras no haya archivos. `self-start`
        // evita que se estire a lo ancho cuando el hueco es el único hijo de
        // un contenedor en columna (ese contenedor, por defecto, estira a
        // todos sus hijos) — así abraza su contenido en vez de rellenar.
        "flex h-08 min-w-[80px] shrink-0 items-center justify-center self-start rounded-md px-03",
        "text-label-s",
        sobreOscuro
          ? "bg-highlight-neutral text-content-always-dark"
          : "bg-background-mid text-content-mid",
      ].join(" ")}
    >
      {nombre}
    </span>
  );
}
