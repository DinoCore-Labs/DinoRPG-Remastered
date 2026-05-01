---
'@dinorpg/core': minor
'@dinorpg/client': minor
'@dinorpg/server': minor
---

Add Skully dialog and mission flow.

Implemented Skully content with its mission chain, mission-specific actions, fight interactions, money/item usage steps, and localized mission/dialog texts.

Improved mission interaction handling so Dinoz actions can correctly start and complete Skully mission goals, including `FIGHT_ACTION`, `USE_ITEM`, and `USE_MONEY` steps.

Also hardened mission action resolution to avoid replaying already-consumed mission interactions after combat or when the player leaves the interaction flow.
