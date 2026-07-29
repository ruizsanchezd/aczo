---
description: 🚀 Comparte tu prototipo para que lo revisen (crea la propuesta / PR)
argument-hint: [título o nota opcional]
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git push:*), Bash(git log:*), Bash(git diff:*), Bash(git remote:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh repo view:*), Bash(gh auth status:*)
---

Vas a crear la "propuesta para revisar" (Pull Request) del trabajo de la hoja actual contra
`main`. La persona NO es técnica: explica en lenguaje sencillo y deja todo listo para revisión.

Nota opcional que dio: **$ARGUMENTS**

Pasos:

1. Comprueba que `gh` está autenticado: `gh auth status`. Si no lo está, explica con calma que
   hay que iniciar sesión una vez, y dale el paso exacto: escribir `! gh auth login` en el chat
   y seguir las instrucciones. Luego para hasta que esté hecho.
2. Rama actual: `git branch --show-current`. Si es `main`, avisa en lenguaje sencillo que no se
   puede crear una propuesta desde la versión principal y ofrece crear una hoja con `/branch`.
3. Verifica que hay remoto (`git remote -v`). Si no hay, explícalo y ofrece conectar el
   repositorio de internet (`gh repo create`) antes de continuar.
4. **Comprueba que de verdad hay trabajo que proponer**: `git log main..HEAD --oneline`. Si NO
   hay ningún guardado por delante de `main`, no crees una propuesta vacía: explica que primero
   hay que guardar trabajo con `/commit` y para.
5. **Comprueba si ya existe una propuesta para esta hoja** (`gh pr view --json url,state` sobre
   la rama actual). Si ya hay una abierta, no crees otra: sube los últimos cambios con
   `git push` y muéstrale el enlace de la propuesta existente; luego termina.
6. Sube el trabajo si hace falta: `git push -u origin HEAD` (🚫 nunca con `--force`).
8. Revisa qué entra en la propuesta comparando con main: `git log main..HEAD --oneline` y `git diff main...HEAD --stat`.
9. Redacta la propuesta en español:
   - **Título**: claro y corto. Usa la nota si la dio, si no dedúcelo de los commits.
   - **Cuerpo** con esta plantilla:
     ```
     ## Qué prototipa este PR
     <1-2 frases: qué pantalla/interacción/animación se añadió o cambió>

     ## Cómo probarlo
     - <pasos para ver la animación/interacción en local>

     ## Notas para el dev de frontend
     - <detalles de la animación: duración, easing, gestos, estados — lo que deba replicar en el repo real>
     - Recuerda: Figma es la fuente de la verdad para el diseño; este PR aporta el comportamiento/movimiento.
     ```
10. Crea la propuesta con base main:
    ```
    gh pr create --base main --title "<título>" --body "$(cat <<'EOF'
    <cuerpo>
    EOF
    )"
    ```
11. Muestra el enlace de la propuesta (`gh pr view --json url -q .url` o el que devuelva el
    comando) y confírmalo en español de forma sencilla: "listo, ya puedes compartir este enlace
    para que revisen tu prototipo".
