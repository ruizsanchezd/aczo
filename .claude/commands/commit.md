---
description: 💾 Guarda tu trabajo (crea un punto de guardado)
argument-hint: [nota opcional de qué hiciste]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*), Bash(git branch:*)
---

Vas a guardar el trabajo actual (crear un "punto de guardado"). Hazlo tú por la persona, con
cuidado y explicando en lenguaje sencillo. La persona NO es técnica.

Nota opcional que dio: **$ARGUMENTS**

Pasos:

1. Comprueba la rama actual con `git branch --show-current`.
   - Si estás en `main`, **avisa en lenguaje sencillo** (que no se debe guardar directamente en
     la versión principal) y ofrece crear una hoja de trabajo con `/branch` antes. No guardes en
     `main` salvo que la persona lo confirme explícitamente.
2. Mira qué cambió: `git status` y `git diff --stat` (y `git diff` si necesitas entender el cambio para redactar el mensaje).
   - Si no hay cambios, dilo con calma ("no hay nada nuevo que guardar") y termina.
3. **Revisa que no se cuele nada que no deba guardarse** antes de añadir:
   - Archivos sensibles o basura: `.env` y variantes, claves/tokens/credenciales,
     `node_modules/`, carpetas de build (`dist/`, `build/`). Si aparecen, **avísalo y déjalos
     fuera** (no los incluyas en el guardado).
   - Archivos muy grandes o binarios inesperados: menciónalo y pregunta antes de incluirlos.
   - Si todo está bien, añade los cambios con `git add -A`.
4. Redacta el mensaje del punto de guardado tú mismo, en español, describiendo QUÉ se logró (no el detalle técnico línea a línea). Estilo:
   - Una primera línea corta e imperativa (máx ~70 caracteres). Ej: `Añade animación de entrada al menú lateral`.
   - Si el cambio es grande, agrega un cuerpo con 2-4 viñetas.
   - Usa la nota de la persona como pista, pero mejora la redacción.
5. Haz el commit con un heredoc para respetar saltos de línea:
   ```
   git commit -m "$(cat <<'EOF'
   <primera línea>

   - <viñeta opcional>

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```
6. Confirma en español y de forma tranquilizadora que su trabajo quedó guardado, con una frase
   sobre qué se guardó. Recuérdale que puede hacer `/commit` tantas veces como quiera, y que
   cuando quiera compartirlo use `/pr-create` (o `/push` si solo quiere respaldarlo). No subas
   nada a internet en este comando: `/commit` solo guarda en su ordenador.
