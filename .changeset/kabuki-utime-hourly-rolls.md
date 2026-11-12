---
'@dinorpg/core': patch
'@dinorpg/server': patch
---

Restore `utime()` as a player-specific hourly roll for dialog availability.

Yakuzi appearances and Kabuki egg offers now use these hourly windows rather than accumulated presence days.

Existing `time()` gates remain unchanged.
