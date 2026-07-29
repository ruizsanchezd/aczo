"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import type { Plan } from "@/mocks/aczo";
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
 *   - La cifra cuenta al cambiar entre anual y mensual (ver NumeroAnimado).
 *   - El logo de cada comercializadora es un hueco reservado con el tamaño
 *     exacto del Figma (80 × 40). Cuando lleguen los archivos, se sustituye el
 *     contenido de ese hueco y no hay que tocar nada más.
 */
export function TarjetaPlan({
  plan,
  mensual,
  onElegir,
}: {
  plan: Plan;
  /** true = enseñar el ahorro por mes en vez de por año. */
  mensual: boolean;
  /** "Hacer switching": lleva al paso de firma. */
  onElegir: () => void;
}) {
  const destacada = plan.recomendado;
  const cifra = mensual ? plan.ahorroAnual / 12 : plan.ahorroAnual;

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
 * HuecoLogo — el sitio reservado para el logo de una comercializadora.
 *
 * Mide 80 × 40, como en el Figma. Mientras no haya archivos, enseña el nombre
 * para que se lea; cuando lleguen, se cambia por la imagen aquí y ya está.
 */
export function HuecoLogo({
  nombre,
  sobreOscuro = false,
}: {
  nombre: string;
  sobreOscuro?: boolean;
}) {
  return (
    <span
      title={nombre}
      className={[
        // 80 × 40: medida del hueco en el Figma. 40 es de la escala (h-08); 80
        // es el ancho de la caja del logo, y aquí funciona como mínimo para que
        // el nombre se lea entero mientras no haya archivos.
        "flex h-08 min-w-[80px] items-center justify-center rounded-md px-03",
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
