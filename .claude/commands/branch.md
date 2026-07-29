---
description: 🌿 Abre una hoja de trabajo nueva para empezar un prototipo
argument-hint: <qué vas a prototipar, en pocas palabras>
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git fetch:*), Bash(git pull:*), Bash(git stash:*)
---

Vas a abrir una "hoja de trabajo" nueva (una rama) para que la persona empiece un prototipo.
La persona NO es técnica: explica cada paso en lenguaje sencillo y que sea imposible equivocarse.

Descripción que dio la persona: **$ARGUMENTS**

Sigue estos pasos:

1. Confirma que estás dentro del repositorio (`git rev-parse --is-inside-work-tree`). Si no lo
   estás, explícalo en una frase sencilla y para; no ejecutes nada más.
2. Ejecuta `git status` para ver si hay cambios sin guardar.
   - Si los hay, **avisa en lenguaje sencillo** ("tienes trabajo sin guardar") y **pregunta**
     antes de seguir: ofrece guardarlo con `/commit` primero. No borres ni descartes nada.
3. Parte SIEMPRE de la versión más reciente del proyecto:
   - `git switch main` (vuelve a la versión principal).
   - `git fetch origin` y luego `git pull --ff-only` para traer lo último. Si no hay remoto o
     falla la conexión, no es grave: continúa con lo que hay en local y menciónalo con calma.
4. Genera el nombre de la rama a partir de la descripción:
   - Formato: `feature/<slug>`.
   - El slug: minúsculas, sin acentos, palabras separadas por guiones, máximo ~5 palabras.
     Ej: "animación del menú lateral" → `feature/animacion-menu-lateral`.
   - Si la descripción está vacía, pide en una frase que te diga qué va a prototipar y para.
5. **Comprueba que no exista ya una hoja con ese nombre** (`git branch --list feature/<slug>`).
   Si ya existe, no la pises: propón un nombre alternativo (p. ej. añadiendo `-2`) o pregunta si
   quiere continuar la que ya existe con `git switch feature/<slug>`.
6. Crea y cambia a la rama desde main: `git switch -c feature/<slug>`.
7. Confirma en español, breve y tranquilizador: qué hoja de trabajo se creó y que ya puede
   empezar. Recuérdale que cuando avance use `/commit` para guardar, y `/pr-create` al terminar.

No subas nada a internet ni hagas guardados todavía. Solo dejar la hoja de trabajo lista.
