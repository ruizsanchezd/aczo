---
description: ✅ Une tu propuesta (PR) al proyecto principal y deja todo ordenado
argument-hint: [nada normalmente; opcional el título o número de otra propuesta]
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git switch:*), Bash(git fetch:*), Bash(git pull:*), Bash(git push:*), Bash(git log:*), Bash(git merge:*), Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh pr merge:*), Bash(gh auth status:*)
---

Vas a unir ("mergear") la propuesta (PR) al proyecto principal (`main`). La persona NO es
técnica: explica en lenguaje sencillo y deja todo ordenado para empezar lo siguiente.

Nota opcional que dio (normalmente vacía; puede ser un número o unas palabras del título de la
propuesta): **$ARGUMENTS**

⚠️ Este comando une **UNA sola propuesta: la suya**. Nunca mergees "todo lo que haya abierto"
ni propuestas de otra persona sin que lo pida explícitamente.

Pasos:

1. Comprueba que `gh` está autenticado: `gh auth status`. Si no lo está, explica con calma que
   hay que iniciar sesión una vez, y dale el paso exacto: escribir `! gh auth login` en el chat
   y seguir las instrucciones. Luego para hasta que esté hecho.
2. Localiza la propuesta a unir. La persona normalmente NO sabe números de PR, y no le hacen
   falta:
   - Caso normal (sin argumentos, en su rama de trabajo): usa la propuesta de la rama actual
     (`gh pr view --json number,url,state,headRefName,mergeable` — resuelve solo).
   - Si dio algo, interprétalo: un número → `gh pr view <número> ...`; palabras → búscalo por
     título entre las abiertas (`gh pr list`).
   - Si estás en `main` sin argumentos: mira las abiertas con `gh pr list`. Si hay una sola,
     propónsela ("¿quieres unir «<título>»?"); si hay varias, enséñaselas **por título** (sin
     jerga, sin exigir números) y pregunta cuál es la suya.
   - Si no hay ninguna propuesta abierta, dilo con calma: primero hay que crearla con
     `/pr-create`.
   - Si la propuesta ya está unida (merged), dilo y pasa directamente al paso 6 para dejar
     su copia al día.
3. **Comprueba que no se queda nada fuera**: `git status`. Si hay cambios sin guardar en la
   rama de la propuesta, avisa ("tienes trabajo sin guardar que NO entraría") y ofrece
   guardarlo con `/commit` y subirlo antes de unir. Igual con commits sin subir
   (`git log origin/<rama>..<rama>` tras un `git fetch`): si los hay, súbelos primero con
   `git push` (🚫 nunca con `--force`).
4. Mira si la propuesta tiene conflictos (`mergeable` en el paso 2):
   - Si NO hay conflictos, continúa.
   - Si hay conflictos (normalmente porque la otra persona unió algo antes), explícalo sin
     drama: "el proyecto principal cambió mientras trabajabas; hay que combinar ambas cosas".
     Trae `main` actualizado a la rama (`git fetch origin` + `git merge origin/main`),
     resuelve tú los conflictos con criterio (ante duda visual, gana el Figma; ante duda de
     intención, pregunta con una pregunta sencilla), guarda el merge y sube con `git push`.
     Luego continúa.
5. Une la propuesta con un merge normal (igual que el botón de GitHub) y borra la rama ya
   usada, que no hace falta conservar:
   ```
   gh pr merge <número> --merge --delete-branch
   ```
   🚫 Nunca uses `--admin` ni fuerces nada. Si GitHub rechaza el merge por algo inesperado,
   explica la situación en una frase y para.
6. Deja su copia lista para lo siguiente:
   - `git switch main` (si no te ha cambiado ya el comando anterior) y `git pull --ff-only`.
   - Si la rama local de la propuesta sigue existiendo, se puede borrar con seguridad
     (`git branch -d <rama>`; nunca `-D`).
7. Confirma en español, breve y tranquilizador: la propuesta ya forma parte del proyecto
   principal, su copia está al día, y puede empezar lo siguiente con `/branch`. Muestra el
   enlace de la propuesta unida por si quiere compartirlo.
