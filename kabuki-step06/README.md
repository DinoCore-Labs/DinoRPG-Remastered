# Correctif v2 — étape 6

Cette version corrige l’ancre du garde de mort de Yakuzi, qui ne doit pas dépendre d’une indentation à quatre espaces, ainsi que l’échappement de l’apostrophe dans le message de combat. Les modifications sont préparées avant écriture ; si une ancre manque, aucun des fichiers n’est modifié.

# DinoRPG Remastered — Kabuki, étape 6

## Objet

Finition des deux combats de Yakuzi selon les sources Motion Twin :

- `DinoRPG/src/fight/Scenario.hx`, `case S.kabuki`, phases 4 et 5.
- `DinoRPG/xml/fr/scenarios.xml`, textes `yakuzi_run`, `kabuki_defend`, `strange_dinoz`.

### Comportement

- **Forges (phase 4)** : à la victoire, texte original « Profitant d'un instant d'inattention... », puis les Dinoz de l'équipe vainqueur à 0 PV (ou moins) sont remis à **exactement 1 PV** avant le calcul des pertes de santé sauvegardées. Aucune résurrection en cas de défaite.
- **Gorges (phase 5)** : Yakuzi appelle « A l'aide !!!! » lorsqu'il invoque `yakkb1` et s'enfuit. Après victoire contre le Kabuki, texte original « Mais quel était donc cet étrange dinoz ?!? ».
- Les combats ordinaires ne sont pas modifiés.
- La progression de la quête est toujours gérée par `fight_win` des dialogues de l'étape 3.

**Périmètre et limites :** messages de combat français d'origine MT ; les versions EN/ES/DE ne sont pas encore ajoutées pour ces trois messages. La compétence originale du monstre `ninja` reste à implémenter. La restitution audio/graphique dépend du lecteur de combat actuel.

## Prérequis

Étapes 1–5 installées dans votre copie locale du monorepo. Le script exige que la fonction `summonKabukiAtGorges` de l'étape 5 soit présente.

## Installation

Décompresser le dossier `kabuki-step06` à la racine de `DinoRPG-Remastered` et, depuis cette racine :

```bash
python kabuki-step06/apply-step06.py
pnpm --filter @dinorpg/server build
pnpm --filter @dinorpg/server test:unit
```

Le script utilise exclusivement les fichiers présents sur votre ordinateur, ne fait aucun accès réseau et n'appelle aucune commande Git. Il vérifie les ancres avant d'écrire quoi que ce soit. Ne pas le relancer après installation (idempotence volontairement bloquante).

## Fichiers concernés

- `app/server/src/utils/fight/generateFight.ts` : hook après détermination de la victoire, avant calcul des résultats des Dinoz.
- `app/server/src/utils/fight/kabukiYakuziFight.ts` : messages et guérison spécifiques.
- `app/server/test/unit/kabuki-yakuzi-epilogue.test.ts` : 4 tests de non-régression.

## Commit local unique

```bash
git add app/server/src/utils/fight/generateFight.ts app/server/src/utils/fight/kabukiYakuziFight.ts app/server/test/unit/kabuki-yakuzi-epilogue.test.ts
git commit -m "feat(fight): finish original Yakuzi Kabuki encounter epilogues"
```

Aucun changement distant n'est réalisé.
