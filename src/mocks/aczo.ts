/**
 * DATOS DE MENTIRA — Aczo
 *
 * Todo lo que se ve en el prototipo sale de aquí. No hay backend, ni API, ni
 * base de datos: son datos inventados, pensados para que las pantallas se vean
 * realistas y variadas (direcciones distintas, consumos distintos, luz y gas,
 * sociedades con más y menos puntos).
 *
 * PARA EL EQUIPO DE DISEÑO: se puede cambiar cualquier cifra o texto de este
 * archivo sin miedo. Los totales NO están escritos a mano: se calculan sumando
 * los suministros (ver las funciones del final), así que siempre cuadran.
 */

/* -------------------------------------------------------------------------- */
/* Pasos del recorrido                                                        */
/* -------------------------------------------------------------------------- */

export const PASOS = [
  { numero: "01", nombre: "Sube tu factura" },
  { numero: "02", nombre: "Recomendación" },
  { numero: "03", nombre: "Switching" },
  { numero: "04", nombre: "Monitoreo constante" },
] as const;

/** Las tres líneas de la pantalla de carga. */
export const PASOS_ANALISIS = [
  "Leyendo tus facturas...",
  "Identificando tus puntos de suministro...",
  "Comparando proveedores",
] as const;

/** Los mensajes de la pantalla de carga del flujo de empresas (/empresas). */
export const PASOS_CARGA_EMPRESAS = [
  "Cargando tus facturas...",
  "Analizando los datos...",
  "Comparando comercializadoras...",
] as const;

/** Los pasos del flujo de empresas (/empresas). Rótulos propios del Figma de
 * ese flujo: no son los mismos que PASOS, aunque el orden se parezca. */
export const PASOS_EMPRESA = [
  { numero: "01", nombre: "Sube tu factura" },
  { numero: "02", nombre: "Ahorro y recomendación" },
  { numero: "03", nombre: "Confirma tus datos" },
  { numero: "04", nombre: "Seguimiento" },
] as const;

/** Los pasos del flujo de particulares (/particulares). Los mismos rótulos que
 * en empresas: los dos flujos recorren las mismas cuatro etapas. */
export const PASOS_PARTICULARES = [
  { numero: "01", nombre: "Sube tu factura" },
  { numero: "02", nombre: "Ahorro y recomendación" },
  { numero: "03", nombre: "Confirma tus datos" },
  { numero: "04", nombre: "Seguimiento" },
] as const;

/* -------------------------------------------------------------------------- */
/* Los tres planes de la pantalla de recomendación                            */
/* -------------------------------------------------------------------------- */

export type Plan = {
  id: string;
  nombre: string;
  /** Ahorro anual estimado, en euros. */
  ahorroAnual: number;
  /** El plan que Aczo recomienda: se pinta sobre fondo oscuro. */
  recomendado: boolean;
  ventajas: { texto: string; nota?: string }[];
  comercializadoras: string[];
};

export const PLANES: Plan[] = [
  {
    id: "aczo",
    nombre: "Ahorro Aczo",
    ahorroAnual: 4948,
    recomendado: true,
    ventajas: [
      { texto: "Una gestión más equilibrada" },
      { texto: "Reparte tus puntos entre menos comercializadoras" },
      {
        texto: "Más ahorro, mucha menos complejidad",
        nota: "+324 €/año vs. plus",
      },
    ],
    comercializadoras: ["TotalEnergies", "Repsol"],
  },
  {
    id: "maximo",
    nombre: "Ahorro máximo",
    ahorroAnual: 7405,
    recomendado: false,
    ventajas: [
      { texto: "Cada punto con su mejor comercializadora" },
      { texto: "Hasta 3 comercializadoras entre las que tú permitas" },
      { texto: "Máximo ahorro posible", nota: "-324 €/año vs. unificar" },
    ],
    comercializadoras: ["TotalEnergies", "Naturgy", "Octopus"],
  },
  {
    id: "confort",
    nombre: "Ahorro confort",
    ahorroAnual: 4948,
    recomendado: false,
    ventajas: [
      { texto: "Una sola factura y gestión" },
      { texto: "Una sola comercializadora para todo" },
      {
        texto: "Menos ahorro, más simplicidad de gestión",
        nota: "+324 €/año vs. plus",
      },
    ],
    comercializadoras: ["TotalEnergies"],
  },
];

/* -------------------------------------------------------------------------- */
/* Suministros, agrupados por dirección y por comercializadora                */
/* -------------------------------------------------------------------------- */

export type TipoSuministro = "Luz" | "Gas";

/** El detalle que se abre al desplegar una fila (el cuarto nivel). */
export type DetalleSuministro = {
  cups: string;
  consumoAnual: number;
  /** Potencia contratada nueva, en kW. */
  potencia: number;
  /** Reparto del consumo por franjas. Los tres porcentajes suman 100. */
  perfil: { punta: number; llano: number; valle: number };
  companiaActual: string;
  ciudad: string;
  mantenimiento: boolean;
  /** Permanencia con la compañía actual: hasta cuándo y cuánto costaría
   * salirse antes. `null` = sin permanencia — no todos los puntos la tienen. */
  permanencia: { hasta: string; penalizacion: { min: number; max: number } } | null;
};

/** Un CUPS de mentira con la pinta real (ES + dígitos + 2 letras), calculado a
 * partir del id del punto: así cada suministro tiene el suyo sin escribirlos
 * a mano ni arriesgarse a repetir uno. */
function cupsDe(id: string): string {
  const digitos = Array.from(id)
    .map((c) => c.codePointAt(0)! % 10)
    .join("")
    .padEnd(16, "0")
    .slice(0, 16);
  const letras = (id.toUpperCase().replace(/[^A-Z]/g, "") + "XX").slice(0, 2);
  return `ES0${digitos}${letras}`;
}

export type Suministro = {
  id: string;
  /** El nombre con el que la persona reconoce el punto. */
  nombre: string;
  tipo: TipoSuministro;
  tarifa: string;
  costeActual: number;
  ahorro: number;
  detalle: DetalleSuministro;
};

export type DireccionSuministros = {
  id: string;
  direccion: string;
  /** A qué sociedad pertenece esta dirección (para el filtro por sociedad). */
  sociedadId: string;
  suministros: Suministro[];
};

export type Comercializadora = {
  id: string;
  nombre: string;
  /** Etiquetas que se ven junto al nombre: tarifas o distintivos. */
  etiquetas: string[];
  direcciones: DireccionSuministros[];
};

/** Atajo para no repetir la misma estructura veinte veces. */
export function suministro(
  id: string,
  nombre: string,
  tipo: TipoSuministro,
  tarifa: string,
  costeActual: number,
  ahorro: number,
  detalle: Partial<DetalleSuministro> & { ciudad: string },
): Suministro {
  return {
    id,
    nombre,
    tipo,
    tarifa,
    costeActual,
    ahorro,
    detalle: {
      cups: detalle.cups ?? cupsDe(id),
      consumoAnual: detalle.consumoAnual ?? 24_500,
      potencia: detalle.potencia ?? 15.5,
      perfil: detalle.perfil ?? { punta: 29, llano: 43, valle: 28 },
      companiaActual: detalle.companiaActual ?? "Iberdrola",
      ciudad: detalle.ciudad,
      mantenimiento: detalle.mantenimiento ?? false,
      permanencia: detalle.permanencia ?? null,
    },
  };
}

/**
 * Potencia contratada (kW) a partir de la cual Aczo activa el mantenimiento de
 * luz por su cuenta, sin que haya que pedirlo: por encima de este tamaño de
 * instalación una incidencia eléctrica tiene bastante más impacto y la cuota
 * del mantenimiento sale a cuenta. Los puntos que la superan llegan con el
 * mantenimiento puesto, y la pantalla de ahorro avisa de ello.
 */
export const POTENCIA_MANTENIMIENTO_AUTO = 30;

/** true si a este punto le corresponde mantenimiento de luz automático
 * (ver POTENCIA_MANTENIMIENTO_AUTO). El gas nunca es "automático" en este
 * sentido: va incluido en la propuesta desde el principio, sea del tamaño
 * que sea. */
export function tieneMantenimientoAutomatico(s: Suministro): boolean {
  return s.tipo === "Luz" && s.detalle.potencia > POTENCIA_MANTENIMIENTO_AUTO;
}

export const COMERCIALIZADORAS: Comercializadora[] = [
  {
    id: "totalenergies",
    nombre: "TotalEnergies",
    etiquetas: ["2.0TD", "3.0TD"],
    direcciones: [
      {
        id: "velazquez",
        sociedadId: "mediterraneo",
        direccion: "Calle Velázquez nº 10, Alcobendas, Madrid",
        suministros: [
          suministro("tv-1", "Planta 1 Puerta Derecha", "Luz", "2.0TD", 6_480, 720, {
            ciudad: "Madrid",
            consumoAnual: 42_350,
            potencia: 15.5,
            perfil: { punta: 29, llano: 43, valle: 28 },
            companiaActual: "Iberdrola",
            permanencia: { hasta: "Marzo 2027", penalizacion: { min: 320, max: 400 } },
          }),
          suministro("tv-2", "Planta 1 Puerta Izquierda", "Luz", "2.0TD", 4_100, 430, {
            ciudad: "Madrid",
            consumoAnual: 33_100,
            potencia: 12,
            perfil: { punta: 31, llano: 40, valle: 29 },
            companiaActual: "Endesa",
          }),
          suministro("tv-3", "Planta 2 Puerta Izquierda", "Luz", "3.0TD", 8_900, 890, {
            ciudad: "Madrid",
            consumoAnual: 78_200,
            potencia: 34.5,
            perfil: { punta: 36, llano: 38, valle: 26 },
            companiaActual: "Iberdrola",
            mantenimiento: true,
          }),
          suministro("tv-4", "Planta 2 Puerta Derecha", "Gas", "3.1", 2_750, 250, {
            ciudad: "Madrid",
            consumoAnual: 61_400,
            potencia: 0,
            perfil: { punta: 22, llano: 46, valle: 32 },
            companiaActual: "Naturgy",
            permanencia: { hasta: "Enero 2027", penalizacion: { min: 150, max: 210 } },
          }),
          suministro("tv-5", "Planta 3 Puerta Izquierda", "Luz", "2.0TD", 3_600, 380, {
            ciudad: "Madrid",
            consumoAnual: 37_900,
            potencia: 15.5,
            perfil: { punta: 27, llano: 45, valle: 28 },
            companiaActual: "Naturgy",
          }),
          suministro("tv-6", "Planta 3 Puerta Derecha", "Luz", "2.0TD", 2_100, 210, {
            ciudad: "Madrid",
            consumoAnual: 29_700,
            potencia: 10.35,
            perfil: { punta: 24, llano: 47, valle: 29 },
            companiaActual: "Repsol",
          }),
          suministro("tv-7", "Local comercial", "Luz", "3.0TD", 5_200, 560, {
            ciudad: "Madrid",
            consumoAnual: 66_800,
            potencia: 28.9,
            perfil: { punta: 39, llano: 36, valle: 25 },
            companiaActual: "Endesa",
            mantenimiento: true,
          }),
        ],
      },
      {
        id: "serrano",
        sociedadId: "norte",
        direccion: "Calle Serrano 12, 28001, Madrid",
        suministros: [
          suministro("ts-1", "Oficina principal", "Luz", "3.0TD", 6_400, 640, {
            ciudad: "Madrid",
            consumoAnual: 91_500,
            potencia: 43.1,
            perfil: { punta: 41, llano: 35, valle: 24 },
            companiaActual: "Iberdrola",
            permanencia: { hasta: "Diciembre 2026", penalizacion: { min: 260, max: 340 } },
          }),
          suministro("ts-2", "Almacén planta -1", "Luz", "2.0TD", 1_450, 150, {
            ciudad: "Madrid",
            consumoAnual: 21_300,
            potencia: 9.2,
            perfil: { punta: 19, llano: 44, valle: 37 },
            companiaActual: "Endesa",
          }),
          suministro("ts-3", "Cocina", "Gas", "3.2", 3_200, 320, {
            ciudad: "Madrid",
            consumoAnual: 118_600,
            potencia: 0,
            perfil: { punta: 26, llano: 42, valle: 32 },
            companiaActual: "Naturgy",
            mantenimiento: true,
          }),
          suministro("ts-4", "Terraza", "Luz", "2.0TD", 980, 95, {
            ciudad: "Madrid",
            consumoAnual: 13_800,
            potencia: 6.9,
            perfil: { punta: 33, llano: 41, valle: 26 },
            companiaActual: "Repsol",
          }),
        ],
      },
      {
        id: "constitucion",
        sociedadId: "central",
        direccion: "Avda. de la Constitución 34, Sevilla",
        suministros: [
          suministro("tc-1", "Restaurante planta calle", "Luz", "3.0TD", 6_900, 700, {
            ciudad: "Sevilla",
            consumoAnual: 72_400,
            potencia: 26.5,
            perfil: { punta: 38, llano: 37, valle: 25 },
            companiaActual: "Iberdrola",
            permanencia: { hasta: "Septiembre 2026", penalizacion: { min: 480, max: 610 } },
          }),
          suministro("tc-2", "Trastienda", "Luz", "2.0TD", 1_750, 175, {
            ciudad: "Sevilla",
            consumoAnual: 17_900,
            potencia: 8.05,
            perfil: { punta: 21, llano: 48, valle: 31 },
            companiaActual: "Endesa",
          }),
        ],
      },
    ],
  },
  {
    id: "repsol",
    nombre: "Repsol",
    etiquetas: ["Gas 3.1"],
    // Menos contenido que TotalEnergies a propósito (una sola dirección, dos
    // suministros): Repsol es la comercializadora pequeña de la propuesta, y
    // así se nota en la pantalla de empresas sin dejar de seguir la misma
    // lógica de agrupar por ubicación.
    direcciones: [
      {
        id: "gran-via",
        sociedadId: "mediterraneo",
        direccion: "Gran Vía 45, 28013, Madrid",
        suministros: [
          suministro("rg-1", "Cocina central", "Gas", "3.1", 3_100, 310, {
            ciudad: "Madrid",
            consumoAnual: 142_800,
            potencia: 0,
            perfil: { punta: 24, llano: 44, valle: 32 },
            companiaActual: "Naturgy",
            permanencia: { hasta: "Junio 2026", penalizacion: { min: 150, max: 210 } },
          }),
          suministro("rg-2", "Calefacción oficinas", "Gas", "3.1", 1_480, 145, {
            ciudad: "Madrid",
            consumoAnual: 78_500,
            potencia: 0,
            perfil: { punta: 28, llano: 40, valle: 32 },
            companiaActual: "Iberdrola",
          }),
        ],
      },
    ],
  },
];

/**
 * Naturgy y Octopus no forman parte de la propuesta actual (`COMERCIALIZADORAS`
 * arriba, TotalEnergies + Repsol): solo aparecen si en la pantalla de empresas
 * se elige el plan "Ahorro máximo", que las recomienda además de TotalEnergies.
 * Llevan muy poco contenido a propósito, igual que Repsol.
 */
const NATURGY: Comercializadora = {
  id: "naturgy",
  nombre: "Naturgy",
  etiquetas: ["Gas 3.2"],
  direcciones: [
    {
      id: "castellana",
      sociedadId: "norte",
      direccion: "Paseo de la Castellana 200, Madrid",
      suministros: [
        suministro("ng-1", "Cocina principal", "Gas", "3.2", 2_900, 290, {
          ciudad: "Madrid",
          consumoAnual: 132_400,
          potencia: 0,
          perfil: { punta: 25, llano: 43, valle: 32 },
          companiaActual: "Iberdrola",
        }),
      ],
    },
  ],
};

const OCTOPUS: Comercializadora = {
  id: "octopus",
  nombre: "Octopus",
  etiquetas: ["2.0TD"],
  direcciones: [
    {
      id: "alcala",
      sociedadId: "central",
      direccion: "Calle Alcalá 90, Madrid",
      suministros: [
        suministro("oc-1", "Oficina", "Luz", "2.0TD", 3_450, 340, {
          ciudad: "Madrid",
          consumoAnual: 39_600,
          potencia: 14,
          perfil: { punta: 30, llano: 42, valle: 28 },
          companiaActual: "Endesa",
        }),
      ],
    },
  ],
};

/**
 * Todas las comercializadoras que puede recomendar algún plan, por nombre:
 * las de la propuesta actual (`COMERCIALIZADORAS`) más las que solo aparecen
 * al elegir otro plan en la pantalla de empresas. Así, sea el plan que sea,
 * `plan.comercializadoras` siempre se puede resolver a datos completos.
 */
export const COMERCIALIZADORAS_POR_NOMBRE: Record<string, Comercializadora> = {
  ...Object.fromEntries(COMERCIALIZADORAS.map((c) => [c.nombre, c])),
  Naturgy: NATURGY,
  Octopus: OCTOPUS,
};

/* -------------------------------------------------------------------------- */
/* Flujo de particulares (/particulares): una sola vivienda                   */
/* -------------------------------------------------------------------------- */

/** La dirección de la persona que hace el cálculo — a diferencia del flujo de
 * empresas, aquí solo hay una, así que no hace falta agrupar por sociedad ni
 * por dirección: se enseñan los puntos directamente. */
export const VIVIENDA_DIRECCION = "Calle Mayor 14, 3ºB, Madrid";

/**
 * Lo que Aczo dice haber LEÍDO DE LA FACTURA subida en el paso 1, y que en el
 * paso 3 ("Cambio de compañía") aparece ya relleno para no pedirlo otra vez:
 * el DNI de quien titula el contrato y la dirección del suministro, desglosada
 * en los campos del formulario.
 *
 * En el prototipo son datos inventados, claro; lo que importa es la idea de
 * que a la persona solo le queda poner el IBAN y firmar. Cuadra con
 * `VIVIENDA_DIRECCION` de arriba y con el CUPS del punto de luz.
 */
export type DatosLeidosParticulares = {
  dni: string;
  tipoVia: string;
  nombreVia: string;
  numero: string;
  piso: string;
  puerta: string;
  codigoPostal: string;
  localidad: string;
  provincia: string;
};

export const DATOS_LEIDOS_PARTICULARES: DatosLeidosParticulares = {
  dni: "38829103B",
  tipoVia: "calle",
  nombreVia: "Mayor",
  numero: "14",
  piso: "3",
  puerta: "B",
  codigoPostal: "28013",
  localidad: "Madrid",
  provincia: "madrid",
};

/** Opciones del desplegable "Tipo de vía" del paso 3. */
export const TIPOS_DE_VIA = [
  { value: "calle", label: "Calle" },
  { value: "avenida", label: "Avenida" },
  { value: "plaza", label: "Plaza" },
  { value: "paseo", label: "Paseo" },
  { value: "camino", label: "Camino" },
  { value: "carretera", label: "Carretera" },
] as const;

/** Opciones del desplegable "Provincia" del paso 3. Una muestra, no las 52:
 * es un prototipo y la lista entera solo añadiría ruido. */
export const PROVINCIAS = [
  { value: "madrid", label: "Madrid" },
  { value: "barcelona", label: "Barcelona" },
  { value: "valencia", label: "Valencia" },
  { value: "sevilla", label: "Sevilla" },
  { value: "malaga", label: "Málaga" },
  { value: "zaragoza", label: "Zaragoza" },
] as const;

/** Los dos puntos de suministro de la vivienda (luz y gas). Reutiliza el
 * mismo tipo `Suministro` que el resto del prototipo — no lleva `sociedadId`
 * porque esa idea no existe para un particular.
 *
 * `costeActual` y `ahorro` van en EUROS AL AÑO, como en el resto del
 * prototipo (`ahorroDireccion`/`ahorroComercializadora` en este mismo
 * archivo suman estos campos sin dividir entre 12; la vista mensual los
 * divide ella misma). Para una vivienda son 744 €/año de luz (62 €/mes) y
 * 456 €/año de gas (38 €/mes) — cifras de una vivienda normal, no de una
 * cartera de empresa. */
export const SUMINISTROS_PARTICULARES: Suministro[] = [
  suministro("part-luz", "Luz — Calle Mayor 14", "Luz", "2.0TD", 744, 168, {
    ciudad: "Madrid",
    companiaActual: "Iberdrola",
    consumoAnual: 3_200,
    potencia: 4.6,
    permanencia: { hasta: "Marzo 2027", penalizacion: { min: 60, max: 90 } },
  }),
  suministro("part-gas", "Gas — Calle Mayor 14", "Gas", "3.1", 456, 108, {
    ciudad: "Madrid",
    companiaActual: "Naturgy",
    consumoAnual: 9_800,
    potencia: 0,
  }),
];

/**
 * Las tres recomendaciones de "Recomendado para ti" (pantalla "Ahorro y
 * recomendación" de particulares). A diferencia de los `PLANES` de empresas
 * (tres niveles de ahorro: máximo/equilibrado/simple), aquí son tres
 * comercializadoras destacadas cada una por un motivo distinto — así lo pide
 * el Figma de esta pantalla. Cada una es una propuesta para LOS DOS puntos
 * de la vivienda a la vez (luz y gas), por eso `ahorroAnual` ya es la suma de
 * los dos — la ficha de "Detalles" de cada tarjeta enseña el desglose de
 * `SUMINISTROS_PARTICULARES` completo, no solo uno de los dos puntos.
 */
export type RecomendacionParticular = {
  id: string;
  /** Etiqueta en mayúsculas de la tarjeta: "AHORRO ACZO", "LA MÁS COMPLETA"... */
  categoria: string;
  /** La única marcada así lleva la etiqueta "Recomendado" y el fondo oscuro
   * — es la que sale elegida por defecto, igual que el plan recomendado en
   * empresas. */
  recomendado: boolean;
  comercializadora: string;
  ahorroAnual: number;
  ventajas: string[];
};

export const RECOMENDACIONES_PARTICULARES: RecomendacionParticular[] = [
  {
    id: "aczo",
    categoria: "Ahorro Aczo",
    recomendado: false,
    comercializadora: "TotalEnergies",
    ahorroAnual: 276,
    ventajas: [
      "Tarifas flexibles luz y gas",
      "Sin permanencia",
      "Energía 100% verde certificada",
    ],
  },
  {
    id: "completa",
    categoria: "La más completa",
    recomendado: true,
    comercializadora: "Repsol",
    ahorroAnual: 252,
    ventajas: [
      "Descuento en carburante",
      "Precio fijo 12 meses",
      "Servicio de mantenimiento incluido",
    ],
  },
  {
    id: "flexible",
    categoria: "La más flexible",
    recomendado: false,
    comercializadora: "Octopus",
    ahorroAnual: 228,
    ventajas: [
      "Tarifa por horas de consumo",
      "Sin permanencia ni penalización",
      "App con control de consumo en tiempo real",
    ],
  },
];

/**
 * El resto de ofertas de "Todas las ofertas", debajo de las tres
 * recomendadas: opciones con menos ahorro, y que no necesariamente cubren
 * los dos puntos de la vivienda (`tipos` dice cuáles). Se puede elegir
 * cualquiera igual que las tres de arriba — al hacerlo, ninguna de esas tres
 * queda ya seleccionada.
 */
export type OfertaParticular = {
  id: string;
  comercializadora: string;
  tipos: TipoSuministro[];
  ahorroAnual: number;
};

export const OFERTAS_PARTICULARES: OfertaParticular[] = [
  { id: "naturgy", comercializadora: "Naturgy", tipos: ["Gas"], ahorroAnual: 96 },
  { id: "endesa", comercializadora: "Endesa", tipos: ["Luz"], ahorroAnual: 84 },
];

/** Total de archivos leídos en la subida de particulares (dato de la
 * maqueta): dos facturas de luz y una de gas, una de ellas con error. */
export const TOTAL_ARCHIVOS_LEIDOS_PARTICULARES = 3;

export const ARCHIVOS_CON_ERROR_PARTICULARES: ArchivoConError[] = [
  { id: "err-part-1", nombre: "foto_factura_gas.jpg", motivo: "Imagen borrosa o cortada" },
];

/**
 * Fichas de alerta para el panel de particulares (`PanelAlertasParticulares`,
 * mismo patrón que `PanelAlertasEmpresas`: portal, pestañas Permanencia /
 * Vencidas, "Revisar" abre el panel en la pestaña correcta). Mismo tipo que
 * `ContratoAlerta` pero sin `sociedad` ni `cif` — esa idea no existe para un
 * particular, así que la ficha tampoco la enseña.
 */
export type ContratoAlertaParticular = {
  id: string;
  comercializadora: string;
  archivo: string;
  tarifa: string;
  cups: string;
  etiquetaFecha: string;
  fecha: string;
  importe: { min: number; max: number } | null;
};

export const PERMANENCIAS_PARTICULARES: ContratoAlertaParticular[] = [
  {
    id: "perm-part-1",
    comercializadora: "Iberdrola",
    archivo: "factura_iberdrola_2024_03.pdf",
    tarifa: "Tarifa 2.0TD",
    cups: "ES0031406225146001JN0F",
    etiquetaFecha: "Fin estimado",
    fecha: "Marzo 2027",
    importe: { min: 60, max: 90 },
  },
];

export const FACTURAS_VENCIDAS_PARTICULARES: ContratoAlertaParticular[] = [
  {
    id: "venc-part-1",
    comercializadora: "Naturgy",
    archivo: "factura_naturgy_2023_01.pdf",
    tarifa: "Tarifa 3.1",
    cups: "ES0021877401925003KP1A",
    etiquetaFecha: "Fecha de la factura",
    fecha: "Enero 2023",
    importe: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Ofertas de la ventana "otras compañías"                                    */
/* -------------------------------------------------------------------------- */

export type Oferta = {
  id: string;
  nombre: string;
  tarifa: string;
  /** Coste anual con esta compañía. */
  precioAnual: number;
  ahorroAnual: number;
  condiciones: string;
  /** La que está contratada ahora: su botón sale desactivado. */
  actual: boolean;
};

export const OFERTAS: Oferta[] = [
  {
    id: "totalenergies",
    nombre: "TotalEnergies",
    tarifa: "Tarifa 2.0TD y 3.0TD",
    precioAnual: 5_520,
    ahorroAnual: 3_800,
    condiciones: "Permanencia: 12 meses. Sin penalización por cambio temprano.",
    actual: true,
  },
  {
    id: "repsol",
    nombre: "Repsol",
    tarifa: "Tarifa 2.0TD y 3.0TD",
    precioAnual: 4_500,
    ahorroAnual: 12_400,
    condiciones: "Sin permanencia. Sujeto a variaciones del pool de energía.",
    actual: false,
  },
  {
    id: "naturgy",
    nombre: "Naturgy",
    tarifa: "Tarifa 2.0TD y 3.0TD",
    precioAnual: 2_250,
    ahorroAnual: 1_950,
    condiciones: "Permanencia: 12 meses. Sin penalización por cambio temprano.",
    actual: false,
  },
  {
    id: "octopus",
    nombre: "Octopus",
    tarifa: "Tarifa 2.0TD y 3.0TD",
    precioAnual: 1_480,
    ahorroAnual: 620,
    condiciones: "Sin permanencia. Mismo precio fijo durante 24 meses.",
    actual: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Alternativas del panel "Comparar con..." (/empresas)                       */
/* -------------------------------------------------------------------------- */

/**
 * Lo que se ve en el panel lateral que se abre con "Comparar" en cada
 * comercializadora de "Tu ahorro potencial": otras compañías que podrían
 * hacerse cargo de esos mismos puntos de suministro, cada una con su ahorro y
 * su letra pequeña.
 *
 * Van ordenadas de más a menos ahorro, que es como se leen: la primera es la
 * que más conviene.
 */
export type AlternativaComparar = {
  id: string;
  nombre: string;
  tipo: TipoSuministro;
  /** Cuántos de los puntos de esa comercializadora cubriría. */
  suministros: number;
  ahorroAnual: number;
  /** La ficha que se despliega al abrir la tarjeta. */
  detalles: {
    precioEnergia: string;
    precioPotencia: string;
    tipoTarifa: string;
    permanencia: string;
    penalizacion: string;
  };
  condiciones: string[];
};

export const ALTERNATIVAS_COMPARAR: AlternativaComparar[] = [
  {
    id: "octopus",
    nombre: "Octopus",
    tipo: "Luz",
    suministros: 11,
    ahorroAnual: 480,
    detalles: {
      precioEnergia: "0,095 €/kWh",
      precioPotencia: "38,50 €/kW año",
      tipoTarifa: "Fija 12 meses",
      permanencia: "Sin permanencia",
      penalizacion: "Sin penalización",
    },
    condiciones: [
      "Factura 100% digital",
      "Energía 100% renovable",
      "Atención al cliente 24/7",
      "Sin servicios adicionales obligatorios",
    ],
  },
  // Las dos siguientes son compañías inventadas, con los nombres del Figma
  // (node 4136:43254). Su logo también es inventado, claro: está en
  // `public/logos/`.
  {
    id: "ahorra",
    nombre: "Ahorra Energía",
    tipo: "Luz",
    suministros: 10,
    ahorroAnual: 380,
    detalles: {
      precioEnergia: "0,101 €/kWh",
      precioPotencia: "36,20 €/kW año",
      tipoTarifa: "Indexada",
      permanencia: "12 meses",
      penalizacion: "60 € por punto",
    },
    condiciones: [
      "Precio que sigue al mercado mayorista",
      "Gestor de cuenta asignado",
      "Informe mensual de consumo",
    ],
  },
  {
    id: "bululu",
    nombre: "Bululú Energía",
    tipo: "Luz",
    suministros: 10,
    ahorroAnual: 180,
    detalles: {
      precioEnergia: "0,108 €/kWh",
      precioPotencia: "34,90 €/kW año",
      tipoTarifa: "Fija 24 meses",
      permanencia: "24 meses",
      penalizacion: "90 € por punto",
    },
    condiciones: [
      "Precio cerrado durante dos años",
      "Mantenimiento incluido sin coste",
      "Atención telefónica en horario de oficina",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Sociedades (pantalla de firma)                                             */
/* -------------------------------------------------------------------------- */

export type Sociedad = { id: string; nombre: string; cif: string };

export const SOCIEDADES: Sociedad[] = [
  { id: "mediterraneo", nombre: "Restaurantes Mediterráneo S.L.", cif: "B-12345678" },
  { id: "norte", nombre: "Grupo Hostelero Norte S.L.", cif: "B-82014567" },
  { id: "central", nombre: "Café Central S.L.", cif: "B-28567891" },
];

/* -------------------------------------------------------------------------- */
/* Alertas: contratos con permanencia y facturas vencidas                     */
/* -------------------------------------------------------------------------- */

/**
 * Lo que se ve en el panel lateral que se abre con "Revisar permanencias".
 *
 * Las dos pestañas del panel usan la misma ficha; lo que cambia es el dato de
 * la caja gris: en permanencias es cuándo acaba y cuánto costaría salirse, y en
 * vencidas es de cuándo es la factura y qué queda pendiente.
 */
export type ContratoAlerta = {
  id: string;
  comercializadora: string;
  /** Nombre del archivo de la factura de la que salió el dato. */
  archivo: string;
  tarifa: string;
  sociedad: string;
  cif: string;
  cups: string;
  /** Etiqueta de la caja gris: "Fin estimado", "Fecha de la factura"… */
  etiquetaFecha: string;
  fecha: string;
  /**
   * Horquilla del importe (coste de salirse, o importe pendiente).
   * `null` = no se ha podido estimar; la ficha lo dice en su sitio.
   */
  importe: { min: number; max: number } | null;
};

export const PERMANENCIAS: ContratoAlerta[] = [
  {
    id: "perm-1",
    comercializadora: "Iberdrola",
    archivo: "factura_iberdrola_2024_03.pdf",
    tarifa: "Tarifa 2.0TD",
    sociedad: "Restaurantes Mediterráneo S.L.",
    cif: "B-12345678",
    cups: "ES0031406225146001JN0F",
    etiquetaFecha: "Fin estimado",
    fecha: "Marzo 2027",
    importe: { min: 320, max: 400 },
  },
  {
    id: "perm-2",
    comercializadora: "Naturgy",
    archivo: "factura_naturgy_2024_03.pdf",
    tarifa: "Tarifa 2.0TD",
    sociedad: "Grupo Hostelero Norte S.L.",
    cif: "B-82014567",
    cups: "ES0021877401925003KP1A",
    etiquetaFecha: "Fin estimado",
    fecha: "Enero 2027",
    importe: null,
  },
  {
    id: "perm-3",
    comercializadora: "Endesa",
    archivo: "factura_endesa_2024_02.pdf",
    tarifa: "Tarifa 3.0TD",
    sociedad: "Café Central S.L.",
    cif: "B-28567891",
    cups: "ES0031408890114002MT7C",
    etiquetaFecha: "Fin estimado",
    fecha: "Septiembre 2026",
    importe: { min: 480, max: 610 },
  },
  {
    id: "perm-4",
    comercializadora: "Repsol",
    archivo: "factura_repsol_2024_01.pdf",
    tarifa: "Tarifa 3.1",
    sociedad: "Restaurantes Mediterráneo S.L.",
    cif: "B-12345678",
    cups: "ES0021877455201007QW3D",
    etiquetaFecha: "Fin estimado",
    fecha: "Junio 2026",
    importe: { min: 150, max: 210 },
  },
  {
    id: "perm-5",
    comercializadora: "Iberdrola",
    archivo: "factura_iberdrola_2024_01.pdf",
    tarifa: "Tarifa 2.0TD",
    sociedad: "Grupo Hostelero Norte S.L.",
    cif: "B-82014567",
    cups: "ES0031406778310004BN9E",
    etiquetaFecha: "Fin estimado",
    fecha: "Diciembre 2026",
    importe: { min: 260, max: 340 },
  },
];

export const FACTURAS_VENCIDAS: ContratoAlerta[] = [
  {
    id: "venc-1",
    comercializadora: "Endesa",
    archivo: "factura_endesa_2022_11.pdf",
    tarifa: "Tarifa 2.0TD",
    sociedad: "Café Central S.L.",
    cif: "B-28567891",
    cups: "ES0031408890114002MT7C",
    etiquetaFecha: "Fecha de la factura",
    fecha: "Noviembre 2022",
    importe: null,
  },
  {
    id: "venc-2",
    comercializadora: "Naturgy",
    archivo: "factura_naturgy_2023_02.pdf",
    tarifa: "Tarifa 3.2",
    sociedad: "Grupo Hostelero Norte S.L.",
    cif: "B-82014567",
    cups: "ES0021877401925003KP1A",
    etiquetaFecha: "Fecha de la factura",
    fecha: "Febrero 2023",
    importe: null,
  },
  {
    id: "venc-3",
    comercializadora: "Iberdrola",
    archivo: "factura_iberdrola_2023_04.pdf",
    tarifa: "Tarifa 2.0TD",
    sociedad: "Restaurantes Mediterráneo S.L.",
    cif: "B-12345678",
    cups: "ES0031406225146001JN0F",
    etiquetaFecha: "Fecha de la factura",
    fecha: "Abril 2023",
    importe: null,
  },
];

/**
 * Archivos que fallaron al leerse en la subida de empresas (/empresas). No
 * bloquean el proceso: se pueden sustituir o descartar sin problema.
 */
export type ArchivoConError = { id: string; nombre: string; motivo: string };

export const ARCHIVOS_CON_ERROR: ArchivoConError[] = [
  { id: "err-1", nombre: "scan_oficina.jpg", motivo: "Lectura del CUPS incorrecta" },
  { id: "err-2", nombre: "foto_factura_repsol.png", motivo: "Imagen borrosa o cortada" },
];

/** Total de archivos leídos en la subida de empresas (dato de la maqueta). */
export const TOTAL_ARCHIVOS_LEIDOS_EMPRESAS = 46;

/** Muestra de los archivos que se leyeron sin problema (el resto, hasta el
 * total, se resume en un texto en vez de listarse uno a uno). */
export const ARCHIVOS_CORRECTOS_MUESTRA = [
  { nombre: "factura_iberdrola_2024_04.pdf", tamano: "1.8 MB" },
  { nombre: "factura_naturgy_2024_04.pdf", tamano: "2.1 MB" },
  { nombre: "factura_endesa_2024_03.pdf", tamano: "1.4 MB" },
  { nombre: "factura_repsol_2024_02.pdf", tamano: "980 KB" },
  { nombre: "factura_octopus_2024_01.pdf", tamano: "1.1 MB" },
] as const;

/* -------------------------------------------------------------------------- */
/* Filtros de la tabla                                                        */
/* -------------------------------------------------------------------------- */

/*
 * Las opciones NO repiten el nombre del filtro ("Tipo de suministro: Luz").
 * Solo la opción que no filtra nada dice de qué va el desplegable ("Todos los
 * suministros"), que es justo la que hace falta para no dejar tres desplegables
 * seguidos poniendo "Todos".
 */

export const FILTROS_TIPO = [
  { value: "todos", label: "Todos los suministros" },
  { value: "luz", label: "Luz" },
  { value: "gas", label: "Gas" },
] as const;

export const FILTROS_TARIFA = [
  { value: "todas", label: "Todas las tarifas" },
  { value: "2.0TD", label: "2.0TD" },
  { value: "3.0TD", label: "3.0TD" },
  { value: "3.1", label: "3.1" },
  { value: "3.2", label: "3.2" },
] as const;

export const FILTROS_SOCIEDAD = [
  { value: "todas", label: "Todas las sociedades" },
  ...SOCIEDADES.map((s) => ({ value: s.id, label: s.nombre })),
] as const;

/* -------------------------------------------------------------------------- */
/* Totales calculados — así nunca se desincronizan de los datos de arriba     */
/* -------------------------------------------------------------------------- */

export function suministrosDe(c: Comercializadora): Suministro[] {
  return c.direcciones.flatMap((d) => d.suministros);
}

export function ahorroDe(items: { ahorro: number }[]): number {
  return items.reduce((total, s) => total + s.ahorro, 0);
}

export function ahorroDireccion(d: DireccionSuministros): number {
  return ahorroDe(d.suministros);
}

export function ahorroComercializadora(c: Comercializadora): number {
  return ahorroDe(suministrosDe(c));
}

export function numSuministros(c: Comercializadora): number {
  return suministrosDe(c).length;
}

/** La sociedad (con su CIF) a la que pertenece una dirección. */
export function sociedadDe(direccion: DireccionSuministros): Sociedad {
  return SOCIEDADES.find((s) => s.id === direccion.sociedadId)!;
}

/** Puntos de suministro de un tipo (Luz o Gas), en todas las comercializadoras. */
export function puntosPorTipo(tipo: TipoSuministro): number {
  return COMERCIALIZADORAS.flatMap(suministrosDe).filter(
    (s) => s.tipo === tipo,
  ).length;
}

/** Direcciones distintas de todas las comercializadoras (los "activos" del
 * resumen de la pantalla de empresas: cada dirección es un local o una oficina). */
export const TOTAL_DIRECCIONES = COMERCIALIZADORAS.reduce(
  (total, c) => total + c.direcciones.length,
  0,
);

/** Sociedades que tienen al menos un suministro en alguna comercializadora. */
export const SOCIEDADES_ACTIVAS = SOCIEDADES.filter((s) =>
  COMERCIALIZADORAS.some((c) =>
    c.direcciones.some((d) => d.sociedadId === s.id),
  ),
).length;

/* -------------------------------------------------------------------------- */
/* Mantenimiento                                                              */
/* -------------------------------------------------------------------------- */

/**
 * El mantenimiento es una cuota fija por punto de suministro: 2 €/mes, 24 €/año.
 * No es gratis, así que al activarlo el ahorro estimado BAJA un poco. Es lo que
 * hace el interruptor "Añadir mantenimiento" de la pantalla de recomendación.
 *
 * Está aquí, con el resto de los datos de mentira, para que se pueda cambiar la
 * cuota en un solo sitio y todas las cifras de la pantalla sigan cuadrando.
 */
export const MANTENIMIENTO_MENSUAL_POR_PUNTO = 2;
export const MANTENIMIENTO_ANUAL_POR_PUNTO = MANTENIMIENTO_MENSUAL_POR_PUNTO * 12;

/** Resta la cuota de mantenimiento de un ahorro anual, si está activado. */
export function conMantenimiento(
  ahorroAnual: number,
  puntos: number,
  activo: boolean,
): number {
  return activo
    ? ahorroAnual - puntos * MANTENIMIENTO_ANUAL_POR_PUNTO
    : ahorroAnual;
}

/**
 * Igual que conMantenimiento, pero para la pantalla de empresas: ahí el
 * mantenimiento se activa punto por punto (un interruptor por fila), no con
 * un único interruptor global. `puntosConMantenimiento` es cuántos de esos
 * puntos lo tienen activado ahora mismo, dentro de lo que se esté calculando
 * (un punto, una comercializadora o la propuesta entera).
 */
export function conMantenimientoMixto(
  ahorroAnual: number,
  puntosConMantenimiento: number,
): number {
  return ahorroAnual - puntosConMantenimiento * MANTENIMIENTO_ANUAL_POR_PUNTO;
}

/** Total de puntos de suministro de la propuesta. */
export const TOTAL_PUNTOS = COMERCIALIZADORAS.reduce(
  (total, c) => total + numSuministros(c),
  0,
);

/** Resumen que se enseña en la pantalla de firma. */
export const RESUMEN = {
  sociedades: SOCIEDADES.length + 3, // hay más sociedades de las que piden IBAN
  puntosSuministro: TOTAL_PUNTOS,
  puntosConMantenimiento: COMERCIALIZADORAS.flatMap(suministrosDe).filter(
    (s) => s.detalle.mantenimiento,
  ).length,
  /** Puntos que quedan fuera por tener permanencia activa. */
  puntosConPermanencia: PERMANENCIAS.length,
};

/**
 * Formatea euros como en el diseño: sin decimales y con punto de millar.
 *
 * `useGrouping: "always"` es importante: por defecto, en español los números de
 * cuatro cifras van SIN punto (4948), y el Figma los escribe con punto (4.948).
 * Manda el Figma.
 */
export function euros(valor: number): string {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
    useGrouping: "always",
  }).format(Math.round(valor));
}

/** Formatea kWh, con el mismo criterio de punto de millar. */
export function kwh(valor: number): string {
  return new Intl.NumberFormat("es-ES", { useGrouping: "always" }).format(
    valor,
  );
}

/* -------------------------------------------------------------------------- */
/* Área de cliente — "Mi cartera"                                             */
/* -------------------------------------------------------------------------- */

/**
 * La cartera de una clienta que ya es de Aczo (pantalla "Dashboard / Mi
 * cartera"). Es otro momento distinto al del recorrido de alta: aquí ya hay
 * sociedades contratadas, repartidas por España, y lo que se mira es el estado
 * de cada una.
 *
 * La clave de todo es `provincia`: tiene que escribirse EXACTAMENTE igual que
 * en `provincias-espana.ts` (son los nombres del INE, con sus dos idiomas
 * donde los hay: "Alacant/Alicante", "Illes Balears", "A Coruña"...). Es lo
 * que usa el mapa para saber qué pintar.
 */

export type EstadoCartera = "activa" | "tramite" | "revision";
export type TipoCartera = "luz" | "gas";

/** Los tres estados, con su rótulo y el token de color de su puntito. */
export const ESTADOS_CARTERA: {
  id: EstadoCartera;
  rotulo: string;
  /** Clase de color del punto. Tokens de feedback del sistema. */
  color: string;
}[] = [
  { id: "activa", rotulo: "Activas", color: "bg-success-high" },
  { id: "tramite", rotulo: "En trámite", color: "bg-info-high" },
  { id: "revision", rotulo: "En revisión", color: "bg-warning-high" },
];

export type SedeCartera = {
  /** Nombre de provincia del INE. Debe coincidir con `provincias-espana.ts`. */
  provincia: string;
  ciudad: string;
  inmuebles: number;
  tipos: TipoCartera[];
  /** Puntos de suministro (CUPS) de esta sede, repartidos por estado. */
  puntos: Record<EstadoCartera, number>;
};

export type SociedadCartera = {
  id: string;
  nombre: string;
  /**
   * El color con el que esta sociedad se pinta en el mapa y en la leyenda.
   *
   * EXCEPCIÓN al principio de "tokens siempre": estos cuatro colores están a
   * pelo porque el Figma los pone a pelo — solo el primero (#20270f) coincide
   * con un token (highlight-deep). Los otros tres no existen en la librería.
   * Se ha decidido calcar el Figma en vez de aproximarlos con la paleta
   * `extended`. Si algún día entran en la librería, se cambian aquí y ya.
   */
  color: string;
  comercializadora: string;
  sedes: SedeCartera[];
};

export const SOCIEDADES_CARTERA: SociedadCartera[] = [
  {
    id: "mendesaltaren",
    nombre: "mendesaltaren SL",
    color: "#20270F",
    comercializadora: "Repsol",
    sedes: [
      { provincia: "Madrid", ciudad: "Madrid", inmuebles: 5, tipos: ["luz", "gas"], puntos: { activa: 13, tramite: 2, revision: 0 } },
      { provincia: "Barcelona", ciudad: "Barcelona", inmuebles: 4, tipos: ["luz", "gas"], puntos: { activa: 8, tramite: 1, revision: 0 } },
      { provincia: "València/Valencia", ciudad: "València", inmuebles: 3, tipos: ["luz"], puntos: { activa: 4, tramite: 0, revision: 1 } },
      { provincia: "Sevilla", ciudad: "Sevilla", inmuebles: 2, tipos: ["luz"], puntos: { activa: 3, tramite: 0, revision: 0 } },
      { provincia: "Bizkaia", ciudad: "Bilbao", inmuebles: 2, tipos: ["luz", "gas"], puntos: { activa: 2, tramite: 1, revision: 0 } },
    ],
  },
  {
    id: "still",
    nombre: "Still SL",
    color: "#898A35",
    comercializadora: "TotalEnergies",
    sedes: [
      { provincia: "Madrid", ciudad: "Alcobendas", inmuebles: 3, tipos: ["luz", "gas"], puntos: { activa: 8, tramite: 1, revision: 0 } },
      { provincia: "Málaga", ciudad: "Málaga", inmuebles: 3, tipos: ["luz"], puntos: { activa: 4, tramite: 1, revision: 0 } },
      { provincia: "Illes Balears", ciudad: "Palma", inmuebles: 3, tipos: ["luz"], puntos: { activa: 3, tramite: 0, revision: 1 } },
      { provincia: "A Coruña", ciudad: "A Coruña", inmuebles: 2, tipos: ["luz", "gas"], puntos: { activa: 3, tramite: 0, revision: 0 } },
    ],
  },
  {
    id: "nocodehackers",
    nombre: "Nocodehackers SL",
    color: "#7B6EEB",
    comercializadora: "Ahorra Energía",
    sedes: [
      { provincia: "Zaragoza", ciudad: "Zaragoza", inmuebles: 4, tipos: ["luz", "gas"], puntos: { activa: 7, tramite: 1, revision: 0 } },
      { provincia: "Valladolid", ciudad: "Valladolid", inmuebles: 3, tipos: ["luz"], puntos: { activa: 4, tramite: 0, revision: 0 } },
      { provincia: "Alacant/Alicante", ciudad: "Alacant", inmuebles: 3, tipos: ["luz"], puntos: { activa: 3, tramite: 1, revision: 0 } },
      { provincia: "Murcia", ciudad: "Murcia", inmuebles: 2, tipos: ["luz", "gas"], puntos: { activa: 3, tramite: 0, revision: 0 } },
      { provincia: "Las Palmas", ciudad: "Las Palmas de Gran Canaria", inmuebles: 2, tipos: ["luz"], puntos: { activa: 2, tramite: 1, revision: 0 } },
    ],
  },
  {
    id: "tailorhub",
    nombre: "Tailor Hub SL",
    color: "#E85AB0",
    comercializadora: "Repsol",
    sedes: [
      { provincia: "Madrid", ciudad: "Pozuelo de Alarcón", inmuebles: 3, tipos: ["luz", "gas"], puntos: { activa: 7, tramite: 1, revision: 0 } },
      { provincia: "Granada", ciudad: "Granada", inmuebles: 2, tipos: ["luz"], puntos: { activa: 3, tramite: 0, revision: 0 } },
      { provincia: "Asturias", ciudad: "Gijón", inmuebles: 2, tipos: ["luz", "gas"], puntos: { activa: 3, tramite: 0, revision: 0 } },
      { provincia: "Navarra", ciudad: "Pamplona", inmuebles: 2, tipos: ["luz"], puntos: { activa: 2, tramite: 1, revision: 0 } },
      { provincia: "Girona", ciudad: "Girona", inmuebles: 2, tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 1 } },
      { provincia: "Cantabria", ciudad: "Santander", inmuebles: 2, tipos: ["luz", "gas"], puntos: { activa: 2, tramite: 0, revision: 0 } },
    ],
  },
];

/* --- Cuentas derivadas (NADA de esto está escrito a mano) ------------------ */

/** Puntos de suministro de una sede, sumando sus tres estados. */
export function puntosDeSede(sede: SedeCartera): number {
  return sede.puntos.activa + sede.puntos.tramite + sede.puntos.revision;
}

/** Inmuebles de una sociedad. */
export function inmueblesDeSociedad(s: SociedadCartera): number {
  return s.sedes.reduce((total, sede) => total + sede.inmuebles, 0);
}

/** Puntos de suministro de una sociedad. */
export function puntosDeSociedad(s: SociedadCartera): number {
  return s.sedes.reduce((total, sede) => total + puntosDeSede(sede), 0);
}

/** Cuántos puntos tiene una sociedad en cada estado. */
export function estadosDeSociedad(
  s: SociedadCartera,
): Record<EstadoCartera, number> {
  return s.sedes.reduce(
    (total, sede) => ({
      activa: total.activa + sede.puntos.activa,
      tramite: total.tramite + sede.puntos.tramite,
      revision: total.revision + sede.puntos.revision,
    }),
    { activa: 0, tramite: 0, revision: 0 },
  );
}

/** Los números de las cinco tarjetas de arriba. */
export const RESUMEN_CARTERA = {
  sociedades: SOCIEDADES_CARTERA.length,
  inmuebles: SOCIEDADES_CARTERA.reduce(
    (t, s) => t + inmueblesDeSociedad(s),
    0,
  ),
  puntos: SOCIEDADES_CARTERA.reduce((t, s) => t + puntosDeSociedad(s), 0),
  comercializadoras: [
    ...new Set(SOCIEDADES_CARTERA.map((s) => s.comercializadora)),
  ],
  estados: SOCIEDADES_CARTERA.reduce(
    (total, s) => {
      const e = estadosDeSociedad(s);
      return {
        activa: total.activa + e.activa,
        tramite: total.tramite + e.tramite,
        revision: total.revision + e.revision,
      };
    },
    { activa: 0, tramite: 0, revision: 0 },
  ),
};

/** Fecha que se enseña arriba del todo ("última actualización"). */
export const ACTUALIZACION_CARTERA = "06 de julio 2026";

/* --- Agrupar la cartera de tres maneras ------------------------------------ */

/** Las tres formas de agrupar la lista de "Mi cartera". */
export type ModoAgrupacion = "ubicacion" | "sociedad" | "comercializadora";

export const MODOS_AGRUPACION: { id: ModoAgrupacion; rotulo: string }[] = [
  { id: "ubicacion", rotulo: "Ubicación" },
  { id: "sociedad", rotulo: "Sociedad" },
  { id: "comercializadora", rotulo: "Comercializadora" },
];

/** Una línea del detalle que se ve al desplegar un grupo. */
export type LineaDetalle = {
  sociedad: string;
  provincia: string;
  ciudad: string;
  inmuebles: number;
  tipos: TipoCartera[];
  puntos: number;
};

/**
 * Un grupo de la lista, sea lo que sea que se esté agrupando. Las tres
 * agrupaciones producen la MISMA forma, así que la fila de la lista y el mapa
 * no necesitan saber por cuál de las tres se ha agrupado.
 */
export type GrupoCartera = {
  id: string;
  nombre: string;
  /**
   * El color con el que se pinta en el mapa. Siempre sale de una sociedad: la
   * que más puntos aporta al grupo. Así, agrupes por lo que agrupes, un mismo
   * color significa siempre la misma sociedad.
   */
  color: string;
  /** Provincias que enciende este grupo en el mapa. */
  provincias: string[];
  inmuebles: number;
  puntos: number;
  estados: Record<EstadoCartera, number>;
  detalle: LineaDetalle[];
};

function sumaEstados(lineas: { estados: Record<EstadoCartera, number> }[]) {
  return lineas.reduce(
    (t, l) => ({
      activa: t.activa + l.estados.activa,
      tramite: t.tramite + l.estados.tramite,
      revision: t.revision + l.estados.revision,
    }),
    { activa: 0, tramite: 0, revision: 0 },
  );
}

/** Todas las sedes de la cartera, aplanadas y con su sociedad al lado. */
function todasLasSedes() {
  return SOCIEDADES_CARTERA.flatMap((sociedad) =>
    sociedad.sedes.map((sede) => ({ sociedad, sede })),
  );
}

/**
 * Los cuatro filtros de la barra de "Mi cartera". Cada uno vacío ("") quiere
 * decir "todos".
 */
export type FiltrosCartera = {
  sociedad: string;
  tipo: "" | TipoCartera;
  provincia: string;
  estado: "" | EstadoCartera;
};

export const FILTROS_VACIOS: FiltrosCartera = {
  sociedad: "",
  tipo: "",
  provincia: "",
  estado: "",
};

/** Las opciones de cada filtro, sacadas de los propios datos. */
export const OPCIONES_FILTROS = {
  sociedad: SOCIEDADES_CARTERA.map((s) => s.nombre),
  tipo: [
    { value: "luz", label: "Luz" },
    { value: "gas", label: "Gas" },
  ],
  provincia: [
    ...new Set(SOCIEDADES_CARTERA.flatMap((s) => s.sedes.map((x) => x.provincia))),
  ].sort((a, b) => a.localeCompare(b, "es")),
  estado: ESTADOS_CARTERA.map((e) => ({ value: e.id, label: e.rotulo })),
};

/**
 * Agrupa la cartera por ubicación, por sociedad o por comercializadora, y de
 * paso aplica los filtros de la barra.
 *
 * Sobre el filtro de estado: deja pasar las sedes que TIENEN algún punto en ese
 * estado, sin recortar sus cifras. Es decir, "En trámite" enseña dónde hay algo
 * en trámite, no cuántos puntos en trámite hay — para eso está la cifra que ya
 * sale a la derecha de cada fila.
 *
 * Nada de esto está escrito a mano: todo se calcula a partir de
 * SOCIEDADES_CARTERA, así que al tocar un dato las tres agrupaciones siguen
 * cuadrando entre ellas.
 */
export function agruparCartera(
  modo: ModoAgrupacion,
  filtros: FiltrosCartera = FILTROS_VACIOS,
): GrupoCartera[] {
  const clave = {
    ubicacion: (s: (typeof SOCIEDADES_CARTERA)[number], sede: SedeCartera) =>
      sede.provincia,
    sociedad: (s: (typeof SOCIEDADES_CARTERA)[number]) => s.nombre,
    comercializadora: (s: (typeof SOCIEDADES_CARTERA)[number]) =>
      s.comercializadora,
  }[modo];

  const cajones = new Map<
    string,
    { sociedad: SociedadCartera; sede: SedeCartera }[]
  >();

  const pasaFiltros = ({
    sociedad,
    sede,
  }: {
    sociedad: SociedadCartera;
    sede: SedeCartera;
  }) =>
    (!filtros.sociedad || sociedad.nombre === filtros.sociedad) &&
    (!filtros.tipo || sede.tipos.includes(filtros.tipo)) &&
    (!filtros.provincia || sede.provincia === filtros.provincia) &&
    (!filtros.estado || sede.puntos[filtros.estado] > 0);

  for (const fila of todasLasSedes().filter(pasaFiltros)) {
    const k = clave(fila.sociedad, fila.sede);
    cajones.set(k, [...(cajones.get(k) ?? []), fila]);
  }

  const grupos = [...cajones].map(([nombre, filas]) => {
    // El color lo pone la sociedad que más puntos aporta al grupo.
    const porSociedad = new Map<string, { color: string; puntos: number }>();
    for (const { sociedad, sede } of filas) {
      const actual = porSociedad.get(sociedad.id);
      porSociedad.set(sociedad.id, {
        color: sociedad.color,
        puntos: (actual?.puntos ?? 0) + puntosDeSede(sede),
      });
    }
    const dominante = [...porSociedad.values()].sort(
      (a, b) => b.puntos - a.puntos,
    )[0];

    return {
      id: nombre,
      nombre,
      color: dominante.color,
      provincias: [...new Set(filas.map(({ sede }) => sede.provincia))],
      inmuebles: filas.reduce((t, { sede }) => t + sede.inmuebles, 0),
      puntos: filas.reduce((t, { sede }) => t + puntosDeSede(sede), 0),
      estados: sumaEstados(filas.map(({ sede }) => ({ estados: sede.puntos }))),
      detalle: filas.map(({ sociedad, sede }) => ({
        sociedad: sociedad.nombre,
        provincia: sede.provincia,
        ciudad: sede.ciudad,
        inmuebles: sede.inmuebles,
        tipos: sede.tipos,
        puntos: puntosDeSede(sede),
      })),
    };
  });

  // Por sociedad se respeta el orden en que están escritas (es el del Figma);
  // en los otros dos casos, de más puntos a menos.
  return modo === "sociedad"
    ? grupos
    : grupos.sort((a, b) => b.puntos - a.puntos);
}
