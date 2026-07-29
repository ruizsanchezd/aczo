"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { euros, PLANES, RESUMEN, SOCIEDADES } from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { HuecoLogo } from "./TarjetaPlan";

/**
 * PantallaFirma — pantalla 5: "Firma y apoderamiento".
 *
 * Tres bloques a la izquierda, resumen a la derecha y barra de acciones abajo.
 *
 * ANIMACIONES — aquí lo interesante son los estados que aparecen y desaparecen:
 *
 *   1. Contador "1/3 Completados": se actualiza en cuanto un IBAN queda
 *      rellenado. Es el único aviso de progreso del bloque, así que tiene que
 *      responder al instante (motion-micro-states).
 *
 *   2. Opción "Tengo los poderes" → aparece la zona para subir los documentos.
 *      Opción "No tengo el poder" → aparece el mini formulario de envío de
 *      enlace, y al enviarlo se sustituye por la confirmación.
 *      Los tres despliegan con la misma técnica de rejilla 0fr → 1fr de la tabla
 *      (motion-macro-levelup), así que abren sin saltos.
 *
 *   3. El aviso "Tienes contratos con permanencia" de la columna derecha entra
 *      con la cascada general. En el Figma está como capa oculta: es un caso que
 *      existe (hay 2 puntos con permanencia), así que aquí se enseña.
 *
 * La zona de subida de poderes y el mini formulario están en Figma solo como
 * wireframe: aquí llevan ya los tokens del sistema.
 */

type FormaAutorizar = "tengo-poderes" | "que-firme-otro";

export function PantallaFirma({
  onContinuar,
  onAtras,
}: {
  onContinuar: () => void;
  onAtras: () => void;
}) {
  const [enNombreDeOtro, setEnNombreDeOtro] = useState(true);
  const [ibanes, setIbanes] = useState<Record<string, string>>({});
  const [titulares, setTitulares] = useState<Record<string, string>>({});
  const [forma, setForma] = useState<FormaAutorizar>("tengo-poderes");

  const completados = SOCIEDADES.filter((s) => ibanes[s.id]?.trim()).length;
  const plan = PLANES[0];

  return (
    <div className="flex flex-col">
      <div className="layout-section flex flex-col gap-08 py-09">
        <div className="anim-aparece flex flex-col gap-03">
          <Text variant="heading-m">Firma y apoderamiento</Text>
          <Text variant="body-m" color="mid" className="max-w-[600px]">
            Para tramitar el cambio en nombre de las sociedades necesitamos al
            apoderado, su firma y el poder que lo acredite.
          </Text>
        </div>

        <div className="flex flex-col gap-06 lg:flex-row lg:items-start">
          {/* Columna izquierda ------------------------------------------- */}
          <div className="flex min-w-0 flex-1 flex-col gap-06">
            {/* Bloque 1: quién tramita */}
            <Bloque style={retardo(1)}>
              <CabeceraBloque
                titulo="Datos de quien tramita"
                descripcion="La persona que firma en representación (apoderado, administrador o gestoría autorizada)."
              />

              <div className="grid gap-04 sm:grid-cols-2">
                <Input label="Nombre y apellidos" placeholder="Tu nombre completo" />
                <Input
                  label="Email de contacto"
                  type="email"
                  placeholder="nombre@empresa.com"
                />
                <Input label="DNI/NIE" placeholder="Ej: 88329302P" />
                <Input label="Cargo" placeholder="Ej. Apoderado solidario" />
              </div>

              <div className="flex items-center gap-03">
                <Switch
                  checked={enNombreDeOtro}
                  onChange={setEnNombreDeOtro}
                  label="Tramitas este proceso en nombre de otra persona"
                />
                <Text variant="body-m" as="span">
                  ¿Tramitas este proceso en nombre de otra persona?
                </Text>
              </div>
            </Bloque>

            {/* Bloque 2: IBAN por sociedad */}
            <Bloque style={retardo(2)}>
              <div className="flex items-start justify-between gap-04">
                <CabeceraBloque
                  titulo="Necesitamos el IBAN para domiciliar los cobros"
                  descripcion="Ingresa tu IBAN para habilitar los pagos automáticos."
                />
                {/* El contador reacciona al instante al rellenar un IBAN. */}
                <Tag className="shrink-0 transition-colors motion-micro-states">
                  {completados}/{SOCIEDADES.length} Completados
                </Tag>
              </div>

              <div className="flex flex-col gap-04">
                {SOCIEDADES.map((sociedad) => (
                  <div
                    key={sociedad.id}
                    className="flex flex-col gap-04 rounded-md border border-border-low p-06"
                  >
                    <div className="flex flex-col">
                      <Text variant="label-l" as="h4">
                        {sociedad.nombre}
                      </Text>
                      <Text variant="body-m" color="mid">
                        CIF {sociedad.cif}
                      </Text>
                    </div>

                    <div className="grid gap-04 sm:grid-cols-2">
                      <Input
                        label="Nombre titular"
                        placeholder={sociedad.nombre}
                        value={titulares[sociedad.id] ?? ""}
                        onChange={(e) =>
                          setTitulares((prev) => ({
                            ...prev,
                            [sociedad.id]: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="IBAN"
                        placeholder="ES00 000 000 000 000"
                        value={ibanes[sociedad.id] ?? ""}
                        onChange={(e) =>
                          setIbanes((prev) => ({
                            ...prev,
                            [sociedad.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Bloque>

            {/* Bloque 3: cómo autorizar */}
            <Bloque style={retardo(3)}>
              <Text variant="title-s" as="h3">
                ¿Cómo quieres autorizar el cambio?
              </Text>

              <div className="grid gap-04 sm:grid-cols-2">
                <TarjetaOpcion
                  elegida={forma === "tengo-poderes"}
                  onElegir={() => setForma("tengo-poderes")}
                  titulo="Tengo los poderes"
                  descripcion="Sube uno o varios poderes de representación, los emparejaremos automáticamente con cada sociedad según el CIF que detectemos en el documento."
                >
                  <SubidaPoderes />
                </TarjetaOpcion>

                <TarjetaOpcion
                  elegida={forma === "que-firme-otro"}
                  onElegir={() => setForma("que-firme-otro")}
                  titulo="No tengo el poder, que firme la persona autorizada"
                  descripcion="Enviaremos un enlace de firma al administrador o apoderado de cada sociedad para que autorice el cambio directamente."
                >
                  <EnvioEnlaceFirma />
                </TarjetaOpcion>
              </div>
            </Bloque>
          </div>

          {/* Columna derecha --------------------------------------------- */}
          <aside className="flex w-full shrink-0 flex-col gap-04 lg:w-[360px]">
            <Bloque style={retardo(2)}>
              <Text variant="title-s" as="h3">
                Resumen de tu cambio
              </Text>

              <div className="flex flex-col gap-04 rounded-md bg-highlight-neutral p-04">
                {/* El bloque de detrás es highlight-neutral, que no cambia entre
                    modo claro y oscuro: la etiqueta usa el tono que tampoco
                    cambia. */}
                <Tag tone="always-light" className="self-start">
                  {plan.nombre}
                </Tag>
                <Text variant="body-m" color="always-dark">
                  Reparte tus puntos entre menos comercializadoras y llega a más
                  del 95% del ahorro máximo.
                </Text>
                <ul className="flex flex-col gap-02">
                  {plan.ventajas.map((v) => (
                    <li key={v.texto} className="flex items-start gap-02">
                      <span className="shrink-0 text-highlight-muted">
                        <Icon name="check-circle" />
                      </span>
                      <span className="flex flex-col">
                        <Text variant="body-m" color="always-dark" as="span">
                          {v.texto}
                        </Text>
                        {v.nota && (
                          <Text
                            variant="body-s"
                            color="always-dark"
                            as="span"
                            // Sobre la superficie crema, que no cambia de modo:
                            // el gris del sistema no serviría en modo oscuro.
                            className="opacity-60"
                          >
                            {v.nota}
                          </Text>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-03">
                <Text variant="body-s" color="mid" as="span">
                  Comercializadoras:
                </Text>
                <div className="flex flex-wrap gap-02">
                  {plan.comercializadoras.map((nombre) => (
                    <HuecoLogo key={nombre} nombre={nombre} />
                  ))}
                </div>
              </div>

              <dl className="flex flex-col gap-02">
                <FilaResumen etiqueta="Sociedades incluidas">
                  {RESUMEN.sociedades}
                </FilaResumen>
                <FilaResumen etiqueta="Puntos de suministro">
                  {RESUMEN.puntosSuministro}
                </FilaResumen>
                <FilaResumen etiqueta="Mantenimiento incluido">
                  {RESUMEN.puntosConMantenimiento} puntos
                </FilaResumen>
              </dl>

              <div className="flex items-end justify-between gap-04 border-t border-border-low pt-04">
                <div className="flex flex-col">
                  <Text variant="body-s" color="mid" as="span">
                    Ahorro estimado total
                  </Text>
                  <span className="font-heading text-heading-m text-content-high">
                    +{euros(plan.ahorroAnual)} €/año
                  </span>
                </div>
                <button
                  type="button"
                  className="cursor-pointer pb-01 text-body-s text-content-high underline transition-opacity motion-micro-states hover:opacity-60"
                >
                  Ver desglose
                </button>
              </div>
            </Bloque>

            {/* Aviso de permanencia. En el Figma es una capa oculta; el caso
                existe (hay 2 puntos con permanencia), así que se enseña. */}
            <div
              className="anim-aparece flex flex-col gap-03 rounded-lg border border-border-low bg-background-base p-05"
              style={retardo(4)}
            >
              <div className="flex items-start gap-03">
                <span className="flex size-07 shrink-0 items-center justify-center rounded-md bg-warning-low text-warning-high">
                  <Icon name="clock" />
                </span>
                <Text variant="label-l" as="h4">
                  Tienes contratos con permanencia
                </Text>
              </div>
              <Text variant="body-m" color="mid">
                {RESUMEN.puntosConPermanencia} puntos no se incluyen todavía por
                tener permanencia activa. Te avisaremos en cuanto expire para que
                puedas cambiarlos sin coste.
              </Text>
            </div>

            {/* Banda "Aczo garantiza": superficie oscura, y por eso el botón va
                en contorno claro (el caso que avisa el sistema de diseño). */}
            <div
              className="anim-aparece flex flex-col gap-04 rounded-lg bg-highlight-muted p-06"
              style={retardo(5)}
            >
              <div className="flex items-start gap-03">
                <span className="flex size-07 shrink-0 items-center justify-center rounded-md bg-highlight-deep text-highlight-vivid">
                  <Icon name="shield" />
                </span>
                <div className="flex flex-col">
                  <Text variant="label-l" color="always-light" as="h4">
                    Aczo garantiza
                  </Text>
                  <Text variant="body-m" color="always-light">
                    Firma digital segura · Sin coste oculto · Cancela cuando
                    quieras
                  </Text>
                </div>
              </div>
              <Button
                variant="tertiary"
                feedback="highlight"
                size="small"
                className="self-start underline"
              >
                Ver detalle completo
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* Barra inferior de acciones ------------------------------------- */}
      <div className="sticky bottom-00 z-10 border-t border-border-low bg-background-base">
        <div className="layout-section flex items-center justify-between py-04">
          <Button variant="secondary" iconStart="chevron-left" onClick={onAtras}>
            Atrás
          </Button>
          <Button onClick={onContinuar}>Activar cambio</Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Piezas de esta pantalla                                                    */
/* -------------------------------------------------------------------------- */

function Bloque({
  style,
  children,
}: {
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section
      className="anim-aparece flex flex-col gap-06 rounded-lg border border-border-low bg-background-base p-06"
      style={style}
    >
      {children}
    </section>
  );
}

function CabeceraBloque({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex flex-col gap-01">
      <Text variant="title-s" as="h3">
        {titulo}
      </Text>
      <Text variant="body-m" color="mid">
        {descripcion}
      </Text>
    </div>
  );
}

function FilaResumen({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-04">
      <dt className="text-body-m text-content-mid">{etiqueta}</dt>
      <dd className="text-body-m text-content-high tabular-nums">{children}</dd>
    </div>
  );
}

/** Tarjeta de opción única, con contenido que se despliega al elegirla. */
function TarjetaOpcion({
  elegida,
  onElegir,
  titulo,
  descripcion,
  children,
}: {
  elegida: boolean;
  onElegir: () => void;
  titulo: string;
  descripcion: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "flex flex-col gap-03 rounded-md border p-05",
        "transition-colors motion-micro-states",
        elegida
          ? "border-highlight-muted bg-background-base"
          : "border-border-low bg-background-base hover:border-border-mid",
      ].join(" ")}
    >
      <Radio
        name="forma-autorizar"
        checked={elegida}
        onChange={onElegir}
        className="[&_label]:text-label-m"
      >
        {titulo}
      </Radio>

      <Text variant="body-m" color="mid">
        {descripcion}
      </Text>

      {/* Misma técnica de despliegue que la tabla: 0fr → 1fr. */}
      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: elegida ? "1fr" : "0fr" }}
        aria-hidden={!elegida}
      >
        <div className="overflow-hidden">
          <div className="pt-02">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * SubidaPoderes — la zona para subir los poderes de representación.
 *
 * No estaba dibujada en el Figma: es la versión pequeña de la zona de arrastre
 * de la pantalla 1, con los mismos estados (reposo, arrastrando) y los mismos
 * tokens.
 */
function SubidaPoderes() {
  const [documentos, setDocumentos] = useState<string[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function anadir(archivos: FileList | null) {
    if (!archivos?.length) return;
    setDocumentos((prev) => [...prev, ...[...archivos].map((f) => f.name)]);
  }

  return (
    <div className="flex flex-col gap-02">
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
          "flex w-full cursor-pointer items-center justify-center gap-02 rounded-md border border-dashed p-05",
          "transition-colors motion-micro-states",
          "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
          arrastrando
            ? "border-highlight-muted bg-highlight-soft"
            : "border-border-mid hover:border-border-high",
        ].join(" ")}
      >
        <span className="text-highlight-muted">
          <Icon name="upload" size={20} />
        </span>
        <Text variant="body-m" color="mid" as="span">
          Arrastra los poderes o haz clic para subirlos
        </Text>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={(e) => anadir(e.target.files)}
        className="hidden"
      />

      {documentos.map((nombre, i) => (
        <span
          key={`${nombre}-${i}`}
          className="anim-aparece flex items-center gap-02 rounded-md bg-background-low p-02"
          style={retardo(i)}
        >
          <span className="text-content-mid">
            <Icon name="document" size={16} />
          </span>
          <Text variant="body-s" as="span" className="min-w-0 truncate">
            {nombre}
          </Text>
          <Tag tone="success" className="ml-auto">
            CIF detectado
          </Tag>
        </span>
      ))}
    </div>
  );
}

/**
 * EnvioEnlaceFirma — el mini formulario y su confirmación.
 *
 * Los dos estaban como capas ocultas en el Figma. Al enviar, el formulario se
 * sustituye por la confirmación: no conviven, porque la pregunta ya está
 * respondida.
 */
function EnvioEnlaceFirma() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [enviadoA, setEnviadoA] = useState<string | null>(null);

  if (enviadoA) {
    return (
      <div className="anim-aparece flex flex-col gap-02 rounded-md bg-success-low p-04">
        <Text variant="body-m" color="high">
          Hemos enviado un enlace a <strong>{enviadoA}</strong> para que autorice
          el cambio directamente. Puedes seguir con el resto del proceso mientras
          tanto — te avisaremos en cuanto firme.
        </Text>
        <button
          type="button"
          onClick={() => setEnviadoA(null)}
          className="cursor-pointer self-start text-body-s text-content-high underline transition-opacity motion-micro-states hover:opacity-60"
        >
          Reenviar enlace
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-03">
      <Input
        label="Nombre de quien debe firmar"
        placeholder="Ej: María López García"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <Input
        label="Email de quien debe firmar"
        type="email"
        placeholder="Ej: maria@empresa.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        size="small"
        iconEnd="arrow-right"
        disabled={!email.trim()}
        onClick={() => setEnviadoA(email.trim())}
        className="self-start"
      >
        Enviar enlace de firma
      </Button>
    </div>
  );
}
