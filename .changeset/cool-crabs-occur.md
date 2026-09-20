---
'@dinorpg/server': minor
---

Improve shop reliability and introduce automated testing infrastructure.

- Make Gold, Magic Shop, Filou and Dinoz purchases atomic and concurrency-safe.
- Prevent double spending, duplicated purchases and partial inventory mutations.
- Secure inventory limits and ShopKeeper purchase limits.
- Improve Dinoz shop generation, refresh behavior and race eligibility handling.
- Add unit, integration and E2E testing infrastructure with Vitest and Playwright.
- Add automated coverage for authentication, economy, inventory and shop workflows.
