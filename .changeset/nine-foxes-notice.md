---
'@dinorpg/server': minor
'@dinorpg/client': minor
'@dinorpg/core': minor
---

Add the Breeder Market system.

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
