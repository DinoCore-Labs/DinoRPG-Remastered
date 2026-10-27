# Étape 43d — Transitions des donjons MT, avec PostgreSQL

Extraction du ZIP à la racine du monorepo, puis :

```bash
node dungeon-step43d/apply-step43d.mjs
pnpm --filter @dinorpg/server exec tsc --noEmit
```

Pour exécuter **seulement ce test** sur la base de test (sans utiliser le script `test:integration` qui réinitialise toute la base), configure `.env.test`, puis :

```bash
pnpm --filter @dinorpg/server exec dotenv -e .env.test -- vitest run --config vitest.integration.config.ts test/integration/dungeon/mtDungeonStages.test.ts
```

**ATTENTION :** le setup des tests exige `DATABASE_URL` pointant sur `dinorpg_test`. Les tests appellent `cleanDatabase()` ; ils suppriment les données de cette base de test. Ne jamais utiliser une base partagée ou de production.

Les tests exercent le véritable adaptateur PostgreSQL (CAS) avec une carte synthétique volontairement simple. Cela teste la persistance des clés, drapeaux, aller-retour, révision périmée et isolation des utilisateurs. **Cela ne remplace pas** le test de déplacement à travers les 11 vraies cartes, des portes réelles et de la sortie vers le monde.

Commit suggéré : `test(dungeon): cover PostgreSQL MT stage transitions and restoration`
