# Étape 26 — sortie du donjon

Correctif de `app/client/src/pages/DungeonPage.vue` basé sur la branche `feat/mt-dungeons` au 25 octobre 2026.

- Supprime le panneau de retour à la surface derrière la MsgBox.
- Transforme la MsgBox de sortie en notification cliquable, sans bouton visible ni titre séparé.
- Un clic sur la notification redirige vers `DinozPage` avec `router.replace`.
- Ne modifie pas le service de sortie ni la sauvegarde de progression.

À exécuter à la racine du monorepo :

```bash
node dungeon_step26/apply-step26.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Commit : `fix(client): simplify dungeon exit to clickable MT message`
