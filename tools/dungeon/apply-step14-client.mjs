/** Idempotent, anchored installer for feat/mt-dungeons. Dry-run by default. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apply = process.argv.includes('--apply');
const root = process.cwd();

function modify(file, transforms) {
	const path = resolve(root, file);
	if (!existsSync(path)) throw new Error(`Missing target: ${file}`);
	let text = readFileSync(path, 'utf8');
	const original = text;
	for (const { marker, insertion, anchor, before = true } of transforms) {
		if (text.includes(marker)) continue;
		const at = text.indexOf(anchor);
		if (at < 0 || text.indexOf(anchor, at + anchor.length) >= 0) {
			throw new Error(`Non-unique or missing anchor in ${file}: ${anchor.slice(0, 60)}`);
		}
		text = text.slice(0, before ? at : at + anchor.length) + insertion + text.slice(before ? at : at + anchor.length);
	}
	console.log(`${text === original ? 'UNCHANGED' : apply ? 'PATCH' : 'WOULD PATCH'} ${file}`);
	if (apply && text !== original) writeFileSync(path, text, 'utf8');
}

const routes = 'app/server/src/Dungeon/Routes/mtDungeon.routes.ts';
modify(routes, [
	{
		marker: "from '../Service/mtDungeonView.service.js';",
		anchor: "import { getMtDungeonPendingEncounter } from '../Service/mtDungeonEncounter.service.js';",
		insertion: "import { getMtDungeonCurrentView } from '../Service/mtDungeonView.service.js';\n",
		before: true
	},
	{
		marker: "app.get('/:leaderDinozId/view'",
		anchor: "\tapp.get('/:leaderDinozId', { preHandler: app.authenticate }, async (req, reply) => {",
		insertion: `\t/** Only current discovered tiles; never return whole map or hidden items. */
\tapp.get('/:leaderDinozId/view', { preHandler: app.authenticate }, async (req, reply) => {
\t\tconst params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
\t\tif (!params.success) return reply.code(400).send({ code: 'invalid-leader' });
\t\ttry {
\t\t\treturn reply.send(await getMtDungeonCurrentView({ userId: req.user.id, leaderDinozId: params.data }));
\t\t} catch (error) {
\t\t\tconst known = handleKnownError(error);
\t\t\tif (known) return reply.code(known.status).send({ code: known.code });
\t\t\tthrow error;
\t\t}
\t});
`,
		before: true
	}
]);

modify('app/client/src/router/index.ts', [
	{
		marker: "import MtMagneticCavernsPage from '../pages/MtMagneticCavernsPage.vue';",
		anchor: "import DinozPage from '../pages/DinozPage.vue';",
		insertion: "\nimport MtMagneticCavernsPage from '../pages/MtMagneticCavernsPage.vue';",
		before: false
	},
	{
		marker: "name: 'MtMagneticCavernsPage',",
		anchor: "\t\t\t{\n\t\t\t\tpath: '/dinoz/:id',",
		insertion: `\t\t\t{
\t\t\t\tpath: '/dinoz/:id/dungeon/stepp',
\t\t\t\tname: 'MtMagneticCavernsPage',
\t\t\t\tcomponent: MtMagneticCavernsPage,
\t\t\t\tmeta: { auth: true },
\t\t\t\tbeforeEnter: requireOwnedDinozByParam('id')
\t\t\t},
`,
		before: true
	}
]);

modify('app/client/src/pages/DinozPage.vue', [
	{
		marker:
			'<div v-if="isReady && nameChoosen === true && dinozData.leaderId === null && dinozData.placeId === PlaceEnum.PYLONES_DE_MAGNETITES"',
		anchor: '\t<div class="dinozPanels" v-if="nameChoosen === true">',
		insertion: `\t<div v-if="isReady && nameChoosen === true && dinozData.leaderId === null && dinozData.placeId === PlaceEnum.PYLONES_DE_MAGNETITES" class="mt-caverns-entry">
\t\t<RouterLink :to="{ name: 'MtMagneticCavernsPage', params: { id: dinozData.id } }">
\t\t\tExplorer les Cavernes Magnétiques (test MT)
\t\t</RouterLink>
\t</div>
`,
		before: true
	},
	{
		marker: "import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';",
		anchor: "import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';",
		insertion: "\nimport { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';",
		before: false
	},
	{
		marker: '\t\t\tPlaceEnum,',
		anchor: '\t\t\tdinozStore: dinozStore(),',
		insertion: '\n\t\t\tPlaceEnum,',
		before: false
	},
	{
		marker: '.mt-caverns-entry {',
		anchor: '<style lang="scss" scoped>\n',
		insertion: `.mt-caverns-entry { text-align: center; width: 100%; padding: 0.55rem 0; }
.mt-caverns-entry a { display: inline-block; padding: 0.45rem 0.7rem; border: 1px solid #8b6839; background: #e9d09f; color: #4c2f16; }
`,
		before: false
	}
]);
console.log(
	apply
		? 'Anchored patches applied. New .vue/.ts files came from the ZIP.'
		: 'Dry run complete. Re-run with --apply to change three existing files.'
);
