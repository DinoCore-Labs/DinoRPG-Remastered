# Étape 42 — cleanup conservateur

Depuis la racine du dépôt :

```sh
node dungeon-step42/apply-step42.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Le script retire uniquement quatre sélecteurs CSS inutilisés de `DungeonPage.vue` et d'anciens marqueurs de patch, après vérification de leur absence du template. Il vérifie avant toute écriture la parité des clés `dungeon` et de leurs paramètres `{placeholder}` pour `FR.json`, `EN.json`, `ES.json`, `DE.json`. Il ne modifie aucun fichier JSON ni service serveur.

Le script doit s'arrêter sans écrire si le code local n'est pas compatible avec les ancres attendues ou si les traductions divergent. Il n'est pas un nettoyage exhaustif des services serveur.

Commit proposé : `refactor(dungeon): remove obsolete view styles and validate locale parity`
