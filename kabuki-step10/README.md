# Kabuki — Étape 10 : dialogues de Yakuzi à l’Île du Totem

Cette étape prépare **uniquement l'épilogue de Yakuzi**, accessible aux progressions `kabuki:21`, `22` et `23`. Elle **ne résout pas** l'accès à l'Île du Totem ni la progression `19 -> 20 -> 21`, qui dépend du scénario de déplacement et du combat final. Elle n'accorde **aucune récompense prématurée**.

## Contenu

- Dialogues et choix originaux de `WebGamesArchives/DinoRPG/xml/{fr,en,es,de}/dialogs/yakuzi.xml`.
- Œuf de Kabuki gratuit lorsque le joueur l'accepte, puis progression vers `kabuki:22`.
- Retour et délai original (`utime(100)`), progression vers `kabuki:23`.
- Nouvelle offre d'œuf à **50 000 or** sous les conditions MT ; suivi du scénario `kabegg` jusqu'à la limite de deux achats.
- Tests unitaires des récompenses et des transitions.

## Installation

À lancer depuis la racine du monorepo, après l'étape 9 :

```bash
python kabuki-step10/apply-step10.py --check
python kabuki-step10/apply-step10.py
pnpm --filter @dinorpg/core build
pnpm --filter @dinorpg/client build
pnpm --filter @dinorpg/core test:unit
```

Le script importe les XML depuis GitHub en lecture seule, ou utilise leur copie locale :

```bash
python kabuki-step10/apply-step10.py --archives "C:/chemin/WebGamesArchives" --check
python kabuki-step10/apply-step10.py --archives "C:/chemin/WebGamesArchives"
```

L'option `--check` vérifie toutes les ancres, structures de dialogues et traductions avant toute écriture. L'installation est refusée si elle semble déjà effectuée. GitHub n'est jamais modifié.

## Commit proposé

```bash
git add packages/core/src/models/dialogs/data/index.ts packages/core/src/models/dialogs/data/yakuziKabukiTotem.dialog.ts packages/core/test/unit/dialogs/yakuziKabukiTotem.dialog.test.ts app/client/src/i18n/locales/
git commit -m "feat(quest): add original Yakuzi Totem reward dialogues"
```

## Suite

Reproduire le trajet `kabuki:19 -> 20 -> 21` et le combat final sur l'île selon les fichiers Motion Twin, sans forcer une progression non justifiée par l'original.
