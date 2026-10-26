# Dynamic MT dungeon message-box icons

This patch changes **only** the message-box icon, not its narrative contents, layout or server state:

- Entrance, exit, Irma, and messages without item icons: **no item icon**.
- Gold pickup: original `item_gold.png`.
- Key pickup: original `item_key_01.png` (cosmetic).
- Scenarios: their original `messageIcon` from the server (`chest`, `scroll`, or `skel`).
- Unknown icons: hidden, rather than requesting nonexistent or arbitrary assets.

From the monorepo root:

```sh
node mt-msgbox-dynamic/apply.mjs
pnpm --filter @dinorpg/client exec vue-tsc --noEmit
pnpm --filter @dinorpg/client test:unit
```

Installer is anchor-guarded. Ensure your local branch contains the latest earlier patches.

Suggested commit: `feat(client): render original MT item icon in dungeon message box`
