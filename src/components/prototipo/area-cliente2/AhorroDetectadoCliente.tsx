"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { PuntoEstado } from "@/components/ui/PuntoEstado";
import { Radio } from "@/components/ui/Radio";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  COMERCIALIZADORAS_AHORRO_DETECTADO,
  euros,
  OFERTAS_AHORRO_DETECTADO,
  SOCIEDADES_AHORRO_DETECTADO,
  suministrosDe,
  type Plan,
  type SociedadAhorroDetectado,
} from "@/mocks/aczo";
import { animarScroll, motionSafe, posicionEnDocumento, retardo } from "@/lib/prototipo";
import { motion } from "@/lib/motion";
import { Bloque, CabeceraBloque, FilaResumen, FirmaCanvas } from "../PiezasCambioCompania";
import { HuecoLogo } from "../TarjetaPlan";
import {
  FilaComercializadoraAhorro,
  FlechaPlegar,
  InterruptorMantenimientoAhorro,
  SelectorPeriodoAhorro,
  TarjetaOfertaAhorro,
} from "./PiezasAreaCliente";

/**
 * AhorroDetectadoCliente — el asistente "Ahorro detectado" del área de
 * cliente (/area-cliente2). Se abre al pulsar "Ver ahorro" en
 * `BannerAhorroExtra` (el banner "Hemos detectado una oportunidad de ahorro
 * extra" de Dashboard, Mi cartera y Consumo y ahorro), y vive DENTRO de
 * `<main>` como otra sección más del `seccion` state de AreaCliente2.tsx —
 * igual que `NuevoSuministroCliente`, no es un modal ni una ruta aparte.
 *
 * Del Figma (fileKey hrMu2uv5cg2Bznl43Jukrr, sección "Ahorro detectado",
 * nodeId 797:43287): un asistente de 3 pasos ("Ahorro detectado" → "Confirma
 * tus datos" → "Solicitud enviada"), con el MISMO patrón visual que el paso
 * "Ahorro y recomendación" de `NuevoSuministroCliente.tsx` (de ahí que las
 * piezas de la tarjeta de oferta y el desglose por comercializadora se
 * compartan desde `PiezasAreaCliente.tsx` en vez de duplicarse), pero con
 * estas diferencias:
 *
 *   - SIN paso de subir/revisar facturas: aquí el ahorro ya se ha detectado
 *     solo (es la promesa del propio banner que abre el asistente), así que
 *     se entra directamente comparando ofertas.
 *   - SIN el stepper "01/02/03/04" que sí lleva "Nuevo suministro": el Figma
 *     de esta pantalla concreta no lo dibuja, solo la flecha atrás + el
 *     título "Ahorro detectado".
 *   - "Confirma tus datos" no es un único formulario de una sociedad: aquí
 *     hay VARIAS sociedades a la vez (`SOCIEDADES_AHORRO_DETECTADO`), en una
 *     lista plegable — cada fila se despliega en su propio formulario
 *     (razón social/CIF/titular/DNI/IBAN), con una única firma que autoriza
 *     a todas a la vez (el texto "autorización de todas las sociedades" del
 *     bloque de firma, heredado de `NuevoSuministroCliente`, ya encajaba con
 *     esto sin cambios).
 *   - SIN pantalla de "Solicitud enviada" propia en el Figma de este flujo:
 *     se reutiliza el mismo patrón visual que `PasoEnviado` de
 *     `NuevoSuministroCliente.tsx` (el check verde, el aviso de "Confirma el
 *     código..." y la tabla resumen), pero la tabla agrupa los puntos de
 *     suministro POR SOCIEDAD en vez de asumir una sola.
 *
 * SUSTITUCIÓN DE LAS SOCIEDADES DEL FIGMA: ese diseño usa "Mendesaltaren
 * S.L" y "Sstill S.L", dos sociedades de mentira que no existen en el resto
 * del prototipo (se parecen a propósito a las de verdad, pero no lo son).
 * Aquí se usan las DOS primeras sociedades reales de `SOCIEDADES_CARTERA`
 * (mendesaltaren SL, Still SL) vía `SOCIEDADES_AHORRO_DETECTADO` — mismo
 * criterio que `SOCIEDAD_NUEVO_SUMINISTRO`.
 *
 * NAVEGACIÓN: igual que `NuevoSuministroCliente` — la flecha de "atrás" del
 * primer paso vuelve a la sección desde la que se abrió (simplificado a
 * "volver siempre al Dashboard"); en el resto, retrocede un paso.
 */

type Vista = "ahorro" | "cambio" | "enviado";

/** A qué vista vuelve la flecha/el botón "Atrás" desde cada vista. El primer
 * paso no tiene vista anterior dentro del asistente: ahí manda `onVolver`. */
const VISTA_ANTERIOR: Partial<Record<Vista, Vista>> = {
  cambio: "ahorro",
};

export function AhorroDetectadoCliente({
  onVolver,
  onIrACartera,
}: {
  /** El paso "Ahorro detectado" no tiene vista anterior dentro del
   * asistente: vuelve a la sección desde la que se abrió. Se simplifica a
   * "volver siempre al Dashboard" (ver la nota de cabecera), igual que
   * `NuevoSuministroCliente`. */
  onVolver: () => void;
  /** El botón final "Ir a mi cartera" del paso "Solicitud enviada". */
  onIrACartera: () => void;
}) {
  const [vista, setVista] = useState<Vista>("ahorro");
  // Foto del plan elegido en "Ahorro detectado" al pulsar "Cambiar
  // compañía", para el resumen de "Confirma tus datos" — mismo patrón que
  // `ResumenNuevoSuministro`.
  const [resumen, setResumen] = useState<ResumenAhorroDetectado | null>(null);
  const contenidoRef = useRef<HTMLDivElement>(null);

  // Al entrar en este asistente (al pulsar "Ver ahorro" desde el banner) el
  // scroll no se queda arriba del todo: sube de golpe hasta el principio y
  // de ahí BAJA deslizándose hasta que "Hemos encontrado una mejora para ti"
  // queda justo a la altura de la barra lateral — mismo gesto que
  // `NuevoSuministroCliente` al entrar en "Ahorro y recomendación" (ver ahí
  // la explicación completa de por qué es un tween propio y no
  // `scrollIntoView({behavior:"smooth"})`). Aquí el paso "ahorro" es
  // también el primero del asistente, así que el mismo efecto cubre tanto
  // la entrada inicial como cualquier vuelta a él con "Atrás".
  useEffect(() => {
    if (vista === "ahorro") {
      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => {
        if (!contenidoRef.current) return;
        // -16: para que el borde de arriba del bloque quede a la misma
        // altura que el borde de arriba de la barra lateral (`top-04`).
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

  function ir(destino: Vista) {
    setVista(destino);
  }

  function alPulsarAtras() {
    const anterior = VISTA_ANTERIOR[vista];
    if (anterior) ir(anterior);
    else onVolver();
  }

  return (
    <div className="flex flex-col gap-06">
      <header className="flex flex-col gap-01">
        <button
          type="button"
          onClick={alPulsarAtras}
          aria-label="Volver"
          className="flex size-07 w-fit items-center justify-center rounded-md text-content-high outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
        >
          <Icon name="arrow-right-solid" className="rotate-180" />
        </button>
        <Text variant="heading-l" as="h1">
          Ahorro detectado
        </Text>
      </header>

      <div
        key={vista}
        ref={contenidoRef}
        className="anim-entra-adelante flex flex-col rounded-md bg-background-low p-06"
      >
        {vista === "ahorro" && (
          <PasoAhorroDetectado
            onContinuar={(r) => {
              setResumen(r);
              ir("cambio");
            }}
          />
        )}
        {vista === "cambio" && resumen && (
          <PasoConfirmaDatos resumen={resumen} onContinuar={() => ir("enviado")} />
        )}
        {vista === "enviado" && <PasoEnviadoAhorroDetectado onIrACartera={onIrACartera} />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 01 — Ahorro detectado                                                */
/* -------------------------------------------------------------------------- */

/** Lo que este paso le pasa a "Confirma tus datos" al pulsar "Cambiar
 * compañía": la foto del plan elegido en ese momento — mismo patrón que
 * `ResumenNuevoSuministro`, pero sobre las DOS sociedades de este flujo. */
export type ResumenAhorroDetectado = {
  plan: Plan;
  totalPuntos: number;
  puntosConMantenimiento: number;
  ahorroAnual: number;
};

function PasoAhorroDetectado({
  onContinuar,
}: {
  onContinuar: (resumen: ResumenAhorroDetectado) => void;
}) {
  const [mensual, setMensual] = useState(false);
  const [planId, setPlanId] = useState(
    () => OFERTAS_AHORRO_DETECTADO.find((p) => p.recomendado)?.id ?? OFERTAS_AHORRO_DETECTADO[0].id,
  );

  // Qué comercializadoras recomienda cada oferta — mismo criterio que
  // `PasoAhorro` de `NuevoSuministroCliente.tsx`: "Ahorro Confort" es solo
  // TotalEnergies, "Ahorro Aczo" es TotalEnergies + Repsol.
  function comercializadorasDelPlan(plan: Plan) {
    return COMERCIALIZADORAS_AHORRO_DETECTADO.filter((c) =>
      plan.comercializadoras.includes(c.nombre),
    );
  }

  // El ahorro de cada oferta ES la suma de sus comercializadoras (ver la
  // documentación de `COMERCIALIZADORAS_AHORRO_DETECTADO` en mocks/aczo.ts
  // para las cifras exactas): así la cifra grande de la tarjeta cuadra
  // siempre con lo que se ve al desplegarla.
  function ahorroBaseDelPlan(plan: Plan) {
    return comercializadorasDelPlan(plan)
      .flatMap(suministrosDe)
      .reduce((total, s) => total + s.ahorro, 0);
  }

  const todosLosSuministros = COMERCIALIZADORAS_AHORRO_DETECTADO.flatMap(suministrosDe);

  const comercializadoraDelSuministro = new Map(
    COMERCIALIZADORAS_AHORRO_DETECTADO.flatMap((c) =>
      suministrosDe(c).map((s) => [s.id, c.nombre] as const),
    ),
  );

  function puntosConMantenimientoDelPlan(plan: Plan) {
    return todosLosSuministros.filter(
      (s) =>
        mantenimientoIds.has(s.id) &&
        plan.comercializadoras.includes(comercializadoraDelSuministro.get(s.id) ?? ""),
    ).length;
  }

  const planSeleccionado =
    OFERTAS_AHORRO_DETECTADO.find((p) => p.id === planId) ?? OFERTAS_AHORRO_DETECTADO[0];

  const comercializadorasSeleccionadas = comercializadorasDelPlan(planSeleccionado);
  const suministrosSeleccionados = comercializadorasSeleccionadas.flatMap(suministrosDe);
  const idsLuz = suministrosSeleccionados.filter((s) => s.tipo === "Luz").map((s) => s.id);
  const idsGas = suministrosSeleccionados.filter((s) => s.tipo === "Gas").map((s) => s.id);

  // El gas llega con el mantenimiento ya incluido, la luz empieza apagada —
  // mismo criterio que `PasoAhorro` de `NuevoSuministroCliente.tsx`.
  const [mantenimientoIds, setMantenimientoIds] = useState<Set<string>>(
    () => new Set(todosLosSuministros.filter((s) => s.tipo === "Gas").map((s) => s.id)),
  );

  const ahorro = ahorroBaseDelPlan(planSeleccionado);

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
      {/* `items-end`: el selector "Ver ahorro anual/mensual" queda a la
          altura de la etiqueta "Oferta válida durante 48h" (la última línea
          de la columna de la izquierda), no centrado con todo el bloque de
          título+descripción+etiqueta. */}
      <div className="anim-aparece flex flex-wrap items-end justify-between gap-04" style={retardo(0)}>
        <div className="flex flex-col gap-04">
          <div className="flex flex-col gap-01">
            <Text variant="heading-m" as="h2">
              Hemos encontrado una mejora para ti
            </Text>
            <Text variant="body-m" color="low">
              En {todosLosSuministros.length} suministros de tus{" "}
              {SOCIEDADES_AHORRO_DETECTADO.length} sociedades hemos detectado
              una tarifa más económica que la actual.
            </Text>
          </div>
          <Tag tone="warning" icon="clock" className="w-fit">
            Oferta válida durante 48h
          </Tag>
        </div>

        <SelectorPeriodoAhorro mensual={mensual} onChange={setMensual} />
      </div>

      <div role="radiogroup" aria-label="Elige una oferta" className="grid gap-04 sm:grid-cols-2">
        {OFERTAS_AHORRO_DETECTADO.map((plan, i) => (
          <div key={plan.id} className="anim-aparece" style={retardo(i + 2)}>
            <TarjetaOfertaAhorro
              plan={plan}
              mensual={mensual}
              ahorroBase={ahorroBaseDelPlan(plan)}
              seleccionada={plan.id === planId}
              onSeleccionar={() => setPlanId(plan.id)}
            />
          </div>
        ))}
      </div>

      <div key={planId} className="anim-aparece flex flex-col gap-06" style={retardo(4)}>
        <div className="flex flex-wrap items-center justify-between gap-04">
          <Text variant="label-m" color="mid" as="span">
            {SOCIEDADES_AHORRO_DETECTADO.length} Sociedades ·{" "}
            {suministrosSeleccionados.length}{" "}
            {suministrosSeleccionados.length === 1 ? "punto" : "puntos"} de suministro
          </Text>

          <div className="flex flex-wrap items-center gap-04">
            <InterruptorMantenimientoAhorro
              etiqueta="Luz"
              icono="lightbulb"
              ids={idsLuz}
              mantenimientoIds={mantenimientoIds}
              onCambiarTodos={(activo) => alCambiarMantenimientoEnBloque(idsLuz, activo)}
            />
            <Text variant="label-m" color="mid" as="span">
              ·
            </Text>
            <InterruptorMantenimientoAhorro
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
            <FilaComercializadoraAhorro
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
          Cambiar compañía
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paso 02 — Confirma tus datos                                              */
/* -------------------------------------------------------------------------- */

type FormaAutorizar = "tengo-poderes" | "que-firme-otro";

/** Los datos editables de una sociedad dentro de la lista plegable —
 * inicializados desde `SOCIEDADES_AHORRO_DETECTADO`, uno por sociedad. */
type DatosSociedad = {
  razonSocial: string;
  cif: string;
  titular: string;
  dni: string;
  iban: string;
};

function datosIniciales(): Record<string, DatosSociedad> {
  return Object.fromEntries(
    SOCIEDADES_AHORRO_DETECTADO.map((s) => [
      s.sociedad.id,
      {
        razonSocial: s.sociedad.nombre,
        cif: s.cif,
        titular: s.titular,
        dni: s.dni,
        iban: s.iban,
      },
    ]),
  );
}

function PasoConfirmaDatos({
  resumen,
  onContinuar,
}: {
  resumen: ResumenAhorroDetectado;
  onContinuar: () => void;
}) {
  const [enNombreDeOtro, setEnNombreDeOtro] = useState(false);
  const [datos, setDatos] = useState<Record<string, DatosSociedad>>(datosIniciales);
  // La primera sociedad empieza desplegada (mismo criterio que un acordeón
  // que no se abre vacío): el resto se abren/pliegan sueltas, no es
  // exclusivo — comprobar los datos de las dos sociedades a la vez tiene
  // que ser posible sin ir cerrando una para ver la otra.
  const [desplegadas, setDesplegadas] = useState<Set<string>>(
    () => new Set([SOCIEDADES_AHORRO_DETECTADO[0].sociedad.id]),
  );
  const [firmado, setFirmado] = useState(false);
  const [declaracionAceptada, setDeclaracionAceptada] = useState(false);
  const [formaAutorizar, setFormaAutorizar] = useState<FormaAutorizar>("tengo-poderes");
  const [poderArchivo, setPoderArchivo] = useState<string | null>(null);

  function alternarDesplegada(id: string) {
    setDesplegadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function actualizarDato(id: string, campo: keyof DatosSociedad, valor: string) {
    setDatos((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
  }

  const datosCompletos = SOCIEDADES_AHORRO_DETECTADO.every((s) => {
    const d = datos[s.sociedad.id];
    return (
      d.razonSocial.trim() !== "" &&
      d.cif.trim() !== "" &&
      d.titular.trim() !== "" &&
      d.dni.trim() !== "" &&
      d.iban.trim() !== ""
    );
  });
  const autorizacionCompleta = enNombreDeOtro
    ? formaAutorizar === "tengo-poderes"
      ? poderArchivo !== null
      : true
    : firmado && declaracionAceptada;
  const todoCompleto = datosCompletos && autorizacionCompleta;
  const enviaSolicitudDeFirma = enNombreDeOtro && formaAutorizar === "que-firme-otro";

  const nombresSociedades = SOCIEDADES_AHORRO_DETECTADO.map((s) => s.sociedad.nombre).join(" y ");

  return (
    <div className="flex flex-col gap-08">
      <div className="anim-aparece" style={retardo(0)}>
        <Alert tone="info" icon="info">
          <div className="flex flex-col gap-01">
            <Text variant="label-m" as="span">
              {/* Plural: el Figma de este flujo (nodo 797:43905) lo dibuja en
                  singular ("La sociedad detectada..."), pero aquí SIEMPRE hay
                  dos sociedades a la vez (ver la nota de cabecera del
                  archivo), así que el aviso habla de las dos. */}
              Las sociedades detectadas ya existen en tu cartera
            </Text>
            <Text variant="body-m" color="mid" as="span">
              Si necesitas modificar algún dato, puedes editarlos a
              continuación y se actualizarán automáticamente. Recuerda que si
              modificas un IBAN, se pasarán los cobros de los suministros de
              esa sociedad a la cuenta corriente actualizada.
            </Text>
          </div>
        </Alert>
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
              descripcion={`${SOCIEDADES_AHORRO_DETECTADO.length} sociedades detectadas en esta oferta`}
            />

            <div className="flex w-full flex-col gap-03">
              {SOCIEDADES_AHORRO_DETECTADO.map((s) => (
                <FilaSociedadConfirmaDatos
                  key={s.sociedad.id}
                  sociedad={s}
                  datos={datos[s.sociedad.id]}
                  desplegada={desplegadas.has(s.sociedad.id)}
                  onAlternar={() => alternarDesplegada(s.sociedad.id)}
                  onCambiarDato={(campo, valor) =>
                    actualizarDato(s.sociedad.id, campo, valor)
                  }
                />
              ))}
            </div>
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
                {nombresSociedades}, y autorizo el cambio de comercializadora
                y la domiciliación en el IBAN facilitado de cada sociedad.
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
                    name="forma-autorizar-ahorro-detectado"
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
                    name="forma-autorizar-ahorro-detectado"
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
                  <SubidaPoder onSubir={setPoderArchivo} />
                )
              ) : (
                <EnlaceFirmaAhorroDetectado />
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
              <FilaResumen etiqueta="Sociedades incluidas">
                {SOCIEDADES_AHORRO_DETECTADO.length}
              </FilaResumen>
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

          <div className="anim-aparece" style={retardo(3)}>
            <Alert tone="warning" icon="info">
              <div className="flex flex-col gap-01">
                <Text variant="label-m" as="span">
                  La oferta caduca en 40h
                </Text>
                <Text variant="body-s" color="mid" as="span">
                  Podemos mantener esta oferta solo 48h. Confirma el cambio
                  dentro de este plazo para no perderla.
                </Text>
              </div>
            </Alert>
          </div>
        </aside>
      </div>

      <div className="flex items-center justify-end">
        <Button iconEnd="chevron-right" disabled={!todoCompleto} onClick={onContinuar}>
          {enviaSolicitudDeFirma ? "Confirmar solicitud" : "Cambiar compañía"}
        </Button>
      </div>
    </div>
  );
}

/** Una fila de la lista plegable de sociedades: icono de check verde,
 * nombre, flecha, y su propio formulario al desplegarla — mismos campos que
 * el bloque "Confirma tus datos" de `NuevoSuministroCliente.tsx`, uno por
 * sociedad en vez de uno para toda la pantalla. */
function FilaSociedadConfirmaDatos({
  sociedad,
  datos,
  desplegada,
  onAlternar,
  onCambiarDato,
}: {
  sociedad: SociedadAhorroDetectado;
  datos: DatosSociedad;
  desplegada: boolean;
  onAlternar: () => void;
  onCambiarDato: (campo: keyof DatosSociedad, valor: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border-low bg-background-low">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={desplegada}
        aria-label={`${desplegada ? "Cerrar" : "Ver"} los datos de ${sociedad.sociedad.nombre}`}
        className="flex w-full cursor-pointer items-center gap-03 p-04 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high"
      >
        <span className="flex shrink-0 items-center justify-center text-success-high">
          <Icon name="check-circle" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <Text variant="label-m" as="span" className="truncate">
            {sociedad.sociedad.nombre}
          </Text>
        </span>
        <span
          className={[
            "flex size-07 shrink-0 items-center justify-center rounded-md text-content-mid",
            "transition-transform motion-micro-states",
            desplegada ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          <Icon name="chevron-down" />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: desplegada ? "1fr" : "0fr" }}
        aria-hidden={!desplegada}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-04 border-t border-border-low bg-background-base p-04">
            <div className="grid w-full gap-04 sm:grid-cols-2">
              <Input
                label="Razón Social"
                value={datos.razonSocial}
                onChange={(e) => onCambiarDato("razonSocial", e.target.value)}
              />
              <Input
                label="CIF"
                value={datos.cif}
                onChange={(e) => onCambiarDato("cif", e.target.value)}
              />
              <Input
                label="Nombre del titular"
                placeholder="Ej: Laura Rodríguez"
                value={datos.titular}
                onChange={(e) => onCambiarDato("titular", e.target.value)}
              />
              <Input
                label="DNI"
                placeholder="Ej: 04950573P"
                value={datos.dni}
                onChange={(e) => onCambiarDato("dni", e.target.value)}
              />
            </div>
            <Input
              label="IBAN"
              placeholder="ES00 0000 0000 0000"
              value={datos.iban}
              onChange={(e) => onCambiarDato("iban", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Zona de subida del poder de representación — mismo patrón que
 * `NuevoSuministroCliente.tsx` (duplicado aquí porque no está exportado de
 * allí, igual que `EnlaceFirmaNuevoSuministro`/`EnlaceFirmaAhorroDetectado`
 * más abajo). */
function SubidaPoder({ onSubir }: { onSubir: (nombre: string) => void }) {
  return (
    <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-02 rounded-sm border border-dashed border-content-low bg-background-low p-05 transition-colors motion-micro-states outline-none focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-info-high">
      <Icon name="document" size={20} />
      <Text variant="body-s" as="span" className="text-center">
        Arrastra tu archivo aquí o haz clic para seleccionar
      </Text>
      <Text variant="body-s" color="low" as="span" className="text-center">
        PDF, JPG, PNG — máx. 10 MB
      </Text>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) onSubir(archivo.name);
        }}
      />
    </label>
  );
}

/** Enlace de firma con botón de copiar — mismo patrón que
 * `EnlaceFirmaNuevoSuministro` de `NuevoSuministroCliente.tsx`. */
function EnlaceFirmaAhorroDetectado() {
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
/* Paso 03 — Solicitud enviada                                               */
/* -------------------------------------------------------------------------- */

/** Un punto de suministro con la comercializadora y la sociedad a la que
 * pertenece — para poder agrupar la tabla del paso final por sociedad. */
type PuntoConSociedad = {
  suministro: ReturnType<typeof suministrosDe>[number];
  comercializadora: string;
  sociedadId: string;
};

function puntosConSociedad(): PuntoConSociedad[] {
  return COMERCIALIZADORAS_AHORRO_DETECTADO.flatMap((c) =>
    c.direcciones.flatMap((d) =>
      d.suministros.map((s) => ({
        suministro: s,
        comercializadora: c.nombre,
        sociedadId: d.sociedadId,
      })),
    ),
  );
}

/**
 * PasoEnviadoAhorroDetectado — "Tu solicitud ha sido enviada", igual que
 * `PasoEnviado` de `NuevoSuministroCliente.tsx` (el Figma de este flujo no
 * trae una pantalla propia, ver la nota de cabecera del archivo), pero con
 * una tabla resumen POR SOCIEDAD en vez de una sola: aquí siempre hay dos.
 */
function PasoEnviadoAhorroDetectado({ onIrACartera }: { onIrACartera: () => void }) {
  const todosLosPuntos = puntosConSociedad();
  // El primer punto de la primera sociedad se enseña "en revisión", el
  // resto activo — mismo gesto que `PasoEnviado`, para que la tabla no
  // enseñe todo en verde de golpe.
  const enRevisionId = todosLosPuntos[0]?.suministro.id;
  // Cada bloque de sociedad se puede plegar/desplegar (Figma nodo 882:14928:
  // la flecha junto a "Activo/En revisión" de cada sociedad) — empiezan
  // todas desplegadas, como en el Figma.
  const [desplegadas, setDesplegadas] = useState<Set<string>>(
    () => new Set(SOCIEDADES_AHORRO_DETECTADO.map((s) => s.sociedad.id)),
  );
  function alternarDesplegada(id: string) {
    setDesplegadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

      <div className="anim-aparece w-full" style={retardo(1)}>
        {/* tone="highlight" (verde pálido, bg-highlight-soft), no "warning"
            (naranja): así lo pinta el Figma (nodo 882:14928) — y las dos
            líneas van a tamaño body-m (14/20), no label-m/body-s: en el
            Figma miden igual, solo cambia el peso (la primera en negrita).
            `always-dark` porque highlight-soft es una superficie que no
            cambia entre modos (ver Alert.tsx y CLAUDE.md, "superficie
            oscura"). */}
        <Alert tone="highlight" icon="info">
          <div className="flex flex-col gap-01">
            <Text variant="body-m" color="always-dark" as="span" className="font-bold">
              Confirma el código que recibirás por SMS para empezar la
              tramitación
            </Text>
            <Text variant="body-m" color="always-dark" as="span">
              En breve recibirás un mensaje de tu comercializadora para
              confirmar el cambio. Revísalo y confírmalo para que podamos
              continuar con la tramitación.
            </Text>
          </div>
        </Alert>
      </div>

      <div className="flex w-full flex-col gap-04">
        {SOCIEDADES_AHORRO_DETECTADO.map((s, i) => {
          const puntos = todosLosPuntos.filter((p) => p.sociedadId === s.sociedad.id);
          const activos = puntos.filter((p) => p.suministro.id !== enRevisionId).length;
          const enRevision = puntos.some((p) => p.suministro.id === enRevisionId);
          const desplegada = desplegadas.has(s.sociedad.id);

          return (
            <div
              key={s.sociedad.id}
              className="anim-aparece flex w-full flex-col rounded-md border border-border-low"
              style={retardo(i + 2)}
            >
              <button
                type="button"
                onClick={() => alternarDesplegada(s.sociedad.id)}
                aria-expanded={desplegada}
                aria-label={`${desplegada ? "Cerrar" : "Ver"} los puntos de suministro de ${s.sociedad.nombre}`}
                className="flex w-full flex-wrap items-center justify-between gap-03 p-04 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high"
              >
                <div className="flex min-w-0 items-center gap-03">
                  <div className="flex shrink-0 items-center gap-02">
                    <Text variant="label-m" as="span">
                      {s.sociedad.nombre}
                    </Text>
                    <Tag>CIF {s.cif}</Tag>
                  </div>
                  <Text variant="body-s" color="low" as="span" className="shrink-0">
                    {puntos.length} puntos de suministro
                  </Text>
                </div>
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
                    cantidad={enRevision ? 1 : 0}
                    estirado={false}
                  />
                  <FlechaPlegar abierto={desplegada} />
                </div>
              </button>

              <div
                className="grid transition-[grid-template-rows] motion-macro-levelup"
                style={{ gridTemplateRows: desplegada ? "1fr" : "0fr" }}
                aria-hidden={!desplegada}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-02 border-t border-b border-border-low bg-background-low px-04 py-03">
                    <Icon name="location" size={16} className="text-content-mid" />
                    <Text variant="body-m" as="span">
                      {s.direccion}
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
                    {puntos.map(({ suministro: sm, comercializadora }) => {
                      const puntoEnRevision = sm.id === enRevisionId;
                      return (
                        <li
                          key={sm.id}
                          className="grid grid-cols-2 gap-02 border-t border-border-low px-04 py-03 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:items-center md:gap-04"
                        >
                          <Text variant="label-m" as="span" className="truncate">
                            {sm.nombre}
                          </Text>
                          <span>
                            <Tag icon={sm.tipo === "Luz" ? "lightbulb" : "fire"}>{sm.tipo}</Tag>
                          </span>
                          <Text variant="body-m" color="mid" as="span">
                            {comercializadora}
                          </Text>
                          <span className="flex items-center gap-01 text-body-m text-content-mid">
                            <Icon name="wrench" size={16} />
                            {sm.detalle.mantenimiento ? "Sí" : "No"}
                          </span>
                          <PuntoEstado
                            color={puntoEnRevision ? "bg-warning-high" : "bg-success-high"}
                            rotulo={puntoEnRevision ? "En revisión" : "Activo"}
                            estirado={false}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex w-full justify-end">
        <Button onClick={onIrACartera}>Ir a mi cartera</Button>
      </div>
    </div>
  );
}
