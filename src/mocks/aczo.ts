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
  consumoAnual: number;
  /** Potencia contratada nueva, en kW. */
  potencia: number;
  /** Reparto del consumo por franjas. Los tres porcentajes suman 100. */
  perfil: { punta: number; llano: number; valle: number };
  companiaActual: string;
  ciudad: string;
  mantenimiento: boolean;
};

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
function suministro(
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
      consumoAnual: detalle.consumoAnual ?? 24_500,
      potencia: detalle.potencia ?? 15.5,
      perfil: detalle.perfil ?? { punta: 29, llano: 43, valle: 28 },
      companiaActual: detalle.companiaActual ?? "Iberdrola",
      ciudad: detalle.ciudad,
      mantenimiento: detalle.mantenimiento ?? false,
    },
  };
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
            potencia: 31.5,
            perfil: { punta: 38, llano: 37, valle: 25 },
            companiaActual: "Iberdrola",
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
      {
        id: "diagonal",
        sociedadId: "norte",
        direccion: "Avinguda Diagonal 220, 08018, Barcelona",
        suministros: [
          suministro("rd-1", "Obrador", "Gas", "3.2", 3_800, 380, {
            ciudad: "Barcelona",
            consumoAnual: 183_200,
            potencia: 0,
            perfil: { punta: 31, llano: 39, valle: 30 },
            companiaActual: "Endesa",
            mantenimiento: true,
          }),
          suministro("rd-2", "Punto de venta", "Gas", "3.1", 980, 95, {
            ciudad: "Barcelona",
            consumoAnual: 58_400,
            potencia: 0,
            perfil: { punta: 20, llano: 45, valle: 35 },
            companiaActual: "Naturgy",
          }),
        ],
      },
    ],
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
