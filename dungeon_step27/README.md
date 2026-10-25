# Étape 27 — Message de sortie sur la fiche du Dinoz

Installation depuis la racine du monorepo, après l'étape 26 :

```bash
node dungeon_step27/apply-step27.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Le serveur enregistre d'abord la sortie. Le client effectue ensuite immédiatement un `router.replace` vers DinozPage, en transmettant le texte MT par `history.state`. Sur la fiche du Dinoz, la MsgBox originale apparaît en mode `notice` (sans bouton), se ferme au clic et ne réapparaît pas lors d'un rafraîchissement de page. Le panneau de sortie et la MsgBox de sortie de DungeonPage sont retirés.

Le script vérifie les ancrages avant toute écriture, et refuse une installation partielle. Il est réexécutable. Aucun code serveur n'est modifié.
