# Étape 27 v2 — sortie immédiate vers la fiche du Dinoz

Correctif de l'installateur 27 pour un dépôt ayant déjà appliqué l'étape 26 : le panneau de sortie n'est **plus requis**. L'installateur le supprime seulement s'il existe. Il accepte aussi `router.replace` (étape 26) en plus de `router.push`.

Depuis la racine du monorepo :

```bash
node dungeon_step27_v2/apply-step27.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Le serveur valide et enregistre la sortie avant `router.replace` vers `DinozPage`; le texte MT est transmis via l'état de navigation Vue Router. La fiche affiche une notification MT cliquable, sans bouton visible, et efface le message après lecture. Aucune modification de GitHub.
