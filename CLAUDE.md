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

Este es un **repositorio de prototipo** del proyecto **Aczo (Tavira Cápital)**. Su única
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
  https://www.figma.com/design/eNrvz49FS5eoTgNh8afYVV/Tavira-C%C3%A1pital--Aczo--%7C-Library?node-id=115572-774&p=f&t=lUMi7l4rti9dY9os-11
- **Branding (identidad visual):**
  https://www.figma.com/design/iNHB9TlL3cgsr3h3G83Ro2/Tavira-C%C3%A1pital--Aczo----Visual-Identity?node-id=162-10521&t=0YH21nlVGJ8BM6E5-11
- **UI Design (pantallas):**
  https://www.figma.com/design/KLiU1HQMw09KWwpvOW7IYk/Tavira-C%C3%A1pital--Aczo--%7C-UI-Design?node-id=2080-2414&t=SAtkLzPGktKsCSD4-11

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
2. **La animación es el producto.** Cuida especialmente duración, easing, orden/stagger,
   interrupciones y que respete `prefers-reduced-motion`. Que se sienta natural, no robótico.
3. **Datos mock, siempre locales.** Guárdalos en archivos tipo `mocks/` o `fixtures/` y que
   sean fáciles de encontrar y editar. Nada de claves, tokens ni endpoints reales.
4. **Código legible como referencia.** Otra persona lo va a leer para reimplementarlo en el
   repo real. Prioriza claridad sobre "listura". Comenta el POR QUÉ de una animación cuando no
   sea obvio (p. ej. por qué ese easing o esa duración).
5. **Simplicidad.** Prefiere lo mínimo que consiga el efecto. No añadas dependencias pesadas si
   no aportan a la animación/prototipo.
6. **Documenta lo que el dev de frontend necesita replicar.** En cada pantalla/interacción no
   trivial, deja claro: qué dispara la animación, duración, easing/curva, y estados.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript.
- **Estilos:** Tailwind CSS v4.
- **Componentes:** sin librería de componentes por ahora (nada de shadcn/ui). Si se decide
  añadir una, documentarlo aquí.
- **Animación:** aún sin librería. Empezar con CSS/Tailwind; si una interacción necesita algo
  más elaborado (gestos, física, timelines), valorar añadir `motion` y documentarlo aquí.
- **Datos mock:** cuando existan, en `src/mocks/` o `src/lib/`, fáciles de encontrar y editar.
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

Flujo típico: `/branch` → trabajar → `/commit` → `/push` → `/pr-create`.

## Convenciones

- **Idioma:** español en commits, PRs, comentarios y documentación.
- **Ramas:** `feature/<slug-en-kebab-case-sin-acentos>`.
- **Commits:** primera línea corta e imperativa en español (p. ej. "Añade animación de entrada
  al menú").
- **Nunca** subir secretos, `.env`, `node_modules` ni credenciales.
