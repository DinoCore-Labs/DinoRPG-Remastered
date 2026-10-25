# Étape 20O — Actions & fenêtres MT

Référence : feat/mt-dungeons, commit 91cab18e58e2b50f66b257b498dd21939e850e45.

Installer le script et son répertoire `step20o-payload/` sous `tools/dungeon/`, puis depuis la racine du monorepo :

```bash
node tools/dungeon/apply-step20o-dungeon-ui.mjs --check
node tools/dungeon/apply-step20o-dungeon-ui.mjs
pnpm --filter @dinorpg/core build
pnpm --filter @dinorpg/server build
pnpm --filter @dinorpg/client build
pnpm --filter @dinorpg/client test:unit -- mtDungeonMessageBox.test.ts
```

La première commande contrôle les ancrages sans modifier les fichiers. La deuxième applique l'ensemble du correctif. Ne pas ajouter `MtDungeonMessageBox.vue` ailleurs : l'installateur le place automatiquement.

Scénarios de vérification manuelle :

1. Chef admissible aux Pylônes : bouton « Explorer les Cavernes Magnétiques » dans DinozActions ; entrée autorisée côté API et introduction MT affichée.
2. Chef ou suiveur à l'intérieur : aucune action habituelle, aucun déplacement sur la carte du monde, lien de retour au donjon ; soin par les objets toujours accessible depuis les panneaux dédiés.
3. Marcher sur un parchemin / coffre MT : message issu du serveur dans une fenêtre utilisant les 8 assets `msgbox_*.png`; aucune récompense tant que « Lire / récupérer » n'est pas confirmé.
4. Fermer la fenêtre d'un scénario sans valider : la session reste bloquée, le panneau d'interaction permet d'y revenir. Rafraîchir la page rouvre le message tant que le scénario reste en attente.
5. Sortie réelle : message original localisé, retour à la surface et fermeture de session.
6. Tester un accès non autorisé directement sur `/dungeon/mt/start` : il doit rester refusé par le serveur.

Limites : les dialogues ne sont pas reconstitués de toutes pièces ; les textes viennent des données localisées Motion Twin. Les autres donjons seront raccordés lorsque leurs pages de navigation seront disponibles. Les blocages d'actions supplémentaires à travers les endpoints métier hors de la fiche Dinoz ne font pas partie de cette étape : un audit serveur séparé reste conseillé.

Commit recommandé : `feat(dungeon): integrate Dinoz actions and original MT message boxes`
