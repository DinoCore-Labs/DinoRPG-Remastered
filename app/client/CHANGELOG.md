# @dinorpg/client

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
