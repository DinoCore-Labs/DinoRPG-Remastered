# 📦 Global CHANGELOG

## 🔹 Core

## 0.15.4

### Patch Changes

- 060577c: add forest Guardian dialog and missions

## 0.15.3

### Patch Changes

- e154d8a: add Nicolas Mulot

## 0.15.2

### Patch Changes

- 978f32c: add Dian Korgsey

## 0.15.1

### Patch Changes

- b06fe72: add Bao Bob dialog and missions

## 0.15.0

### Minor Changes

- d0548a7: Add Fosselave Training Center

  Added the Fosselave Training Center feature with CEF programs, dedicated backend routes and services, frontend training page, available action integration, fight animation flow, and localized training center content.

  Also added shared loading utilities with Loader, Spinner, and loadingStore, improved the training center page, fixed CEF fight animation locale handling, and ensured CEF fight results are displayed after the animation ends.

## 0.14.3

### Patch Changes

- aeb70fe: Update the roadmap and add the related EN/ES/DE translations.

  This release fixes several missing or incorrect i18n keys, improves the egg acquisition toast display before redirecting, and adjusts fight result handling by determining the winner from the caller with better tie management.

  It also includes several dependency updates, including Prisma, PixiJS, dotenv, Swagger UI, `@prisma/client-runtime-utils`, and the pnpm lockfile.

## 0.14.2

### Patch Changes

- c14b8e1: add venerable and injured soldier

## 0.14.1

### Patch Changes

- 2178350: Add admin support for Dinoz mission management, including mission editing, replay reset, and improved owner navigation between admin Dinoz and user pages.

## 0.14.0

### Minor Changes

- a901d79: Improve Dinoz actions, fight resolution, and user data synchronization.

  Added confirmation popups for inventory item usage and Dinoz actions such as digging, freezing, unfreezing, reincarnating, and unlocking new skills.

  Improved fight stability by fixing timeout handling, death dialog resolution, critical hit bonus naming, special stat energy defaults, attacker defeat rules, and time reference mutation issues during fights.

  Updated Dinoz user data handling by synchronizing sidebar data after the initial user load and making the Dinoz ordering utility safer to use from the backend.

## 0.13.3

### Patch Changes

- 92fcbf6: Fix mission dialog handling, translation keys, and swamp special rules configuration.
  - fix mission dialog NPC name resolution
  - fix current/completed mission checks in dialog conditions
  - fix incorrect rodeur translation keys
  - remove unused mission dialog params
  - add config toggles for swamp movement and fight restrictions

## 0.13.2

### Patch Changes

- 1a7f794: add Rodeur dialogs and missions

## 0.13.1

### Patch Changes

- e0d67f4: add shaman mou dialogs and missions

## 0.13.0

### Minor Changes

- 7304d10: feat: implement private messaging, rich text editor, and messaging access flow

## 0.12.0

### Minor Changes

- bc9e852: Implement the full mission system across Prisma, core, backend, and frontend, and add the Papy Joe mission chain.

  ### Added
  - Prisma models and persistence for dinoz missions and progression
  - shared mission definitions, goals, rewards, and interaction types in core
  - backend mission progression, validation, rewards, and action handling
  - frontend mission HUD, mission actions, validation flow, and reward modal
  - Papy Joe missions with movement, talk, kill, action, and validation goals

  ### Improved
  - mission progression handling for grouped dinoz in movement and fights
  - mission monster encounter weighting for kill objectives
  - mission reward synchronization with frontend state

## 0.11.1

### Patch Changes

- 4f8b9ba: add strange dinoz dialogs

## 0.11.0

### Minor Changes

- aefc4ba: Add the Speleleologue NPC, freeze/unfreeze actions, and automatic unfreeze completion after 24 hours

## 0.10.6

### Patch Changes

- f7503f9: Add weird man dialog

## 0.10.5

### Patch Changes

- c141871: add Archisage dialog

## 0.10.4

### Patch Changes

- b421908: Adds Hydargol and Padamoine dialogs, collection reward handling, and the Pearl daily healing scheduler

## 0.10.3

### Patch Changes

- eb40dca: feat atlanteGuard and joveboze dialogs

## 0.10.2

### Patch Changes

- 69c3dd9: feat coral miner

## 0.10.1

### Patch Changes

- bd58005: feat professor eugene

## 0.10.0

### Minor Changes

- a32f88d: feat dialog

## 0.9.0

### Minor Changes

- 9fa33cb: refactor conditions

## 0.8.5

### Patch Changes

- 4549e80: feat news

## 0.8.4

### Patch Changes

- 21f55ea: feat: admin dinoz panel

## 0.8.3

### Patch Changes

- c41aa3d: admin secrets panel

## 0.8.2

### Patch Changes

- a534c39: admin user panel

## 0.8.1

### Patch Changes

- abeb4b5: alpha 0.1.0

## 0.8.0

### Minor Changes

- f7a4874: refactor fight

## 0.7.1

### Patch Changes

- f848067: some fixes

## 0.7.0

### Minor Changes

- 4686734: feat shop

## 0.6.0

### Minor Changes

- 3f8f525: feat: dinoz actions

## 0.5.3

### Patch Changes

- 7d5974f: feat: dinoz state

## 0.5.2

### Patch Changes

- 19e315b: chore: update dependencies and dev dependencies

## 0.5.1

### Patch Changes

- f85d657: user unique skills

## 0.5.0

### Minor Changes

- db8c871: feat: items

## 0.4.0

### Minor Changes

- 33c02ca: feat: level up

## 0.3.1

### Patch Changes

- ac3fd27: chore: update dependencies

## 0.3.0

### Minor Changes

- c2a2b6b: feat: gather
- b39d3bb: feat: completion and completion ranking

## 0.2.0

### Minor Changes

- 98da614: chore: update dependencies and dev dependencies

## 0.1.0

### Minor Changes

- 4893ac4: feat: fight
- babb181: feat: buy dinoz

### Patch Changes

- d12f917: feat: dinoz shop

## 0.0.5

### Patch Changes

- 449be3b: chore: update dependencies

## 0.0.4

### Patch Changes

- 370e56a: add user profile, user items, user ingredients

## 0.0.3

### Patch Changes

- [2a84f0d](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/2a84f0d): feat dinorpg_animations
  - [40e1dca](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/40e1dca): feat user wallet
  - [bb0ad18](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/bb0ad18): feat rankings

## 0.0.2

### Patch Changes

- [d2c5d3d](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/d2c5d3d): feat: create interface router, userStore, UserRole

## 0.0.1

### Patch Changes

- [4c54f8c](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/4c54f8c): configure core packages and eslint/prettier setup for Typescript .mts files

## 🔹 Bot

## 0.2.5

### Patch Changes

- eb40dca: feat atlanteGuard and joveboze dialogs

## 0.2.4

### Patch Changes

- f848067: some fixes

## 0.2.3

### Patch Changes

- 19e315b: chore: update dependencies and dev dependencies

## 0.2.2

### Patch Changes

- ac3fd27: chore: update dependencies

## 0.2.1

### Patch Changes

- 4319096: fix: remove console log

## 0.2.0

### Minor Changes

- 98da614: chore: update dependencies and dev dependencies

## 0.1.1

### Patch Changes

- 449be3b: chore: update dependencies

## 0.1.0

### Minor Changes

- [ab4441c](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/ab4441c): configure bot discord

## 🔹 Server

## 0.16.2

### Patch Changes

- e154d8a: add Nicolas Mulot
- Updated dependencies [e154d8a]
  - @dinorpg/core@0.15.3

## 0.16.1

### Patch Changes

- b06fe72: add Bao Bob dialog and missions
- Updated dependencies [b06fe72]
  - @dinorpg/core@0.15.1

## 0.16.0

### Minor Changes

- d0548a7: Add Fosselave Training Center

  Added the Fosselave Training Center feature with CEF programs, dedicated backend routes and services, frontend training page, available action integration, fight animation flow, and localized training center content.

  Also added shared loading utilities with Loader, Spinner, and loadingStore, improved the training center page, fixed CEF fight animation locale handling, and ensured CEF fight results are displayed after the animation ends.

### Patch Changes

- Updated dependencies [d0548a7]
  - @dinorpg/core@0.15.0

## 0.15.3

### Patch Changes

- aeb70fe: Update the roadmap and add the related EN/ES/DE translations.

  This release fixes several missing or incorrect i18n keys, improves the egg acquisition toast display before redirecting, and adjusts fight result handling by determining the winner from the caller with better tie management.

  It also includes several dependency updates, including Prisma, PixiJS, dotenv, Swagger UI, `@prisma/client-runtime-utils`, and the pnpm lockfile.

- Updated dependencies [aeb70fe]
  - @dinorpg/core@0.14.3

## 0.15.2

### Patch Changes

- c14b8e1: add venerable and injured soldier
- Updated dependencies [c14b8e1]
  - @dinorpg/core@0.14.2

## 0.15.1

### Patch Changes

- 2178350: Add admin support for Dinoz mission management, including mission editing, replay reset, and improved owner navigation between admin Dinoz and user pages.
- Updated dependencies [2178350]
  - @dinorpg/core@0.14.1

## 0.15.0

### Minor Changes

- a901d79: Improve Dinoz actions, fight resolution, and user data synchronization.

  Added confirmation popups for inventory item usage and Dinoz actions such as digging, freezing, unfreezing, reincarnating, and unlocking new skills.

  Improved fight stability by fixing timeout handling, death dialog resolution, critical hit bonus naming, special stat energy defaults, attacker defeat rules, and time reference mutation issues during fights.

  Updated Dinoz user data handling by synchronizing sidebar data after the initial user load and making the Dinoz ordering utility safer to use from the backend.

### Patch Changes

- Updated dependencies [a901d79]
  - @dinorpg/core@0.14.0

## 0.14.4

### Patch Changes

- 92fcbf6: Fix mission dialog handling, translation keys, and swamp special rules configuration.
  - fix mission dialog NPC name resolution
  - fix current/completed mission checks in dialog conditions
  - fix incorrect rodeur translation keys
  - remove unused mission dialog params
  - add config toggles for swamp movement and fight restrictions

- Updated dependencies [92fcbf6]
  - @dinorpg/core@0.13.3

## 0.14.3

### Patch Changes

- 1a7f794: add Rodeur dialogs and missions
- Updated dependencies [1a7f794]
  - @dinorpg/core@0.13.2

## 0.14.2

### Patch Changes

- e0d67f4: add shaman mou dialogs and missions
- Updated dependencies [e0d67f4]
  - @dinorpg/core@0.13.1

## 0.14.1

### Patch Changes

- 50b38bb: feat add locale switcher

## 0.14.0

### Minor Changes

- 7304d10: feat: implement private messaging, rich text editor, and messaging access flow

### Patch Changes

- Updated dependencies [7304d10]
  - @dinorpg/core@0.13.0

## 0.13.0

### Minor Changes

- bc9e852: Implement the full mission system across Prisma, core, backend, and frontend, and add the Papy Joe mission chain.

  ### Added
  - Prisma models and persistence for dinoz missions and progression
  - shared mission definitions, goals, rewards, and interaction types in core
  - backend mission progression, validation, rewards, and action handling
  - frontend mission HUD, mission actions, validation flow, and reward modal
  - Papy Joe missions with movement, talk, kill, action, and validation goals

  ### Improved
  - mission progression handling for grouped dinoz in movement and fights
  - mission monster encounter weighting for kill objectives
  - mission reward synchronization with frontend state

### Patch Changes

- Updated dependencies [bc9e852]
  - @dinorpg/core@0.12.0

## 0.12.1

### Patch Changes

- 4f8b9ba: add strange dinoz dialogs
- Updated dependencies [4f8b9ba]
  - @dinorpg/core@0.11.1

## 0.12.0

### Minor Changes

- aefc4ba: Add the Speleleologue NPC, freeze/unfreeze actions, and automatic unfreeze completion after 24 hours

### Patch Changes

- Updated dependencies [aefc4ba]
  - @dinorpg/core@0.11.0

## 0.11.6

### Patch Changes

- f7503f9: Add weird man dialog
- Updated dependencies [f7503f9]
  - @dinorpg/core@0.10.6

## 0.11.5

### Patch Changes

- c141871: add Archisage dialog
- Updated dependencies [c141871]
  - @dinorpg/core@0.10.5

## 0.11.4

### Patch Changes

- b421908: Adds Hydargol and Padamoine dialogs, collection reward handling, and the Pearl daily healing scheduler
- Updated dependencies [b421908]
  - @dinorpg/core@0.10.4

## 0.11.3

### Patch Changes

- eb40dca: feat atlanteGuard and joveboze dialogs
- Updated dependencies [eb40dca]
  - @dinorpg/core@0.10.3

## 0.11.2

### Patch Changes

- 69c3dd9: feat coral miner
- Updated dependencies [69c3dd9]
  - @dinorpg/core@0.10.2

## 0.11.1

### Patch Changes

- bd58005: feat professor eugene
- Updated dependencies [bd58005]
  - @dinorpg/core@0.10.1

## 0.11.0

### Minor Changes

- a32f88d: feat dialog

### Patch Changes

- Updated dependencies [a32f88d]
  - @dinorpg/core@0.10.0

## 0.10.0

### Minor Changes

- 9fa33cb: refactor conditions

### Patch Changes

- Updated dependencies [9fa33cb]
  - @dinorpg/core@0.9.0

## 0.9.6

### Patch Changes

- 4549e80: feat news
- Updated dependencies [4549e80]
  - @dinorpg/core@0.8.5

## 0.9.5

### Patch Changes

- 21f55ea: feat: admin dinoz panel
- Updated dependencies [21f55ea]
  - @dinorpg/core@0.8.4

## 0.9.4

### Patch Changes

- c41aa3d: admin secrets panel
- Updated dependencies [c41aa3d]
  - @dinorpg/core@0.8.3

## 0.9.3

### Patch Changes

- a534c39: admin user panel
- Updated dependencies [a534c39]
  - @dinorpg/core@0.8.2

## 0.9.2

### Patch Changes

- b8a7bac: refactor(server): migrate API validation to Zod v4 and add Swagger tags

## 0.9.1

### Patch Changes

- abeb4b5: alpha 0.1.0
- Updated dependencies [abeb4b5]
  - @dinorpg/core@0.8.1

## 0.9.0

### Minor Changes

- f7a4874: refactor fight

### Patch Changes

- Updated dependencies [f7a4874]
  - @dinorpg/core@0.8.0

## 0.8.1

### Patch Changes

- f848067: some fixes
- Updated dependencies [f848067]
  - @dinorpg/core@0.7.1

## 0.8.0

### Minor Changes

- 4686734: feat shop

### Patch Changes

- Updated dependencies [4686734]
  - @dinorpg/core@0.7.0

## 0.7.0

### Minor Changes

- 3f8f525: feat: dinoz actions

### Patch Changes

- Updated dependencies [3f8f525]
  - @dinorpg/core@0.6.0

## 0.6.3

### Patch Changes

- 7d5974f: feat: dinoz state
- Updated dependencies [7d5974f]
  - @dinorpg/core@0.5.3

## 0.6.2

### Patch Changes

- 19e315b: chore: update dependencies and dev dependencies
- Updated dependencies [19e315b]
  - @dinorpg/core@0.5.2

## 0.6.1

### Patch Changes

- f85d657: user unique skills
- Updated dependencies [f85d657]
  - @dinorpg/core@0.5.1

## 0.6.0

### Minor Changes

- db8c871: feat: items

### Patch Changes

- Updated dependencies [db8c871]
  - @dinorpg/core@0.5.0

## 0.5.1

### Patch Changes

- c9de971: some fixes

## 0.5.0

### Minor Changes

- 33c02ca: feat: level up

### Patch Changes

- Updated dependencies [33c02ca]
  - @dinorpg/core@0.4.0

## 0.4.1

### Patch Changes

- ac3fd27: chore: update dependencies
- Updated dependencies [ac3fd27]
  - @dinorpg/core@0.3.1

## 0.4.0

### Minor Changes

- c2a2b6b: feat: gather
- b39d3bb: feat: completion and completion ranking

### Patch Changes

- Updated dependencies [c2a2b6b]
- Updated dependencies [b39d3bb]
  - @dinorpg/core@0.3.0

## 0.3.0

### Minor Changes

- 98da614: chore: update dependencies and dev dependencies

### Patch Changes

- Updated dependencies [98da614]
  - @dinorpg/core@0.2.0

## 0.2.0

### Minor Changes

- 4893ac4: feat: fight
- babb181: feat: buy dinoz

### Patch Changes

- d12f917: feat: dinoz shop
- ff359da: feat: model dinoz shop
- ac47736: chore: update prisma dependencies
- ac47736: feat: model dinoz
- Updated dependencies [d12f917]
- Updated dependencies [4893ac4]
- Updated dependencies [babb181]
  - @dinorpg/core@0.1.0

## 0.1.3

### Patch Changes

- 449be3b: chore: update dependencies
- Updated dependencies [449be3b]
  - @dinorpg/core@0.0.5

## 0.1.2

### Patch Changes

- 370e56a: add user profile, user items, user ingredients
- 370e56a: add device and network limits on account signup
- Updated dependencies [370e56a]
  - @dinorpg/core@0.0.4

## 0.1.1

### Patch Changes

- [bb0ad18](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/bb0ad18): feat rankings
- Updated dependencies [6858444]
  - @dinorpg/core@0.0.3

## 0.1.0

### Minor Changes

- [cf61cf7](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/cf61cf7): chore configure @fastify-swagger
- [0885b20](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/0885b20): feat user controller
- [508d7f3](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/508d7f3): feat user routes, user schemas & init prisma

## 0.0.1

### Patch Changes

- [26f9f95](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/26f9f95): initialize server package with Fastify, TypeScript, tsc-watch, and dev/start scripts

## 🔹 Client

## 0.16.4

### Patch Changes

- 060577c: add forest Guardian dialog and missions

## 0.16.3

### Patch Changes

- e154d8a: add Nicolas Mulot

## 0.16.2

### Patch Changes

- 978f32c: add Dian Korgsey

## 0.16.1

### Patch Changes

- b06fe72: add Bao Bob dialog and missions

## 0.16.0

### Minor Changes

- d0548a7: Add Fosselave Training Center

  Added the Fosselave Training Center feature with CEF programs, dedicated backend routes and services, frontend training page, available action integration, fight animation flow, and localized training center content.

  Also added shared loading utilities with Loader, Spinner, and loadingStore, improved the training center page, fixed CEF fight animation locale handling, and ensured CEF fight results are displayed after the animation ends.

## 0.15.3

### Patch Changes

- aeb70fe: Update the roadmap and add the related EN/ES/DE translations.

  This release fixes several missing or incorrect i18n keys, improves the egg acquisition toast display before redirecting, and adjusts fight result handling by determining the winner from the caller with better tie management.

  It also includes several dependency updates, including Prisma, PixiJS, dotenv, Swagger UI, `@prisma/client-runtime-utils`, and the pnpm lockfile.

## 0.15.2

### Patch Changes

- c14b8e1: add venerable and injured soldier

## 0.15.1

### Patch Changes

- 2178350: Add admin support for Dinoz mission management, including mission editing, replay reset, and improved owner navigation between admin Dinoz and user pages.

## 0.15.0

### Minor Changes

- a901d79: Improve Dinoz actions, fight resolution, and user data synchronization.

  Added confirmation popups for inventory item usage and Dinoz actions such as digging, freezing, unfreezing, reincarnating, and unlocking new skills.

  Improved fight stability by fixing timeout handling, death dialog resolution, critical hit bonus naming, special stat energy defaults, attacker defeat rules, and time reference mutation issues during fights.

  Updated Dinoz user data handling by synchronizing sidebar data after the initial user load and making the Dinoz ordering utility safer to use from the backend.

## 0.14.5

### Patch Changes

- 92fcbf6: Fix mission dialog handling, translation keys, and swamp special rules configuration.
  - fix mission dialog NPC name resolution
  - fix current/completed mission checks in dialog conditions
  - fix incorrect rodeur translation keys
  - remove unused mission dialog params
  - add config toggles for swamp movement and fight restrictions

## 0.14.4

### Patch Changes

- 1a7f794: add Rodeur dialogs and missions

## 0.14.3

### Patch Changes

- e0d67f4: add shaman mou dialogs and missions

## 0.14.2

### Patch Changes

- 51518dd: i18n: add English translations

## 0.14.1

### Patch Changes

- 50b38bb: feat add locale switcher

## 0.14.0

### Minor Changes

- 7304d10: feat: implement private messaging, rich text editor, and messaging access flow

## 0.13.0

### Minor Changes

- bc9e852: Implement the full mission system across Prisma, core, backend, and frontend, and add the Papy Joe mission chain.

  ### Added
  - Prisma models and persistence for dinoz missions and progression
  - shared mission definitions, goals, rewards, and interaction types in core
  - backend mission progression, validation, rewards, and action handling
  - frontend mission HUD, mission actions, validation flow, and reward modal
  - Papy Joe missions with movement, talk, kill, action, and validation goals

  ### Improved
  - mission progression handling for grouped dinoz in movement and fights
  - mission monster encounter weighting for kill objectives
  - mission reward synchronization with frontend state

## 0.12.1

### Patch Changes

- 4f8b9ba: add strange dinoz dialogs

## 0.12.0

### Minor Changes

- aefc4ba: Add the Speleleologue NPC, freeze/unfreeze actions, and automatic unfreeze completion after 24 hours

## 0.11.6

### Patch Changes

- f7503f9: Add weird man dialog

## 0.11.5

### Patch Changes

- c141871: add Archisage dialog

## 0.11.4

### Patch Changes

- b421908: Adds Hydargol and Padamoine dialogs, collection reward handling, and the Pearl daily healing scheduler

## 0.11.3

### Patch Changes

- eb40dca: feat atlanteGuard and joveboze dialogs

## 0.11.2

### Patch Changes

- 69c3dd9: feat coral miner

## 0.11.1

### Patch Changes

- bd58005: feat professor eugene

## 0.11.0

### Minor Changes

- a32f88d: feat dialog

## 0.10.0

### Minor Changes

- 9fa33cb: refactor conditions

## 0.9.6

### Patch Changes

- 4549e80: feat news

## 0.9.5

### Patch Changes

- 21f55ea: feat: admin dinoz panel

## 0.9.4

### Patch Changes

- c41aa3d: admin secrets panel

## 0.9.3

### Patch Changes

- a534c39: admin user panel

## 0.9.2

### Patch Changes

- abeb4b5: alpha 0.1.0

## 0.9.1

### Patch Changes

- c12bfc7: feat roadmap

## 0.9.0

### Minor Changes

- f7a4874: refactor fight

## 0.8.1

### Patch Changes

- f848067: some fixes

## 0.8.0

### Minor Changes

- 4686734: feat shop

## 0.7.0

### Minor Changes

- 3f8f525: feat: dinoz actions

## 0.6.3

### Patch Changes

- 7d5974f: feat: dinoz state

## 0.6.2

### Patch Changes

- 19e315b: chore: update dependencies and dev dependencies

## 0.6.1

### Patch Changes

- f85d657: user unique skills

## 0.6.0

### Minor Changes

- db8c871: feat: items

## 0.5.1

### Patch Changes

- c9de971: some fixes

## 0.5.0

### Minor Changes

- 33c02ca: feat: level up

## 0.4.1

### Patch Changes

- ac3fd27: chore: update dependencies

## 0.4.0

### Minor Changes

- c2a2b6b: feat: gather
- b39d3bb: feat: completion and completion ranking

## 0.3.0

### Minor Changes

- 98da614: chore: update dependencies and dev dependencies

## 0.2.0

### Minor Changes

- 4893ac4: feat: fight
- babb181: feat: buy dinoz

### Patch Changes

- d12f917: feat: dinoz shop

## 0.1.4

### Patch Changes

- 449be3b: chore: update dependencies

## 0.1.3

### Patch Changes

- 22a9b7c: refactor: add DZTable component
- efb8bc3: feat: user left menu
- 37e834f: feat: faq page
- 1c28126: feat: help page

## 0.1.2

### Patch Changes

- 370e56a: add user profile, user items, user ingredients
- 370e56a: chore: vue-tippy

## 0.1.1

### Patch Changes

- [bb0ad18](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/bb0ad18): feat rankings

## 0.1.0

### Minor Changes

- [d2c5d3d](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/d2c5d3d): feat add frontend auth integration (register/login, userStore, router auth & roles)
- [288cb3a](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/288cb3a): chore configure pinia
- [c6ba44a](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/c6ba44a): feat authMenu

## 0.0.2

### Patch Changes

- [fb68309](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/fb68309): feat mainpage & leftpanel
- [3757c33](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/3757c33): feat beautifulNumber utility
- [97a0e70](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/97a0e70): feat topbar
- [96b8e3f](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/96b8e3f): feat footer

## 0.0.1

### Patch Changes

- [3effdb3](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/3effdb3): setup VueDevTools
- [ea6c230](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/ea6c230): feat HomePage
- [139ebff](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/139ebff): fix correct dev script to properly launch client
- [da7cc2c](https://github.com/DinoCore-Labs/DinoRPG-Remastered/commit/da7cc2c): setup Vue 3 + Vite setup with TypeScript, ESLint and Prettier
