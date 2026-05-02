---
'@dinorpg/core': minor
'@dinorpg/server': minor
'@dinorpg/client': minor
---

Add PDA-based Dinoz order management.

Implemented the Manage Dinoz page unlocked by the PDA epic reward, allowing players to reorder their Dinoz from the side menus.

Added core return types and improved Dinoz ordering so active and frozen Dinoz keep their own sorted order while preserving follower placement after leaders.

Added PDA-protected server endpoints to fetch manageable Dinoz and update their order safely.

Added client service methods, route registration, PDA access checks through the user store, and updated Dinoz lists to reflect the custom order across the account and active Dinoz navigation.
