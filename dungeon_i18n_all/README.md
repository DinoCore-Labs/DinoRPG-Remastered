# Traductions des clés `dungeon` — EN / ES / DE

Décompressez ce dossier à la racine du monorepo, puis :

```sh
node dungeon_i18n_all/apply-dungeon-locales.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
```

Le script conserve les autres espaces de noms des fichiers de langue et ajoute/remplace seulement la section `dungeon` dans `EN.json`, `ES.json` et `DE.json`. Les modèles `{dinoz}`, `{dungeonName}`, `{id}`, `{prefix}`, `{suffix}`, `{key}`, `{amount}` sont préservés.

Les textes du dossier `dungeon.keys` sont des traductions des noms cosmétiques construits à partir de dictionnaires approximatifs, et non des noms MT officiellement attestés. Les autres langues peuvent employer des accords grammaticaux différents.

Commit proposé : `feat(i18n): translate dungeon UI and key names into en es de`
