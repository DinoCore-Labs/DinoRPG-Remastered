#!/usr/bin/env node
/** Step 20N: remove deceased followers from MT dungeon parties, locally. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const check = process.argv.includes('--check');
const sourceDir = fileURLToPath(new URL('../../', import.meta.url)); // archive root
const edits = new Map();
const normalize = (s) => s.replace(/\r\n/g, '\n');

function load(path) {
	if (!edits.has(path)) {
		const full = join(root, path);
		const original = readFileSync(full, 'utf8');
		edits.set(path, { original, text: normalize(original) });
	}
	return edits.get(path);
}
function edit(path, fn) { const entry = load(path); entry.text = fn(entry.text); }
function addOnce(path, originalAnchor, replacement, indicator) {
	edit(path, s => {
		if (s.includes(indicator)) return s;
		const n = s.split(originalAnchor).length - 1;
		if (n !== 1) throw Error(`${path}: ancrage absent ou ambigu (${n}): ${originalAnchor.slice(0, 85)}`);
		return s.replace(originalAnchor, replacement);
	});
}
function insertBeforeNth(path, anchor, added, nth, id) {
	edit(path, s => {
		if (s.includes(id)) return s;
		const hits = [];
		let pos = -1;
		while ((pos = s.indexOf(anchor, pos + 1)) >= 0) hits.push(pos);
		if (hits.length !== (path.includes('mtDungeonGuardianTrial') ? 2 : 1)) throw Error(`${path}: ancrage attendu ${nth} fois, trouvé ${hits.length}: ${anchor.slice(0, 80)}`);
		const at = hits[nth-1];
		return s.slice(0, at) + added + s.slice(at);
	});
}

const directory = 'app/server/src/Dungeon/Service/';
for (const p of ['mtDungeonFight.service.ts','mtDungeonGuardianTrial.service.ts']) {
	const file = directory + p;
	addOnce(file,
		"import { isWipedMtDungeonParty } from './mtDungeonDefeat.service.js';",
		"import { detachDeadMtDungeonFollowers, mtDungeonLeaderIsDead } from './mtDungeonCasualties.service.js';\nimport { isWipedMtDungeonParty } from './mtDungeonDefeat.service.js';",
		"from './mtDungeonCasualties.service.js'"
	);
	// Resolution can use a PREPARED attempt from before the install.
	// Remove already-dead followers before obtaining the authoritative fight team.
	const findUser = 'const user = await getDinozFightDataRequest(identity.leaderDinozId, identity.userId);';
	const tag = p.startsWith('mtDungeonGuardian') ? '/* MT20N RESOLVE GUARDIAN: remove deceased followers */' : '/* MT20N RESOLVE SCENARIO: remove deceased followers */';
	const n = p.startsWith('mtDungeonGuardian') ? 2 : 1;
	insertBeforeNth(file, findUser,
		`/* MT20N RESOLVE ${p.startsWith('mtDungeonGuardian')?'GUARDIAN':'SCENARIO'}: remove deceased followers */\n\t\tawait prisma.$transaction(tx => detachDeadMtDungeonFollowers(tx, identity));\n\t\t`, n, tag);

	// Death of the leader requires normal evacuation: a live run's identity
	// and its persistent progress are tied to the original leaderDinozId.
	addOnce(file,
		'if (await isWipedMtDungeonParty(tx, identity)) {',
		'if ((await isWipedMtDungeonParty(tx, identity)) || (await mtDungeonLeaderIsDead(tx, identity))) {',
		'if ((await isWipedMtDungeonParty(tx, identity)) || (await mtDungeonLeaderIsDead(tx, identity))) {'
	);
	edit(file, s => {
		if (s.includes('// MT20N: persist the group reduction together with run settlement.')) return s;
		const anchor = /^([ \t]*)const updated = await tx\.mtDungeonRun\.updateMany\(\{/gm;
		const matches = [...s.matchAll(anchor)];
		if (matches.length !== 1) throw Error(`${file}: ancrage mise à jour de session ambigu (${matches.length})`);
		const match = matches[0];
		const tabs = match[1];
		const extra = `${tabs}// MT20N: persist the group reduction together with run settlement.\n${tabs}await detachDeadMtDungeonFollowers(tx, identity);\n`;
		return s.slice(0, match.index) + extra + s.slice(match.index);
	});
}
// For guardian generation, update the party before calculating the monster team.
insertBeforeNth(directory + 'mtDungeonGuardianTrial.service.ts',
	'const user = await getDinozFightDataRequest(identity.leaderDinozId, identity.userId);',
	'/* MT20N PREPARE GUARDIAN: remove legacy deceased followers */\n\t\tawait prisma.$transaction(tx => detachDeadMtDungeonFollowers(tx, identity));\n\t\t',1,
	'/* MT20N PREPARE GUARDIAN: remove legacy deceased followers */');

// Recovery endpoint works for a dead leader with living followers as well.
const defeat = directory+'mtDungeonDefeat.service.ts';
addOnce(defeat,
	"import { isMtDungeonPartyWiped } from '@dinorpg/core/models/dungeon/dungeon.defeat.js';",
	"import { isMtDungeonPartyWiped } from '@dinorpg/core/models/dungeon/dungeon.defeat.js';\nimport { mtDungeonLeaderIsDead } from './mtDungeonCasualties.service.js';",
	"from './mtDungeonCasualties.service.js'"
);
addOnce(defeat,
	"if (!(await isWipedMtDungeonParty(tx, identity))) throw new MtDungeonDefeatError('party-not-wiped');",
	"if (!(await isWipedMtDungeonParty(tx, identity)) && !(await mtDungeonLeaderIsDead(tx, identity)))\n\t\t\t\tthrow new MtDungeonDefeatError('party-not-wiped');",
	"if (!(await isWipedMtDungeonParty(tx, identity)) && !(await mtDungeonLeaderIsDead(tx, identity)))"
);

// The recovery action remains available for old partial-death sessions where
// the original leader died but its followers are still alive.
const page = 'app/client/src/pages/MtMagneticCavernsPage.vue';
addOnce(page,
	'<section v-if="partyDefeated" class="mt-test__panel" aria-live="polite">',
	'<section v-if="partyDefeated || partyLeaderDead" class="mt-test__panel" aria-live="polite">',
	'<section v-if="partyDefeated || partyLeaderDead" class="mt-test__panel" aria-live="polite">'
);
addOnce(page,
	'<p>Tous les Dinoz sont KO. Le groupe doit quitter le donjon pour pouvoir être ressuscité.</p>',
	'<p v-if="partyDefeated">Tous les Dinoz sont KO. Le groupe doit quitter le donjon pour pouvoir être ressuscité.</p>\n\t\t\t<p v-else>Le chef du groupe est KO : évacuation nécessaire avant de reprendre l’exploration.</p>'.replace(/\\n/g,'\n').replace(/\\t/g,'\t'),
	'Le chef du groupe est KO : évacuation nécessaire'
);
addOnce(page,
	'const partyDefeated = computed(',
	'const partyLeaderDead = computed(() => visualMembers.value.some(member => member.id === leaderId && member.life <= 0));\nconst partyDefeated = computed(',
	'const partyLeaderDead = computed'
);
edit(page, s => {
	if (s.includes('partyLeaderDead.value ||')) return s;
	const pattern = /^([ \t]*)partyDefeated\.value\s*\|\|[ \t]*\n[ \t]*partyNeedsIrma\.value\s*\|\|/gm;
	const matches = [...s.matchAll(pattern)];
	if (matches.length !== 1) throw Error(`${page}: bloc de navigation ambigu (${matches.length})`);
	return s.replace(pattern, (_whole, indent) => `${indent}partyDefeated.value ||\n${indent}partyLeaderDead.value ||\n${indent}partyNeedsIrma.value ||`);
});
addOnce(page,
	'if (!session.value || !partyDefeated.value) return;',
	'if (!session.value || (!partyDefeated.value && !partyLeaderDead.value)) return;',
	'if (!session.value || (!partyDefeated.value && !partyLeaderDead.value)) return;'
);

// New source files are copied only if not present or byte-identical.
const bundled = [
	'app/server/src/Dungeon/Service/mtDungeonCasualties.service.ts',
	'app/server/test/unit/dungeon/mtDungeonCasualties.service.test.ts'
];
const assets = [];
for (const path of bundled) {
	const src = join(sourceDir, path);
	const content = readFileSync(src,'utf8');
	const dst = join(root,path);
	if (existsSync(dst) && normalize(readFileSync(dst,'utf8')) !== normalize(content))
		throw Error(`Le fichier ${path} existe et diffère de l'archive; aucun remplacement automatique.`);
	assets.push({path, dst, content});
}

if (check) {
	console.log('20N PRECONTROLE OK : ancrages vérifiés, aucun fichier modifié.');
} else {
	for (const [path, entry] of edits) {
		const origNormalized = normalize(entry.original);
		if (entry.text === origNormalized) continue;
		const updated = entry.original.includes('\r\n') ? entry.text.replace(/\n/g,'\r\n') : entry.text;
		writeFileSync(join(root,path),updated,'utf8');
		console.log('MODIFIE',path);
	}
	for (const {path,dst,content} of assets) {
		if (existsSync(dst)) continue;
		mkdirSync(dirname(dst),{recursive:true});
		writeFileSync(dst,content,'utf8');
		console.log('AJOUTE',path);
	}
	console.log('20N INSTALLE : membres morts exclus, sauvegarde et évacuation conservées.');
}
