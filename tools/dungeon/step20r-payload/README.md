# Étape 20R — Fenêtre d'entrée et sortie automatique des Cavernes Magnétiques

**Prérequis :** étapes 20O V2 et 20P V3 **déjà installées**. Ne pas appliquer 20Q.

## Correctifs

- `DinozActions.vue` : après la confirmation **Entrer** (`dungeon_enter`), le client charge le texte authentique localisé depuis le catalogue MT, crée la session, recharge la fiche, puis affiche la **même fenêtre `MtDungeonMessageBox`** que la sortie. La fenêtre se ferme par « Continuer », sans naviguer automatiquement vers le plan.
- `MtMagneticCavernsPage.vue` : un déplacement atteignant une frontière MT déclenche immédiatement l'action serveur :
  - `stepp_0` + `boundary-start` → sortie vers la surface, popup de sortie.
  - `stepp_1`, `_2`, `_3` + `boundary-start` → étage précédent.
  - `stepp_0`, `_1`, `_2` + `boundary-exit` → étage suivant.
  - `stepp_3` + `boundary-exit` → sortie définitive, popup de sortie.
- Les boutons de validation de frontière sous le canvas disparaissent. Une session laissée en attente à une frontière peut être reprise : `refresh()` déclenche la même action, sans rejouer le déplacement.
- `mtDungeonBoundaryAction.ts` : un petit sélecteur pur et typé, accompagné d'un test Vitest.

## Installation

Extraire le ZIP **à la racine** du dépôt : `tools/dungeon/...`.

```bash
node tools/dungeon/apply-step20r-dungeon-dialogues.mjs --check
node tools/dungeon/apply-step20r-dungeon-dialogues.mjs
```

Le `--check` ne modifie aucun fichier. Le script prépare et valide tous les changements avant d'écrire ; il refuse les fichiers inattendus. Exécution répétable sans modification supplémentaire.

## Validation

```bash
pnpm --filter @dinorpg/client test:unit -- mtDungeonBoundaryAction.test.ts
pnpm --filter @dinorpg/client build
```

Essais manuels :

1. Aux Pylônes avec Irma et les conditions MT requises, cliquer **Entrer**, accepter la confirmation, vérifier la popup de texte d'entrée puis fermer : la fiche montre le disclaimer et **Accéder au Plan**.
2. Cliquer **Accéder au Plan**, remonter par la vraie flèche de sortie près de l'entrée : la sortie serveur et la popup se déclenchent directement, sans chercher le bouton sous le canvas.
3. Descendre/remonter entre cartes quand la frontière est atteinte : transition immédiate.
4. Vérifier la popup de sortie définitive depuis le dernier étage.
5. Rafraîchir une session qui était déjà `boundary-start` ou `boundary-exit` : la transition en attente se finalise sans double déplacement.
6. Vérifier que les rencontres, les coffres et leurs popups restent inchangés.

**Important :** le client n'invente aucune sortie ni récompense ; `transition` / `worldExit` continuent à valider l'état `pending`, la révision et le droit d'accès côté serveur. Le code source de Motion Twin ne fournit pas nécessairement le gestionnaire serveur original : cette intégration reste un adaptateur Remastered.

## Commit proposé

```bash
git add app/client/src/components/dinoz/DinozActions.vue app/client/src/pages/MtMagneticCavernsPage.vue app/client/src/components/dungeon/mtDungeonBoundaryAction.ts app/client/test/unit/dungeon/mtDungeonBoundaryAction.test.ts tools/dungeon/apply-step20r-dungeon-dialogues.mjs tools/dungeon/step20r-payload
git commit -m "fix(dungeon): show original entry dialog and auto-resolve MT exits"
```

Aucune migration, aucune modification GitHub et aucune modification du serveur.
