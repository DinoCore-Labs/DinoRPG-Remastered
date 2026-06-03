# @dinorpg/client

## 0.26.0

### Minor Changes

- f176621: Add the Dinoland Bank treasury ticket exchange feature.

  The bank now exposes a daily exchange rate for converting treasury tickets into gold. The exchange rate is randomly generated between 0.9 and 1.2, stored server-side, and refreshed daily through the scheduler.

  Players can access the Bank of Dinoland from the side menus, view the current exchange rate, choose how many treasury tickets to convert, preview the gold reward, and complete the conversion. The player wallet is updated immediately after a successful exchange.

## 0.25.0

### Minor Changes

- c6e5d18: Add discovered skills progression and PAC epic reward unlock.

  Players now progressively discover skills when a Dinoz learns a new skill during level up, or when they claim a market Dinoz that already owns skills. The discovered skills are stored on the user profile and exposed through the user session payload.

  The PAC epic reward and scenario are now unlocked automatically when the first skill is discovered. PAC grants access to the new skills page, where discovered skills are displayed as elemental skill trees with unknown skills hidden until discovered.

  Also sync discovered skills and PAC reward state on the client after level up and market claim actions.

## 0.24.0

### Minor Changes

- 91b2e99: add elmaster dialog and missions

## 0.23.0

### Minor Changes

- 0a3de64: Add complete game log tracking, admin log management, and log analytics charts.

  ### Backend
  - Added missing logs for gameplay events, missions, market actions, and admin actions.
  - Added audit logs for sensitive actions performed from the admin panel.
  - Added dedicated admin logs for updates on users, Dinoz, missions, scenarios, inventories, currencies, rewards, statuses, and skills.
  - Added support for hourly and daily log aggregations.
  - Added aggregated values for logs such as gold won/lost, XP earned, and HP lost.

  ### Frontend
  - Added a dedicated Admin logs page.
  - Added filters by type, retention, user, Dinoz, admin actor, and period.
  - Added detailed metadata display for logs.
  - Added charts to visualize logs by day or by hour depending on the selected period.
  - Added min/max value highlighting in log charts.
  - Reused existing UI components: `DZTable`, `DZInput`, `DZButton`, and `DZSelect`.

  ### Core
  - Added shared types required to read and display admin logs on the client.

## 0.22.0

### Minor Changes

- ab866ae: add madame X (dialogs and missions) + double skills

## 0.21.0

### Minor Changes

- b055010: Add the Forcebrut tournament system.
  - Add shared Forcebrut tournament types and opponent data.
  - Add the tournament organizer dialog to unlock tournament access.
  - Add backend routes and services for Forcebrut opponents and fights.
  - Add admin tools to create and manage tournament opponents.
  - Add Prisma seed support for Forcebrut tournament opponents.
  - Add the Forcebrut tournament frontend page and combat flow.
  - Consume an Irma potion when launching a tournament fight.
  - Show the last defeated opponent when all available tournament opponents are completed.
  - Add translated Forcebrut tournament error messages.

## 0.20.0

### Minor Changes

- 9553d7a: Add the Breeder Market system.

  This update introduces the first version of the Breeder Market, allowing players to create, browse, bid on, cancel, and claim market offers.

  ### Backend
  - Added market offer database models for offers, offer items, bids, and offer statuses.
  - Added market API routes for listing, creating, bidding, cancelling, and claiming offers.
  - Added scheduled market offer expiration using the existing server job system.
  - Added inventory, Dinoz ownership, capacity, wallet, and ranking safeguards.
  - Added support for selling Dinoz, items, and ingredients through market offers.
  - Added automatic gold transfer to sellers when an offer ends with a winning bid.

  ### Frontend
  - Added the Breeder Market page.
  - Added offer listing, transaction, selling, and history views.
  - Added offer details with Dinoz stats, skills, statuses, items, ingredients, seller, timer, and bid information.
  - Added Treasure Ticket bidding support.
  - Added silent market refresh to avoid global loading flicker while keeping offer timers updated.
  - Added Dinoz selling state handling and disclaimer in Dinoz actions.

  ### Core
  - Added shared market types and utilities used by the frontend and backend.

## 0.19.1

### Patch Changes

- a36a9ac: Refactor frontend HTTP layer by adding typed API helpers and migrating services to use direct response unwrapping.

  This simplifies service calls, improves response typing, removes repeated Axios `.then/.catch` boilerplate, and supports silent background requests for endpoints such as version checks.

## 0.19.0

### Minor Changes

- 67f00da: Add player scenario progression support and introduce the first Starquest scenario.

  This update adds the foundations for scenario-driven gameplay, including player scenario progression, scenario conditions in dialogs and actions, and quest-specific scenario rewards.

  It also introduces the first playable scenario, Starquest, with dedicated dialogs, item-based triggers, dig/resurrection progression steps, localized scenario texts, and frontend feedback for scenario rewards.

## 0.18.0

### Minor Changes

- a51a2f0: Add PDA-based Dinoz order management.

  Implemented the Manage Dinoz page unlocked by the PDA epic reward, allowing players to reorder their Dinoz from the side menus.

  Added core return types and improved Dinoz ordering so active and frozen Dinoz keep their own sorted order while preserving follower placement after leaders.

  Added PDA-protected server endpoints to fetch manageable Dinoz and update their order safely.

  Added client service methods, route registration, PDA access checks through the user store, and updated Dinoz lists to reflect the custom order across the account and active Dinoz navigation.

## 0.17.1

### Patch Changes

- 3c8c010: add Merguez seller

## 0.17.0

### Minor Changes

- 5de4019: Add Skully dialog and mission flow.

  Implemented Skully content with its mission chain, mission-specific actions, fight interactions, money/item usage steps, and localized mission/dialog texts.

  Improved mission interaction handling so Dinoz actions can correctly start and complete Skully mission goals, including `FIGHT_ACTION`, `USE_ITEM`, and `USE_MONEY` steps.

  Also hardened mission action resolution to avoid replaying already-consumed mission interactions after combat or when the player leaves the interaction flow.

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
