# Étape 44c — Installateur corrigé (v2)

La première archive 44c échouait avant écriture en recherchant des espaces là où `DungeonPage.vue` utilise des tabulations. Cette archive **remplace** l'ancienne archive 44c et reprend ses corrections sans toucher à l'étape 44b (portes).

## Installation

1. Extraire **ce ZIP** à la racine de DinoRPG Remastered en remplaçant le dossier `dungeon-step44c` de la version précédente.
2. Depuis la racine :

```bash
node dungeon-step44c/apply-step44c.mjs --dry-run
node dungeon-step44c/apply-step44c.mjs
pnpm --filter @dinorpg/client exec vitest run --config vitest.config.ts test/unit/dungeon/mtDungeonMessageBox.test.ts test/unit/dungeon/mtDungeonScenarioMessageIcon.test.ts
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
```

Le script repère les deux variantes `notice`/`dialog` sans dépendre de l'indentation ni du style CRLF/LF ; il vérifie les points clés **avant d'écrire**, est relançable, et refuse de remplacer une version inconnue d'un fichier créé par l'étape.

## Comportement

- La fenêtre de scénario conserve sa grande largeur mais se confirme par un clic sur la fenêtre/le texte ; pas de boutons en pied.
- L'icône `misc` du SWF n'ayant pas été exportée, on affiche l'icône d'origine **de la scène** du scénario comme solution de repli visuelle (parchemin, coffre, squelette).
- Aucune duplication du texte sous forme de bandeau `notice` après validation.
- Erreur réseau : la fenêtre reste présente, le clic n'est pas perdu ; requête en cours : les doubles clics sont refusés.
- Aucun changement serveur, aucun changement de moteur de combat, aucun correctif sur les portes.

Commit suggéré : `fix(client): restore MT scenario popup icon and one-click interaction`
