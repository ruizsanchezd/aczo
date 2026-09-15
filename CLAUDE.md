# CLAUDE.md

Guía para Claude Code (y para cualquiera que trabaje en este repo).

## Para quién es este repo (y cómo hablarle)

Quien usa este repo es **el equipo de diseño: personas NO técnicas**. No saben git, ni consola,
ni programación. Trabajan a través tuya (Claude). Por eso, en TODO momento:

- **Habla en español, claro y sin jerga.** Nada de "HEAD", "upstream", "staging", "rebase",
  "detached", etc. Traduce siempre: rama = "hoja de trabajo", commit = "punto de guardado",
  push = "subir a internet", PR = "propuesta para revisar".
- **Nunca muestres errores técnicos en crudo.** Si un comando falla, explica en una frase qué
  pasó y qué se puede hacer, con calma. No pegues el volcado de error tal cual.
- **Explica lo que vas a hacer ANTES de hacerlo** y, cuando algo sea delicado, **pide
  confirmación** con una pregunta de sí/no sencilla.
- **Tranquiliza.** Deja claro que no se puede romper nada grave y que su trabajo está a salvo.
- **No des por sentado conocimiento técnico.** Si necesitas que hagan algo (p. ej. autenticarse),
  dales los pasos exactos, palabra por palabra.

## Reglas de seguridad con git (guardrails — aplican SIEMPRE)

Estas reglas valen para cualquier acción de git/GitHub, la pidan por comando o en lenguaje normal:

- 🚫 **Nunca** uses operaciones destructivas sin confirmación explícita y una explicación previa:
  nada de `git reset --hard`, `git push --force` / `--force-with-lease`, `git clean -fd`,
  `git rebase`, `git branch -D`, ni `checkout .`/`restore` que descarte cambios.
- 🚫 **Nunca** trabajes ni hagas commits directamente en `main`. El trabajo va siempre en una
  rama `feature/*`. Si detectas que están en `main`, avisa y ofrece crear una rama.
- 🚫 **Nunca** subas secretos ni basura: `.env`, tokens, claves, `node_modules/`. Si aparecen en
  los cambios, avisa y déjalos fuera.
- 🛟 **Ante la duda, para y pregunta.** Es mejor una pregunta de más que perder trabajo.
- 🛟 **No pierdas cambios sin guardar.** Antes de cambiar de rama u operaciones que puedan
  descartar trabajo, comprueba si hay cambios sin guardar y ofrece guardarlos primero.
- ✅ Si algo se tuerce, prioriza **explicar la situación en lenguaje sencillo** y proponer el
  siguiente paso seguro, en vez de intentar arreglos avanzados por tu cuenta.

## Qué es este repositorio

Este es un **repositorio de prototipo** del proyecto **Aczo**. Su única
finalidad es **animar y prototipar diseños de Figma** para poder ver cómo quedarían ya en
movimiento: transiciones, microinteracciones, gestos, estados hover/pressed, entradas y salidas
de elementos, etc.

- **Figma es la fuente de la verdad** para el diseño visual (layout, colores, tipografía,
  espaciados, componentes). Este repo NO redefine el diseño; lo pone en movimiento.
- **Este repo es la referencia de comportamiento/animación.** Aporta el "cómo se siente":
  timings, easings, secuencias, físicas, interacciones.
- Lo usa el **equipo de diseño** para prototipar rápido, y luego sirve como **guía** para que,
  en **otro repositorio** (el real de producto), el desarrollador de frontend implemente e
  integre basándose en (1) el Figma original y (2) las interacciones/animaciones de aquí.

## Referencias de diseño (Figma — fuente de la verdad)

Estos son los archivos de Figma del proyecto. Ante cualquier duda visual, se consulta aquí:

- **Librería (componentes):**
  https://www.figma.com/design/eNrvz49FS5eoTgNh8afYVV/?node-id=115572-774&p=f&t=lUMi7l4rti9dY9os-11
- **Branding (identidad visual):**
  https://www.figma.com/design/iNHB9TlL3cgsr3h3G83Ro2/?node-id=162-10521&t=0YH21nlVGJ8BM6E5-11
- **UI Design (pantallas):**
  https://www.figma.com/design/VcYbjrFgIE3U8QMwY24m9a/Tavira-C%C3%A1pital--Aczo--%7C-Master?node-id=0-1&t=406E4zLLpMyU3cof-1

## Qué NO es

- ❌ No es producción. No es la app real.
- ❌ No se conecta a ningún backend real, API real ni base de datos. **Todo son datos mock.**
- ❌ No hay autenticación real, pagos reales, ni llamadas de red de verdad. Si se necesita
  simular una respuesta, se hace con datos falsos locales y, si acaso, un retardo simulado.
- ❌ No es un lugar para arquitectura "de verdad": nada de over-engineering, capas
  innecesarias, tests exhaustivos, CI complejo o abstracciones prematuras.

## Principios al escribir código aquí

1. **Fidelidad al Figma primero.** Si algo se ve distinto al Figma, es un bug. Ante la duda
   sobre un valor visual, sigue el Figma; no inventes.
2. **🚫 Tokens SIEMPRE. Prohibido hardcodear valores.** Todo valor visual sale de un token del
   sistema de diseño: color, tipografía, espaciado, radio, borde, sombra, duración y easing.
   Nunca escribas el valor a pelo, ni siquiera "solo por probar".

   | ❌ Prohibido | ✅ Así sí |
   | --- | --- |
   | `#f6fe01`, `rgb(246,254,1)`, `bg-yellow-300` | `bg-highlight-vivid` |
   | `text-zinc-500`, `text-[#4d4d4d]` | `text-content-mid` |
   | `p-[16px]`, `p-4`, `gap-[24px]` | `p-04`, `gap-06` |
   | `rounded-[8px]`, `rounded-xl` | `rounded-md` |
   | `duration-300`, `ease-[0,0,0.58,1]` | `motion-micro-appear` |
   | `text-sm`, `text-[14px]`, `font-medium` | `text-label-m` (o `<Text variant="label-m">`) |
   | `shadow-lg`, `box-shadow: 0 2px 4px…` | `shadow-md` |

   Ojo con las clases **por defecto de Tailwind** que parecen inocentes pero no son del sistema:
   `p-4`, `text-sm`, `gap-2`, `text-gray-500`, `rounded-xl`, `duration-200`… Todas prohibidas.
   La lista de lo que sí existe está en `/estilos` y en la tabla de la sección **Tokens**.

   **Si el token que necesitas no existe:** no te lo inventes ni improvises un valor. Para,
   dilo, y pregunta si hay que sacarlo del Figma o si se está usando el token equivocado. Las
   dos únicas excepciones son valores que no son de diseño (p. ej. `max-w-[52ch]` para medir
   una línea de texto, o una distancia concreta de una animación puntual) y hay que comentar
   en el código por qué va a pelo.
3. **La animación es el producto.** Cuida especialmente duración, easing, orden/stagger,
   interrupciones y que respete `prefers-reduced-motion`. Que se sienta natural, no robótico.
4. **Datos mock, siempre locales.** Guárdalos en archivos tipo `mocks/` o `fixtures/` y que
   sean fáciles de encontrar y editar. Nada de claves, tokens ni endpoints reales.
5. **Código legible como referencia.** Otra persona lo va a leer para reimplementarlo en el
   repo real. Prioriza claridad sobre "listura". Comenta el POR QUÉ de una animación cuando no
   sea obvio (p. ej. por qué ese easing o esa duración).
6. **Simplicidad.** Prefiere lo mínimo que consiga el efecto. No añadas dependencias pesadas si
   no aportan a la animación/prototipo.
7. **Documenta lo que el dev de frontend necesita replicar.** En cada pantalla/interacción no
   trivial, deja claro: qué dispara la animación, duración, easing/curva, y estados.
8. **Todo se componentiza y se documenta en Storybook.** Cualquier elemento visual reutilizable
   de la interfaz (botones, campos, tarjetas, etiquetas, alertas...) va como componente propio en
   `src/components/ui/` (o en `src/components/prototipo/` si es específico de una pantalla), y
   **siempre acompañado de su Story** (`NombreComponente.stories.tsx`, junto al componente) con
   `tags: ["autodocs"]` para que Storybook genere su página de documentación sola. Cuando se crea
   o se cambia un componente, la Story se crea o se actualiza en el mismo cambio — no después.
   Cada Story debe cubrir las variantes y estados reales del componente (tamaños, tonos,
   desactivado, error...), no solo el caso por defecto.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript.
- **Estilos:** Tailwind CSS v4, con los tokens del Figma en `src/app/globals.css`.
- **Componentes:** sin librería de componentes (nada de shadcn/ui). Los componentes del sistema
  de diseño están hechos a mano en `src/components/ui/`, uno por archivo, a partir de la
  documentación de la librería de Figma: `Button`, `Input` (con `Textarea`, `Select`,
  `PasswordInput`, `SearchInput`), `Checkbox`, `Radio`, `Switch`, `Tag`, `ProgressBar`
  (+ `SegmentedProgress`), `Alert`, `Tooltip`, `Icon` y `Text`.
- **Animación:** sin librería. Todo con CSS/Tailwind usando las utilidades de motion y unas
  pocas animaciones de una pasada definidas en `globals.css` (`anim-*`). Si alguna interacción
  llega a necesitar gestos o timelines de verdad, valorar añadir `motion` y documentarlo aquí.
- **Storybook:** documentación viva de los componentes, para desarrollo. Cada componente de
  `src/components/ui/` tiene su `NombreComponente.stories.tsx` al lado, con `tags: ["autodocs"]`.
  Addons instalados: `@storybook/addon-a11y` (comprobaciones de accesibilidad) y
  `@storybook/addon-docs` (genera la página de documentación de cada componente). Arranca con
  `npm run storybook` (servidor en `http://localhost:6006`). Ver el **principio 8**.

### Tokens del sistema de diseño

Los tokens están extraídos de las variables del Figma **Library** y viven en dos sitios:

- `src/app/globals.css` — todos los tokens como utilidades de Tailwind.
- `src/lib/motion.ts` — los tokens de motion en JavaScript, para animar desde código.

Hay una página de referencia en **`/estilos`** que los pinta todos: sirve para abrirla al lado
del Figma y comprobar que coinciden. Si algo no cuadra, es un bug.

Recuerda el **principio 2**: tokens siempre, hardcodear valores está prohibido. Esta tabla es
la referencia de lo que existe.

| Familia | Cómo se usa | Ejemplos |
| --- | --- | --- |
| Color | `bg-*`, `text-*`, `border-*` | `bg-background-low`, `text-content-mid`, `border-border-low`, `bg-highlight-vivid` |
| Tipografía | `text-<familia>-<talla>` | `text-body-m`, `text-label-s`, `text-title-l`, `text-heading-xl` (+ `font-heading`) |
| Espaciado | escala `00`–`10` | `p-04` (16px), `gap-06` (24px), `mt-02` (8px) |
| Radios | `rounded-*` | `rounded-sm` (4), `rounded-md` (8), `rounded-lg` (16), `rounded-full` (999) |
| Sombra | `shadow-md` | el único `style-shadow-m` del Figma |
| Motion | `motion-*` | `motion-micro-states`, `motion-macro-levelup` |
| Sección | `layout-section` | ancho máximo + padding lateral responsive |

Para tipografía se puede usar el componente `<Text variant="…">` de
`src/components/ui/Text.tsx`, que ya aplica familia, tamaño, interlineado y peso correctos.

**Motion:** las utilidades `motion-*` fijan duración y curva de una vez; hay que añadir la
propiedad a animar (`transition-colors`, `transition-transform`…). Los seis tokens semánticos
son `micro-states`, `micro-leave`, `micro-appear`, `macro-levelup`, `macro-leveldown` y
`macro-structure`. `prefers-reduced-motion` ya está respetado globalmente.

### Modo claro y oscuro

**El producto va SIEMPRE en modo claro.** Lo fuerza `data-theme="light"` en el `<html>` de
`src/app/layout.tsx`. El modo oscuro está implementado y se queda **en la recámara** por si algún
día se activa: para volver a que siga el ajuste del sistema de cada persona, basta con quitar ese
atributo. No hay nada más que cambiar.

> ⚠️ **No confundir "modo oscuro" con "superficie oscura".** Son dos cosas distintas:
>
> - **Modo oscuro:** toda la interfaz cambia según el ajuste del sistema. Desactivado.
> - **Superficie oscura:** una pieza concreta que es oscura **siempre**, también en modo claro.
>   Es el caso de la tarjeta "Ahorro Aczo", el fondo de la pantalla de carga y la banda "Aczo
>   garantiza". Estas se hacen con tokens que **no cambian entre modos** (`highlight-deep`,
>   `highlight-muted`, la familia `highlight` en general) y con textos `content-always-light` /
>   `content-always-dark` en lugar de `content-high` / `content-inverse`.
>
> Si pintas texto sobre una superficie oscura con `text-content-high`, funcionará en claro y se
> volverá invisible el día que se active el oscuro. Usa siempre los `always-*` ahí.

Los dos modos del Figma están implementados. **No hay que hacer nada especial para
soportarlos:** si usas los tokens de color, el cambio de modo ya funciona solo. No escribas
variantes `dark:` a mano.

Los tokens que cambian se declaran en `globals.css` como `light-dark(claro, oscuro)`, así que
los dos valores viven juntos. Los que aparecen con un solo valor es porque el Figma los define
iguales en ambos modos (la familia `highlight`, la paleta `extended`, los `high` de feedback,
`content-always-*`, `background-high` y `background-overlay`).

Qué modo se aplica lo decide `color-scheme`:

- `data-theme="light"` en `<html>` fuerza el claro. **Es lo que hay puesto ahora.**
- `data-theme="dark"` fuerza el oscuro.
- Sin el atributo, manda el ajuste del sistema de cada persona.

En `/estilos` hay un interruptor (`ThemeToggle`) para ver los dos modos y comprobar que el oscuro
sigue sano. No guarda la elección: al recargar vuelve a "Claro".

### Fuentes

- `body`, `label` y `title` → **Inter** (gratuita, se carga de Google Fonts).
- `heading` → **Bradford LL TT Medium**, la fuente de marca. Es la real, licenciada; el archivo
  está en `src/fonts/`. Se usa con `font-heading` o con `<Text variant="heading-*">`.

Las dos se cargan en `src/app/layout.tsx`, que define `--font-inter` y `--font-bradford`. Esos
nombres **no pueden coincidir** con los tokens `--font-sans` / `--font-heading` de `@theme`, o
las variables se referenciarían a sí mismas. Ver `src/fonts/README.md`.
### Qué hay construido

- **`/recorrido`** — el recorrido completo del prototipo, las seis pantallas del Figma de UI
  Design: subida de facturas → datos → análisis → recomendación → firma → alta en tramitación.
  Cada pantalla es un archivo en `src/components/prototipo/`, y `Recorrido.tsx` las une.
- **`/empresas`** — el flujo de empresas, en construcción paso a paso desde el Figma máster
  (frame "Aczo / Landing / Desktop", sección "Subida de documentos"). `RecorridoEmpresas.tsx` une
  las vistas, igual que `Recorrido.tsx` en el particular. De momento están: subir las facturas de
  varias sociedades (`PantallaSubidaEmpresas`), la pantalla de carga (`PantallaCargaEmpresas`), el
  resultado con errores y alertas (`PantallaResultadoEmpresas` + el panel `PanelAlertasEmpresas`,
  con pestañas "Permanencia"/"Vencidas") y "Tu ahorro potencial" agrupado por sociedad
  (`PantallaAhorroEmpresas`) — donde el mantenimiento de luz de los puntos de más de 30 kW llega
  ya activado y un aviso con acciones lo explica: se abre solo la primera vez que se baja hasta esa
  fila (nunca al cargar la pantalla) y, si se desactiva por segunda vez, vuelve a salir cambiando
  el "lo hemos activado" por "te lo recomendamos"; y el contador subrayado de ese interruptor abre
  `ModalSuministrosGrandes`, el diálogo que enseña cuáles son esos suministros para decidir uno por
  uno — y, al pulsar "Hacer el cambio", "Cambio de compañía"
  (`PantallaCambioCompaniaEmpresas`): datos de quien tramita (con nombre y email pre-rellenados
  desde la subida de facturas), IBAN por sociedad, y verificación de identidad + firma — o, si se
  tramita en nombre de otra persona, poderes de representación o enlace de firma en su lugar. Y,
  al pulsar "Activar cambio", la pantalla final (`PantallaAltaEmpresas`): "Alta completada" o
  "Alta en tramitación" según haya quedado pendiente la firma de la persona representante, con un
  fondo oscuro y cruces de la marca (`Icon name="spark"`) entrando a modo de chispazo.
  Componentes en `src/components/prototipo/empresas/`.
- **`/particulares`** — el flujo de particulares, en construcción paso a paso desde la landing
  ("Calcula tu ahorro particular"). `RecorridoParticulares.tsx` une las vistas con la MISMA
  estructura que `/empresas`, y en las partes que comparten mecánica reutiliza sus componentes
  tal cual o los calca sin sociedad/CIF (esa idea no existe para un particular): subir la
  factura (`PantallaSubidaParticulares`), la pantalla de carga (reutiliza
  `PantallaCargaEmpresas` directamente), el resultado con errores y alertas
  (`PantallaResultadoParticulares` + el panel `PanelAlertasParticulares`) y, al pulsar "Calcular
  ahorro", "Ahorro y recomendación" (`PantallaAhorroParticulares`): tres tarjetas destacadas cada
  una por un motivo distinto (no tres niveles de ahorro como en empresas), con su propio
  interruptor "Condiciones"/"Detalles", más "Todas las ofertas" debajo con el resto de
  compañías — selección única entre las tres tarjetas y esas ofertas, y cada oferta se despliega
  en la misma tabla de puntos de suministro que empresas (con casilla para dejar un punto fuera
  del cálculo e interruptor de mantenimiento, que aquí empieza apagado también en gas). Y, al
  pulsar "Hacer el cambio", "Cambio de compañía" (`PantallaCambioCompaniaParticulares`): casi
  todo llega ya relleno —nombre y email de la subida, DNI y dirección "leídos de la factura",
  CUPS bloqueado— y solo quedan el IBAN y la firma. Y, al pulsar "Activar cambio", el paso 04
  ("Seguimiento"), que reutiliza `PantallaAltaEmpresas` tal cual (es la misma pantalla) con el
  email de la persona tapado en el bloque de credenciales. El recorrido está completo.
  Componentes en `src/components/prototipo/particulares/`.

  Los dos flujos comparten los rótulos del indicador de pasos (`PASOS_EMPRESA` y
  `PASOS_PARTICULARES` en `mocks/aczo.ts`): sube tu factura → ahorro y recomendación → confirma
  tus datos → seguimiento. Y su cabecera se queda pegada arriba, encogiéndose de 80 a 64 px
  mientras se navega y recuperando su altura completa al volver arriba.
- **`/area-cliente`** — "Mi cartera": lo que ve quien YA es cliente, no el alta. Barra lateral de
  navegación sobre superficie oscura, cinco tarjetas de resumen, y un panel con la lista de la
  cartera y un **mapa de España interactivo**. Marcar una fila (o una entrada de la leyenda) apaga
  el mapa y enciende solo SUS provincias, de norte a sur y con un marcador que late encima de la
  principal; volver a pulsarla lo desmarca. La flecha de cada fila abre sus **inmuebles**, con su
  nombre (subrayado, porque se toca), su categoría, su dirección y sus CUPS; los que llegaron de
  una factura sin clasificar enseñan "Categoriza este inmueble" y se les puede poner categoría ahí
  mismo. Los filtros (Sociedad, Tipo de suministro, Inmueble, Dirección y Estado) son de
  selección múltiple y se abren como listas de casillas; el de Dirección va agrupado por provincia,
  con encabezados que marcan toda la provincia de una vez, y el de Inmueble ofrece las **categorías
  generales** (oficinas, local comercial, nave industrial, almacén, centro logístico, hotel,
  vivienda) y lleva debajo el bloque "Organiza tu cartera", que cuenta cuántos quedan sin clasificar
  y deja verlos en un modo aparte, con su aviso y su salida. Qué filtros salen depende de la
  agrupación (`FILTROS_POR_AGRUPACION`): con Ubicación, por ejemplo, el de Sociedad sobra.
  "Agrupar por" rehace la lista de **cuatro** maneras (ubicación, sociedad, comercializadora o
  inmueble) y los filtros recortan la cartera antes de agruparla, así que lista, mapa, leyenda y
  porcentajes siempre cuadran. Agrupando por **Ubicación** la pantalla cambia de cara: el mapa se
  lleva más ancho, se pinta con una **escala de verdes** (más oscuro = más cantidad) y la leyenda
  pasa a enseñar el **ahorro** en euros en vez de los puntos de suministro. El mapa va a la izquierda y la lista a la derecha, y el globo que sale al pasar por
  encima de una provincia **se desglosa por el filtro que haya puesto**: con "Inmueble: local
  comercial" dice cuántos locales comerciales hay ahí, no el reparto por sociedades. Y se puede
  pulsar: despliega esa provincia en la lista y la trae a la vista.

  La cartera de mentira se reparte por **6 provincias** (Madrid, Barcelona, Málaga, València,
  A Coruña y Murcia). Con más, ni la lista ni la leyenda se podían leer de un vistazo. Componentes en
  `src/components/prototipo/area-cliente/`.

  El mapa NO es la imagen del Figma: las provincias son trazados SVG de verdad, en
  `src/mocks/provincias-espana.ts`, generados **una sola vez** desde el TopoJSON público de
  `es-atlas` (datos del INE) y proyectados con `d3-geo`. Esos paquetes se usaron para generar el
  archivo y se quitaron: el prototipo no depende de nada nuevo. Canarias va en un recuadro aparte
  abajo a la izquierda, como es costumbre en los mapas de España (en el Figma el mapa es una
  imagen de la península y Canarias no sale; el recuadro se añade para que esas dos provincias
  también se puedan pintar).

- **`/estilos`** — la página de referencia de tokens.
- **`ANIMACIONES.md`** (en la raíz) — el documento para el desarrollador del repo real: qué se
  mueve en cada pantalla, cuánto dura, con qué curva y por qué. **Si se añade o cambia una
  animación, hay que actualizarlo.**

Ya tienen logo real TotalEnergies y Repsol (`public/logos/totalenergies.png` y `repsol.png`,
exportados del Figma) — se ven en `HuecoLogo` y `LogoComercializadora`, ambos en
`TarjetaPlan.tsx`. También tienen logo "Ahorra Energía" y "Bululú Energía"
(`ahorra-energia.svg` y `bululu-energia.svg`), pero ese es INVENTADO, porque las dos compañías
también lo son (salen en el panel de comparar). Pendiente: Naturgy, Octopus, Iberdrola y Endesa
— son marcas reales, así que su logo no se inventa: de momento enseñan el nombre en el hueco
reservado (80 × 40) o su inicial en las listas de caja cuadrada. Cuando lleguen los archivos,
van en `public/logos/` y solo hay que añadirlos al mapa `LOGOS`, cuya clave es el nombre en
minúsculas tal cual (con espacios y tildes).

- **Datos mock:** todos en `src/mocks/aczo.ts`, un solo archivo. Los totales no están escritos a
  mano: se calculan sumando los suministros, así que al editar una cifra todo sigue cuadrando.
- **Cómo arrancar en local:** `npm install` y luego `npm run dev` (servidor en
  `http://localhost:3000`).
- **Dependencias:** al añadir una nueva, instalar siempre la **última versión** publicada
  (`npm install <paquete>@latest`), nunca una versión recordada o copiada de otro proyecto.

Mantén esta sección al día según evolucione el prototipo.

## Flujo de trabajo (gitflow simplificado)

Se trabaja con `main` + ramas `feature/*`, y se integra vía Pull Request contra `main`.

Hay **comandos slash** para automatizarlo (pensados para que nadie tenga que pelearse con git):

- `/branch <descripción>` — crea una rama `feature/*` partiendo SIEMPRE de `main` actualizado.
- `/commit [nota]` — guarda tu trabajo en un commit con un mensaje claro (stage + commit).
- `/push` — sube tu rama al remoto (configura el upstream si hace falta).
- `/pr-create [título]` — abre un Pull Request contra `main` con una plantilla útil.
- `/pr-merge` — mergea el PR de la rama actual a `main` (merge normal), resuelve conflictos si
  los hay, borra la rama y deja `main` local actualizado. No hace falta saber el número del PR;
  solo se mergea el PR propio, nunca "todo lo abierto".

Flujo típico: `/branch` → trabajar → `/commit` → `/push` → `/pr-create` → `/pr-merge`.

**Quién mergea:** las propias personas del equipo de diseño, con `/pr-merge`, sin esperar
aprobación de nadie. El PR no existe para "pedir permiso": existe para dejar registro legible
del prototipo, para que cada persona vea en qué trabaja la otra, y para detectar conflictos
antes de tocar `main` (aquí trabajan 2 personas en paralelo). Si al mergear hay conflicto con
lo que unió la otra persona, lo resuelves tú (Claude) explicándolo en lenguaje sencillo.

## Convenciones

- **Idioma:** español en commits, PRs, comentarios y documentación.
- **Ramas:** `feature/<slug-en-kebab-case-sin-acentos>`.
- **Commits:** primera línea corta e imperativa en español (p. ej. "Añade animación de entrada
  al menú").
- **Nunca** subir secretos, `.env`, `node_modules` ni credenciales.
