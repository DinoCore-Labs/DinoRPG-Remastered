---
'@dinorpg/core': minor
'@dinorpg/server': minor
'@dinorpg/client': minor
---

Add the Dinoland Bank savings feature.

Players can now deposit gold into savings plans with different durations and interest rates. Savings are locked for 7, 14, 21, or 30 days, then can be claimed once available to recover the initial deposit plus interest.

The feature includes shared savings constants and response types, backend validation and API endpoints, gold wallet updates, savings creation and claiming logic, and a new savings tab in the Bank of Dinoland UI.

Savings deposits are capped at 1,000,000 gold per deposit.
