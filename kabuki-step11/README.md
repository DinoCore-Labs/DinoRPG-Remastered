# Kabuki — étape 11 : Île du Totem (MT 19 → 21)

Patch local pour `feat/kabuki`. Aucun push, aucune modification distante.

## Installation

Depuis la racine du monorepo, après les étapes 1 à 10 :

```bash
python kabuki-step11/apply-step11.py --check
python kabuki-step11/apply-step11.py
pnpm --filter @dinorpg/core build
pnpm --filter @dinorpg/server build
pnpm --filter @dinorpg/client build
pnpm --filter @dinorpg/server test:unit
```

## Implémentation

- Déplacement `ITLOST` depuis Mines de Corail à `kabuki:19` : retour sur place et progression à 20, avec message narratif (pas de combat factice).
- Déplacement `ITOTEM` à `kabuki:20` : Igor et ses 3 compagnons face aux Dinoz du groupe + Yakuzi, Ninjutsu, Kage.
- En cas de victoire : progression à 21, attribution unique de la collection `kaura`, arrivée du groupe à l'île. La suite des dialogues Yakuzi de l'étape 10 devient accessible.
- En cas de défaite : pas de collection, pas d'avancement du scénario.
- Ajout de `kaura` dans le registre des récompenses et traductions narratives FR/EN/ES/DE.

## Différences MT explicitement reportées

Le moteur n'insère pas encore Igor et les renforts en cours d'animation au moment des répliques ; les combattants sont présents dans la composition initiale. Les compétences spéciales MT `ninja`, `tornad` et `prprec` et le rendu du sprite Kabuki sont à finaliser. Les dialogues intermédiaires sont représentés par une narration courte, non par la totalité des séquences de `Scenario.hx`.

## Commit

```bash
git add app/server/src/Scenario/Controller/kabukiScenario.controller.ts app/server/src/Scenario/Service/scenarioMoveFight.service.ts app/server/test/unit/kabuki-totem-scenario.test.ts packages/core/src/models/rewards/rewardsKeyMap.ts app/client/src/i18n/locales/
git commit -m "feat(quest): connect Kabuki lost route and Totem Island finale"
```
