---
'@dinorpg/core': patch
'@dinorpg/client': patch
'@dinorpg/server': patch
---

Refactor frontend HTTP layer by adding typed API helpers and migrating services to use direct response unwrapping.

This simplifies service calls, improves response typing, removes repeated Axios `.then/.catch` boilerplate, and supports silent background requests for endpoints such as version checks.
