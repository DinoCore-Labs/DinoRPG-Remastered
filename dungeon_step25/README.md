# Étape 25 — Page Dungeon générique

Cet installateur remplace `MtMagneticCavernsPage.vue` par `DungeonPage.vue`, monte la nouvelle route `/dinoz/:id/dungeon`, redirige l'ancienne URL, relie l'action d'exploration au nouvel écran, conserve le canvas PixiJS et ajoute les textes de présentation dans `FR.json` sous `dungeon`.

## Installation

À la racine du monorepo, depuis la branche `feat/mt-dungeons` :

```bash
node dungeon_step25/apply-step25.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Le script n'écrit pas les fichiers si une ancre de la branche attendue manque. Il est volontairement non réexécutable après succès (la page a changé de nom).

## Limites connues

- Le système d'actions d'entrée côté serveur expose actuellement la possibilité d'entrer dans les Cavernes Magnétiques ; ce correctif ne crée **pas** de droits d'entrée artificiels pour les autres donjons. La page d'exploration est générique pour toute session déjà ouverte via le serveur.
- Le client utilise la métadonnée du catalogue MT pour afficher le nom et conserver les textes originaux de scénario renvoyés par l'API.
- Le fichier `FR.json` reçoit la nouvelle section `dungeon`; les autres langues utilisent le fallback FR. La localisation exhaustive des diagnostics encore présents dans l'ancienne vue sera une passe séparée.
