# Étape 20P V3 — Deux actions de donjon Motion Twin

Cette version **remplace** `tools/dungeon/apply-step20p-original-actions.mjs` de l'archive 20P précédente. Ne relancez pas l'ancien script. Elle met à jour l'étape **20O V2 déjà installée**, et tolère le réordonnancement des imports dans `getDinozFiche.service.ts` (ou l'absence de l'import qui bloquait la version précédente).

## Fonctionnement

- **`dungeon_enter` — Entrer**, icône originale `train` (`act_train.webp`), confirmation avec la description MT.
- Après acceptation : `POST /dungeon/mt/start`, toast avec le **texte d'entrée MT** provenant du catalogue localisé, **rafraîchissement de la fiche Dinoz sans navigation**.
- Si le chef ou un suiveur est dans une session `MtDungeonRun`, **seule** l'action **`dungeon` — Accéder au Plan** est présentée par `getAvailableActions` dans `getDinozActions.service.ts`, ainsi qu'un petit disclaimer d'exploration au-dessus du bouton.
- Cliquer sur « Accéder au Plan » ouvre la carte interactive sur la session existante du chef ; cette page ne peut plus créer une session.
- Les fenêtres des scénarios et de sortie utilisant les huit sprites originaux `msgbox_*.png` de l'étape 20O V2 sont conservées.
- Le service `getDinozFiche.service.ts` retrouve sa seule responsabilité de charger la fiche, d'appeler `getAvailableActions` et de renvoyer la réponse. L'ajout de logique de disponibilité des actions fait par la V2 est retiré.

## Installer

Extraire le ZIP **à la racine** du monorepo en remplaçant le script 20P précédent. Aucun autre installateur à lancer.

```bash
node tools/dungeon/apply-step20p-original-actions.mjs --check
node tools/dungeon/apply-step20p-original-actions.mjs
```

`--check` est en lecture seule. Tous les points d'insertion, les quatre JSON de langues, la présence de la popup V2 et du payload de test sont contrôlés **avant toute écriture**. Le script est conçu pour être relançable : une seconde exécution doit signaler `0 fichier(s)`.

## Contrôles à effectuer

```bash
pnpm --filter @dinorpg/core build
pnpm --filter @dinorpg/server build
pnpm --filter @dinorpg/client build
pnpm --filter @dinorpg/core exec vitest run test/unit/dungeon/mtDungeonActions.test.ts
pnpm --filter @dinorpg/client exec vitest run test/unit/dungeon/mtDungeonMessageBox.test.ts
```

Vérifier ensuite manuellement : entrée disponible seulement si le serveur autorise le groupe ; confirmation avec texte d'origine ; création d'une session et toast ; **même fiche** rafraîchie ; seul « Accéder au Plan » + disclaimer ; action similaire sur le suiveur ; entrée et sorties interdites sans session autorisée ; scénario et récompenses confirmés par le serveur.

## Sécurité et périmètre

Pas de migration, de modification de base ni de push GitHub. Cacher les actions dans la fiche ne bloque pas automatiquement tous les autres endpoints métier ; la sécurisation de ces endpoints reste un chantier transversal distinct. Les tests TypeScript/Prisma complets doivent être exécutés sur le monorepo local : les essais de l'installateur ont été effectués dans un environnement de test simulé sur les fichiers de référence 20O V2, y compris la mise en forme des imports et l'idempotence.

Commit conseillé **après validation** :

```bash
git add packages/core/src/models/dinoz/dinozActions.ts packages/core/src/models/dinoz/dinozFiche.ts packages/core/test/unit/dungeon/mtDungeonActions.test.ts app/server/src/Dinoz/Service/getDinozActions.service.ts app/server/src/Dinoz/Service/getDinozFiche.service.ts app/client/src/components/dinoz/DinozActions.vue app/client/src/pages/DinozPage.vue app/client/src/pages/MtMagneticCavernsPage.vue app/client/src/i18n/locales tools/dungeon/apply-step20p-original-actions.mjs tools/dungeon/step20p-payload

git commit -m "fix(dungeon): restore original MT entry and map actions"
```
