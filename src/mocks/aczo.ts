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

export type EstadoCartera =
  | "activa"
  | "tramite"
  | "revision"
  | "por-activar";
export type TipoCartera = "luz" | "gas";

/**
 * Los cuatro estados de un punto de suministro, con su rótulo y el token de
 * color de su puntito.
 *
 * `rotulo` es como se llama el estado en la tarjeta de resumen y en las filas
 * ("Activas 86"), donde se está contando; `rotuloFiltro` es como se llama en el
 * desplegable de filtros ("Activo"), donde se está eligiendo uno. Es la única
 * diferencia, y sale así del Figma.
 */
export const ESTADOS_CARTERA: {
  id: EstadoCartera;
  rotulo: string;
  rotuloFiltro: string;
  /** Clase de color del punto. Tokens de feedback del sistema. */
  color: string;
}[] = [
  {
    id: "activa",
    rotulo: "Activas",
    rotuloFiltro: "Activo",
    color: "bg-success-high",
  },
  {
    id: "tramite",
    rotulo: "En trámite",
    rotuloFiltro: "En trámite",
    color: "bg-info-high",
  },
  {
    id: "revision",
    rotulo: "En revisión",
    rotuloFiltro: "En revisión",
    color: "bg-warning-high",
  },
  {
    id: "por-activar",
    rotulo: "Por activar",
    rotuloFiltro: "Por activar",
    // Rojo, no gris: en la Figma del Dashboard (nodo 788:9503) es el único
    // estado que de verdad necesita que alguien haga algo (activar el punto),
    // y por eso lleva el color de aviso más fuerte del sistema.
    color: "bg-danger-high",
  },
];

/** Las categorías que se le pueden poner a un inmueble. */
export const CATEGORIAS_INMUEBLE = [
  "Oficinas",
  "Local comercial",
  "Nave industrial",
  "Almacén",
  "Centro logístico",
  "Hotel",
  "Vivienda",
] as const;

export type CategoriaInmueble = (typeof CATEGORIAS_INMUEBLE)[number];

/** El cajón de los inmuebles que nadie ha clasificado todavía. */
export const SIN_CATALOGAR = "Sin catalogar";

/**
 * La paleta con la que se pinta la cartera: sociedades, comercializadoras y
 * tipos de inmueble tiran todos de aquí, en este orden. Que sea LA MISMA lista
 * es lo que hace que el gráfico se lea igual agrupes por lo que agrupes.
 *
 * EXCEPCIÓN al principio de "tokens siempre": los cuatro primeros están a pelo
 * porque el Figma los pone a pelo — solo #20270f coincide con un token
 * (highlight-deep). Se decidió calcar el Figma en vez de aproximarlos.
 *
 * Los cuatro últimos SÍ son tokens: el Figma solo define cuatro colores (tiene
 * cuatro sociedades) y los tipos de inmueble son ocho, así que para el resto se
 * tira de la paleta `extended` del sistema, que es justo la que existe para
 * gráficas. Están elegidos para que dos tonos parecidos no caigan seguidos.
 */
export const PALETA_CARTERA = [
  "#20270F",
  "#898A35",
  "#7B6EEB",
  "#E85AB0",
  "var(--color-extended-four-mid)",
  "var(--color-extended-three-mid)",
  "var(--color-extended-five-dark)",
  "var(--color-extended-two-dark)",
];

export type InmuebleCartera = {
  /**
   * El nombre que le ha puesto la clienta y su categoría. Los dos pueden faltar
   * a la vez: es un inmueble que llegó de una factura y nadie ha clasificado
   * todavía. La lista lo enseña como "Categoriza este inmueble".
   */
  nombre?: string;
  categoria?: CategoriaInmueble;
  direccion: string;
  tipos: TipoCartera[];
  /** Puntos de suministro (CUPS) del inmueble, repartidos por estado. */
  puntos: Record<EstadoCartera, number>;
  /** Ahorro estimado al año, en euros. Es lo que enseña la leyenda del mapa. */
  ahorro: number;
};

export type SedeCartera = {
  /** Nombre de provincia del INE. Debe coincidir con `provincias-espana.ts`. */
  provincia: string;
  ciudad: string;
  inmuebles: InmuebleCartera[];
};

export type SociedadCartera = {
  id: string;
  nombre: string;
  /** Su color en el gráfico y en la leyenda. Sale de `PALETA_CARTERA`. */
  color: string;
  comercializadora: string;
  sedes: SedeCartera[];
};

export const SOCIEDADES_CARTERA: SociedadCartera[] = [
  {
    id: "mendesaltaren",
    nombre: "mendesaltaren SL",
    color: PALETA_CARTERA[0],
    comercializadora: "Repsol",
    sedes: [
      {
        provincia: "Madrid",
        ciudad: "Madrid",
        inmuebles: [
          { direccion: "Calle Velázquez nº 10, Alcobendas, Madrid", tipos: ["luz", "gas"], puntos: { activa: 5, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 1330 },
          { direccion: "Paseo de la Castellana 141, Madrid", tipos: ["luz"], puntos: { activa: 3, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 620 },
          { direccion: "Calle Los Ángeles 22, Getafe, Madrid", tipos: ["luz"], puntos: { activa: 2, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 810 },
          { direccion: "Calle Orense 34, Madrid", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 470 },
          { direccion: "Calle Fuencarral 78, Madrid", tipos: ["luz"], puntos: { activa: 0, tramite: 0, revision: 0, "por-activar": 1 }, ahorro: 320 },
        ],
      },
      {
        provincia: "Barcelona",
        ciudad: "Barcelona",
        inmuebles: [
          { direccion: "Avinguda Diagonal 442, Barcelona", tipos: ["luz", "gas"], puntos: { activa: 4, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 1120 },
          { direccion: "Calle Bonanova 2, Barcelona", tipos: ["luz"], puntos: { activa: 2, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 780 },
          { direccion: "Carrer A 12, Zona Franca, Barcelona", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 290 },
          { direccion: "Carrer Gran de Gràcia 90, Barcelona", tipos: ["luz"], puntos: { activa: 0, tramite: 0, revision: 0, "por-activar": 1 }, ahorro: 250 },
        ],
      },
      {
        provincia: "València/Valencia",
        ciudad: "València",
        inmuebles: [
          { direccion: "Carrer de Sueca 41, València", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 540 },
          { direccion: "Camí del Port 8, València", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 1, "por-activar": 0 }, ahorro: 460 },
          { direccion: "Avinguda del Cid 120, València", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 260 },
        ],
      },
      {
        provincia: "A Coruña",
        ciudad: "A Coruña",
        inmuebles: [
          { direccion: "Avenida de Buenos Aires 5, A Coruña", tipos: ["luz", "gas"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 580 },
          { direccion: "Parcela D 14, Pocomaco, A Coruña", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 300 },
        ],
      },
      {
        provincia: "Málaga",
        ciudad: "Málaga",
        inmuebles: [
          { direccion: "Paseo del Muelle Uno 3, Málaga", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 520 },
          { direccion: "Calle Alfarnate 9, Málaga", tipos: ["luz"], puntos: { activa: 0, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 240 },
        ],
      },
    ],
  },
  {
    id: "still",
    nombre: "Still SL",
    color: PALETA_CARTERA[1],
    comercializadora: "TotalEnergies",
    sedes: [
      {
        provincia: "Madrid",
        ciudad: "Alcobendas",
        inmuebles: [
          { direccion: "Avenida de Bruselas 7, Alcobendas, Madrid", tipos: ["luz", "gas"], puntos: { activa: 5, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 1280 },
          { direccion: "Carretera de Fuencarral km 3, Alcobendas, Madrid", tipos: ["luz"], puntos: { activa: 2, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 830 },
          { direccion: "Calle Marqués de la Valdavia 54, Alcobendas, Madrid", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 280 },
        ],
      },
      {
        provincia: "Málaga",
        ciudad: "Málaga",
        inmuebles: [
          { direccion: "Paseo Marítimo Pablo Ruiz Picasso 12, Málaga", tipos: ["luz", "gas"], puntos: { activa: 2, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 910 },
          { direccion: "Calle Tomás Heredia 18, Málaga", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 270 },
          { direccion: "Calle Cerrojo 5, Málaga", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 230 },
        ],
      },
      {
        provincia: "Barcelona",
        ciudad: "Barcelona",
        inmuebles: [
          { direccion: "Carrer de Pallars 193, Barcelona", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 560 },
          { direccion: "Carrer de Balmes 210, Barcelona", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 1, "por-activar": 0 }, ahorro: 420 },
        ],
      },
      {
        provincia: "A Coruña",
        ciudad: "A Coruña",
        inmuebles: [
          { direccion: "Rúa Orzán 60, A Coruña", tipos: ["luz", "gas"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 570 },
          { direccion: "Rúa Gutenberg 9, A Coruña", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 260 },
        ],
      },
    ],
  },
  {
    id: "nocodehackers",
    nombre: "Nocodehackers SL",
    color: PALETA_CARTERA[2],
    comercializadora: "Endesa",
    sedes: [
      {
        provincia: "Madrid",
        ciudad: "Madrid",
        inmuebles: [
          { direccion: "Calle Nicasio Gallego 18, Madrid", tipos: ["luz", "gas"], puntos: { activa: 4, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 1080 },
          { direccion: "Calle Sierra de Guadalupe 2, Madrid", tipos: ["luz"], puntos: { activa: 2, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 790 },
          { direccion: "Calle Alcalá 320, Madrid", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 250 },
          { direccion: "Avenida de la Cañada 14, Coslada, Madrid", tipos: ["luz"], puntos: { activa: 0, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 180 },
        ],
      },
      {
        provincia: "València/Valencia",
        ciudad: "València",
        inmuebles: [
          { direccion: "Carrer dels Cavallers 22, València", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 530 },
          { direccion: "Plaça del Mercat 6, València", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 240 },
          { direccion: "Carrer de Colom 1, València", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 230 },
        ],
      },
      {
        provincia: "Murcia",
        ciudad: "Murcia",
        inmuebles: [
          { direccion: "Carril de la Condomina 4, Espinardo, Murcia", tipos: ["luz", "gas"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 610 },
          { direccion: "Gran Vía Escultor Salzillo 20, Murcia", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 270 },
          { direccion: "Calle Trapería 18, Murcia", tipos: ["luz"], puntos: { activa: 0, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 220 },
        ],
      },
      {
        provincia: "Barcelona",
        ciudad: "Barcelona",
        inmuebles: [
          { direccion: "Avinguda Rius i Taulet 3, Sant Cugat, Barcelona", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 540 },
          { direccion: "Carrer de Muntaner 88, Barcelona", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 250 },
        ],
      },
      {
        provincia: "Málaga",
        ciudad: "Málaga",
        inmuebles: [
          { direccion: "Calle Villa de Madrid 7, Málaga", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 580 },
          { direccion: "Calle Camino de Antequera 40, Málaga", tipos: ["luz"], puntos: { activa: 0, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 210 },
        ],
      },
    ],
  },
  {
    id: "tailorhub",
    nombre: "Tailor Hub SL",
    color: PALETA_CARTERA[3],
    comercializadora: "Repsol",
    sedes: [
      {
        provincia: "Madrid",
        ciudad: "Pozuelo de Alarcón",
        inmuebles: [
          { direccion: "Avenida de Europa 26, Pozuelo de Alarcón, Madrid", tipos: ["luz", "gas"], puntos: { activa: 5, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 1260 },
          { direccion: "Camino de Húmera 14, Pozuelo de Alarcón, Madrid", tipos: ["luz"], puntos: { activa: 2, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 800 },
          { direccion: "Calle Las Flores 3, Pozuelo de Alarcón, Madrid", tipos: ["luz"], puntos: { activa: 0, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 190 },
        ],
      },
      {
        provincia: "Málaga",
        ciudad: "Málaga",
        inmuebles: [
          { direccion: "Calle Louis Pasteur 5, Málaga", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 550 },
          { direccion: "Calle Larios 12, Málaga", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 260 },
        ],
      },
      {
        provincia: "A Coruña",
        ciudad: "A Coruña",
        inmuebles: [
          { direccion: "Avenida Alfonso Molina 30, A Coruña", tipos: ["luz", "gas"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 570 },
          { direccion: "Rúa Real 44, A Coruña", tipos: ["luz"], puntos: { activa: 1, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 240 },
        ],
      },
      {
        provincia: "Murcia",
        ciudad: "Murcia",
        inmuebles: [
          { direccion: "Camino de los Molinos 8, Alcantarilla, Murcia", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 520 },
          { direccion: "Calle Platería 27, Murcia", tipos: ["luz"], puntos: { activa: 0, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 200 },
          { direccion: "Avenida Juan Carlos I 55, Murcia", tipos: ["luz"], puntos: { activa: 0, tramite: 1, revision: 0, "por-activar": 0 }, ahorro: 230 },
        ],
      },
      {
        provincia: "València/Valencia",
        ciudad: "València",
        inmuebles: [
          { direccion: "Carrer de Mistral 14, València", tipos: ["luz"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 540 },
          { direccion: "Carrer de Cadis 33, València", tipos: ["luz"], puntos: { activa: 0, tramite: 0, revision: 1, "por-activar": 0 }, ahorro: 250 },
        ],
      },
      {
        provincia: "Barcelona",
        ciudad: "Barcelona",
        inmuebles: [
          { direccion: "Carrer de Girona 120, Barcelona", tipos: ["luz", "gas"], puntos: { activa: 2, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 480 },
          { direccion: "Carrer de Provença 250, Barcelona", tipos: ["luz"], puntos: { activa: 0, tramite: 0, revision: 0, "por-activar": 0 }, ahorro: 180 },
        ],
      },
    ],
  },
];

/* --- Cuentas derivadas (NADA de esto está escrito a mano) ------------------ */

/** Puntos de suministro (CUPS) de un inmueble, sumando todos sus estados. */
export function puntosDeInmueble(i: InmuebleCartera): number {
  return ESTADOS_CARTERA.reduce((t, e) => t + i.puntos[e.id], 0);
}

/** Puntos de suministro de una sede, sumando sus inmuebles. */
export function puntosDeSede(sede: SedeCartera): number {
  return sede.inmuebles.reduce((t, i) => t + puntosDeInmueble(i), 0);
}

/** Inmuebles de una sociedad. */
export function inmueblesDeSociedad(s: SociedadCartera): number {
  return s.sedes.reduce((total, sede) => total + sede.inmuebles.length, 0);
}

/** Puntos de suministro de una sociedad. */
export function puntosDeSociedad(s: SociedadCartera): number {
  return s.sedes.reduce((total, sede) => total + puntosDeSede(sede), 0);
}

/** Cuántos puntos tiene una sociedad en cada estado. */
export function estadosDeSociedad(
  s: SociedadCartera,
): Record<EstadoCartera, number> {
  return sumaEstados(
    s.sedes.flatMap((sede) => sede.inmuebles.map((i) => ({ estados: i.puntos }))),
  );
}

/** Los números de las cinco tarjetas de arriba. */
export const RESUMEN_CARTERA = {
  sociedades: SOCIEDADES_CARTERA.length,
  inmuebles: SOCIEDADES_CARTERA.reduce((t, s) => t + inmueblesDeSociedad(s), 0),
  puntos: SOCIEDADES_CARTERA.reduce((t, s) => t + puntosDeSociedad(s), 0),
  comercializadoras: [
    ...new Set(SOCIEDADES_CARTERA.map((s) => s.comercializadora)),
  ],
  estados: sumaEstados(
    SOCIEDADES_CARTERA.map((s) => ({ estados: estadosDeSociedad(s) })),
  ),
};

/** Fecha que se enseña arriba del todo ("última actualización"). */
export const ACTUALIZACION_CARTERA = "06 de julio 2026";

/* -------------------------------------------------------------------------- */
/* Área de cliente — "Dashboard"                                             */
/* -------------------------------------------------------------------------- */

/**
 * Ahorro potencial anual estimado. Es una proyección, así que se enseña
 * igual pase lo que pase con el resto de tarjetas: antes de la primera
 * factura ES lo único que hay, y con el cliente ya asentado sigue siendo la
 * referencia contra la que se compara el ahorro real.
 */
export const AHORRO_POTENCIAL_ANUAL_DASHBOARD = 8300;

/**
 * El escenario "cliente ya asentado" del Dashboard: casi un año con Aczo, ya
 * con facturas reales de por medio (a diferencia del escenario inicial, con
 * el ahorro real y el resto de tarjetas todavía en "--"). Sale del Figma
 * (nodo 788:11027).
 */
export const AHORRO_REAL_ACUMULADO_DASHBOARD = 7234;

/** Coste y consumo del último mes, con la variación frente al mismo mes del
 * año anterior. El signo va incluido en `variacion` (puede ser negativo). */
export type ResumenUltimoMes = { valor: number; variacion: number };

export const COSTE_ULTIMO_MES_DASHBOARD: ResumenUltimoMes = {
  valor: 3231,
  variacion: -6,
};

export const CONSUMO_ULTIMO_MES_DASHBOARD: ResumenUltimoMes = {
  valor: 18650,
  variacion: 6,
};

/** El período contra el que se comparan las variaciones de arriba. */
export const MES_COMPARACION_DASHBOARD = "julio 2025";

/** Fecha de la última actualización del Dashboard. */
export const ACTUALIZACION_DASHBOARD = "06 de julio 2026";

/**
 * Un mes del histórico de coste que se enseña en el Dashboard: lo que habría
 * costado con la comercializadora anterior frente a lo que ha costado (o se
 * estima que costará) con Aczo.
 *
 * `real` distingue los meses ya facturados de los que todavía son una
 * proyección: con casi un año de cliente, los primeros ocho meses son
 * factura de verdad y solo quedan por estimar los últimos cuatro. Es lo que
 * decide si la columna se pinta sólida o con la trama de "estimado" (ver
 * `GraficaBarras`).
 */
export type PuntoConsumoMensual = {
  mes: string;
  costeConAczo: number;
  costeSinAczo: number;
  consumoKwh: number;
  real: boolean;
};

/**
 * El histórico de los últimos 12 meses. Los números son de mentira, pero
 * guardan la misma forma que el Figma: más consumo (y más ahorro) en los
 * meses de más calor.
 */
export const CONSUMO_MENSUAL_DASHBOARD: PuntoConsumoMensual[] = [
  { mes: "Ene", costeConAczo: 195, costeSinAczo: 260, consumoKwh: 1450, real: true },
  { mes: "Feb", costeConAczo: 210, costeSinAczo: 275, consumoKwh: 1520, real: true },
  { mes: "Mar", costeConAczo: 165, costeSinAczo: 220, consumoKwh: 1180, real: true },
  { mes: "Abr", costeConAczo: 175, costeSinAczo: 230, consumoKwh: 1230, real: true },
  { mes: "May", costeConAczo: 160, costeSinAczo: 215, consumoKwh: 1140, real: true },
  { mes: "Jun", costeConAczo: 205, costeSinAczo: 270, consumoKwh: 1480, real: true },
  { mes: "Jul", costeConAczo: 255, costeSinAczo: 330, consumoKwh: 1820, real: true },
  { mes: "Ago", costeConAczo: 200, costeSinAczo: 260, consumoKwh: 1460, real: true },
  { mes: "Sep", costeConAczo: 210, costeSinAczo: 275, consumoKwh: 1510, real: false },
  { mes: "Oct", costeConAczo: 220, costeSinAczo: 285, consumoKwh: 1560, real: false },
  { mes: "Nov", costeConAczo: 245, costeSinAczo: 320, consumoKwh: 1740, real: false },
  { mes: "Dic", costeConAczo: 260, costeSinAczo: 335, consumoKwh: 1850, real: false },
];

/* -------------------------------------------------------------------------- */
/* Área de cliente — Panel de "Notificaciones y alertas"                     */
/* -------------------------------------------------------------------------- */

/**
 * Una alerta: algo que le falta resolver a la persona para no perder ahorro.
 * Se distingue de una notificación en que PIDE una acción (Completar,
 * Revisar…) y se puede descartar; la notificación solo informa.
 */
export type AlertaCliente = {
  id: string;
  titulo: string;
  descripcion: string;
  /** Sale la etiqueta "Urgente" en naranja delante del título. */
  urgente?: boolean;
  fecha: string;
  /** Rótulo del botón principal ("Completar", "Revisar"…). */
  accion: string;
};

export const ALERTAS_CLIENTE: AlertaCliente[] = [
  {
    id: "sociedades-pendientes",
    titulo: "Sociedades pendientes",
    descripcion: "Completa los datos de las sociedades para poder tramitar tu ahorro",
    urgente: true,
    fecha: "16/08/2026",
    accion: "Completar",
  },
  {
    id: "errores-lectura",
    titulo: "Errores de lectura",
    descripcion: "Revisa las facturas para poder calcular el ahorro correctamente",
    fecha: "16/08/2026",
    accion: "Revisar",
  },
];

/** Una notificación: solo informa de algo que ya ha pasado. No se descarta, se lee. */
export type NotificacionCliente = {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
};

export const NOTIFICACIONES_CLIENTE: NotificacionCliente[] = [
  {
    id: "alta-1",
    titulo: "Nueva alta ejecutada",
    detalle: "Ruiz carpintería SL · CUPS: ES1234567890",
    fecha: "Hoy",
  },
  {
    id: "alta-2",
    titulo: "Nueva alta ejecutada",
    detalle: "mendesaltaren SL · CUPS: ES0857788126185",
    fecha: "Hoy",
  },
  {
    id: "alta-3",
    titulo: "Nueva alta ejecutada",
    detalle: "Still SL · CUPS: ES0955850307201",
    fecha: "Ayer",
  },
];

/**
 * Una factura que ha dado error al leerse, dentro del detalle de la alerta
 * "Errores de lectura" (se abre pulsando "Revisar"). El CUPS se enseña
 * tapado porque, en un error de lectura, es justo el dato que no se pudo
 * leer bien.
 */
export type FacturaConError = {
  id: string;
  comercializadora: string;
  archivo: string;
  sociedad: string;
  cif: string;
  tarifa: string;
};

export const ERRORES_LECTURA_CLIENTE: FacturaConError[] = [
  {
    id: "err-naturgy-1",
    comercializadora: "Naturgy",
    archivo: "factura_naturgy_2024_03.pdf",
    sociedad: "Martínez SL",
    cif: "B-91028374",
    tarifa: "Tarifa Luz",
  },
  {
    id: "err-naturgy-2",
    comercializadora: "Naturgy",
    archivo: "factura_naturgy_2024_03.pdf",
    sociedad: "Martínez SL",
    cif: "B-91028374",
    tarifa: "Tarifa Luz",
  },
];

/* -------------------------------------------------------------------------- */
/* Área de cliente — "Documentos"                                            */
/* -------------------------------------------------------------------------- */

/** Una factura de la pestaña "Facturas" de "Documentos". */
export type FacturaCliente = {
  id: string;
  numero: string;
  fecha: string;
  tipo: TipoCartera;
  sociedad: string;
  comercializadora: string;
  ubicacion: string;
  importe: number;
};

/**
 * Las facturas de las cuatro sociedades de la cartera, tres meses seguidos
 * (mayo-julio 2026) y una por cada tipo de suministro que de verdad tiene su
 * primera sede — ni sociedad ni dirección se escriben a mano, salen de
 * `SOCIEDADES_CARTERA`, así que la lista de "Documentos" cuadra con el resto
 * del área de cliente. El importe sí es un número de mentira (300 € de base
 * más un escalón por factura, para que la lista no sea todo el mismo valor).
 */
export const FACTURAS_CLIENTE: FacturaCliente[] = (() => {
  const meses = ["Mayo 2026", "Junio 2026", "Julio 2026"];
  const facturas: FacturaCliente[] = [];
  let n = 0;

  for (const sociedad of SOCIEDADES_CARTERA) {
    const sede = sociedad.sedes[0];
    const inmueble = sede.inmuebles[0];
    for (const mes of meses) {
      for (const tipo of inmueble.tipos) {
        n += 1;
        facturas.push({
          id: `factura-${n}`,
          numero: `Factura ${String(n).padStart(3, "0")}`,
          fecha: mes,
          tipo,
          sociedad: sociedad.nombre,
          comercializadora: sociedad.comercializadora,
          ubicacion: inmueble.direccion,
          importe: 300 + ((n * 37) % 500),
        });
      }
    }
  }
  return facturas;
})();

/** Un contrato de la pestaña "Contratos" de "Documentos" (Figma nodo 797:44901). */
export type ContratoCliente = {
  id: string;
  titulo: string;
  categoria: string;
  proveedor: string;
  sociedad: string;
  firma: string;
  vigencia: string;
  estado: "Vigente";
};

/**
 * Los tres contratos del Figma, con las sociedades de verdad de la cartera
 * (el Figma trae otras tres, de mentira, que no existen en ningún otro sitio
 * del prototipo — se sustituyen por las nuestras para que el filtro de
 * "Sociedad" tenga sentido con el resto del área de cliente).
 */
export const CONTRATOS_CLIENTE: ContratoCliente[] = [
  {
    id: "contrato-1",
    titulo: "Mantenimiento técnico",
    categoria: "agua",
    proveedor: "Aqualia",
    sociedad: "mendesaltaren SL",
    firma: "04 feb 2026",
    vigencia: "04 feb 2027",
    estado: "Vigente",
  },
  {
    id: "contrato-2",
    titulo: "Contrato de alquiler",
    categoria: "oficina",
    proveedor: "Meridia",
    sociedad: "Still SL",
    firma: "18 jun 2025",
    vigencia: "18 jun 2028",
    estado: "Vigente",
  },
  {
    id: "contrato-3",
    titulo: "Seguro empresarial",
    categoria: "negocio",
    proveedor: "Mapfre",
    sociedad: "Nocodehackers SL",
    firma: "30 sep 2024",
    vigencia: "30 sep 2026",
    estado: "Vigente",
  },
];

/* --- Agrupar la cartera de tres maneras ------------------------------------ */

/** Las tres formas de agrupar la lista de "Mi cartera". */
export type ModoAgrupacion =
  | "ubicacion"
  | "sociedad"
  | "comercializadora"
  | "inmueble";

export const MODOS_AGRUPACION: { id: ModoAgrupacion; rotulo: string }[] = [
  { id: "ubicacion", rotulo: "Ubicación" },
  { id: "sociedad", rotulo: "Sociedad" },
  { id: "comercializadora", rotulo: "Comercializadora" },
  { id: "inmueble", rotulo: "Inmueble" },
];

/**
 * Qué filtros se enseñan con cada agrupación.
 *
 * No siempre son los mismos: agrupando por ubicación, por ejemplo, el filtro de
 * "Sociedad" sobra — la lista ya no va de sociedades. Sale así del Figma.
 */
export const FILTROS_POR_AGRUPACION: Record<
  ModoAgrupacion,
  (keyof FiltrosCartera)[]
> = {
  ubicacion: ["direcciones", "tiposDeInmueble", "tipos", "estados"],
  sociedad: ["sociedades", "direcciones", "tipos", "estados"],
  comercializadora: ["comercializadoras", "direcciones", "tipos", "estados"],
  inmueble: ["tiposDeInmueble", "direcciones", "tipos", "estados"],
};

/**
 * Una línea del detalle que se ve al desplegar un grupo: un inmueble, con la
 * sociedad y la provincia a las que pertenece.
 */
export type LineaDetalle = {
  /** Clave estable de la fila. La dirección no se repite en toda la cartera. */
  id: string;
  sociedad: string;
  provincia: string;
  ciudad: string;
  nombre?: string;
  categoria?: CategoriaInmueble;
  direccion: string;
  tipos: TipoCartera[];
  /** Puntos de suministro (CUPS) del inmueble. */
  puntos: number;
  estados: Record<EstadoCartera, number>;
  /** Los CUPS uno a uno, que es lo que se ve al desplegar el inmueble. */
  suministros: PuntoDeInmueble[];
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
  /** Ahorro estimado al año del grupo, en euros. */
  ahorro: number;
  estados: Record<EstadoCartera, number>;
  detalle: LineaDetalle[];
};

/** Un contador a cero para cada estado. Crece solo si se añade un estado. */
export function estadosACero(): Record<EstadoCartera, number> {
  return Object.fromEntries(
    ESTADOS_CARTERA.map((e) => [e.id, 0]),
  ) as Record<EstadoCartera, number>;
}

function sumaEstados(lineas: { estados: Record<EstadoCartera, number> }[]) {
  return lineas.reduce((total, l) => {
    for (const e of ESTADOS_CARTERA) total[e.id] += l.estados[e.id];
    return total;
  }, estadosACero());
}

/**
 * Todos los inmuebles de la cartera, aplanados y con su sociedad y su sede al
 * lado. Es la unidad con la que trabajan los filtros y las tres agrupaciones.
 */
function todosLosInmuebles() {
  return SOCIEDADES_CARTERA.flatMap((sociedad) =>
    sociedad.sedes.flatMap((sede) =>
      sede.inmuebles.map((inmueble) => ({ sociedad, sede, inmueble })),
    ),
  );
}

/**
 * Los cinco filtros de la barra de "Mi cartera". Todos son de varias
 * respuestas: una lista vacía quiere decir "todos".
 */
export type FiltrosCartera = {
  sociedades: string[];
  comercializadoras: string[];
  tipos: TipoCartera[];
  /**
   * Tipos de inmueble elegidos (Oficinas, Almacén, Nave industrial…). El filtro
   * se llama "Inmueble" y ofrece SOLO estas categorías generales, no inmuebles
   * sueltos: con 54 inmuebles, una lista de nombres no se puede recorrer, y lo
   * que se quiere filtrar casi siempre es "enséñame las oficinas".
   *
   * Los inmuebles sin catalogar no tienen categoría, así que ningún filtro los
   * alcanza. Para verlos está `soloSinClasificar`, que es otra cosa y por eso va
   * aparte.
   */
  tiposDeInmueble: CategoriaInmueble[];
  direcciones: string[];
  estados: EstadoCartera[];
  /** Deja a la vista únicamente los inmuebles que aún no están catalogados. */
  soloSinClasificar: boolean;
};

export const FILTROS_VACIOS: FiltrosCartera = {
  sociedades: [],
  comercializadoras: [],
  tipos: [],
  tiposDeInmueble: [],
  direcciones: [],
  estados: [],
  soloSinClasificar: false,
};

/** Un encabezado del desplegable de direcciones y las direcciones que cuelgan. */
export type GrupoDirecciones = { provincia: string; direcciones: string[] };

function agruparDirecciones(): GrupoDirecciones[] {
  const mapa = new Map<string, Set<string>>();
  for (const sociedad of SOCIEDADES_CARTERA) {
    for (const sede of sociedad.sedes) {
      const set = mapa.get(sede.provincia) ?? new Set<string>();
      for (const inmueble of sede.inmuebles) set.add(inmueble.direccion);
      mapa.set(sede.provincia, set);
    }
  }
  return [...mapa]
    .map(([provincia, set]) => ({
      provincia,
      direcciones: [...set].sort((a, b) => a.localeCompare(b, "es")),
    }))
    .sort((a, b) => a.provincia.localeCompare(b.provincia, "es"));
}

/**
 * Todos los inmuebles de la cartera en una lista plana, con la clave y el
 * rótulo que usan los filtros. La clave es la dirección: no se repite en toda
 * la cartera.
 */
export function listaDeInmuebles(
  /** Las categorías puestas durante la sesión, igual que en `agruparCartera`. */
  categorias: Record<string, CategoriaInmueble> = {},
  /** Lo mismo, pero para el nombre puesto en ModalOrganizaCartera. */
  nombres: Record<string, string> = {},
): {
  id: string;
  nombre?: string;
  categoria?: CategoriaInmueble;
  direccion: string;
  provincia: string;
  ciudad: string;
}[] {
  return SOCIEDADES_CARTERA.flatMap((sociedad) =>
    sociedad.sedes.flatMap((sede) =>
      sede.inmuebles.map((inmueble) => ({
        id: inmueble.direccion,
        nombre: nombres[inmueble.direccion] ?? inmueble.nombre,
        categoria: categorias[inmueble.direccion] ?? inmueble.categoria,
        direccion: inmueble.direccion,
        provincia: sede.provincia,
        ciudad: sede.ciudad,
      })),
    ),
  );
}

/** Las opciones de cada filtro, sacadas de los propios datos. */
export const OPCIONES_FILTROS = {
  sociedades: SOCIEDADES_CARTERA.map((s) => s.nombre),
  comercializadoras: [
    ...new Set(SOCIEDADES_CARTERA.map((s) => s.comercializadora)),
  ],
  tipos: [
    { value: "luz" as const, label: "Luz" },
    { value: "gas" as const, label: "Gas" },
  ],
  estados: ESTADOS_CARTERA.map((e) => ({
    value: e.id,
    label: e.rotuloFiltro,
  })),
  /** El filtro "Inmueble": las categorías generales, no inmuebles sueltos. */
  tiposDeInmueble: CATEGORIAS_INMUEBLE.map((c) => ({ value: c, label: c })),
  /**
   * Las direcciones de la cartera, agrupadas por provincia y ordenadas — es
   * como las enseña el desplegable de "Dirección" agrupando por UBICACIÓN: un
   * encabezado por provincia y debajo sus direcciones, cada una con su
   * casilla. Ahí SÍ tiene sentido bajar hasta la dirección: es la propia vista
   * de "dónde está la cartera".
   */
  direcciones: agruparDirecciones(),
  /**
   * Las provincias de la cartera, una sola vez y ordenadas — es como enseña
   * el filtro "Dirección" en las agrupaciones de Sociedad, Comercializadora e
   * Inmueble: ahí lo que se compara es OTRA cosa (quién es cada sociedad, qué
   * tipo de inmueble...), así que bajar hasta la dirección de la calle sería
   * un nivel de detalle de más — con la provincia ya basta para acotar.
   */
  provincias: [
    ...new Set(SOCIEDADES_CARTERA.flatMap((s) => s.sedes.map((x) => x.provincia))),
  ].sort((a, b) => a.localeCompare(b, "es")),
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
  /**
   * Las categorías que se han puesto durante la sesión, por dirección. Los
   * datos de mentira no se tocan nunca: lo que cambia la persona se guarda
   * aparte y se aplica aquí, que es el único sitio por el que pasa todo.
   */
  categorias: Record<string, CategoriaInmueble> = {},
  /** Lo mismo que `categorias`, pero para el nombre puesto en ModalOrganizaCartera. */
  nombres: Record<string, string> = {},
): GrupoCartera[] {
  const categoriaDe = (i: InmuebleCartera) =>
    categorias[i.direccion] ?? i.categoria;
  const nombreDe = (i: InmuebleCartera) => nombres[i.direccion] ?? i.nombre;

  const clave = {
    ubicacion: (_s: SociedadCartera, sede: SedeCartera) => sede.provincia,
    sociedad: (s: SociedadCartera) => s.nombre,
    comercializadora: (s: SociedadCartera) => s.comercializadora,
    // Un grupo por TIPO de inmueble, no por inmueble suelto: son las mismas
    // categorías generales que ofrece el filtro "Inmueble". Con 54 inmuebles,
    // una fila por cada uno no se puede ni leer ni comparar.
    //
    // Los que nadie ha catalogado van todos juntos a SIN_CATALOGAR, que se
    // queda siempre en último lugar (ver el orden, al final de la función):
    // es lo que falta por hacer, no una categoría más que comparar.
    inmueble: (_s: SociedadCartera, _sede: SedeCartera, i: InmuebleCartera) =>
      categoriaDe(i) ?? SIN_CATALOGAR,
  }[modo];

  type Fila = {
    sociedad: SociedadCartera;
    sede: SedeCartera;
    inmueble: InmuebleCartera;
  };

  const cajones = new Map<string, Fila[]>();

  // Una lista de filtro vacía quiere decir "todos", así que no recorta nada.
  const pasaFiltros = ({ sociedad, sede, inmueble }: Fila) =>
    (filtros.sociedades.length === 0 ||
      filtros.sociedades.includes(sociedad.nombre)) &&
    (filtros.comercializadoras.length === 0 ||
      filtros.comercializadoras.includes(sociedad.comercializadora)) &&
    (filtros.tipos.length === 0 ||
      filtros.tipos.some((t) => inmueble.tipos.includes(t))) &&
    (filtros.tiposDeInmueble.length === 0 ||
      (!!categoriaDe(inmueble) &&
        filtros.tiposDeInmueble.includes(categoriaDe(inmueble)!))) &&
    // Agrupando por ubicación el filtro baja hasta la dirección; en las
    // otras tres agrupaciones ese mismo campo guarda provincias (ver el
    // filtro "Dirección" en PantallaCartera), así que compara contra la
    // provincia de la sede en vez de la dirección exacta.
    (filtros.direcciones.length === 0 ||
      (modo === "ubicacion"
        ? filtros.direcciones.includes(inmueble.direccion)
        : filtros.direcciones.includes(sede.provincia))) &&
    (filtros.estados.length === 0 ||
      filtros.estados.some((e) => inmueble.puntos[e] > 0)) &&
    (!filtros.soloSinClasificar || !categoriaDe(inmueble));

  for (const fila of todosLosInmuebles().filter(pasaFiltros)) {
    const k = clave(fila.sociedad, fila.sede, fila.inmueble);
    cajones.set(k, [...(cajones.get(k) ?? []), fila]);
  }

  const grupos = [...cajones].map(([nombre, filas]) => {
    // El color lo pone la sociedad que más puntos aporta al grupo.
    const porSociedad = new Map<string, { color: string; puntos: number }>();
    for (const { sociedad, inmueble } of filas) {
      const actual = porSociedad.get(sociedad.id);
      porSociedad.set(sociedad.id, {
        color: sociedad.color,
        puntos: (actual?.puntos ?? 0) + puntosDeInmueble(inmueble),
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
      inmuebles: filas.length,
      puntos: filas.reduce(
        (t, { inmueble }) => t + puntosDeInmueble(inmueble),
        0,
      ),
      ahorro: filas.reduce((t, { inmueble }) => t + inmueble.ahorro, 0),
      estados: sumaEstados(
        filas.map(({ inmueble }) => ({ estados: inmueble.puntos })),
      ),
      detalle: filas.map(({ sociedad, sede, inmueble }) => ({
        id: inmueble.direccion,
        sociedad: sociedad.nombre,
        provincia: sede.provincia,
        ciudad: sede.ciudad,
        nombre: nombreDe(inmueble),
        categoria: categoriaDe(inmueble),
        direccion: inmueble.direccion,
        tipos: inmueble.tipos,
        puntos: puntosDeInmueble(inmueble),
        estados: inmueble.puntos,
        suministros: puntosDelInmueble(inmueble, sociedad.comercializadora),
      })),
    };
  });

  // Por sociedad se respeta el orden en que están escritas (es el del Figma);
  // en el resto, de más puntos a menos. "Sin catalogar" es la excepción: va
  // SIEMPRE al final, pese los puntos que pese. No es una categoría más con la
  // que compararse, es lo que queda por ordenar.
  if (modo === "sociedad") return grupos;
  return grupos.sort((a, b) => {
    if (a.id === SIN_CATALOGAR) return 1;
    if (b.id === SIN_CATALOGAR) return -1;
    return b.puntos - a.puntos;
  });
}

/* --- Los puntos de suministro de cada inmueble ----------------------------- */

/**
 * Los CUPS que se ven al desplegar un inmueble en "Mi cartera".
 *
 * NO están escritos uno a uno: son cien, y a mano se desincronizarían del
 * `puntos` de su inmueble a la primera. Se derivan de lo que ya hay — cuántos
 * puntos tiene el inmueble en cada estado y si lleva luz, gas o las dos — con
 * el mismo atajo `suministro()` que usa el resto del prototipo, así que
 * comparten forma, CUPS de pega y valores por defecto.
 *
 * Al editar los `puntos` de un inmueble, su lista de CUPS se rehace sola.
 */

/** Los sitios con los que se nombra un punto dentro de un edificio. */
const SITIOS = [
  "Planta 1 Puerta Derecha",
  "Planta 1 Puerta Izquierda",
  "Planta 2 Puerta Derecha",
  "Planta 2 Puerta Izquierda",
  "Planta 3 Oficina",
  "Planta baja Local",
  "Sótano Garaje",
  "Cubierta Climatización",
  "Almacén interior",
  "Zona común",
];

export type PuntoDeInmueble = {
  suministro: Suministro;
  estado: EstadoCartera;
  /** Quién le da el suministro hoy. Es la de su sociedad. */
  comercializadora: string;
};

/**
 * Reparte los puntos de un inmueble en CUPS concretos.
 *
 * El reparto es a propósito determinista (nada de azar): la misma cartera
 * produce siempre la misma lista, así que una captura de pantalla de hoy sigue
 * valiendo mañana.
 */
export function puntosDelInmueble(
  inmueble: InmuebleCartera,
  comercializadora: string,
): PuntoDeInmueble[] {
  const puntos: PuntoDeInmueble[] = [];
  let i = 0;

  for (const estado of ESTADOS_CARTERA) {
    for (let n = 0; n < inmueble.puntos[estado.id]; n++) {
      // Si el inmueble tiene luz y gas, el gas es SIEMPRE el último punto: en
      // un edificio hay una acometida de gas y muchos cuadros de luz.
      const ultimo =
        i === puntosDeInmueble(inmueble) - 1 && inmueble.tipos.includes("gas");
      const tipo: TipoSuministro = ultimo ? "Gas" : "Luz";

      // La potencia sube con el tamaño del inmueble: los que tienen muchos
      // puntos son instalaciones grandes, y algunas pasan del umbral a partir
      // del cual el mantenimiento de luz entra solo.
      const potencia =
        tipo === "Gas" ? 0 : 15.5 + (puntosDeInmueble(inmueble) > 4 ? 20 : 0);

      puntos.push({
        estado: estado.id,
        comercializadora,
        suministro: suministro(
          // El número va DELANTE: el CUPS de pega se calcula con los primeros
          // caracteres del id, y con la dirección delante saldrían todos
          // iguales dentro de un mismo inmueble.
          `${i}-${inmueble.direccion}`,
          SITIOS[i % SITIOS.length],
          tipo,
          tipo === "Gas" ? "3.1" : "2.0TD",
          0,
          0,
          {
            ciudad: inmueble.direccion.split(", ").pop() ?? "",
            potencia,
            consumoAnual: tipo === "Gas" ? 18_400 : 42_350,
            mantenimiento: tipo === "Gas" || potencia > POTENCIA_MANTENIMIENTO_AUTO,
          },
        ),
      });
      i++;
    }
  }

  return puntos;
}
