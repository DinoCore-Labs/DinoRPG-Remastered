# Étape 35 — Retour après combat MT fiable

Exécuter depuis la racine du monorepo, sur feat/mt-dungeons :

```sh
node dungeon_step35/apply-step35.mjs
pnpm --filter @dinorpg/core exec tsc --noEmit
pnpm --filter @dinorpg/server exec tsc --noEmit
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Le serveur annote les deux chemins de combat MT (gardiens et scénarios) avec un `FightResult.dungeonReturn` optionnel contenant l'ID du meneur et le mapId serveur. Le champ est enregistré dans les tentatives terminées pour préserver son comportement lors d'une réponse répétée. Le client n'interroge la session que pour les combats portant ce champ. Une session présente retourne à `DungeonPage`; une session supprimée (404) retourne à la fiche du meneur; les erreurs autres que 404 ne sont pas absorbées.

**Limite importante :** le retour sur un FightResult historique produit avant l'étape 35 ne porte pas ce champ et suit l'ancien flux normal ; tester avec un nouveau combat. Une victoire qui entraîne la mort du meneur supprimera la session et reviendra à la fiche.

Aucune modification GitHub. Scripts fail-closed et re-exécutables. Pas de test Vitest complet effectué dans cet environnement.

Commit suggéré : `fix(dungeon): persist MT fight return context in FightResult`
