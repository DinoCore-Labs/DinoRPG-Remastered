# Étape 35 v2 — installateur compatible avec étapes 33/34

À la racine du monorepo :

```bash
node dungeon_step35_v2/apply-step35.mjs
pnpm --filter @dinorpg/core exec tsc --noEmit
pnpm --filter @dinorpg/server exec tsc --noEmit
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
```

Le correctif ajoute `FightResult.dungeonReturn`, l'affecte côté serveur pour les combats de donjon et remplace la logique de retour de `FightBounce` quelle que soit sa variante héritée des étapes 33/34. Les opérations de détection sont effectuées avant toute écriture. Le script est relançable.

**Important :** vérifier le comportement sur un nouveau combat, les anciens FightResult ne contenant pas ce champ. En cas de combat fatal, une session 404 est normale et entraîne le retour à la fiche du meneur.
