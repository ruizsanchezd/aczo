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
    recorrido/page.tsx          la ruta del prototipo
  components/
    brand/                      logo y patrón de cruces
    prototipo/                  una pantalla por archivo + Recorrido.tsx
    ui/                         componentes del sistema de diseño
  lib/
    motion.ts                   tokens de motion en JavaScript
    prototipo.ts                utilidades pequeñas (cascada, formato)
  mocks/
    aczo.ts                     TODOS los datos de mentira, en un solo archivo
```
