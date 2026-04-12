---
'@dinorpg/core': minor
'@dinorpg/client': minor
'@dinorpg/server': minor
---

Implement the full mission system across Prisma, core, backend, and frontend, and add the Papy Joe mission chain.

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
