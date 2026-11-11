# DinoRPG Remastered — Kabuki / Stage 05

## Portée

Source historique : `DinoRPG/src/fight/Scenario.hx`, cas `S.kabuki` phase 5 ; `DinoRPG/xml/fr/monsters.xml` entrée `yakkb1`.

- Rencontre **Gorges Profondes**, `yakuzi_gorges:combat` exclusivement.
- Yakuzi commence le combat à **30 PV** ; ses autres caractéristiques demeurent intactes.
- Un coup fatal contre Yakuzi interrompt sa mort **avant `checkDeaths`** ; un Kabuki `yakkb1` apparaît dans le combat (niveau 10, 100 PV, DNA d'origine).
- Yakuzi regagne 100 PV et s'échappe. Le combat continue contre le Kabuki. La progression `kabuki:4 → 5` n'est toujours autorisée qu'après la victoire, via `combat_win` de l'étape 3.
- Aucune altération des combats ordinaires, aucune écriture GitHub.

### Limites explicites

La compétence historique `ninja` du Kabuki n'existe pas dans le moteur actuel : le renfort possède **les caractéristiques et l'apparence MT d'origine, mais pas encore cette compétence**. Le message `kabuki_defend` n'est pas encore injecté dans l'historique des combats. La guérison des Dinoz morts à 1 PV après le combat des **Forges** (phase 4 MT) reste également à faire ; il ne faut pas considérer ces trois points comme fidèles à 100 %.

## Installation

Depuis la **racine** de ton monorepo (avec les étapes 1 à 4 déjà appliquées) :

```bash
python kabuki-step05/apply-step05.py
pnpm --filter @dinorpg/core build
pnpm --filter @dinorpg/server build
pnpm --filter @dinorpg/server test -- kabuki-yakuzi-gorges
```

Le script refuse les ancres absentes/ambiguës et ne lance aucune commande Git. Il nécessite les fichiers produits par l'étape 4. Une sauvegarde / branche de travail reste recommandée. Les builds et tests du monorepo n'ont pas été exécutés ici.

## Commit local recommandé

```bash
git add packages/core/src/models/monster/monsterList.ts packages/core/src/models/monster/monsterKey.ts packages/core/src/models/monster/monsterKeyMap.ts app/server/src/utils/fight/fight.mapper.ts app/server/src/Fight/Service/fight.service.ts app/server/src/Fight/Service/processDialogFight.service.ts app/server/src/utils/fight/generateFight.ts app/server/src/utils/fight/kabukiYakuziFight.ts app/server/test/unit/kabuki-yakuzi-gorges.test.ts
git commit -m "feat(fight): script Yakuzi's Kabuki reinforcement at Gorges"
```

Aucun `git push` n'est nécessaire.

## Correctif v2 (ancre `scriptedEncounter`)

Cette version remplace le bloc de sélection entier de l’étape 4, indépendamment du formatage Prettier. Elle ne modifie aucun fichier du projet tant que toutes les ancres ne sont pas validées.
