# Contributing / Contribution

First off, thank you for considering contributing to **DinoRPG Remastered**! 🦖  
Merci de votre intérêt pour contribuer à **DinoRPG Remastered** !

This document explains the workflow used in this repository.
Ce document explique le workflow utilisé dans ce dépôt.

---

# Contributing

Before making significant changes, please **open an issue** or discuss the change on **Discord** to make sure it aligns with the project direction.

Please also read our Code of Conduct before contributing.

👉 See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## Development workflow

### 1. Never commit directly to `main` or `develop`

Do **not commit directly to the `main` or `develop` branch**.

All other work must be done in a dedicated branch.

---

### 2. Create a branch from `develop`

Always create a branch from the `develop` branch.

```bash
git checkout develop
git pull
```

For a new feature:

```bash
git checkout -b feat-my-feature
```

For a bug fix:

```bash
git checkout -b fix-my-fix
```

Branch naming conventions:

| Type          | Prefix      |
| ------------- | ----------- |
| New feature   | `feat-`     |
| Bug fix       | `fix-`      |
| Refactor      | `refactor-` |
| Documentation | `docs-`     |

A branch should contain only one feature or fix.

### 3. Install dependencies

Make sure dependencies are installed:

```bash
pnpm install
```

### 4. Respect code style

Before opening a Pull Request, make sure your code passes lint checks.

```bash
pnpm lint
pnpm fix
```

Fix any issues before submitting your changes.

### 5. Commit messages

Use clear and descriptive commit messages.

Examples:

```md
feat: add inventory filtering
fix: correct dinoz experience calculation
docs: update README installation section
```

### 6. Open a Pull Request

When your work is ready:

> [!IMPORTANT]
> Before opening a Pull Request, make sure your branch is up to date with `develop`.

1. Push your branch
2. Open a Pull Request
3. Describe clearly:

- what was changed
- why it was changed
- any related issue

Example:

```md
Fix XP distribution after fights
Closes #42
```

### 7. Wait for review

Please wait for review and approval from another maintainer before merging.

### 8. Use squash merge

When merging Pull Requests we prefer squash commits to keep the Git history clean.

# Contribution

Merci de vouloir contribuer à DinoRPG Remastered ! 🦖

Avant d’apporter des modifications importantes, merci d’ouvrir une issue GitHub ou d’en discuter sur Discord afin de vérifier que la modification correspond bien aux besoins du projet.

Merci également de lire notre code de conduite avant de contribuer.

👉 Voir [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Workflow de développement

### 1. Ne jamais commit directement sur `main` ou `develop`

Ne commitez jamais directement sur la branche `main` ou `develop`.

Tout autre travail doit être réalisé dans une branche dédiée.

### 2. Créer une branche depuis develop

Toujours créer une branche à partir de develop.

```bash
git checkout develop
git pull
```

Pour une nouvelle fonctionnalité :

```bash
git checkout -b feat-ma-feature
```

Pour corriger un bug :

```bash
git checkout -b fix-mon-fix
```

Conventions de nommage des branches :

| Type                    | Préfixe   |
| ----------------------- | --------- |
| Nouvelle fonctionnalité | feat-     |
| Correction de bug       | fix-      |
| Refactorisation         | refactor- |
| Documentation           | docs-     |

Une branche doit contenir une seule fonctionnalité ou correction.

### 3. Installer les dépendances

Assurez-vous que les dépendances sont installées :

```bash
pnpm install
```

### 4. Respecter le style du projet

Avant d’ouvrir une Pull Request, assurez-vous que le code respecte les conventions du projet.

```bash
pnpm lint
pnpm fix
```

Corrigez les éventuelles erreurs avant de proposer vos modifications.

### 5. Messages de commit

Utilisez des messages de commit clairs et descriptifs.

Exemples :

```md
feat: ajout du filtrage de l'inventaire
fix: correction du calcul d'expérience des dinoz
docs: mise à jour de la section installation du README
```

### 6. Ouvrir une Pull Request

Lorsque votre travail est prêt :

> [!IMPORTANT]
> Assurez-vous que votre branche est à jour avec `develop` avant d’ouvrir une Pull Request.

1. Poussez votre branche
2. Ouvrez une Pull Request
3. Décrivez clairement :

- les modifications apportées
- la raison de ces modifications
- l’issue associée si nécessaire

Exemple :

```md
Correction de la distribution d'XP après les combats
Closes #42
```

### 7. Attendre la review

Merci d’attendre la review et l’approbation d’un mainteneur avant de fusionner la Pull Request.

### 8. Utiliser les squash commits

Lors de la fusion des Pull Requests, nous privilégions les squash commits afin de garder un historique Git propre et lisible.
