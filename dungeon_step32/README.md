# Étape 32 — combats MT et nettoyage des outils de développement

Appliquer depuis la racine du monorepo : `node dungeon_step32/apply-step32.mjs`.

Ce patch généralise le _chemin de combat des gardiens_ aux identifiants des six donjons et remplace les références à stepp dans leur composition et leur lieu. Les scénarios utilisent déjà les définitions du donjon courant. La sélection des gardiens reste une adaptation Remastered fondée sur le catalogue MT : la composition originale des groupes côté serveur n'est pas présente dans les archives.

Les routes /dev/** de mtDungeon.routes.ts sont retirées, ainsi que les messages et contrôles développeur de la page. Les routes de combat publiques et leurs mécanismes anti-duplication restent en place.

Tests conseillés :

- `pnpm --filter @dinorpg/core test:unit -- dungeon.guardianTrial`
- `pnpm --filter @dinorpg/server test:unit -- dungeon`
- `pnpm --filter @dinorpg/server exec tsc --noEmit`
- `pnpm --filter @dinorpg/client exec vue-tsc --noEmit`

Ne pas déclarer tous les combats opérationnels avant un test réel, notamment pour les clés de monstres absentes de monsterByKey.
