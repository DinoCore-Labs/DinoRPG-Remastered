# Étape 20X — Fenêtres Motion Twin : notice + dialogue

## But

Reproduire l'apparence de la boîte Flash de la vidéo : rouge brun, liseré doré,
petit ergot supérieur et texte crème, **sans fond beige, parchemin ni voile de modal**.
Les huit PNG `msgbox_*.png` sont **déjà présents** dans
`app/client/public/dungeon/mt/` et sont réutilisés à leurs dimensions natives :
coins et bandes verticales = **77 × 41 px**, bandes haut/bas = **23 × 41 px**.
L'ergot central est une approximation CSS d'après la capture vidéo ; les huit
bordures, elles, proviennent du projet.

## Déroulement

- `notice`: boîte compacte cliquable pour introduction au donjon et potion d'Irma.
  La boîte elle-même sert de bouton de confirmation ; pas de bouton « web » visible.
- `dialog`: boîte plus large utilisant les mêmes ressources, avec titre facultatif,
  bouton confirmer, et bouton annuler seulement s'il a été explicitement demandé.
- Dans le donjon, les boîtes sont positionnées **dans le viewport** et n'ajoutent
  aucun voile noir artificiel au brouillard.
- La sortie, après disparition de la session serveur, conserve un affichage
  écran pour ne pas dépendre d'un canvas démonté.
- Texte et récompenses de scénarios : pas de changement à l'API ni à la validation
  côté serveur ; une simple fermeture ne valide jamais une récompense.
- Une Potion d'Irma réussie crée désormais une notice MT au lieu d'un toast web.

## Installation

Prérequis : code de la branche `feat/mt-dungeons` incluant 20O/20P/20R.
20S, 20T, 20U, 20V et 20W ne sont **pas** des prérequis du correctif msgBox.

1. Décompresser l'archive à la **racine** du monorepo, en conservant les dossiers.
2. Vérifier sans modifier :

   ```bash
   node tools/dungeon/apply-step20x-original-message-box.mjs --check
   ```

3. Appliquer :

   ```bash
   node tools/dungeon/apply-step20x-original-message-box.mjs
   ```

4. Valider :

   ```bash
   pnpm --filter @dinorpg/client test:unit -- mtDungeonMessageBox.test.ts
   pnpm --filter @dinorpg/client build
   ```

Le script planifie toutes ses modifications avant de commencer à écrire.
Il refuse un ancrage absent ou ambigu et il peut être réexécuté (`--check` donne
« 0 fichier à modifier » après installation). Il conserve les fins de ligne LF/CRLF.

## Tester en jeu

1. Entrer dans les Cavernes Magnétiques depuis la fiche Dinoz : texte MT dans une notice sans titre ni CTA visuel.
2. Reprendre le plan ; utiliser une potion d'Irma : notice directement dans le canvas, fermeture au clic.
3. Récupérer un journal/coffre : dialogue MT avec confirmation ; ne vérifier les récompenses qu'après l'action serveur.
4. Sortir du donjon : le texte de sortie utilise le même cadre MT et le bouton « Retour à la fiche ».
5. Vérifier avec un écran mobile, puis avec des dialogues longs.

## Fichiers affectés

- `app/client/src/components/dungeon/MtDungeonMessageBox.vue`
- `app/client/src/components/dinoz/DinozActions.vue`
- `app/client/src/pages/MtMagneticCavernsPage.vue`
- `app/client/test/unit/dungeon/mtDungeonMessageBox.test.ts`
- `tools/dungeon/apply-step20x-original-message-box.mjs`

Aucun changement de règles serveur, de Prisma, de marchandises ou de carte.

**Commit suggéré** :

```bash
git add app/client tools/dungeon
git commit -m "feat(dungeon): restore Motion Twin message box styling"
```

Vérifications réalisées pour le paquet : analyse des ancrages sur la branche GitHub,
validation syntaxique Node de l'installateur, application et seconde exécution
sur des fichiers de contrôle LF et CRLF, et échec simulé sans écriture.
Le build Vue/Vitest complet devra être confirmé localement.
