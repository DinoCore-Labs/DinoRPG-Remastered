# Correction de l’étape 35 — modèle et services

Depuis la racine du monorepo :

```bash
node dungeon_step35_fix/apply-fix.mjs
pnpm --filter @dinorpg/core exec tsc --noEmit
pnpm --filter @dinorpg/server exec tsc --noEmit
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
```

Le correctif complète `FightResult` avec `dungeonReturn?: { leaderDinozId: number; mapId: string }`, et crée un `dungeonResult: FightResult` dans les deux services afin que la réponse et la sauvegarde contiennent ce contexte. La règle `settleMtDungeonInteraction(..., result.result)` reste inchangée.

Le script ne remplace pas les fichiers intégralement et peut être relancé. Il vérifie tous les fichiers avant d'écrire.
