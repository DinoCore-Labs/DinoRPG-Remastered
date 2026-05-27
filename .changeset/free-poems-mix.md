---
'@dinorpg/core': minor
'@dinorpg/server': minor
'@dinorpg/client': minor
---

Add discovered skills progression and PAC epic reward unlock.

Players now progressively discover skills when a Dinoz learns a new skill during level up, or when they claim a market Dinoz that already owns skills. The discovered skills are stored on the user profile and exposed through the user session payload.

The PAC epic reward and scenario are now unlocked automatically when the first skill is discovered. PAC grants access to the new skills page, where discovered skills are displayed as elemental skill trees with unknown skills hidden until discovered.

Also sync discovered skills and PAC reward state on the client after level up and market claim actions.
