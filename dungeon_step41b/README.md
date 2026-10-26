# Étape 41b : tests de régression des 11 cartes MT

```sh
node dungeon_step41b/apply-step41b.mjs
pnpm --filter @dinorpg/core exec vitest run test/unit/dungeon/dungeon.mtInteractionCoverage.test.ts
```

Ces tests lisent les **11 cartes originales embarquées**, vérifient la structure des portes et clés, puis la conservation des états de clés et de trésors au moyen des fonctions `snapshotMtDungeonProgress` et `restoreMtDungeonProgress`.

Ils ne vérifient pas les transactions PostgreSQL d'attribution d'or ni un parcours joueur complet. Aucun code métier, route, fichier de traduction ou donnée du jeu n'est modifié.

Commit : `test(dungeon): cover MT doors keys and persisted treasure across maps`
