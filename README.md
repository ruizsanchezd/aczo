# aczo

Repositorio **prototipo** del proyecto **Aczo**, para animar y prototipar los diseños de Figma
del equipo de diseño.

Sirve para ver cómo se sienten los diseños **en movimiento** (transiciones, microinteracciones,
gestos, estados) usando **datos de mentira (mock)** y **sin conectar con nada real**. Después
sirve de **guía** para que el equipo de desarrollo lo construya en el repositorio de verdad,
tomando **Figma como fuente de la verdad** del diseño.

> ¿Quieres el contexto completo del proyecto? Está en [`CLAUDE.md`](./CLAUDE.md).

---

## 🎨 Los diseños de referencia (Figma)

Todo lo que se prototipa aquí sale de estos tres archivos de Figma:

- **Librería (componentes):**
  [Aczo | Library](https://www.figma.com/design/eNrvz49FS5eoTgNh8afYVV/?node-id=115572-774&p=f&t=lUMi7l4rti9dY9os-11)
- **Branding (identidad visual):**
  [Aczo | Visual Identity](https://www.figma.com/design/iNHB9TlL3cgsr3h3G83Ro2/?node-id=162-10521&t=0YH21nlVGJ8BM6E5-11)
- **UI Design (pantallas):**
  [Aczo | UI Design](https://www.figma.com/design/KLiU1HQMw09KWwpvOW7IYk/?node-id=2080-2414&t=SAtkLzPGktKsCSD4-11)

---

## ⬇️ Paso 0 — Traerte este proyecto a tu ordenador (solo la primera vez)

Antes de nada necesitas **una copia del proyecto en tu ordenador**. Solo hay que hacerlo una vez;
después ya lo tendrás siempre. Elige la forma que te resulte más cómoda:

### Opción A (la más fácil): GitHub Desktop

1. Instala **[GitHub Desktop](https://desktop.github.com)** y abre sesión con tu cuenta de GitHub.
   (Si no tienes acceso al proyecto, pide que te inviten al repositorio.)
2. En el menú: **File → Clone repository**.
3. En la pestaña **URL**, pega esta dirección:
   ```
   https://github.com/ruizsanchezd/aczo.git
   ```
4. Elige la carpeta de tu ordenador donde quieres guardarlo y pulsa **Clone**.

¡Listo! Ya tienes el proyecto. Cuando en el futuro quieras la última versión, abre GitHub Desktop
y pulsa **Fetch origin** / **Pull**.

### Opción B: dejar que Claude lo haga por ti

Si ya tienes **Claude Code** instalado, ábrelo en una carpeta vacía y escríbele en lenguaje
normal:

> «Tráete el repositorio `https://github.com/ruizsanchezd/aczo.git` a esta carpeta.»

Claude se encarga de descargarlo. (Necesitas tener *git* instalado; si no lo tienes, Claude te
dirá cómo.)

> 💡 A partir de aquí, **abre siempre este proyecto con Claude Code** para trabajar. El resto de
> pasos de esta guía se hacen ya dentro de Claude.

---

## 👋 ¿Es tu primera vez? Empieza por aquí

No necesitas saber programar ni usar la consola. Trabajarás dentro de **Claude Code**, y para
las tareas de guardar y compartir tu trabajo solo tienes que escribir **comandos** que empiezan
por `/` (barra). Claude hace el resto y te va explicando cada paso.

### Primero, tres palabras que verás mucho

No hace falta que te las aprendas, pero ayuda entenderlas:

- 🌿 **Rama (branch):** una copia tuya para trabajar tranquilo, sin pisar el trabajo de nadie.
  Es como abrir una "hoja nueva" para tu prototipo.
- 💾 **Commit:** una foto guardada de tu trabajo en un momento dado, con una notita de qué
  hiciste. Es tu "punto de guardado", como en un videojuego.
- 📤 **Subir (push) / PR:** mandar tu trabajo a internet (GitHub) y proponer que se una al
  proyecto principal para que los demás lo vean. El **PR** (Pull Request) es esa propuesta.

---

## 🚦 El flujo, paso a paso

Cada vez que vayas a prototipar algo nuevo, sigue estos 5 pasos **en orden**:

```
 1. /branch        2. (trabajas)      3. /commit        4. /pr-create      5. /pr-merge
 ┌───────────┐    ┌───────────┐      ┌───────────┐     ┌───────────┐      ┌───────────┐
 │  Abro una │    │  Diseño y │      │  Guardo   │     │  Comparto │      │  Lo uno   │
 │ hoja nueva│ ─▶ │  animo mi │  ─▶  │ mi trabajo│ ─▶  │ mi trabajo│  ─▶  │al proyecto│
 │  🌿       │    │ prototipo │      │  💾       │     │  📤       │      │  ✅       │
 └───────────┘    └───────────┘      └───────────┘     └───────────┘      └───────────┘
   Antes de empezar        Cuando tengas algo          Cuando esté listo
```

> 💡 `/commit` guarda **en tu ordenador**. `/pr-create` lo **sube a internet** y crea la
> propuesta (por eso `/pr-create` ya se encarga de subirlo por ti; no necesitas un paso aparte).
> Si prefieres subir sin abrir todavía el PR, existe `/push`.

### Paso 1 — `/branch` · Abrir una hoja nueva para trabajar

Escribe `/branch` seguido de una frase corta de lo que vas a hacer.

```
/branch animación del menú lateral
```

Qué hace por ti:
- Se pone en la versión más reciente del proyecto (`main` actualizado).
- Crea tu hoja nueva (rama) con un nombre ordenado, p. ej. `feature/animacion-menu-lateral`.

👉 **Cuándo:** al empezar cualquier prototipo o cambio nuevo.

### Paso 2 — Trabajas en tu prototipo

Diseña, anima, prueba. Aquí no hay comandos: es tu momento creativo. Cuando tengas algo que no
quieras perder, pasa al paso 3.

### Paso 3 — `/commit` · Guardar tu trabajo

Escribe `/commit`. Puedes añadir una nota de qué hiciste (opcional):

```
/commit ya funciona la entrada del menú con rebote
```

Qué hace por ti:
- Reúne todos tus cambios y crea un **punto de guardado** con un mensaje claro.
- Puedes hacer `/commit` **varias veces** mientras avanzas. Guarda a menudo, sin miedo.

👉 **Cuándo:** cada vez que consigas algo que quieras conservar.

### Paso 4 — `/pr-create` · Compartir para que lo revisen

Cuando tu prototipo esté listo para enseñarlo, escribe:

```
/pr-create animación del menú lateral
```

Qué hace por ti:
- Sube tu trabajo a internet (GitHub).
- Crea la **propuesta (PR)** con una descripción útil: qué hiciste, cómo probarlo y las notas de
  animación (duración, easing, gestos) que el equipo de desarrollo necesita para replicarlo.
- Te da un enlace para compartir.

👉 **Cuándo:** cuando quieras que alguien lo revise o quede registrado.

### Paso 5 — `/pr-merge` · Unir tu trabajo al proyecto principal

Cuando la propuesta esté lista (no hace falta esperar la aprobación de nadie), escribe:

```
/pr-merge
```

Qué hace por ti:
- Une tu propuesta al proyecto principal (`main`), que es la versión "oficial" que ven todos.
- Si mientras trabajabas tu compañera unió algo que choca con lo tuyo, Claude lo combina por
  ti y te lo explica con calma. No se pierde el trabajo de nadie.
- Recoge la hoja de trabajo ya usada y te deja lista la última versión para empezar lo
  siguiente con `/branch`.

👉 **Cuándo:** justo después de `/pr-create`, cuando quieras que tu prototipo pase a formar
parte del proyecto. Sois vosotras quienes unís vuestras propias propuestas.

---

## 🧰 Los 5 comandos, de un vistazo

| Comando | En cristiano | ¿Cuándo lo uso? |
| --- | --- | --- |
| `/branch <descripción>` | Abro una hoja nueva para trabajar | Al empezar algo nuevo |
| `/commit [nota]` | Guardo mi trabajo (punto de guardado) | Cada vez que avanzo |
| `/push` | Subo mi trabajo a internet | Si quiero respaldarlo sin abrir PR aún |
| `/pr-create [título]` | Comparto mi trabajo para que lo revisen | Cuando está listo |
| `/pr-merge` | Uno mi trabajo al proyecto principal | Después de `/pr-create` |

---

## 🆘 Si te pierdes

- **No pasa nada por equivocarse.** Los comandos avisan antes de hacer cualquier cosa delicada
  y no borran tu trabajo.
- ¿No sabes qué toca ahora? Pregúntale a Claude en lenguaje normal, por ejemplo:
  *"¿en qué punto estoy y qué debería hacer?"* o *"quiero guardar lo que llevo"*.
- ¿Un comando pide algo que no entiendes? Dile a Claude *"explícamelo más fácil"*.

---

## ⚙️ Requisitos (solo para configurar el equipo la primera vez)

Esto normalmente lo deja listo una persona técnica una sola vez:

- [Node.js](https://nodejs.org) — para cuando se añada el código del prototipo.
- [GitHub CLI (`gh`)](https://cli.github.com) autenticado con `gh auth login` — necesario para
  que `/pr-create` pueda subir y crear la propuesta.
