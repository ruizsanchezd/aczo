# Animaciones e interacciones del prototipo

Este documento es para **el desarrollador de frontend del repo real**. Recoge, pantalla por
pantalla, qué se mueve, cuándo, cuánto dura y con qué curva. El diseño visual se consulta en
Figma; el comportamiento se consulta aquí.

Todo sale de los tokens de motion del sistema. **Ninguna animación usa un valor inventado.**

## Los seis tokens de motion

| Token | Duración | Curva | Cuándo se usa |
| --- | --- | --- | --- |
| `micro-states` | 200 ms | lineal | hover, pulsado, foco, marcado/desmarcado |
| `micro-leave` | 250 ms | ease out | algo se va: cerrar una ventana, un aviso que desaparece |
| `micro-appear` | 350 ms | ease in | algo entra: un aviso, un panel pequeño |
| `macro-levelup` | 350 ms | ease out | entrar en un detalle, abrir un desplegable |
| `macro-leveldown` | 400 ms | ease in | volver atrás, cerrar un detalle |
| `macro-structure` | 500 ms | ease in out | el layout se recoloca, una barra que crece |

En este repo están como utilidades de Tailwind (`motion-micro-states`…) en `src/app/globals.css`
y como objeto de JavaScript en `src/lib/motion.ts`.

**`prefers-reduced-motion` está respetado globalmente**: si la persona ha pedido menos movimiento
en su sistema, todas las transiciones y animaciones se anulan. Es obligatorio replicarlo.

## Reglas generales

- **Entradas en cascada:** cuando varios elementos entran a la vez (ayudas, tarjetas, filas), cada
  uno arranca **60 ms** después del anterior. Suficiente para que se lea como "van entrando" sin
  que el último se haga esperar. La constante está en `src/lib/prototipo.ts` (`PASO_CASCADA`).
- **Salir siempre es más rápido que entrar.** Entrar 350 ms, salir 250 ms.
- **Volver atrás es más lento que avanzar** (400 vs 350 ms): esos 50 ms extra se leen como "estás
  deshaciendo".
- **Los desplegables no animan `height`.** Se usa una rejilla de una fila que pasa de `0fr` a `1fr`
  (`grid-template-rows`), que sí se puede animar y no necesita conocer el alto del contenido.
  El hijo lleva `overflow: hidden`.

## Componentes del sistema

### Botón

| Estado | Qué pasa |
| --- | --- |
| Reposo | opacidad 100 % |
| Hover | **opacidad 60 %** del botón completo (no solo del fondo) |
| Pulsado | **opacidad 30 %** |
| Foco de teclado | anillo azul (`info-high`), 2 px, con separación de 2 px |

Transición: `micro-states`, solo sobre `opacity`. La opacidad se aplica al botón entero para que
se comporte igual sobre cualquier superficie.

### Campo de formulario

- **Foco:** anillo azul, igual que el botón.
- **Escribiendo:** el borde pasa de `border-mid` a `border-high` (`micro-states`).
- **Error:** borde y mensaje de ayuda en `danger-high`.
- **Contraseña:** el ojo alterna mostrar/ocultar y cambia a ojo tachado.

### Casilla, opción única e interruptor

- **Casilla:** se rellena al marcar (`micro-states`).
- **Opción única:** el punto central **crece desde cero** (`micro-appear`). Aparecer de golpe se
  siente menos como "he elegido esto".
- **Interruptor:** carril de 40 × 24 y bolita de 20. Apagado el carril es `background-mid` (gris
  claro) y encendido `background-inverse` (negro); la bolita es `content-inverse` en los dos
  estados. El color del carril y la posición de la bolita se animan juntos (`micro-states`).
  Desactivado: carril `background-state-disabled` y bolita `content-state-disabled`.

### Tooltip

- **Disparador:** un icono `info` con el atributo de teclado `tabIndex`, para que se pueda enfocar
  igual que se puede pasar el ratón por encima.
- **Aparecer:** `micro-appear` sobre `opacity`, al hacer hover o al enfocar con el teclado
  (`:focus-within`, no solo `:focus`, así funciona también si el foco cae en un hijo).
- **Desaparecer:** `micro-leave` sobre `opacity`.
- **Por qué no es el tooltip nativo del navegador (`title`):** no se puede diseñar (tipografía,
  color, tiempos) y en la práctica cuesta acertar sobre un icono pequeño. Se dibuja a mano.
- **Colores y tipografía** (del componente DS Tooltip, leídos de una instancia en el Figma de UI
  Design, node 5349:32575): superficie `background-inverse` con texto `content-inverse`, radio
  `md`, texto `body-m`, padding 12/8 y `shadow-md`. Ojo: es una superficie **invertida**, no una
  superficie oscura fija — el día que se active el modo oscuro la burbuja pasa a clara con texto
  oscuro, que es lo correcto para que siga destacando sobre la página.
- **Posición:**
  - `"top"` (por defecto) y `"bottom"`: ancla su borde derecho al del icono y crece hacia la
    izquierda. Centrarlo sobre el icono lo saca por fuera de la tarjeta cuando el icono está
    pegado al lado derecho de su fila, que es el caso más habitual.
  - `"right"`: a la derecha del icono y **centrada verticalmente con él**, con 4 px de hueco
    (medido en el Figma; arriba y abajo el hueco son 8). Si no cabe (ventana estrecha o burbuja
    más alta que el sitio que queda), se pega al borde dejando el aire mínimo de 8 px. Es la que
    pide el Figma para el aviso del mantenimiento.
- **Modo con acciones (`interactive`):** cuando la burbuja lleva botones dentro deja de ser un
  texto de ayuda y pasa a ser un aviso. Cambian tres cosas:
  - La burbuja recibe el ratón (`pointer-events-auto`), para poder pulsar los botones. Cerrada
    nunca lo recibe, ni en este modo: taparía lo que hay debajo estando invisible.
  - **Ya no se cierra al salir el ratón.** Entre el icono y la burbuja hay 8 px de hueco
    (`mb-02`/`mt-02`): si se cerrara al salir, sería imposible llegar hasta los botones. Se cierra
    con Escape, pulsando fuera o desde sus propios botones.
  - **Se abre al PULSAR el icono, no al pasar por encima.** Si se abriera con el ratón, pulsar el
    icono la abriría (hover) y la cerraría (clic) en el mismo gesto. El disparador pasa a ser un
    `<button>` de verdad con `aria-expanded`, y la burbuja un `role="dialog"` con `aria-label`.
- **Abrir desde fuera (`open` + `onOpenChange`):** modo controlado, para que una pantalla pueda
  abrir la burbuja sola. Lo usa el aviso del mantenimiento automático de "Tu ahorro potencial"
  (empresas), y con acciones dentro el ancho pasa a ser el fijo del Figma (320 px), el que deja
  sitio a los dos botones en una sola línea. Ojo al implementar: el momento de montar la burbuja en el DOM se ajusta DURANTE el
  render, no desde un efecto — desde un efecto encadena un render de más.

## Pantalla 1 · Subida masiva de facturas

1. **Entrada:** titular, las tres ayudas, la zona de arrastre y el botón entran en cascada de 60 ms.
2. **Zona de arrastre, al pasar un archivo por encima:** borde gris → oliva, fondo blanco → oliva
   muy suave, y el icono **crece un 5 %**. Todo en `micro-states`. Tiene que notarse al instante:
   es lo que hace que la zona se sienta receptiva.
3. **Al soltar:** cada factura entra por separado (`micro-appear`) con 60 ms de retardo entre una y
   otra. Escalonado, se lee "han entrado varias"; a la vez, se lee "ha cambiado el bloque".

## Pantalla 2 · Datos y consentimiento

- El **titular no se anima**: es el mismo texto en la misma posición que en la pantalla anterior, así
  que se queda quieto y da continuidad. Lo que entra es lo de debajo.
- El botón "Continuar" pasa de desactivado a activo al marcar el consentimiento (`micro-states`).

## Pantalla 3 · Analizando documentación

**La animación principal del prototipo.** Tres cosas a la vez:

1. **Las cruces giran, a saltos.** La cruz de la marca tiene 4 puntas simétricas: al girar **90°**
   vuelve a estar exactamente igual que al empezar. Por eso el ciclo de la animación es de 90° y no
   de 360°: el giro se ve continuo y **nunca se aprecia el salto** al reiniciarse.
   - Ciclo: **800 ms** (`motion-timing-6`), con `steps(3)`: tres tirones por cuarto de vuelta.
   - **A saltos y no continuo** es una decisión tomada: se siente mecánico, "una máquina
     trabajando", y encaja con el carácter de la marca mejor que un giro suave.
   - Las tres giran **sincronizadas**. Para ponerlas en cascada bastaría con darle a cada una un
     `animation-delay` distinto.
2. **Los pasos se completan.** Al terminar un paso, su cruz **deja de girar y se convierte en un
   check**, y el texto pasa de gris a negro. Así la lista cuenta el progreso, no solo lo acompaña.
3. **La barra sube** con `macro-structure` en cada salto, que es lo que la hace ver fluida en vez de
   a tirones.

Al llegar al 100 % hay **500 ms de respiro** antes de cambiar de pantalla: si se salta de golpe, no
se llega a leer que ha terminado.

## Pantalla 4 · Tu ahorro potencial

1. **Entrada en cascada** de todo: titular, aviso, controles, las tres tarjetas (una tras otra),
   buscador y tabla. Es la pantalla con más información, y la cascada marca el orden de lectura.
2. **Selector anual/mensual:** el fondo negro **se desliza** de un segmento al otro
   (`macro-structure`) y, a la vez, **las cifras cuentan** hasta su nuevo valor
   (`macro-leveldown`, 400 ms). Las dos cosas juntas explican que es el mismo dato en otra unidad;
   si la cifra cambiara de golpe, costaría entenderlo.
3. **Interruptor "Añadir mantenimiento":** no es decorativo. El mantenimiento cuesta una cuota fija
   por punto de suministro (2 €/mes, en `mocks/aczo.ts`), así que al activarlo **todas las cifras de
   ahorro bajan**: las tres tarjetas de plan y los tres niveles de la tabla. Las cifras grandes
   **cuentan** hasta el nuevo valor (`macro-leveldown`, 400 ms); los importes pequeños de dentro de
   la tabla cambian de golpe a propósito, porque son docenas y animarlos todos sería ruido.
   Mientras está activado, el interruptor de mantenimiento de cada punto se ve encendido y
   desactivado: se manda desde arriba.
4. **Tarjetas de plan, al pasar por encima:** se elevan 2 px y cogen `shadow-md` (`micro-states`).
   Sutil a propósito: son tres tarjetas de decisión, no deben competir entre ellas.
5. **Los cuatro niveles de despliegue** (comercializadora → dirección → suministro → detalle), todos
   con la técnica de rejilla `0fr → 1fr` y `macro-levelup`. La flecha gira 180° con `micro-states`,
   así que **acaba antes que el panel** y se lee como "esto lo ha provocado la flecha".
   Al desplegar una comercializadora, su **primera dirección viene ya abierta**: si no, se abre una
   fila para encontrar otra fila cerrada.
6. **Ventana de comparación:** el velo aparece (350 ms) y la ventana **crece desde el 96 %**. Crecer
   poco es clave: desde el 80 % parecería un aviso de error. Las cuatro tarjetas entran en cascada.
   Al cerrar, todo se va en 250 ms. Se cierra con la X, con Escape y pulsando fuera.
   **No hay casillas de selección** en las tarjetas: se lee la información y se decide con el botón.
   Una casilla además del botón obliga a dos gestos para una sola decisión.
7. **Panel de alertas ("Revisar permanencias"):** el velo aparece (350 ms) y el panel **entra
   deslizándose desde el borde derecho** (`macro-levelup`, 350 ms, ease out): es "entrar en un
   detalle", el mismo token que los desplegables. El desplazamiento es del **100 % de su propio
   ancho**, no de la pantalla, así que arranca justo fuera de la vista sin tener que saber cuánto
   mide. Las fichas entran en cascada ya con el panel dentro, y **al cambiar de pestaña la cascada se
   repite**: eso es lo que se lee como "esta es otra lista". Al cerrar, el panel se va hacia la
   derecha en 250 ms. Se cierra con la X, con Escape y pulsando fuera.

> **Aviso para producción:** la ventana modal **y el panel de alertas** se pintan con un portal,
> colgados del `<body>`. Dentro
> del contenedor de la pantalla no funciona: la animación de entrada de la pantalla usa `transform`,
> eso crea un nuevo contexto de posicionamiento y el `position: fixed` de la modal deja de referirse
> a la ventana del navegador. La modal aparece descolocada. Es un fallo fácil de cometer y difícil
> de diagnosticar.

## Pantalla 5 · Firma y apoderamiento

Aquí lo interesante son los **estados que aparecen y desaparecen**:

1. **Contador "1/3 Completados":** se actualiza en cuanto un IBAN queda rellenado. Es el único aviso
   de progreso del bloque, así que responde al instante.
2. **Forma de autorizar:** al elegir una opción, se despliega su contenido (`macro-levelup`):
   - "Tengo los poderes" → la zona para subir los documentos, con los mismos estados que la zona de
     arrastre de la pantalla 1.
   - "No tengo el poder" → el mini formulario de envío de enlace. Al enviarlo, **se sustituye** por
     la confirmación: no conviven, porque la pregunta ya está respondida.
3. **Aviso "Tienes contratos con permanencia":** entra con la cascada general.
4. La **barra inferior de acciones** queda fija abajo mientras se hace scroll.

## Pantalla 6 · Alta en tramitación

- **La barra de cuatro tramos se llena al entrar**, no aparece ya llena: se monta en cero y pasa al
  estado real 200 ms después (`macro-structure`). Es lo que hace que se lea "vas por aquí" en vez de
  "esto es un gráfico".
- El resto entra en cascada.

## Flujo de empresas (/empresas)

Flujo aparte del recorrido particular, en construcción paso a paso. El indicador de arriba
(`NavbarEmpresas`) es distinto al del recorrido: es una píldora que se ajusta al texto, sin
botones de "Ver demo" / "Iniciar sesión" (ya se ha entrado al flujo).

**La cabecera se queda pegada arriba y se encoge al bajar** — lo mismo en los dos flujos
(`NavbarEmpresas` y `NavbarParticulares`, que es su calco). Es `sticky`, así que acompaña
siempre; y en cuanto la página deja de estar arriba del todo pasa de 80 px de alto (20 px de aire
arriba y abajo, la medida del Figma) a unos 64 px, con 16 px arriba y abajo. Al volver arriba
recupera su altura completa. El cambio se anima con `motion-micro-states` para que no dé un salto
seco, y el umbral para considerar que "ya no está arriba" son 8 px, lo justo para que no parpadee
con el rebote del scroll de macOS (ver `useDesplazado` en `lib/prototipo.ts`).

Encogida NO lleva altura impuesta: abraza su contenido (32 px) más el padding, y de ahí salen los
~64 px. Los 80 px de arriba son una altura MÍNIMA, no fija — así la cabecera crecería sola si el
contenido no cupiera, y además el encogimiento se puede animar (de una altura a "auto" el
navegador no sabe interpolar; de 80 px a 0, sí).

### Pantalla 1 · Sube las facturas de tus sociedades

Los tres estados de la maqueta del Figma (zona vacía → subiendo → subido) **no son tres
pantallas**: es el mismo componente (`PantallaSubidaEmpresas`) reaccionando a la lista de
archivos.

1. **Zona de arrastre:** igual que en la subida particular — borde y fondo pasan a oliva y el
   icono crece un 5 % al pasar un archivo por encima (`micro-states`).
2. **Subida simulada:** no hay backend, así que cada archivo "sube" solo: el progreso avanza a
   saltos aleatorios cada 180 ms hasta el 100 %, momento en el que la barra y el "Subiendo… X%"
   se sustituyen por el tamaño del archivo. Varios archivos pueden estar en progresos distintos
   a la vez (como en el Figma: 75 %, 45 %, 15 %).
3. **Quitar un archivo:** no se borra de golpe — se encoge y se desvanece (`micro-leave`, 250 ms)
   antes de salir de la lista de verdad.
4. **Botón "Analizar facturas":** desactivado hasta que hay al menos un archivo ya subido, nombre,
   email y las dos casillas de consentimiento marcadas. El cambio de desactivado a activo lleva
   una transición de color (`micro-states`): es el momento en que "ya se puede seguir".

### Pantalla 2 · Cargando tus facturas...

Pantalla completa, sin barra superior (`PantallaCargaEmpresas`). Es la versión sencilla del Figma
de empresas: logo, una barra de progreso y el aviso de conexión segura — no confundir con
"Analizando documentación..." del recorrido particular, que tiene su lista de pasos y las cruces
girando (esta no la tiene). La barra avanza sola de 0 a 100% en ~2,4 s y, al llegar, hay un
respiro de 500 ms antes de pasar a la pantalla siguiente (mismo motivo que en la pantalla de
"Analizando": si se salta de golpe, no se llega a leer el 100%).

### Pantalla 3 · Resultado: errores y alertas

Es la MISMA pantalla que el paso 1 (`PantallaResultadoEmpresas`), después del análisis: el mismo
titular y ayuda de arriba, la zona de arrastre reducida a una barra de "añadir más", y debajo la
tarjeta de revisión con errores y alertas. Nada de esto bloquea el avance — se puede pulsar
"Calcular ahorro" con errores y alertas sin resolver.

1. **Sustituir / descartar un error:** misma técnica que quitar un archivo en el paso 1 (se
   desvanece con `micro-leave` antes de salir). Al sustituir, el archivo pasa a contar como
   correcto — el número de "archivos correctos" sube solo, sin recalcular nada a mano.
2. **Acordeón "N archivos correctos":** rejilla `0fr → 1fr` (`macro-levelup`), igual que los
   desplegables de la pantalla de recomendación — no se anima `height`.
3. **"Revisar" abre el panel de alertas** (`PanelAlertasEmpresas`): mismo patrón que "Revisar
   permanencias" del recorrido particular (`PanelPermanencias.tsx`) — portal colgado del
   `<body>`, velo + panel que entra deslizándose desde la derecha (`macro-levelup`), fichas en
   cascada que se repite al cambiar de pestaña. Se abre ya en la pestaña desde la que se pulsó
   "Revisar".
   - La ficha SÍ cambia de forma entre pestañas, no solo de dato: en "Permanencia" hay una caja
     gris con la fecha de fin y el coste de cancelación estimado, más el interruptor "Incluir de
     todos modos"; en "Vencidas" solo hay una etiqueta "Vencida" y el enlace "Subir factura
     reciente" — no hay nada que estimar, así que no hay caja ni interruptor.
   - Se cierra con la X, con Escape y pulsando fuera, igual que el panel particular.

### Pantalla 4 · Tu ahorro potencial

Al pulsar "Calcular ahorro" en la pantalla 3 (`PantallaAhorroEmpresas`). Mismo espíritu que la
pantalla 4 del recorrido particular (título + selector, tres tarjetas de plan, tabla de detalle),
con diferencias de fondo porque aquí hay varias sociedades y ubicaciones a la vez:

1. **El plan recomendado siempre en el centro** de las tres tarjetas, sin importar en qué orden
   estén en `PLANES` (`mocks/aczo.ts`): los otros dos se reparten uno a cada lado, manteniendo su
   orden relativo (`planesCentrados` en `PantallaAhorroEmpresas.tsx`).
2. **Las tres tarjetas son elegibles** (`radiogroup`, por defecto la recomendada): la tarjeta
   elegida pasa a fondo oscuro (`highlight-deep`, la misma superficie oscura fija de la tarjeta
   "Recomendado"; sin sombra ni borde) — esa es la única señal de "elegida", no hay una etiqueta
   aparte. "Recomendado" es una etiqueta fija del plan y no cambia con la elección, así que puede
   convivir con el fondo oscuro cuando ambas coinciden en la misma tarjeta. Elegir un plan distinto
   cambia TODO el módulo de abajo: el resumen, los
   interruptores de bulto y las filas de comercializadora pasan a ser las que recomiende ese plan
   (`plan.comercializadoras`, resuelto con `COMERCIALIZADORAS_POR_NOMBRE` en `mocks/aczo.ts`) — así
   "Ahorro máximo" enseña TotalEnergies + Naturgy + Octopus en vez de TotalEnergies + Repsol.
3. **Mantenimiento punto por punto:** cada fila de la tabla lleva su propio interruptor — no hay
   un único interruptor por tipo. **El de gas empieza encendido en todos los puntos** (se incluye
   en la propuesta sin tocar nada); **el de luz empieza apagado**, salvo en los puntos de más de
   30 kW (`POTENCIA_MANTENIMIENTO_AUTO` en `mocks/aczo.ts`), donde Aczo lo activa por su cuenta.
   El icono de información junto a "Mantenimiento" (columna de la tabla, un `Tooltip` — ver
   "Componentes del sistema") explica esa diferencia. Los interruptores "Mantenimiento Luz/Gas" de
   la barra de resumen son de bulto: encienden o apagan a la vez todos los puntos de ese tipo, y su
   contador (n/m) cuenta cuántos están activos en cada momento (puede quedar a medias si se han
   tocado filas sueltas). Cada punto activo descuenta su cuota (2 €/mes, en `mocks/aczo.ts`) del
   ahorro de su fila, de su comercializadora y de la tarjeta de SU plan (cada tarjeta descuenta
   solo los puntos de sus propias comercializadoras, no los de las de otro plan).
4. **Aviso del mantenimiento automático** (`AvisoMantenimientoLuz` en
   `PantallaAhorroEmpresas.tsx`). Cada interruptor de bulto lleva su propio icono `info` detrás:
   - **Gas:** un `Tooltip` normal, solo informa (va incluido desde el principio, en todos los
     puntos).
   - **Luz:** un `Tooltip` con acciones (ver "Componentes del sistema"), con **dos versiones** que
     cuentan lo mismo y solo cambian el verbo y lo que se puede hacer. Se elige según cómo esté el
     mantenimiento en ese momento:
     - **Puesto** (node 5349:32575): "…**activamos automáticamente** el mantenimiento…", con
       "Mantener activos" (cierra sin tocar nada) y "Desactivar" (los apaga todos, el contador se
       queda en 0).
     - **Apagado** (node 5355:33477): "…**recomendamos activar** el mantenimiento…", con "Activar
       mantenimiento" (los vuelve a poner) y "Desactivar" (cierra, ya está apagado).

     El botón principal es `primary highlight`. El segundo es un `secondary` con el contorno
     `border-mid` y el texto forzado a `content-inverse`, tal cual el Figma (node 5349:32585): la
     librería no tiene un secondary pensado para superficie invertida, su neutral pinta el texto en
     `content-high` y sobre la burbuja no se vería.
   - **POSICIÓN: a la derecha del icono y centrada con él** (`position="right"`, ver "Componentes
     del sistema"), con el ancho fijo de 320 px del componente del Figma. Así el aviso no tapa ni
     las tarjetas de plan de arriba ni las filas de comercializadora de abajo — abriéndose hacia
     arriba se comía la tarjeta recomendada, que es justo lo que hay que poder seguir viendo
     mientras se lee el aviso.
   - **DISPARADOR 1: se abre SOLA la primera vez que se BAJA hasta la fila de mantenimiento**, con
     la animación de siempre (`micro-appear` sobre `opacity`). Es una decisión que se ha tomado por
     la persona, así que no puede quedarse escondida detrás de un icono que a lo mejor no pulsa
     nunca. Detalles a replicar (`useAlBajarHasta` en `lib/prototipo.ts`):
     - Hacen falta **dos cosas a la vez**: que la fila se vea (`IntersectionObserver` con umbral
       0.6) **y** que ya se haya bajado algo (`scrollY > 8`, el mismo umbral antirrebote de
       `useDesplazado`). Lo segundo es lo que evita que la burbuja salte de golpe al cargar la
       pantalla: en una ventana alta la fila puede verse desde el primer momento, y ahí un aviso
       que aparece solo se lee como un susto y no como una explicación.
     - Se desconecta en cuanto salta: **una vez y se acabó**. Si no, volvería a saltar cada vez que
       se reactivara a mano uno de esos puntos, y sería un aviso plasta.
     - **No** vale el `useRevelarAlEntrar` de las animaciones de entrada: ese sí se dispara con lo
       que ya se veía al cargar, y además se da por visto si el bloque se ha quedado POR ENCIMA de
       la pantalla (para que no quede invisible tras un salto de golpe). Aquí eso abriría la
       burbuja donde nadie la ve.
     - Solo salta si de verdad hay algún mantenimiento automático activo.
   - **DISPARADOR 2: se abre SOLA la segunda vez que el mantenimiento de esos puntos se queda a
     cero**, ya con la versión de "lo recomendamos". La lógica está en `aplicarMantenimiento`, que
     es el único sitio por el que pasan TODOS los cambios de mantenimiento (interruptor de bulto,
     interruptor de fila y botones del aviso) — está centralizado justo para poder detectar ese
     momento, que no pertenece a ningún interruptor concreto:
     - **1ª vez** que se queda a cero: no se dice nada, la persona ha decidido y punto.
     - **2ª vez**: se abre el aviso recomendándolo. Es insistir una vez, no discutir.
     - **3ª y siguientes**: no se insiste más. Sería un aviso plasta, y el mensaje sigue estando a
       mano en el icono.
   - **El contador de luz va subrayado** mientras haya mantenimientos que Aczo puso por su cuenta
     (p. ej. `(2/11)`): es la pista de que ese número no lo ha elegido la persona. Al desactivarlos,
     el subrayado desaparece.
5. **Casilla por fila:** desmarcarla saca ese punto del cálculo (como si no existiera) en el
   ahorro de su comercializadora y de la tarjeta de su plan — la fila se queda atenuada
   (`opacity-40`) y su interruptor de mantenimiento se desactiva. Los "puntos de suministro" que
   se cuentan en las cabeceras NO cambian: son un dato de inventario, no del cálculo.
6. **Tabla agrupada por UBICACIÓN** (cada dirección es ya una ubicación en `mocks/aczo.ts`), no
   por sociedad: el CIF de la sociedad a la que pertenece se enseña en la cabecera de su grupo.
   Al desplegar una comercializadora (`macro-levelup`, misma técnica de rejilla `0fr → 1fr` que el
   resto de desplegables), sus ubicaciones ya se ven abiertas — cada una con su propio desplegable
   independiente, por si se quiere cerrar alguna suelta.
7. **Cada punto de suministro se despliega a su vez** (el cuarto nivel, misma técnica de rejilla
   `0fr → 1fr`): CUPS, tarifa contratada, consumo anual, potencia contratada, perfil de consumo
   (Punta/Llano/Valle) y compañía actual — el mismo contenido que `DetalleSuministro` en
   `TablaAhorro.tsx` (recorrido particular). Su flecha es independiente de la casilla y del
   interruptor de mantenimiento de la fila: se puede abrir el detalle sin tocar ninguno de los dos.
   El icono junto a "Compañía actual" lleva un `Tooltip` (ver "Componentes del sistema") que
   avisa si hay permanencia con esa compañía: hasta cuándo y qué penalización tendría cambiar
   ahora — el dato sale de `detalle.permanencia` en `mocks/aczo.ts` (no todos los puntos la
   tienen).
8. **Botón "Comparar"** de cada comercializadora: abre `PanelCompararEmpresas`, un PANEL LATERAL
   (Figma nodes 4096:19503 y 4181:44479). **No es `ModalComparar`**, que es la ventana centrada
   del recorrido particular clásico y se queda como está: este Figma pide otra forma y, sobre
   todo, otra mecánica — allí solo se miran ofertas, y aquí se ELIGE una para sustituir a la
   comercializadora desde la que se abrió.
   - Mismo patrón de panel que el de alertas (`PanelAlertasEmpresas`): portal colgado del
     `<body>`, velo, entrada deslizándose desde la derecha, cierre con la X, con Escape y
     pulsando fuera.
   - Cada compañía alternativa **se despliega** (rejilla 0fr → 1fr de siempre) para enseñar la
     ficha de la oferta (precio de energía y potencia, tipo de tarifa, permanencia y penalización)
     y sus condiciones. Desplegar NO es elegir: son dos gestos distintos, y por eso la flecha
     corta la propagación del clic.
   - La elegida se marca subiendo el borde de `border-low` a `border-mid`, sin cambiar el fondo —
     la misma señal que las filas de "Todas las ofertas" en particulares.
   - Pie fijo con "Descartar" (cierra sin tocar nada) y "Seleccionar compañía", **desactivado
     hasta que hay una elegida**. Al confirmar, la fila de origen pasa a enseñar la compañía
     elegida: su nombre, su logo, su tipo de suministro, sus puntos y su ahorro. Los puntos de
     suministro del desplegable no cambian —son los mismos—, lo que cambia es quién los sirve.
   - **Al cambiar una compañía, las tres tarjetas de arriba se DESMARCAN**: la propuesta ya no es
     ninguna de ellas, sino una hecha a medida, así que ninguna debe seguir pareciendo la
     elegida. Se sigue enseñando el contenido de la última (sus comercializadoras y sus puntos,
     que son los que se están tocando), pero sin el fondo oscuro de "seleccionada". Volver a
     pulsar una tarjeta deshace los cambios de compañía y vuelve a esa propuesta: son dos formas
     distintas de decidir y no se suman.
   - Las tres alternativas están en `ALTERNATIVAS_COMPARAR` (`mocks/aczo.ts`), ordenadas de más a
     menos ahorro. Dos son compañías inventadas —"Ahorra Energía" y "Bululú Energía", los nombres
     del Figma— y su logo también es inventado (`public/logos/`). Octopus, que sí es una marca
     real, no tiene todavía archivo de logo: en esta lista enseña su inicial en la misma caja
     cuadrada, para no romper el ritmo.
9. **Barra inferior fija** con "Atrás" (vuelve a la pantalla de resultado) y "Hacer el cambio"
   (lleva a "Cambio de compañía", pantalla 5 más abajo), igual patrón que la barra de la
   pantalla de firma del recorrido particular (`sticky`, botones alineados a los extremos). No
   aparece hasta que se ha bajado más de un 8 % del recorrido de la página
   (`useVisibleAlDesplazar` en `src/lib/prototipo.ts`, un pequeño hook que escucha el scroll):
   así, al entrar, no da la sensación de que ya se ve todo — la barra aparece (y desaparece,
   `transition-opacity motion-micro-appear`) según se baje o se suba.

### Pantalla 5 · Cambio de compañía

Al pulsar "Hacer el cambio" en la pantalla 4 (`PantallaCambioCompaniaEmpresas.tsx`). Mismo
espíritu que "Firma y apoderamiento" del recorrido particular (`PantallaFirma.tsx`) — tres
bloques a la izquierda, resumen a la derecha, barra de acciones abajo — pero con dos flujos
distintos según un interruptor, y el resumen de la derecha es dinámico (viene de
`ResumenCambioEmpresas`, la foto del plan que estaba elegido en "Tu ahorro potencial" en el
momento de pulsar "Hacer el cambio": sociedades, puntos, mantenimiento, ahorro y
comercializadoras — así el resumen de aquí siempre coincide con la tarjeta que se eligió, sea
cual sea).

1. **Datos de quien tramita:** nombre y email llegan ya rellenados con lo que se escribió en
   "Sube las facturas de tus sociedades" (pantalla 1) — viajan por `RecorridoEmpresas.tsx`
   (`datosContratante`), no hace falta volver a escribirlos.
2. **El interruptor "¿Tramitas este proceso en nombre de otra persona?" cambia el flujo entero**
   (apagado por defecto — tramita standard):
   - **Apagado (tramita standard):** aparece un bloque para verificar la identidad de quien
     tramita (foto o escaneo del DNI/NIE/pasaporte, mismo `Dropzone` con microinteracción de
     arrastre que la subida de facturas — borde y fondo `highlight-soft`, icono que crece un
     poco), y más abajo un bloque de firma: un lienzo (`<canvas>`) donde se dibuja con el ratón
     o el dedo (`FirmaCanvas`), más una casilla de declaración de poderes con los nombres de las
     sociedades ya escritos (función `listaConY`, "A, B y C").
   - **Encendido (en nombre de otra persona):** el bloque de identidad desaparece (no es esta
     persona la que se identifica) y en su lugar aparece "¿Cómo quieres autorizar el cambio?":
     dos tarjetas de opción única (`TarjetaOpcion`) que, a diferencia de `PantallaFirma.tsx`, NO
     despliegan nada por dentro — comparten un mismo hueco justo debajo de las dos, según cuál
     esté elegida:
       - **"Tengo los poderes":** una zona de subida compacta (`DropzonePoderes`, borde
         punteado, sin la casilla de icono en amarillo de la de identidad) que recicla el
         patrón de progreso de `PantallaSubidaEmpresas.tsx` (la subida de facturas): insignia
         de tipo, tamaño y botón para quitarlo, con "+ Agregar más archivos". En cuanto todos
         terminan de subir aparece, como bloque nuevo debajo, "Firma de autorización" — igual
         que en tramita standard, pero con una casilla más: confirmar que la documentación es
         veraz y responsabilizarse de su confidencialidad.
       - **"No tengo el poder, enviar solicitud de firma...":** un enlace ya generado
         (`EnlaceFirma`) con botón "Copiar" que cambia a "Copiado" 2 segundos — no hace falta
         recoger nombre ni email de quien deba firmar; el enlace se comparte por el canal que se
         prefiera, fuera de la app.
3. **IBAN por sociedad:** una tarjeta por cada sociedad incluida en el plan elegido, con nombre
   del titular, DNI e IBAN — un campo más que en el recorrido particular (aquí hace falta el DNI
   de quien firma cada domiciliación). El contador "n/3 completados" reacciona al instante
   (`motion-micro-states`), igual que en `PantallaFirma.tsx`.
4. **Todo es obligatorio:** "Activar cambio" está desactivado (`disabled`) hasta completar los
   datos de quien tramita, el IBAN de cada sociedad, y — según el interruptor y la forma de
   autorizar — la identidad más la firma, los poderes subidos más la firma, o (con "enviar
   solicitud de firma") nada más: en cuanto se elige esa opción no queda nada pendiente aquí.
5. **Firma con lienzo (`FirmaCanvas`):** el recuadro cambia de borde al pasar el ratón por
   encima y el cursor pasa a cruz; en cuanto hay un trazo aparece "Borrar firma". El lienzo mide
   su tamaño en píxeles una sola vez al montar (para que el trazo no salga borroso), así que
   redimensionar la ventana borra la firma — aceptable en un prototipo; en el repo real conviene
   un `ResizeObserver` que reescale sin perder el trazo. El color del trazo es negro fijo (no un
   token: un lienzo pinta píxeles, no puede leer variables CSS) — coincide con `content-high` en
   modo claro, el único modo del producto.
6. **Barra inferior fija**, mismo comportamiento que en "Tu ahorro potencial" (pantalla 4): no
   aparece hasta que se baja más de un 8 % de la página (`useVisibleAlDesplazar`), para que se
   note que hay más formulario debajo.

### Pantalla 6 · Alta completada / Alta en tramitación

Al pulsar "Activar cambio" (o "Confirmar solicitud", ver más abajo) en la pantalla 5
(`PantallaAltaEmpresas.tsx`). Mismo contenido de fondo que "Alta en tramitación" del recorrido
particular (`PantallaTramitacion.tsx`: barra de cuatro tramos + tarjeta de acceso al área de
cliente), pero en dos versiones según cómo haya terminado el paso anterior — lo decide
`pendienteAprobacion`, que viaja desde `RecorridoEmpresas.tsx`:

- **Alta completada** (`pendienteAprobacion` false): la propia persona autorizó el cambio — firma
  propia, o poderes ya subidos y firmados. No queda nada pendiente.
- **Alta en tramitación** (true): se eligió "No tengo el poder, enviar solicitud de firma...". El
  enlace de firma (`EnlaceFirma`, con su botón "Copiar") se repite dentro de la tarjeta de
  seguimiento, para no perderlo de vista mientras la persona representante no haya confirmado. El
  botón de la pantalla anterior (`PantallaCambioCompaniaEmpresas.tsx`) pasa a decir **"Confirmar
  solicitud"** en vez de "Activar cambio" en este caso — nada se activa todavía, solo se manda la
  solicitud de firma.

**Fidelidad al Figma — todo dentro de una sola tarjeta blanca.** Todo el contenido (titular, barra
de tramos, tarjeta de acceso y enlace de descarga) vive dentro de una única tarjeta blanca
centrada, y el panel oscuro que la rodea llega hasta los bordes de la pantalla, sin marco ni
padding alrededor — así lo marca el Figma. Antes el titular flotaba suelto sobre el fondo oscuro y
cada bloque era una tarjeta separada, con un margen de por medio: además de no coincidir con el
diseño, hacía que las cruces del patrón denso se vieran por detrás de las letras. Metiéndolo todo
en la tarjeta blanca (opaca) el problema de legibilidad desaparece solo, sin ningún recorte de CSS.

**La animación de entrada — el fondo "nace" para anunciar que el proceso ha terminado:**

1. **El fondo se construye poco a poco.** `BrandPattern` (el mismo patrón denso de cruces
   pequeñas de la pantalla "Analizando documentación") entra con su prop nueva `animado`: cada
   cruz aparece por separado, solo con opacidad (sin moverse), en cascada de **15 ms** por cruz —
   con las 138 cruces del mapa, el fondo entero tarda **algo más de dos segundos** en completarse.
   Es la pantalla que CIERRA el recorrido, así que el fondo se "construye" en vez de aparecer ya
   hecho — al revés que en la pantalla de carga, que necesita el fondo listo desde el primer
   fotograma porque ahí lo urgente es "ya está trabajando", no "algo ha terminado".
2. **Las cruces grandes de las esquinas** (`EstrellasEsquina`, dentro de
   `PantallaAltaEmpresas.tsx`) entran por encima del fondo, a modo de chispazo. Son la misma cruz
   de 4 puntas que gira en la pantalla de carga (`Icon name="spark"`, la reutiliza directamente en
   vez de dibujar un SVG nuevo). Entran con `anim-estrella-entra`: arrancan giradas -30° y a
   tamaño cero, y "aterrizan" a su sitio — la cruz que **giraba** mientras se analizaba la
   documentación ahora **se posa**, como cierre del mismo gesto.
   - Cada cruz tiene su propio retardo, en pasos de **50 ms** (`retardo(i, 50)`) — más rápido que
     la cascada normal de 60 ms del resto del contenido, para que se lea como una salva de
     chispas y no como una lista que va apareciendo.
   - Dos grupos, transcritos del Figma (no aleatorios): un tresillo apretado arriba a la
     izquierda, y una "pirámide" de 6 abajo a la derecha (más ancha por abajo).
3. **Las cruces (las grandes de las esquinas Y las del fondo) siempre en `highlight-neutral`**,
   el mismo tono apagado en las dos versiones de la pantalla: aquí el color no distingue
   "pendiente" de "completado" — de eso ya se encargan la barra de tramos y el texto del titular.
4. **La barra de cuatro tramos se llena al entrar**, no aparece ya llena: se monta en cero y pasa
   al tramo real 200 ms después (`macro-structure`) — mismo truco que la pantalla 6 del recorrido
   particular. El relleno es `success-high` (verde), tal cual el Figma de esta pantalla — es un
   tono nuevo (`tono="success"`) en el componente compartido `SegmentedProgress`
   (`src/components/ui/ProgressBar.tsx`); por defecto sigue en `highlight-muted` (oliva), así que
   la pantalla 6 del recorrido particular no cambia. Con ese tono, los tramos ya completados
   pintan su nombre en gris (`content-low`) en vez de negro — así también lo marca el Figma.
5. **El tramo "En tramitación" queda en movimiento continuo** (prop `animado` de
   `SegmentedProgress`): en cuanto se rellena hasta su marca (35 %), sigue solo, en un lazo suave
   de ida y vuelta hasta el 100 % y de nuevo a su marca (`anim-tramitacion-en-curso`, 2.4 s,
   ease-in-out) — es la microinteracción que dice "esto sigue trabajando", no "esto se ha quedado
   a medias". Es un lazo sin fin, como el giro de la pantalla de carga: no sale de los seis
   tokens de motion porque esos son para transiciones de un estado a otro, y esto es ambiental.
6. El resto (tarjeta de seguimiento, tarjeta de acceso, enlace de descarga) entra en cascada
   normal (60 ms).

## Flujo de particulares (/particulares)

Flujo aparte del recorrido particular clásico (`/recorrido`, que no se toca) y del flujo de
empresas: se entra pulsando "Calcula tu ahorro particular" en la landing. Se construye paso a
paso con la MISMA estructura que `/empresas` (subida → carga → resultado → ahorro y
recomendación → …), y en las partes que comparten mecánica, **es literalmente la misma
interacción, no una versión simplificada** — solo cambian los números (a la escala de una
vivienda: un puñado de facturas, uno o dos avisos, no una cartera de sociedades) y la copia
(habla de "tu vivienda", nunca de "sociedades").

Hasta dónde está construido:

1. **Sube tu factura** (`PantallaSubidaParticulares.tsx`): calco de `PantallaSubidaEmpresas.tsx`
   (mismo dropzone, misma subida simulada, nombre/email/consentimiento en la misma pantalla),
   con copia adaptada a una sola vivienda.
2. **Carga**: reutiliza `PantallaCargaEmpresas.tsx` tal cual — ya es genérica (logo, barra de
   progreso, aviso de conexión segura), sin nada específico de empresas que haya que quitar.
3. **Resultado: errores y alertas** (`PantallaResultadoParticulares.tsx`): calco de
   `PantallaResultadoEmpresas.tsx`, con el mismo botón "Revisar" que abre un panel lateral
   (`PanelAlertasParticulares.tsx`, calco de `PanelAlertasEmpresas.tsx`) con sus mismas dos
   pestañas, Permanencia y Vencidas. La única diferencia real de la ficha: no enseña "Sociedad"
   ni "CIF" (esa idea no existe para un particular), así que esos dos datos desaparecen y solo
   queda el CUPS.
4. **Ahorro y recomendación** (paso 02, `PantallaAhorroParticulares.tsx`): del Figma "Recomendado
   para ti" — aquí SÍ hay una diferencia real de fondo con `PantallaAhorroEmpresas.tsx`, porque
   con solo dos puntos de suministro (luz y gas de esta vivienda) no tiene sentido agrupar por
   sociedad ni por dirección:
   - **Tres tarjetas destacadas por un motivo distinto cada una** ("Ahorro Aczo" / "La más
     completa" / "La más flexible"), no tres niveles de ahorro. La de "La más completa" lleva la
     etiqueta "Recomendado" y sale elegida por defecto (fondo oscuro, sin sombra ni borde — misma
     señal de "elegida" que en empresas).
   - **Cada tarjeta lleva su propio interruptor "Condiciones"/"Detalles"**, independiente de la
     selección (corta la propagación del clic para no elegir la tarjeta sin querer al tocarlo):
     Condiciones enseña la lista de ventajas; Detalles la sustituye por la ficha técnica de los
     dos puntos de la vivienda (CUPS, tarifa, consumo, compañía actual).
   - **Debajo, "Todas las ofertas"**: el resto de compañías, con menos ahorro y que no siempre
     cubren los dos puntos. Cada fila se despliega (misma rejilla 0fr → 1fr de siempre) en la
     MISMA tabla que empresas — punto de suministro con su casilla, tipo, coste actual, ahorro
     potencial y mantenimiento —, y cada punto se abre a su vez en su ficha técnica, que ya es
     literalmente el mismo componente en los dos flujos (`DetalleTecnicoSuministro.tsx`). La
     tabla no lleva caja propia: las únicas líneas son las que separan un punto del siguiente.
     Desplegar no selecciona. Quitar la casilla de un punto lo saca del cálculo de TODAS las tarjetas y
     ofertas que lo cubrían: como en los mocks el ahorro de cada compañía es una cifra global,
     se reparte entre sus puntos en proporción al ahorro propio de cada uno y se suman solo los
     que siguen marcados.
   - **Selección única entre las tres tarjetas de arriba Y las ofertas de abajo**: un solo
     `radiogroup` repartido en dos bloques — elegir una de un lado desselecciona cualquiera del
     otro.
   - **El selector empieza en "Ver ahorro mensual"**, al revés que en empresas (que empieza en
     anual) — así lo marca este Figma.
   - **El mantenimiento se activa por tipo** (un interruptor para Luz, otro para Gas, sin
     contador n/m porque solo hay un punto de cada) y descuenta su cuota de cualquier tarjeta u
     oferta que cubra ese tipo (`conMantenimientoMixto`, la misma función que usa empresas). Los
     dos empiezan APAGADOS: aquí el mantenimiento no viene incluido de serie (en empresas el de
     gas sí), y el tooltip de la columna "Mantenimiento" lo dice con esas palabras. El
     interruptor de la tabla es ESE MISMO, no otro: con un solo punto por tipo, "el
     mantenimiento de la luz" y "el de este punto de luz" son la misma cosa, así que comparten
     estado y se mueven a la vez.

5. **Cambio de compañía** (paso 03, `PantallaCambioCompaniaParticulares.tsx`): del Figma
   node 4105:32954. Aparece al pulsar "Hacer el cambio". La idea de la pantalla es que casi todo
   llegue ya relleno y solo queden el IBAN y la firma:
   - **Nombre y email** vienen de lo que se escribió en el paso 1 (los arrastra
     `RecorridoParticulares` desde `PantallaSubidaParticulares`).
   - **DNI y toda la dirección del suministro** salen "leídos de la factura"
     (`DATOS_LEIDOS_PARTICULARES` en `mocks/aczo.ts`), y el bloque lo dice con la etiqueta
     "Detectados de tu factura". El **CUPS** también, pero va bloqueado: identifica el punto de
     suministro, no es algo que se corrija a mano.
   - **Titular** de la cuenta se rellena con el nombre de la persona; **IBAN y firma** son lo
     único vacío.
   - "Activar cambio" está desactivado hasta que hay IBAN, firma y consentimiento de la
     domiciliación.
   - La columna derecha lleva el resumen de lo elegido en el paso 02 (comercializadora, puntos
     incluidos, mantenimiento y ahorro — se calcula al pulsar "Hacer el cambio", así que refleja
     los puntos que se hayan dejado fuera) y la banda oscura "Aczo garantiza".
   - Diferencias con la misma pantalla de empresas: aquí no hay sociedades ni apoderados, así que
     desaparecen el interruptor "¿tramitas en nombre de otra persona?", los poderes de
     representación, el enlace de firma y el IBAN por sociedad. Las piezas que sí son idénticas
     (tarjeta blanca, cabecera, fila de resumen, zona de subida del DNI y recuadro de firma) ya no
     están duplicadas: viven en `PiezasCambioCompania.tsx` y las usan los dos flujos.
   - Animaciones: las mismas que en empresas, porque son las mismas piezas — arrastrar el DNI tiñe
     la zona de `highlight-soft` y agranda el icono, el recuadro de firma cambia de borde al pasar
     por encima y el cursor pasa a cruz, "Borrar firma" aparece en cuanto hay trazo, y la barra
     inferior no se ve hasta que se empieza a bajar (`useVisibleAlDesplazar`).

6. **Seguimiento** (paso 04): del Figma node 4136:42677. Aparece al pulsar "Activar cambio".
   Es **la misma pantalla que en empresas**, así que reutiliza `PantallaAltaEmpresas.tsx` tal cual
   (igual que la pantalla de carga), siempre en su variante "alta completada" — aquí no existe la
   figura del apoderado que tenga que firmar aparte, eso solo pasa en empresas. Lo único que se le
   pasa es el email escrito en el paso 1, que sale tapado en el bloque de credenciales
   ("laura@gmail.com" → "la•••@gmail.com").
   - Animaciones: las que ya tenía esa pantalla — el fondo de cruces que se construye en cascada,
     las cruces grandes de las esquinas entrando a modo de chispazo y la barra de cuatro tramos
     que se llena al entrar (con "En tramitación" en movimiento continuo).

## Landing (`/`) · las secciones entran al bajar

La landing usa **la misma entrada que los recorridos** (`anim-aparece`: sube 8 px y aparece,
`macro-levelup` / 350 ms, con la misma cascada de 60 ms entre bloques de una misma sección).
Lo único que cambia es **cuándo se dispara**.

En los recorridos cada pantalla se ve entera de una vez, así que la cascada arranca al montarla.
La landing es una página larga que se recorre bajando: si todo se animara al cargar, lo de abajo
se habría movido sin que nadie lo viera. Aquí cada bloque **espera a asomar por la pantalla**.

| | |
| --- | --- |
| Qué lo dispara | que se vea al menos el **15 %** del bloque (`IntersectionObserver`) |
| Animación | `anim-aparece` — 8 px hacia arriba + opacidad, `macro-levelup` |
| Antes de entrar | `anim-espera`: el bloque está en el fotograma 0 de esa animación, así que al entrar continúa sin ningún salto |
| Cascada | 60 ms entre los bloques de una misma sección (`retardo`) |
| Repetición | **una sola vez**. Al volver a subir no se repite: sería mareante en una página que se recorre arriba y abajo |

**Tres casos que hay que respetar al reimplementarlo**, porque si no hay contenido que se queda
invisible para siempre:

1. Si se **salta de golpe** por encima de un bloque (un enlace que baja a una sección, recargar
   con la página ya bajada, un scroll muy rápido), el bloque no llega a asomar nunca → se enseña
   igualmente si ya ha quedado por encima de la pantalla.
2. **No se recorta la pantalla con un margen negativo** para "esperar a estar un poco dentro".
   Ese margen deja una franja muerta abajo del todo, y lo que cae ahí al final de la página (la
   línea legal del pie, por ejemplo) no puede salir de ella por mucho que se baje. Por eso el
   criterio es un porcentaje del bloque visible, no un recorte de la pantalla.
3. Un bloque **más alto que la pantalla** nunca puede enseñar su 15 %: con que llene media
   pantalla, ya cuenta como entrado.

Bloques que entran, en orden: título del hero → las dos tarjetas de calculadora → la barra de
ventajas → cabecera de "Por qué Aczo" → sus cuatro tarjetas (en cascada) → texto y logos de la
comparativa → las dos partes del pie.

### La cinta de logos

Los logos de "Comparamos entre las principales compañías del mercado" **pasan sin parar de
izquierda a derecha**. Es ambiente, no información: no se puede parar, ni tiene controles, ni
hace falta llegar al final para enterarse de nada (los logos van repetidos).

| | |
| --- | --- |
| Recorrido | 60 s por vuelta, **lineal**, sin fin |
| Sentido | de izquierda a derecha (`translateX` de `-50 %` a `0`) |
| Bordes | dos degradados al color de fondo, para que la fila no se corte en seco |

Ni la duración ni la curva salen de los seis tokens de motion: esos son para transiciones de un
estado a otro, y esto es un lazo ambiental sin fin — el mismo caso que el giro de la pantalla de
carga y el pulso de la barra de seguimiento. Una cinta **tiene que ir a velocidad constante**:
cualquier easing la haría acelerar y frenar en cada vuelta y delataría la costura.

**El truco para que el bucle no se vea:** dentro hay **dos copias idénticas** de la fila, una
detrás de otra, y el recorrido es exactamente la mitad de la cinta (el ancho de una copia). Al
volver a empezar, la cinta está pintando lo mismo que al acabar. Para que la costura tenga el
mismo hueco que el resto, la separación de cada copia va como **relleno por la derecha** y no
como hueco entre copias — así cada copia mide justo la mitad. La segunda copia es decorado, así
que va oculta a los lectores de pantalla.

Con "menos movimiento" activado la cinta se queda quieta con los logos a la vista (la regla
global deja la animación en una sola pasada de 0,01 ms, y su fotograma final es la posición
normal).

Está en `useRevelarAlEntrar` (`src/lib/prototipo.ts`) y en el componente que lo envuelve,
`src/components/prototipo/Revelar.tsx`. Va en su propio archivo con `"use client"` para que
`Landing.tsx` pueda seguir siendo un componente de servidor.

> ⚠️ Al envolver un bloque en `<Revelar>`, **las opacidades de estilo (`opacity-60`, `opacity-50`)
> tienen que ir por dentro**, no en el propio `Revelar`. La animación termina fijando la opacidad
> a 1 (`animation-fill-mode: both`) y se las comería.

## Transición entre pantallas

Cada pantalla entra desplazándose **24 px** y apareciendo. La dirección depende de hacia dónde se va:

| Sentido | Desde | Token |
| --- | --- | --- |
| Hacia delante | abajo | `macro-levelup` (350 ms) |
| Hacia atrás | arriba | `macro-leveldown` (400 ms) |

(Antes entraba en horizontal, desde los laterales — se cambió a vertical porque quedaba
demasiado sutil como para leerse bien; el gesto de subir/bajar además encaja mejor con los
nombres de los propios tokens, `levelup`/`leveldown`.)

**Navegación:** hacia delante solo con los botones de cada pantalla (hay datos que rellenar). Hacia
atrás, además, pulsando un paso ya completado en el indicador de la barra superior. Los pasos
pendientes no son pulsables.

El indicador anima el color del número y de la etiqueta en `micro-states`, acompañando a la
transición de pantalla.

## Dónde está cada cosa

```
src/
  app/
    globals.css                tokens + utilidades de motion y de animación
    recorrido/page.tsx          la ruta del recorrido particular clásico
    empresas/page.tsx           la ruta del flujo de empresas
    particulares/page.tsx       la ruta del flujo de particulares (nuevo)
  components/
    brand/                      logo y patrón de cruces
    prototipo/                  una pantalla por archivo + Recorrido.tsx
      Revelar.tsx                   envuelve un bloque de la landing para que
                                    entre cuando asoma por la pantalla
      DetalleTecnicoSuministro.tsx  la ficha técnica de un punto, compartida por
                                    las tablas de empresas y de particulares
      PiezasCambioCompania.tsx      tarjeta, cabecera, fila de resumen, subida
                                    del DNI y recuadro de firma — las comparten
                                    las dos pantallas del paso 03
      empresas/                 pantallas y navbar propios del flujo de empresas
      particulares/             pantallas y navbar propios del flujo de particulares
    ui/                         componentes del sistema de diseño
  lib/
    motion.ts                   tokens de motion en JavaScript
    prototipo.ts                utilidades pequeñas (cascada, formato)
  mocks/
    aczo.ts                     TODOS los datos de mentira, en un solo archivo
```
