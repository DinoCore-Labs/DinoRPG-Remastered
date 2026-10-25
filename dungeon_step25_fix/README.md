# Correctif étape 25 — canvas invisible

L'installateur de l'étape 25 avait remplacé un `<template v-else>` par un `<template>` sans directive. Vue peut traiter cette balise comme un élément HTML inerte, rendant les éléments contenus invisibles.

Depuis la racine du monorepo :

```bash
node dungeon_step25_fix/apply-fix.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Le correctif supprime uniquement le conteneur inerte et sa fermeture, sans toucher aux interactions, traductions, règles de déplacement ou API serveur. Il est réexécutable et vérifie les ancres avant toute écriture.
