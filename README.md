# 🦖 DinoRPG Remastered

DinoRPG Remastered is an open-source recreation and modernization of the classic browser game **DinoRPG** originally created by **Motion Twin**.

> This project is an independent fan project and is not affiliated with Motion Twin.

DinoRPG Remastered est une recréation open-source et une modernisation du jeu navigateur **DinoRPG** créé à l’origine par **Motion Twin**.

> Ce projet est un projet de fans indépendant et n’est pas affilié à Motion Twin.

🌍 Original game: [Motion Twin](https://motiontwin.com/)  
🦖 Project repository: https://github.com/DinoCore-Labs/DinoRPG-Remastered

## Table of Contents / Table des matières

- [About the project](#about-the-project)
- [À propos du projet](#à-propos-du-projet)
- [Project Structure / Structure du projet](#project-structure--structure-du-projet)
- [Local installation](#local-installation)
- [Installation locale](#installation-locale)
- [License / Licence](#license--licence)

## About the project

DinoRPG Remastered is a community-driven project that aims to recreate the original DinoRPG experience while modernizing the technology behind it.

The goal of this project is to:

- preserve the gameplay of the original browser game
- modernize the codebase
- make the project fully open-source
- allow the community to extend and improve the game

Players can raise **Dinoz**, explore maps, gather resources, fight monsters, and progress through the world.

The original DinoRPG was created by **Motion Twin**.

Official website of Motion Twin: [Motion Twin](https://motiontwin.com/)

---

## À propos du projet

DinoRPG Remastered est un projet communautaire visant à recréer l'expérience originale du jeu navigateur DinoRPG tout en modernisant sa technologie.

Les objectifs du projet sont :

- préserver le gameplay du jeu original
- moderniser l’architecture technique
- rendre le projet entièrement open-source
- permettre à la communauté d'améliorer et d'étendre le jeu

Les joueurs peuvent élever des **Dinoz**, explorer le monde, récolter des ressources, combattre des monstres et progresser dans l’univers du jeu.

Le DinoRPG original a été créé par **Motion Twin**.

Site officiel de Motion Twin : [Motion Twin](https://motiontwin.com/)

---

## Project Structure / Structure du projet

This repository uses a **pnpm workspace monorepo** to organize the different parts of the project.

Ce dépôt utilise un **monorepo pnpm workspace** pour organiser les différentes parties du projet.

```
.
├─ app/
│ ├─ client/ # Vue 3 frontend (Vite + Pinia)
│ └─ server/ # Fastify backend API
│
├─ packages/
│ └─ core/ # Shared types, models and game logic
│
├─ package.json
├─ pnpm-workspace.yaml # Root workspace configuration
└─ README.md
```

### Explanation / Explication

**client**  
Frontend application built with **Vue 3**, **Vite**, and **Pinia**.

Application frontend développée avec **Vue 3**, **Vite** et **Pinia**.

**server**  
Backend API built with **Node.js**, **Fastify**, and **Prisma**.

API backend développée avec **Node.js**, **Fastify** et **Prisma**.

**core**  
Shared package containing **types, models, and game logic** used by both the client and the server.

Package partagé contenant les **types, modèles et logique du jeu** utilisés par le client et le serveur.

## Local installation

### Requirements

- Node.js >= 20
- pnpm
- PostgreSQL

### 1 — Clone the repository

```bash
git clone https://github.com/DinoCore-Labs/DinoRPG-Remastered.git

cd DinoRPG-Remastered
```

### 2 — Install dependencies

```bash
pnpm install
```

### 3 — Configure environment variables

Create a `.env` file inside `app/server`

The file `app/server/.env` must be edited so that the last line matches your **DinoRPG database configuration**.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
```

Make sure to replace:

- `user` with your PostgreSQL username
- `password` with your PostgreSQL password
- `db_name` with the name of your database

### 4 — Run database migrations

```bash
pnpm db:sync
```

### 5 — Start the development servers

```bash
pnpm dev
```

The application should now be available at:
http://localhost:8080

## Installation locale

### Prérequis

- Node.js >= 20
- pnpm
- PostgreSQL

### 1 — Cloner le dépôt

```bash
git clone https://github.com/DinoCore-Labs/DinoRPG-Remastered.git

cd DinoRPG-Remastered
```

### 2 — Installer les dépendances

```bash
pnpm install
```

### 3 — Configurer les variables d’environnement

Créer un fichier `.env` dans le dossier `app/server`

Le fichier app/server/.env doit être modifié afin que la dernière ligne corresponde à votre base de données DinoRPG.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
```

Assurez-vous de remplacer :

- `user` par votre nom d'utilisateur PostgreSQL
- `password` par votre mot de passe PostgreSQL
- `db_name` par le nom de votre base de données

### 4 — Lancer les migrations

```bash
pnpm db:sync
```

### 5 — Lancer le projet

```bash
pnpm dev
```

L’application sera alors disponible en local : http://localhost:8080

## License / Licence

### Code

The source code of this project is licensed under the **GNU AGPL-3.0** license.

See the [LICENSE](LICENSE) file for more details.

Le code source de ce projet est distribué sous licence **GNU AGPL-3.0**.

---

### Game assets and original content

Some game assets and original content originate from **DinoRPG**, a game created by **Motion Twin**.

These assets are licensed under the:

**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**

License link:  
http://creativecommons.org/licenses/by-nc-sa/4.0/
