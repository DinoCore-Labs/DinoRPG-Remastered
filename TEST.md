# Tests

## Prérequis

Avant de lancer les tests :

- Node.js 22+
- pnpm
- PostgreSQL
- les dépendances du projet installées

```bash
pnpm install
```

### Base de données de test

Les tests d'intégration utilisent une base PostgreSQL séparée.

Crée une base dédiée, par exemple :

```text
dinorpg_test
```

Copie ensuite le fichier d'exemple :

```bash
cp .env.test.example .env.test
```

Configure `DATABASE_URL` dans `.env.test` :

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dinorpg_test"
```

> Ne jamais utiliser la base de développement ou de production pour les tests.

### Tests d'intégration

Lancer tous les tests d'intégration :

```bash
pnpm test:integration
```

Mode watch :

```bash
pnpm test:integration:watch
```

Réinitialiser manuellement la base de test :

```bash
pnpm test:db:reset
```

Vérifier le typage TypeScript des tests serveur :

```bash
pnpm --filter @dinorpg/server exec tsc -p test/tsconfig.json --noEmit
```

### Tests E2E avec Playwright

Les tests E2E utilisent Playwright.

Installer Chromium une première fois :

```bash
pnpm exec playwright install chromium
```

Sous Linux, si les dépendances système sont également nécessaires :

```bash
pnpm exec playwright install --with-deps chromium
```

Lancer les tests E2E :

```bash
pnpm test:e2e
```

Pour afficher le navigateur pendant les tests :

```bash
pnpm exec playwright test --headed
```

Pour utiliser l'interface Playwright :

```bash
pnpm exec playwright test --ui
```

### Vérification avant commit

Commande recommandée :

```bash
pnpm --filter @dinorpg/server exec tsc -p test/tsconfig.json --noEmit
pnpm test:integration
pnpm test:e2e
pnpm check
```

---

## Requirements

Before running the tests:

- Node.js 22+
- pnpm
- PostgreSQL
- project dependencies installed

```bash
pnpm install
```

### Test database

Integration tests use a dedicated PostgreSQL database.

Create a separate database, for example:

```text
dinorpg_test
```

Then copy the example environment file:

```bash
cp .env.test.example .env.test
```

Configure `DATABASE_URL` in `.env.test`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dinorpg_test"
```

> Never use the development or production database for tests.

### Integration tests

Run all integration tests:

```bash
pnpm test:integration
```

Watch mode:

```bash
pnpm test:integration:watch
```

Manually reset the test database:

```bash
pnpm test:db:reset
```

Check TypeScript types for server tests:

```bash
pnpm --filter @dinorpg/server exec tsc -p test/tsconfig.json --noEmit
```

### E2E tests with Playwright

E2E tests use Playwright.

Install Chromium once:

```bash
pnpm exec playwright install chromium
```

On Linux, if system dependencies are also required:

```bash
pnpm exec playwright install --with-deps chromium
```

Run the E2E tests:

```bash
pnpm test:e2e
```

Run Playwright with a visible browser:

```bash
pnpm exec playwright test --headed
```

Open the Playwright UI:

```bash
pnpm exec playwright test --ui
```

### Before committing

Recommended checks:

```bash
pnpm --filter @dinorpg/server exec tsc -p test/tsconfig.json --noEmit
pnpm test:integration
pnpm test:e2e
pnpm check
```
