---
'@dinorpg/core': minor
'@dinorpg/client': minor
'@dinorpg/server': minor
---

Add the game rules system and mandatory acceptance flow.

- Add a dedicated page displaying the full game rules with section-based navigation.
- Add the complete game rules content to the i18n translation files.
- Add a link to the game rules in the footer.
- Require players to accept the game rules when creating an account.
- Store the accepted rules version and acceptance date in the database.
- Require players to accept the rules again when a new version is published.
- Restrict access to game features until the current rules version has been accepted.
- Add an API endpoint for accepting the current game rules version.
- Add the shared types and constants required to manage game rules versions.
