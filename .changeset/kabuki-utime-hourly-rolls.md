---
"@dinorpg/core": patch
"@dinorpg/server": patch
---

Fix `utime()` dialog availability by evaluating deterministic player-specific hourly windows instead of accumulated presence days. Restore intermittent Yakuzi appearances and Kabuki egg offers while preserving existing `time()` gates.
