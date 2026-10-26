# Étape 41 — Localisation des clés et messages du donjon

Depuis la racine du monorepo :

```bash
node dungeon_step41/apply-step41.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client exec vitest run test/unit/dungeon/mtDungeonKeyNames.test.ts
```

Le script modifie `mtDungeonKeyNames.ts`, `DungeonPage.vue`, `FR.json` et le test des clés.
Les préfixes et suffixes sont dans `dungeon.keys.prefixes.p0…p7` et `dungeon.keys.suffixes.s0…s7` ; traduisez-les dans les JSON des autres langues avec la même structure. Les notifications de clés, portes, or, refus de déplacement et scénario sont également dans `FR.json`.

Ce correctif n'est **pas encore l'audit exhaustif de persistance** des 11 cartes. Les textes du catalogue original MT fournis par le serveur restent distincts des traductions statiques de l'interface.

Commit proposé : `refactor(client): localize MT dungeon keys and loot messages`
