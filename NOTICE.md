# Attribution and Modification Notice

## DinoRPG Remastered

DinoRPG Remastered is an independently maintained modified derivative that contains source code adapted from the open-source Eternaltwin DinoRPG project, together with material originating from Motion Twin's DinoRPG archives and new work created for DinoRPG Remastered.

DinoRPG Remastered is not affiliated with, sponsored by, or endorsed by Eternaltwin or Motion Twin.

## Eternaltwin DinoRPG

Original project:

https://gitlab.com/eternaltwin/dinorpg/dinorpg

Reference revision used for the provenance audit:

`3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d`

License:

GNU Affero General Public License version 3 or later (`AGPL-3.0-or-later`)

Copyright in the original Eternaltwin contributions remains with their respective authors and contributors. No original copyright, authorship, warranty, or license notice is intentionally removed or replaced by this notice.

## Modifications

Eternaltwin-derived source files were subsequently modified, refactored, reorganized, or extended by the contributors to DinoRPG Remastered. Relevant modification dates are stated in file-level provenance notices and are also available in the Git history.

The principal project-level changes include:

- reorganization into `app/client`, `app/server`, and `packages/core`;
- substantial backend development and adaptation around Fastify;
- migration of monorepo tooling to pnpm;
- changes and extensions to Prisma data models and persistence;
- changes and extensions to shared models, combat systems, and the Vue client;
- additional dialogs, scenarios, administration tools, deployment tooling, documentation, localization, and infrastructure;
- new source code and features created specifically for DinoRPG Remastered.

## Motion Twin material

Some game assets, data, names, text, and historical source material originate from Motion Twin's WebGamesArchives:

https://github.com/motion-twin/WebGamesArchives/tree/main/DinoRPG

Such material remains subject to the attribution and licensing terms applicable to the corresponding Motion Twin archive material, including CC BY-NC-SA 4.0 where indicated.

## Contributor context

Matthieu Bonjour, maintainer of DinoRPG Remastered, previously contributed to the Eternaltwin DinoRPG project. His public contribution history is available here:

https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/commits/staging?author=Matthieu%20Bonjour

This information is provided as context and as part of DinoCore Labs' good-faith effort to document provenance and preserve the rights and attribution of all contributors.

## Source-code license

The source code covered by this repository's GNU AGPL license is distributed under GNU AGPL version 3 or later.

SPDX identifier:

`AGPL-3.0-or-later`

See `LICENSE` for the complete license text.

This notice supplements and does not replace any file-level or upstream copyright, authorship, warranty, or license notice.

## Ruffle

DinoRPG Remastered includes a self-hosted web distribution of Ruffle,
a Flash Player emulator developed by the Ruffle contributors.

- Component: Ruffle
- Package: `@ruffle-rs/ruffle`
- Version: `0.2.0-nightly.2025.11.29`
- Upstream project: https://github.com/ruffle-rs/ruffle
- Local distribution: `app/client/public/ruffle/`
- License: MIT OR Apache-2.0, at the recipient's option
- Apache-2.0 license text: `app/client/public/ruffle/LICENSE_APACHE`
- MIT license text: `app/client/public/ruffle/LICENSE_MIT`

Ruffle remains licensed under its own license terms and is not relicensed
under the GNU Affero General Public License applicable to DinoRPG
Remastered source code.
