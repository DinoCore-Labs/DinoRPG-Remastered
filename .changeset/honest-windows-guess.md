---
'@dinorpg/server': minor
'@dinorpg/client': minor
'@dinorpg/core': minor
---

Add complete game log tracking, admin log management, and log analytics charts.

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
