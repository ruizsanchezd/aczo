import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
import { Text } from "@/components/ui/Text";

/**
 * Landing — la página de entrada (captación). Es la primera pantalla que ve
 * alguien que todavía no es cliente, antes de entrar en /particulares o en
 * /empresas según qué tarjeta pulse.
 *
 * Sale del frame "Aczo / Landing / Desktop" del Figma máster. Los anchos y
 * paddings de cada sección (140px, 220px, 1000px...) son la maqueta de esa
 * página a 1440px, no forman parte de la escala de espaciado del sistema —
 * por eso van a pelo en vez de con los tokens `p-*`/`gap-*` habituales.
 */

const calculadoras = [
  {
    imagen: "/landing/calculadora-particular.png",
    titulo: "Calcula tu ahorro particular",
    descripcion:
      "Una vivienda, tus facturas de luz y gas. Un proceso rápido y sencillo, sin tecnicismos.",
    enlace: "/particulares",
  },
  {
    imagen: "/landing/calculadora-empresa.png",
    titulo: "Calcula el ahorro de tu empresa",
    descripcion:
      "De un local a una cartera de suministros. Ahorra de manera automática y eficiente.",
    enlace: "/empresas",
  },
];

const caracteristicas = [
  "Sin coste",
  "100% online",
  "Equipo humano + IA",
  "Ahorro automático",
];

// Logos de comparación (marquee decorativo, sin marca real detrás). Medidas
// originales del Figma, para que no se deformen.
const logosComparativa = [
  { imagen: "/landing/comparativa-1.png", width: 157, height: 39 },
  { imagen: "/landing/comparativa-2.png", width: 106, height: 60 },
  { imagen: "/landing/comparativa-3.png", width: 144, height: 61 },
  { imagen: "/landing/comparativa-4.png", width: 116, height: 61 },
  { imagen: "/landing/comparativa-5.png", width: 100, height: 37 },
  { imagen: "/landing/comparativa-6.png", width: 266, height: 38 },
];

const enlacesFooter = ["Privacy policy", "Cookie Preferences", "Terms and conditions"];

function LandingNavbar() {
  return (
    <header className="flex h-[80px] items-center justify-between bg-background-base px-06">
      <div className="flex items-center gap-03 text-content-high">
        <Logo />
        <span className="font-heading text-heading-xs">Aczo</span>
      </div>
      <div className="flex items-center gap-02">
        <Button variant="secondary" feedback="neutral">
          Ver demo
        </Button>
        <Button variant="primary" feedback="highlight">
          Iniciar sesión
        </Button>
      </div>
    </header>
  );
}

function LandingHero() {
  return (
    <section className="bg-background-base px-06 text-center">
      {/* Los huecos del Figma (179 / 40 / 163px, más un cierre de 100 antes
          de "Por qué Aczo") son relativos entre sí, no iguales — se reparten
          como flex-grow, no como márgenes fijos, para que se encojan juntos
          y en proporción en pantallas más bajas. Así se garantiza que, al
          cargar, siempre asome un 5% de la sección siguiente abajo del todo
          (como pista de que hay más contenido) — con márgenes fijos, en
          cuanto el contenido más los márgenes no cabían en el 95% de la
          pantalla, el hueco desaparecía entero en vez de solo encogerse
          (80px = alto del Navbar). */}
      <div className="mx-auto flex h-[calc(95vh-80px)] max-w-[1100px] flex-col items-center">
        <div aria-hidden style={{ flexGrow: 179 }} />
        <Text variant="heading-m" className="max-w-[1100px] shrink-0">
          Gestionamos tu energía de forma 100% gratuita y automática.
          <br />
          La plataforma que realmente puedes activar y olvidar.
        </Text>

        <div aria-hidden style={{ flexGrow: 40 }} />
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-04">
          {calculadoras.map((calculadora) => {
            const contenido = (
              <>
                <img
                  src={calculadora.imagen}
                  alt=""
                  width={64}
                  height={64}
                  className="size-10 shrink-0 rounded-sm object-cover"
                />
                <div className="flex flex-col gap-01">
                  <Text variant="heading-xs">{calculadora.titulo}</Text>
                  <Text variant="body-s" color="low">
                    {calculadora.descripcion}
                  </Text>
                </div>
              </>
            );

            // Solo las tarjetas con `enlace` se comportan (y se ven) como
            // pulsables — así, si algún día se añade una calculadora sin
            // flujo real todavía, basta con no darle `enlace`.
            return calculadora.enlace ? (
              <Link
                key={calculadora.titulo}
                href={calculadora.enlace}
                className="flex w-[370px] items-center gap-04 rounded-md bg-background-low p-04 text-left transition-colors motion-micro-states hover:bg-background-mid"
              >
                {contenido}
              </Link>
            ) : (
              <div
                key={calculadora.titulo}
                className="flex w-[370px] items-center gap-04 rounded-md bg-background-low p-04 text-left"
              >
                {contenido}
              </div>
            );
          })}
        </div>

        <div aria-hidden style={{ flexGrow: 163 }} />
        <div className="flex shrink-0 flex-wrap items-center justify-center border-t border-b border-border-mid opacity-60">
          {caracteristicas.map((caracteristica, index) => (
            <div
              key={caracteristica}
              className={`flex items-center gap-02 py-03 pl-03 pr-04 ${
                index > 0 ? "border-l border-border-mid" : ""
              }`}
            >
              <Icon name="check" size={18} className="text-content-high" />
              <Text variant="body-m" color="mid" as="span">
                {caracteristica}
              </Text>
            </div>
          ))}
        </div>
        <div aria-hidden style={{ flexGrow: 100 }} />
      </div>
    </section>
  );
}

// El cuadradito amarillo con el icono, encima de cada tarjeta destacada.
function InsigniaTarjeta({
  icono,
  className = "",
}: {
  icono: "zap" | "lightbulb";
  className?: string;
}) {
  return (
    <div
      className={`flex size-07 shrink-0 items-center justify-center rounded-md bg-highlight-neutral ${className}`}
    >
      <Icon name={icono} size={16} className="text-content-high" />
    </div>
  );
}

function LandingWhyAczo() {
  return (
    <section className="bg-background-base px-06">
      {/* highlight-deep es de la familia "siempre oscura" (como la tarjeta
          "Ahorro Aczo"): el texto va con los tokens always-*, no con los
          normales, o se volvería invisible el día que se active el oscuro. */}
      <div className="mx-auto flex max-w-[1392px] flex-col items-center gap-[64px] rounded-md bg-highlight-deep px-06 py-[80px] md:p-[140px]">
        <div className="flex max-w-[800px] flex-col items-center gap-04 text-center">
          <Text variant="label-s-uppercase" color="always-light" className="opacity-60">
            por qué Aczo
          </Text>
          <Text variant="heading-m" color="always-light">
            Cambiar de compañía es fácil. Que alguien te vigile después, no.
            Con Aczo delegas de verdad.
          </Text>
        </div>

        <div className="flex w-full max-w-[1112px] flex-wrap justify-center gap-04">
          {/* Tarjeta 1 — con la notificación de ahorro extra */}
          <div className="flex h-[552px] w-[441px] flex-col justify-between rounded-md bg-background-base p-07">
            <div className="flex flex-col gap-02">
              <Text variant="heading-m">Tu factura, vigilada</Text>
              <Text variant="body-m" color="mid">
                Analizamos el mercado cada día y detectamos el momento exacto
                para actuar. Tú no tienes que acordarte de nada.
              </Text>
            </div>
            <div className="flex flex-col gap-03 rounded-md border border-border-low bg-background-low p-06">
              <InsigniaTarjeta icono="zap" />
              <div className="flex flex-col gap-02">
                <Text variant="heading-s">
                  Hemos detectado una oportunidad de ahorro extra
                </Text>
                <Text variant="body-s" color="mid">
                  Podrías ahorrar <span className="text-success-high">4.590 €</span> extra
                  al año cambiando de comercializadora.
                </Text>
              </div>
            </div>
          </div>

          {/* Tarjeta 2 — foto, sin recuadro de fondo propio */}
          <div className="relative h-[552px] w-[441px] overflow-hidden rounded-md">
            <img
              src="/landing/tarjeta-negociacion.png"
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent"
            />
            <div className="relative flex flex-col gap-02 px-07 pt-07">
              <Text variant="heading-m" color="always-light">
                Más poder de negociación
              </Text>
              <Text variant="body-m" color="always-light" className="opacity-80">
                Agregamos demanda para conseguirte condiciones que, en
                solitario, no conseguirías nunca.
              </Text>
            </div>
          </div>

          {/* Tarjeta 3 — con la captura del móvil */}
          <div className="flex h-[552px] w-[441px] flex-col items-center justify-between overflow-hidden rounded-md bg-highlight-soft pt-07">
            <div className="flex w-full flex-col gap-02 px-07 text-left">
              <Text variant="heading-m">Sin letra pequeña</Text>
              <Text variant="body-m" color="mid">
                Ves cada alternativa, cada euro de ahorro y cada decisión que
                tomamos por ti. Nada oculto.
              </Text>
            </div>
            <img
              src="/landing/movil-ahorro.png"
              alt="Móvil mostrando el ahorro potencial en la app de Aczo"
              className="h-[403px] w-full object-cover"
            />
          </div>

          {/* Tarjeta 4 — con el comparador de contratos */}
          <div className="flex h-[552px] w-[441px] flex-col justify-between rounded-md bg-background-base p-07">
            <div className="flex flex-col gap-02">
              <Text variant="heading-m">Cero fricciones.</Text>
              <Text variant="body-m" color="mid">
                Sin formularios, sin llamadas, sin volver a comparar tarifas
                en tu vida.
              </Text>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border-low bg-background-low p-04">
              <div className="flex items-center gap-02">
                <InsigniaTarjeta icono="lightbulb" />
                <Text variant="heading-s">Cambiar compañía</Text>
              </div>
              {/* Interruptor decorativo: es la maqueta de un interruptor dentro
                  de la tarjeta, no un control real de la landing — por eso no
                  usa el componente Switch (que necesita estado y "use client"),
                  solo su mismo aspecto en encendido. */}
              <div className="flex h-06 w-08 shrink-0 items-center rounded-full bg-background-inverse p-[2px]">
                <div className="size-05 translate-x-04 rounded-full bg-content-inverse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingComparativa() {
  return (
    <section className="bg-background-base px-06 py-[80px] md:py-[140px]">
      <div className="mx-auto flex max-w-[1102px] flex-col items-center gap-06">
        <Text variant="body-l" color="low">
          Comparamos entre las principales compañías del mercado
        </Text>
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center justify-center gap-08 py-03">
            {logosComparativa.map((logo) => (
              <img
                key={logo.imagen}
                src={logo.imagen}
                alt=""
                width={logo.width}
                height={logo.height}
                className="opacity-40 grayscale"
              />
            ))}
          </div>
          {/* Desvanecido en los bordes: la fila de logos no se corta en seco. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-[160px] bg-gradient-to-r from-background-base to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-[160px] bg-gradient-to-l from-background-base to-transparent"
          />
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="bg-background-high px-06 py-[64px] text-content-always-light">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-08">
        <div className="flex flex-wrap items-start justify-between gap-06">
          <Text variant="heading-m" color="always-light">
            Ahorro energético
            <br />
            personalizado para ti
          </Text>

          <div className="flex flex-col items-end gap-02">
            <div className="flex items-center gap-03">
              <Logo />
              <span className="font-heading text-heading-l">Aczo</span>
            </div>
            <div className="flex items-center">
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex size-08 items-center justify-center rounded-full transition-opacity motion-micro-states hover:opacity-60"
              >
                <Icon name="linkedin" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex size-08 items-center justify-center rounded-full transition-opacity motion-micro-states hover:opacity-60"
              >
                <Icon name="instagram" />
              </a>
              <a
                href="#"
                aria-label="X (Twitter)"
                className="flex size-08 items-center justify-center rounded-full transition-opacity motion-micro-states hover:opacity-60"
              >
                <Icon name="twitter-x" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-04 opacity-50">
          <Text variant="body-m" color="always-light">
            © 2026 Aczo all rights reserved.
          </Text>
          <div className="flex gap-06">
            {enlacesFooter.map((enlace) => (
              <Text key={enlace} variant="body-m" color="always-light">
                {enlace}
              </Text>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <main>
      <LandingNavbar />
      <LandingHero />
      <LandingWhyAczo />
      <LandingComparativa />
      <LandingFooter />
    </main>
  );
}
