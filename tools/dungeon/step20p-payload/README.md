# Étape 20P — Retrouver les deux actions originales MT

Ce correctif remplace **la logique erronée de l'étape 20O V2**. Il suppose que l'étape 20O V2 est déjà installée sur la branche `feat/mt-dungeons` (à partir de 91cab18e58e2). Il ne lance aucune migration et n'écrit rien sur GitHub.

## Fonctionnement attendu

- Aux Pylônes de Magnétite, un chef de groupe éligible reçoit **`dungeon_enter`** / **Entrer** (`act_train.webp`) dans `DinozActions`.
- La confirmation affiche la description MT « Vous pouvez explorer cet endroit, mais faites attention à ne pas vous y perdre ! ».
- Après confirmation : `POST /dungeon/mt/start`, toast reprenant l'introduction localisée depuis `/dungeon/mt/catalog`, **rechargement de la fiche Dinoz sans navigation automatique**.
- Pour un chef ou un suiveur dont le groupe a une session active : seule l'action **`dungeon`** / **Accéder au Plan** (`act_train.webp`) est renvoyée par `getDinozActions.service.ts`, et le petit disclaimer d'exploration est affiché.
- Cliquer **Accéder au Plan** ouvre la session via `MtMagneticCavernsPage`, avec l'identifiant réel du chef. Un utilisateur ne peut pas créer la session depuis la page d'exploration : il doit passer par la fiche Dinoz.
- Les popups de scénario et de sortie de l'étape 20O V2 sont conservées. Le texte de l'entrée est affiché en toast sur la fiche, pas dans la carte.

## Installation

Extraire le ZIP à la racine du monorepo, en conservant `tools/dungeon/...`.

```bash
node tools/dungeon/apply-step20p-original-actions.mjs --check
node tools/dungeon/apply-step20p-original-actions.mjs
```

**Mode vérification :** aucune modification sur `--check`; il signale un ancrage manquant, un fichier différent ou l'absence de l'étape 20O V2. En cas de problème, n'applique pas le script et transmets l'erreur. Les sources ne sont écrites qu'une fois les points d'insertion vérifiés.

## Contrôles locaux

```bash
pnpm --filter @dinorpg/core build
pnpm --filter @dinorpg/server build
pnpm --filter @dinorpg/client build
pnpm --filter @dinorpg/core exec vitest run test/unit/dungeon/mtDungeonActions.test.ts
pnpm --filter @dinorpg/client exec vitest run test/unit/dungeon/mtDungeonMessageBox.test.ts
```

**Parcours manuel :**

1. Chef aux Pylônes avec conditions d'entrée satisfaites : bouton **Entrer** + confirmation avec texte MT.
2. Accepter : la fiche Dinoz reste affichée et se recharge; le texte d'entrée apparaît en toast.
3. Vérifier **Accéder au Plan** et le disclaimer; aucun combat/déplacement du monde, aucune mission dans le panneau Actions.
4. Ouvrir un suiveur de ce groupe : vérifier le même accès via l'identifiant du chef.
5. Cliquer **Accéder au Plan** : reprise de la session déjà créée sans nouvel appel `start`.
6. Tester la découverte d'un journal/coffre et une sortie du donjon : les popups de la V2 restent fonctionnelles.
7. Tester un Dinoz non éligible / sans session : aucun bouton d'entrée si `assertMtDungeonEntry` échoue.

La logique serveur d'entrée existante contrôle encore les conditions d'accès et la session côté serveur; cacher les actions sur la fiche ne constitue pas à lui seul un contrôle de tous les autres endpoints métier. Le verrouillage transversal des autres endpoints nécessite un audit séparé.

Commit conseillé :

```bash
git add packages/core/src/models/dinoz/dinozActions.ts packages/core/src/models/dinoz/dinozFiche.ts packages/core/test/unit/dungeon/mtDungeonActions.test.ts app/server/src/Dinoz/Service/getDinozActions.service.ts app/server/src/Dinoz/Service/getDinozFiche.service.ts app/client/src/components/dinoz/DinozActions.vue app/client/src/pages/DinozPage.vue app/client/src/pages/MtMagneticCavernsPage.vue app/client/src/i18n/locales tools/dungeon/apply-step20p-original-actions.mjs tools/dungeon/step20p-payload

git commit -m "fix(dungeon): restore original MT entry and map actions"
```
