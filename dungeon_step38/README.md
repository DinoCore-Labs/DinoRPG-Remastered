# Étape 38 — recadrage des monstres MT

Depuis la racine du monorepo :

```bash
node dungeon_step38/apply-step38.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit -- mtDungeonGuardianFrames
```

Le script remplace uniquement `app/client/src/components/dungeon/mtDungeonGuardianFrames.ts`.
Il génère les animations dans un canvas de 160×160 puis calcule la boîte alpha
**commune à toutes les frames** et les recadre à l'identique, avec 2 pixels
de marge. Cela ne restaure pas les pixels déjà perdus par l'export source.

À conserver dans `paintGuardians()` : `visual.anchor.set(0.5, 1)` et
le plafonnement de l'échelle en fonction de `frameWidth` et `frameHeight`.

Si besoin, revenir en arrière avec Git :
`git restore app/client/src/components/dungeon/mtDungeonGuardianFrames.ts`

Commit : `fix(client): crop MT guardian frames using stable animation bounds`
