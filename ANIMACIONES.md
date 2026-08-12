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
  color, tiempos) y en la práctica cuesta acertar sobre un icono pequeño. Se dibuja a mano:
  fondo `background-high` (negro fijo, no cambia entre modos) y texto `content-always-light`,
  con `shadow-md`.
- **Posición:** ancla su borde derecho al del icono y crece hacia la izquierda (`position="top"`
  o `"bottom"` según convenga). Centrarlo sobre el icono lo saca por fuera de la tarjeta cuando el
  icono está pegado al lado derecho de su fila, que es el caso más habitual.

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
   en la propuesta sin tocar nada); **el de luz empieza apagado** y hay que activarlo si se quiere.
   El icono de información junto a "Mantenimiento" (columna de la tabla, un `Tooltip` — ver
   "Componentes del sistema") explica esa diferencia. Los interruptores "Mantenimiento Luz/Gas" de
   la barra de resumen son de bulto: encienden o apagan a la vez todos los puntos de ese tipo, y su
   contador (n/m) cuenta cuántos están activos en cada momento (puede quedar a medias si se han
   tocado filas sueltas). Cada punto activo descuenta su cuota (2 €/mes, en `mocks/aczo.ts`) del
   ahorro de su fila, de su comercializadora y de la tarjeta de SU plan (cada tarjeta descuenta
   solo los puntos de sus propias comercializadoras, no los de las de otro plan).
4. **Casilla por fila:** desmarcarla saca ese punto del cálculo (como si no existiera) en el
   ahorro de su comercializadora y de la tarjeta de su plan — la fila se queda atenuada
   (`opacity-40`) y su interruptor de mantenimiento se desactiva. Los "puntos de suministro" que
   se cuentan en las cabeceras NO cambian: son un dato de inventario, no del cálculo.
5. **Tabla agrupada por UBICACIÓN** (cada dirección es ya una ubicación en `mocks/aczo.ts`), no
   por sociedad: el CIF de la sociedad a la que pertenece se enseña en la cabecera de su grupo.
   Al desplegar una comercializadora (`macro-levelup`, misma técnica de rejilla `0fr → 1fr` que el
   resto de desplegables), sus ubicaciones ya se ven abiertas — cada una con su propio desplegable
   independiente, por si se quiere cerrar alguna suelta.
6. **Cada punto de suministro se despliega a su vez** (el cuarto nivel, misma técnica de rejilla
   `0fr → 1fr`): CUPS, tarifa contratada, consumo anual, potencia contratada, perfil de consumo
   (Punta/Llano/Valle) y compañía actual — el mismo contenido que `DetalleSuministro` en
   `TablaAhorro.tsx` (recorrido particular). Su flecha es independiente de la casilla y del
   interruptor de mantenimiento de la fila: se puede abrir el detalle sin tocar ninguno de los dos.
   El icono junto a "Compañía actual" lleva un `Tooltip` (ver "Componentes del sistema") que
   avisa si hay permanencia con esa compañía: hasta cuándo y qué penalización tendría cambiar
   ahora — el dato sale de `detalle.permanencia` en `mocks/aczo.ts` (no todos los puntos la
   tienen).
7. **Botón "Comparar"** de cada comercializadora: abre la misma ventana de comparación
   (`ModalComparar`) que el recorrido particular.
8. **Barra inferior fija** con "Atrás" (vuelve a la pantalla de resultado) y "Hacer el cambio"
   (lleva a "Cambio de compañía", pantalla 5 más abajo), igual patrón que la barra de la
   pantalla de firma del recorrido particular (`sticky`, botones alineados a los extremos).

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

### Pantalla 6 · Alta completada / Alta en tramitación

Al pulsar "Activar cambio" en la pantalla 5 (`PantallaAltaEmpresas.tsx`). Mismo contenido de fondo
que "Alta en tramitación" del recorrido particular (`PantallaTramitacion.tsx`: barra de cuatro
tramos + tarjeta de acceso al área de cliente), pero en dos versiones según cómo haya terminado el
paso anterior — lo decide `pendienteAprobacion`, que viaja desde `RecorridoEmpresas.tsx`:

- **Alta completada** (`pendienteAprobacion` false): la propia persona autorizó el cambio — firma
  propia, o poderes ya subidos y firmados. No queda nada pendiente.
- **Alta en tramitación** (true): se eligió "No tengo el poder, enviar solicitud de firma...". El
  enlace de firma (`EnlaceFirma`, con su botón "Copiar") se repite dentro de la tarjeta de
  seguimiento, para no perderlo de vista mientras la persona representante no haya confirmado.

**La animación de entrada — el "chispazo" que anuncia que el proceso ha terminado:**

1. **Las cruces de las esquinas** (`EstrellasEsquina`, dentro de `PantallaAltaEmpresas.tsx`) son
   la misma cruz de 4 puntas que gira en la pantalla de carga (`Icon name="spark"`, la reutiliza
   directamente en vez de dibujar un SVG nuevo). Entran con `anim-estrella-entra`: arrancan
   giradas -30° y a tamaño cero, y "aterrizan" a su sitio — la cruz que **giraba** mientras se
   analizaba la documentación ahora **se posa**, como cierre del mismo gesto.
   - Cada cruz tiene su propio retardo, en pasos de **50 ms** (`retardo(i, 50)`) — más rápido que
     la cascada normal de 60 ms del resto del contenido, para que se lea como una salva de
     chispas y no como una lista que va apareciendo.
   - Dos grupos, transcritos del Figma (no aleatorios): un tresillo apretado arriba a la
     izquierda, y una "pirámide" de 6 abajo a la derecha (más ancha por abajo).
2. **El color de las cruces cuenta el estado**, mismo lenguaje que el resto del sistema (el
   "Recomendado" de las tarjetas de plan también es `vivid`):
   - `highlight-neutral` (el tono apagado de siempre) — Alta completada, no hace falta nada más.
   - `highlight-vivid` (el amarillo de marca) — Alta en tramitación, todavía hay una acción
     pendiente (que la persona representante firme).
3. **La barra de cuatro tramos se llena al entrar**, no aparece ya llena: se monta en cero y pasa
   al tramo real 200 ms después (`macro-structure`) — mismo truco que la pantalla 6 del recorrido
   particular.
4. El resto (tarjeta de seguimiento, tarjeta de acceso, enlace de descarga) entra en cascada
   normal (60 ms).

> **Nota de fidelidad:** el Figma de esta pantalla pinta el relleno de la barra de tramos en
> `success/high` (verde), mientras que el componente compartido `SegmentedProgress` (en
> `src/components/ui/ProgressBar.tsx`) usa `highlight-muted` (oliva) — el mismo que ya lleva la
> pantalla 6 del recorrido particular. Se ha mantenido el componente tal cual para no cambiar el
> aspecto de esa otra pantalla sin que se pida; si se quiere el verde exacto del Figma, hay que
> decidir si se cambia el componente compartido (afecta a las dos pantallas) o se le añade un tono.

## Transición entre pantallas

Cada pantalla entra desplazándose **24 px** y apareciendo. La dirección depende de hacia dónde se va:

| Sentido | Desde | Token |
| --- | --- | --- |
| Hacia delante | derecha | `macro-levelup` (350 ms) |
| Hacia atrás | izquierda | `macro-leveldown` (400 ms) |

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
    recorrido/page.tsx          la ruta del recorrido particular
    empresas/page.tsx           la ruta del flujo de empresas
  components/
    brand/                      logo y patrón de cruces
    prototipo/                  una pantalla por archivo + Recorrido.tsx
      empresas/                 pantallas y navbar propios del flujo de empresas
    ui/                         componentes del sistema de diseño
  lib/
    motion.ts                   tokens de motion en JavaScript
    prototipo.ts                utilidades pequeñas (cascada, formato)
  mocks/
    aczo.ts                     TODOS los datos de mentira, en un solo archivo
```
