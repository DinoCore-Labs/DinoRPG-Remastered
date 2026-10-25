# Étape 31 — Affichage des monstres MT de tous les donjons

Le serveur sélectionne déjà les apparences des gardiens à partir de `definition.monsters` du donjon courant, mais `mtDungeonGuardianVisuals.service.ts` écartait celles qui ne faisaient pas partie des sept monstres des Cavernes Magnétiques.

Ce correctif :

- supprime cette whitelist `stepp` ;
- garde la sélection déterministe via `selectMtGuardianSprite` ;
- garde la vue expurgée par le brouillard et refuse les identifiants graphiques malformés ;
- autorise les apparences des rencontres spéciales tirées des scénarios MT ;
- met à jour les tests serveur et l'étiquette générique du canvas.

**Limite importante :** certains identifiants MT ne sont peut-être pas disponibles dans le module `@eternaltwin/dinorpg_animations` actuel. Dans ce cas, le composant existant gère l'échec du chargement, sans sprite inventé. Cela ne remplace pas le futur moteur d'animation original MT. Les règles de composition des combats et de spawn ne sont pas modifiées.

## Installation

À la racine du monorepo :

```bash
node dungeon_step31/apply-step31.mjs
pnpm --filter @dinorpg/server test:unit -- mtDungeonGuardianVisuals
pnpm --filter @dinorpg/server exec tsc --noEmit
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
```

Commit proposé : `fix(dungeon): render guardians from every MT dungeon catalog`

Aucune écriture sur GitHub.
