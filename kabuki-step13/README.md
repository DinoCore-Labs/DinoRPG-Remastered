# Kabuki — étape 13 : ouverture du combat final (Motion Twin)

Ce patch ajoute les **messages et événements d'arrivée en séquence** pendant le combat final, en conservant les adversaires et alliés de l'étape 11 et leurs compétences de l'étape 12.

## Installation

Décompresser `kabuki-step13.zip` dans la racine `DinoRPG-Remastered`, puis :

```bash
python kabuki-step13/apply-step13.py --check
python kabuki-step13/apply-step13.py
pnpm --filter @dinorpg/core build
pnpm --filter @dinorpg/server build
pnpm --filter @dinorpg/client build
pnpm --filter @dinorpg/server exec vitest run test/unit/kabuki-totem-opening.test.ts
```

`--check` vérifie toutes les ancres et les fichiers **sans rien modifier**. L'installateur n'effectue aucun commit, push ou appel réseau.

## Comportement

D'après `WebGamesArchives/DinoRPG/src/fight/Scenario.hx` (`P.itotem`, scénario Kabuki phase 20) :

1. Igor parle et annonce Barbara, Choupette, Poupoule avec leurs événements `arrive` individuels.
2. Yakuzi intervient, puis Ninjutsu et Kage apparaissent successivement.
3. Le combat préexistant s'exécute sans changement de statistiques, compétences, gains ou calcul des dégâts.

Les textes de la scène sont repris de `WebGamesArchives/DinoRPG/xml/{fr,en,es,de}/scenarios.xml`.

## Limite importante

**Ce n'est pas encore l'invocation dynamique originale de MT.** Les sept PNJ sont toujours présents dès l'initialisation du simulateur ; seuls les événements narratifs/visuels sont insérés avant le premier tour. Une future évolution du moteur de combat sera nécessaire pour que les personnages entrent aussi _mécaniquement_ au moment exact de leur apparition. Le problème d'animation d'un Kabuki signalé aux Gorges peut encore se reproduire : ne pas assimiler ce patch à sa correction.

## Fichiers modifiés

- `app/server/src/Scenario/Controller/kabukiScenario.controller.ts`
- `app/server/src/Scenario/Controller/kabukiTotemOpening.ts` (nouveau)
- `app/server/test/unit/kabuki-totem-opening.test.ts` (nouveau)
- `app/client/src/i18n/locales/{FR,EN,ES,DE}.json`

## Commit local

```bash
git add app/server/src/Scenario/Controller/kabukiScenario.controller.ts app/server/src/Scenario/Controller/kabukiTotemOpening.ts app/server/test/unit/kabuki-totem-opening.test.ts app/client/src/i18n/locales/
git commit -m "feat(quest): add MT Kabuki Totem battle opening sequence"
```
