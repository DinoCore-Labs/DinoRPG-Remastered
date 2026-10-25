# Étape 24 — Tests MsgBox et sprite de soin

Deux correctifs ciblés pour les tests remontés :

1. `MtDungeonMessageBox.vue` : liaison dynamique de l'URL publique `item_scroll.png` pour éviter l'import de l'asset par le transformateur Vue de Vitest. Le `src` rendu dans le navigateur ne change pas.
2. `mtDungeonSceneItems.test.ts` : le test prend en compte `item_heal.png`, sprite récupéré depuis, et vérifie toujours le rejet des icônes de scénario inconnues.

Exécuter depuis la racine du monorepo :

```sh
node dungeon_step24/apply-step24.mjs
pnpm --filter @dinorpg/client test:unit -- mtDungeonMessageBox mtDungeonSceneItems
pnpm --filter @dinorpg/client test:unit
```

Le script est réexécutable ; ses deux modifications sont validées avant écriture. Aucune modification GitHub.
