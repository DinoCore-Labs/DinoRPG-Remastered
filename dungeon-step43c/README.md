# Étape 43c — Tests d'intégration MT (PostgreSQL)

À la racine du monorepo :

```bash
node dungeon-step43c/apply-step43c.mjs
pnpm --filter @dinorpg/server test:integration
```

**Attention :** la commande `test:integration` réinitialise la base `dinorpg_test`. Vérifie `app/server/.env.test` avant son exécution. Ne jamais lancer sur production.

Le fichier `app/server/test/integration/dungeon/mtDungeonPartyActions.test.ts` couvre les véritables opérations PostgreSQL liées aux morts dans le groupe, aux potions Irma et au refus de soins hors zone. Il ne déclenche pas le moteur de combat complet ni les scénarios de guérison sur une zone active ; ces parcours restent à couvrir.

Commit conseillé : `test(dungeon): cover MT party casualties Irma and healing with PostgreSQL`
