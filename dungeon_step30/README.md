# Étape 30 – Sorties MT vraiment génériques

Applique sur la branche `feat/mt-dungeons` après les étapes 27–29.

```sh
node dungeon_step30/apply-step30.mjs
pnpm --filter @dinorpg/client test:unit -- mtDungeonBoundaryAction
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
```

- Résolution `boundary-start` et `boundary-exit` pour tous les donjons de `MT_DUNGEON_MAPS`.
- Le nombre d'étapes est déduit du catalogue, sans valeur figée.
- Les escaliers respectent `tower` provenant des définitions originales, pour le bouton affiché **et** le `dl` envoyé au serveur.
- Les contrôles serveur, la sauvegarde et la redirection déjà installée restent inchangés.

Attention : le script ne remplace pas la gestion des actions épuisées. Si le bouton est grisé, vérifier d'abord l'état du groupe et Irma.
