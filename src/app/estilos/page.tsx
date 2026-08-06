import { Text } from "@/components/ui/Text";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MotionDemo } from "./MotionDemo";

/**
 * Página de referencia de los tokens del sistema de diseño.
 *
 * Para qué sirve: abrir esto al lado del Figma y comprobar de un vistazo que
 * los colores, la tipografía, los espaciados y el motion del prototipo
 * coinciden con la librería. Si algo no cuadra, es un bug.
 */

export const metadata = { title: "Aczo · Estilos" };

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border-low py-09">
      <Text variant="title-l" className="mb-06">
        {title}
      </Text>
      {children}
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div>
      <div
        className={`h-10 w-full rounded-md border border-border-low ${className}`}
      />
      <Text variant="body-s" color="mid" className="mt-02 break-all">
        {name}
      </Text>
    </div>
  );
}

function SwatchGrid({
  label,
  swatches,
}: {
  label: string;
  swatches: { name: string; className: string }[];
}) {
  return (
    <div className="mb-07">
      <Text variant="label-m" color="mid" className="mb-03">
        {label}
      </Text>
      <div className="grid grid-cols-2 gap-04 sm:grid-cols-3 md:grid-cols-5">
        {swatches.map((s) => (
          <Swatch key={s.name} {...s} />
        ))}
      </div>
    </div>
  );
}

const spacing = [
  ["00", "0"],
  ["01", "4"],
  ["02", "8"],
  ["03", "12"],
  ["04", "16"],
  ["05", "20"],
  ["06", "24"],
  ["07", "32"],
  ["08", "40"],
  ["09", "48"],
  ["10", "64"],
];

const typeScale = [
  "heading-xl",
  "heading-l",
  "heading-m",
  "heading-s",
  "heading-xs",
  "title-xl",
  "title-l",
  "title-m",
  "title-s",
  "label-l",
  "label-m",
  "label-s",
  "label-s-uppercase",
  "body-l",
  "body-m",
  "body-s",
] as const;

export default function EstilosPage() {
  return (
    <main className="layout-section py-10">
      <header className="mb-09">
        <Text variant="heading-l">Estilos</Text>
        <Text variant="body-l" color="mid" className="mt-03">
          Los tokens del sistema de diseño de Aczo, tal y como están en el
          Figma. Abre esta página al lado de la librería para comprobar que todo
          coincide.
        </Text>
        <div className="mt-06 flex flex-wrap items-center gap-03">
          <Text variant="label-s" color="low" as="span">
            Modo de color
          </Text>
          <ThemeToggle />
        </div>
      </header>

      <Section title="Color">
        <div className="mb-07 rounded-md bg-background-low p-04">
          <Text variant="body-s" color="mid">
            Cambia el modo de color ahí arriba para ver los dos. Lo que{" "}
            <strong>sí cambia</strong>: contenido, fondos, bordes y los fondos
            suaves de feedback. Lo que <strong>no cambia</strong> (así está en el
            Figma, no es un olvido): la familia highlight, la paleta extended,
            los colores fuertes de feedback y los{" "}
            <code>content-always-light</code> / <code>always-dark</code>.
          </Text>
        </div>
        <SwatchGrid
          label="Contenido — texto e iconos"
          swatches={[
            { name: "content-high", className: "bg-content-high" },
            { name: "content-mid", className: "bg-content-mid" },
            { name: "content-low", className: "bg-content-low" },
            { name: "content-inverse", className: "bg-content-inverse" },
            {
              name: "content-state-disabled",
              className: "bg-content-state-disabled",
            },
          ]}
        />
        <SwatchGrid
          label="Fondos"
          swatches={[
            { name: "background-base", className: "bg-background-base" },
            { name: "background-low", className: "bg-background-low" },
            { name: "background-mid", className: "bg-background-mid" },
            { name: "background-high", className: "bg-background-high" },
            { name: "background-overlay", className: "bg-background-overlay" },
          ]}
        />
        <SwatchGrid
          label="Bordes"
          swatches={[
            { name: "border-low", className: "bg-border-low" },
            { name: "border-mid", className: "bg-border-mid" },
            { name: "border-high", className: "bg-border-high" },
          ]}
        />
        <SwatchGrid
          label="Highlight — el amarillo de marca y su familia"
          swatches={[
            { name: "highlight-vivid", className: "bg-highlight-vivid" },
            { name: "highlight-soft", className: "bg-highlight-soft" },
            { name: "highlight-muted", className: "bg-highlight-muted" },
            { name: "highlight-neutral", className: "bg-highlight-neutral" },
            { name: "highlight-deep", className: "bg-highlight-deep" },
          ]}
        />
        <SwatchGrid
          label="Feedback"
          swatches={[
            { name: "success-high", className: "bg-success-high" },
            { name: "success-low", className: "bg-success-low" },
            { name: "danger-high", className: "bg-danger-high" },
            { name: "danger-low", className: "bg-danger-low" },
            { name: "info-high", className: "bg-info-high" },
            { name: "info-low", className: "bg-info-low" },
            { name: "warning-high", className: "bg-warning-high" },
            { name: "warning-low", className: "bg-warning-low" },
          ]}
        />
        <SwatchGrid
          label="Extended — paleta ampliada (gráficas, categorías)"
          swatches={[
            { name: "extended-one-mid", className: "bg-extended-one-mid" },
            { name: "extended-two-mid", className: "bg-extended-two-mid" },
            { name: "extended-three-mid", className: "bg-extended-three-mid" },
            { name: "extended-four-mid", className: "bg-extended-four-mid" },
            { name: "extended-five-mid", className: "bg-extended-five-mid" },
            { name: "extended-one-light", className: "bg-extended-one-light" },
            { name: "extended-two-light", className: "bg-extended-two-light" },
            {
              name: "extended-three-light",
              className: "bg-extended-three-light",
            },
            { name: "extended-four-light", className: "bg-extended-four-light" },
            { name: "extended-five-light", className: "bg-extended-five-light" },
            { name: "extended-one-dark", className: "bg-extended-one-dark" },
            { name: "extended-two-dark", className: "bg-extended-two-dark" },
            { name: "extended-three-dark", className: "bg-extended-three-dark" },
            { name: "extended-four-dark", className: "bg-extended-four-dark" },
            { name: "extended-five-dark", className: "bg-extended-five-dark" },
          ]}
        />
      </Section>

      <Section title="Tipografía">
        <div className="flex flex-col gap-05">
          {typeScale.map((variant) => (
            <div key={variant}>
              <Text variant="body-s" color="low" as="p">
                {variant}
              </Text>
              <Text variant={variant} as="p">
                Aczo · Ag 123
              </Text>
            </div>
          ))}
        </div>
        <div className="mt-07 rounded-md bg-background-low p-04">
          <Text variant="body-s" color="mid">
            Los <strong>heading</strong> usan <strong>Bradford LL TT</strong>, la
            fuente de marca. Las demás familias (<strong>title</strong>,{" "}
            <strong>label</strong> y <strong>body</strong>) usan{" "}
            <strong>Inter</strong>.
          </Text>
        </div>
      </Section>

      <Section title="Layout — espaciado">
        <div className="flex flex-col gap-03">
          {spacing.map(([token, px]) => (
            <div key={token} className="flex items-center gap-04">
              {/* Anchos de columna a pelo: son el andamio de esta tabla de
                  documentación, no valores de diseño del Figma. */}
              <Text variant="body-s" color="mid" className="w-[110px] shrink-0">
                layout-size-{token}
              </Text>
              <Text variant="body-s" color="low" className="w-[48px] shrink-0">
                {px}px
              </Text>
              {/* Aquí el ancho ES el token: la barra mide lo que mide el token. */}
              <div
                className="h-04 bg-highlight-vivid"
                style={{ width: `${px}px` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-07 rounded-md bg-background-low p-04">
          <Text variant="body-s" color="mid">
            En clases se usan como <strong>p-04</strong>,{" "}
            <strong>gap-06</strong>, <strong>mt-02</strong>… La sección
            (<strong>layout-section</strong>) es 600px de ancho máximo con 16px
            de padding en móvil, y 1200px con 32px en desktop.
          </Text>
        </div>
      </Section>

      <Section title="Style — radios, bordes, opacidad y sombra">
        <Text variant="label-m" color="mid" className="mb-03">
          Radios
        </Text>
        <div className="mb-07 grid grid-cols-2 gap-04 sm:grid-cols-5">
          {[
            ["rounded-none", "0px"],
            ["rounded-sm", "4px"],
            ["rounded-md", "8px"],
            ["rounded-lg", "16px"],
            ["rounded-full", "999px"],
          ].map(([cls, px]) => (
            <div key={cls}>
              <div
                className={`h-09 w-full border-2 border-border-high ${cls}`}
              />
              <Text variant="body-s" color="mid" className="mt-02">
                {cls} · {px}
              </Text>
            </div>
          ))}
        </div>

        <Text variant="label-m" color="mid" className="mb-03">
          Grosor de borde
        </Text>
        <div className="mb-07 grid grid-cols-2 gap-04">
          {[
            ["border", "1px · border-width-m"],
            ["border-2", "2px · border-width-l"],
          ].map(([cls, label]) => (
            <div key={cls}>
              <div className={`h-09 w-full rounded-md border-border-high ${cls}`} />
              <Text variant="body-s" color="mid" className="mt-02">
                {label}
              </Text>
            </div>
          ))}
        </div>

        <Text variant="label-m" color="mid" className="mb-03">
          Opacidad de estado
        </Text>
        <div className="mb-07 grid grid-cols-3 gap-04">
          {[
            ["opacity-100", "100% · default"],
            ["opacity-60", "60% · hover"],
            ["opacity-30", "30% · pressed"],
          ].map(([cls, label]) => (
            <div key={cls}>
              <div className={`h-09 w-full rounded-md bg-content-high ${cls}`} />
              <Text variant="body-s" color="mid" className="mt-02">
                {label}
              </Text>
            </div>
          ))}
        </div>

        <Text variant="label-m" color="mid" className="mb-03">
          Sombra
        </Text>
        <div className="rounded-md bg-background-low p-07">
          <div className="h-09 w-full rounded-md bg-background-base shadow-md" />
          <Text variant="body-s" color="mid" className="mt-03">
            shadow-md · style-shadow-m
          </Text>
        </div>
      </Section>

      <Section title="Motion">
        <Text variant="body-m" color="mid" className="mb-06">
          Los tokens semánticos: cada uno lleva ya su duración y su curva. Pulsa
          para comparar cómo se sienten.
        </Text>
        <MotionDemo />
        <div className="mt-07 rounded-md bg-background-low p-04">
          <Text variant="body-s" color="mid">
            Si en los ajustes del sistema tienes activado{" "}
            <strong>reducir movimiento</strong>, las animaciones se desactivan
            solas en todo el prototipo. Es a propósito.
          </Text>
        </div>
      </Section>
    </main>
  );
}
