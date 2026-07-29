---
description: 📤 Sube tu trabajo a internet (respaldo, sin abrir propuesta todavía)
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git push:*), Bash(git rev-parse:*), Bash(git log:*), Bash(git remote:*)
---

Vas a subir a internet (GitHub) el trabajo de la hoja actual, para que quede respaldado y listo
para compartir. La persona NO es técnica: explica en lenguaje sencillo.

Pasos:

1. Rama actual: `git branch --show-current`.
   - Si es `main`, avisa en lenguaje sencillo que no se sube trabajo directamente a la versión
     principal y **pregunta** si de verdad quiere continuar (por defecto, no lo hagas).
2. Verifica que hay un remoto: `git remote -v`.
   - Si NO hay remoto configurado, explícalo con calma y para. Dile que primero hay que conectar
     el repositorio de internet y ofrece hacerlo (por ejemplo con `gh repo create`).
3. Comprueba si hay algo sin subir. Si ya está todo subido, dilo con calma y termina.
4. Sube de forma segura y normal: `git push -u origin HEAD`.
   - 🚫 **Nunca** uses `--force` ni `--force-with-lease`. Si el push es rechazado porque hay
     cambios en internet que no tienes, **NO fuerces**: explica la situación en lenguaje sencillo
     y ofrece traer esos cambios primero antes de reintentar.
5. Confirma en español: trabajo subido y, si aparece una URL para abrir la propuesta, muéstrala.
   Sugiere `/pr-create` para compartirlo y que lo revisen.
