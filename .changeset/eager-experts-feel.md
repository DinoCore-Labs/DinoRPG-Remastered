---
'@dinorpg/core': minor
'@dinorpg/server': minor
'@dinorpg/client': minor
---

Add the Dinoland Bank treasury ticket exchange feature.

The bank now exposes a daily exchange rate for converting treasury tickets into gold. The exchange rate is randomly generated between 0.9 and 1.2, stored server-side, and refreshed daily through the scheduler.

Players can access the Bank of Dinoland from the side menus, view the current exchange rate, choose how many treasury tickets to convert, preview the gold reward, and complete the conversion. The player wallet is updated immediately after a successful exchange.
