# Étape 34 — Retour au donjon après combat

Dans `DungeonPage.vue`, les quatre navigations vers `FightPage` portent désormais `mtDungeonLeader` en query, l'identifiant du meneur de session.

Dans `FightBounce.vue`, « Continuer » utilise en priorité cet identifiant plutôt que le store local potentiellement périmé. La session est toujours vérifiée côté serveur : si elle a été supprimée après la mort du meneur ou une défaite totale (404), retour normal à la fiche. Une erreur réseau/serveur n'est pas silencieusement transformée en retour à la fiche.

## Installation

Extraire à la racine du monorepo puis :

```bash
node dungeon_step34/apply-step34.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Le script cible la branche et les correctifs des étapes précédentes et vérifie les deux blocs avant toute écriture. Aucun push GitHub.
