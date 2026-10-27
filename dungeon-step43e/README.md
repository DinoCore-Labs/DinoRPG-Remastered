# Étape 43e — Audit des parcours sur les 11 cartes MT

Installation depuis la racine du monorepo :

```bash
node dungeon-step43e/apply-step43e.mjs
pnpm --filter @dinorpg/server exec tsc --noEmit
pnpm --filter @dinorpg/server exec dotenv -e .env.test -- vitest run --config vitest.integration.config.ts test/integration/dungeon/mtDungeonOriginalRoutes.test.ts
```

**Important :** Le fichier est situé dans `test/integration/dungeon`, conformément à l'organisation demandée. Il vérifie l'intégration du codec original, des définitions MT et du moteur de déplacements; il n'écrit pas en base et ne remplace pas les parcours E2E avec combats, récompenses et sorties. La configuration d'intégration déclenche néanmoins le garde-fou `dinorpg_test`.

Les scénarios `DIBlock` conservent leur blocage original. Le scanner autorise toutes les clés et considère les portes/gardiens déjà passés pour mesurer une **enveloppe de connectivité potentielle**. Les états réels ne sont pas injectés dans le serveur. Le résultat `exit in optimistic envelope` est un diagnostic, non une affirmation de faisabilité d'une partie.

Commit suggéré : `test(dungeon): audit original MT map movement across all 11 stages`
