/**
 * Stage 14: enable the archived active(cavmagnet) gate in DEVELOPMENT only,
 * and evaluate its live feature list via Remastered's canonical context.
 *
 * Run at repository root:
 *   node tools/dungeon/fix-step14-cavmagnet.mjs           # preview
 *   node tools/dungeon/fix-step14-cavmagnet.mjs --apply   # apply
 *
 * Works on CRLF/LF, makes no changes if already applied, and validates both
 * anchors before writing either file.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const apply = process.argv.includes('--apply');
const root = process.cwd();
const configFile = 'app/server/src/config/game.config.ts';
const serviceFile = 'app/server/src/Dungeon/Service/mtDungeonRuntime.service.ts';

function read(path) {
	const absolute = resolve(root, path);
	if (!existsSync(absolute)) throw new Error(`Fichier introuvable : ${path} (lancer à la racine du dépôt)`);
	const raw = readFileSync(absolute, 'utf8');
	return { path, absolute, raw, eol: raw.includes('\r\n') ? '\r\n' : '\n', src: raw.replace(/\r\n/g, '\n') };
}
function once(source, needle, replacement, filename) {
	const start = source.indexOf(needle);
	if (start < 0 || source.indexOf(needle, start + needle.length) >= 0) {
		throw new Error(`Point d'insertion absent ou non unique : ${filename} (${needle.slice(0, 65)})`);
	}
	return source.slice(0, start) + replacement + source.slice(start + needle.length);
}
function updateDevConfig(source) {
	const begin = source.indexOf('development: {');
	const end = source.indexOf('production: {');
	if (begin < 0 || end <= begin) throw new Error(`${configFile} : blocs development/production non reconnus`);
	const devBlock = source.slice(begin, end);
	const matches = [...devBlock.matchAll(/activeFeatures:\s*\[([^\]]*)\]/g)];
	if (matches.length !== 1) throw new Error(`${configFile} : activeFeatures de development manquant ou ambigu`);
	const entries = matches[0][1];
	if (/(?:'|")cavmagnet(?:'|")/.test(entries)) return source;
	const after = entries.trimEnd();
	const replacement = `activeFeatures: [${after}${after.trim().endsWith(',') ? ' ' : ', '}'cavmagnet']`;
	const updated = devBlock.replace(matches[0][0], replacement);
	return source.slice(0, begin) + updated + source.slice(end);
}
function updateEntryService(source) {
	const marker = 'activeFeatures: gameConfig.world.activeFeatures';
	if (source.includes(marker)) {
		if (!source.includes("import gameConfig from '../../config/game.config.js';")) {
			throw new Error(`${serviceFile} : injection déjà présente mais import gameConfig absent`);
		}
		return source;
	}
	const oldConditionImport =
		"import { mtDungeonEntryCondition } from '@dinorpg/core/models/dungeon/dungeon.definition.js';";
	source = once(
		source,
		oldConditionImport,
		"import { defaultConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';\n" +
			oldConditionImport +
			'\n' +
			"import { evalCondition } from '@dinorpg/core/models/utils/conditions/evalConditions.js';",
		serviceFile
	);
	const oldImport = "import { canGoToThisPlace } from '../../utils/dinoz/dinozFiche.mapper.js';";
	source = once(
		source,
		oldImport,
		"import gameConfig from '../../config/game.config.js';\n" +
			"import { buildConditionContext } from '../../utils/conditions/buildConditionContext.js';",
		serviceFile
	);
	const oldCheck = [
		'\tfor (const member of user.dinoz) {',
		'\t\tif (!canGoToThisPlace({ ...user, dinoz: [member] }, condition, member.id))',
		"\t\t\tthrow new MtDungeonEntryError('condition-not-met');",
		'\t}'
	].join('\n');
	const newCheck = [
		'\tfor (const member of user.dinoz) {',
		'\t\tconst context = buildConditionContext(',
		'\t\t\t{ ...user, dinoz: [member] },',
		'\t\t\tmember.id,',
		'\t\t\tdefaultConditionKeyMaps,',
		'\t\t\t{ activeFeatures: gameConfig.world.activeFeatures }',
		'\t\t);',
		'\t\tif (!evalCondition(context, condition))',
		"\t\t\tthrow new MtDungeonEntryError('condition-not-met');",
		'\t}'
	].join('\n');
	return once(source, oldCheck, newCheck, serviceFile);
}
const items = [read(configFile), read(serviceFile)];
const next = [updateDevConfig(items[0].src), updateEntryService(items[1].src)];
const modified = items.map((item, i) => next[i] !== item.src);
for (let i = 0; i < items.length; i++) {
	console.log(`${modified[i] ? (apply ? 'PATCH' : 'WOULD PATCH') : 'ALREADY OK'} ${items[i].path}`);
}
// Important: all replacements above were validated before reaching this point.
if (apply) {
	for (let i = 0; i < items.length; i++) {
		if (modified[i]) writeFileSync(items[i].absolute, next[i].replace(/\n/g, items[i].eol), 'utf8');
	}
	console.log('Correction de la condition MT appliquée. Redémarre le serveur.');
} else {
	console.log('Simulation terminée. Ajoute --apply pour effectuer les changements.');
}
