/**
 * Fix two outdated encounter/original-evidence tests after step 20K's
 * manual IHeal zone policy. Does not change dungeon runtime code.
 *
 * Usage (from monorepo root):
 *   node tools/dungeon/apply-step20k-tests-fix.mjs --check
 *   node tools/dungeon/apply-step20k-tests-fix.mjs
 *
 * Preflights every replacement before writing any file. Safe to rerun.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const check = process.argv.includes('--check');
const changes = new Map();

function fail(path, explanation) {
	throw new Error(`${path}: ${explanation}`);
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function replaceTest(source, path, oldName, nextName, newName, newBody) {
	const start = new RegExp(`^([ \\t]*)it\\('${escapeRegExp(oldName)}',\\s*\\(\\)\\s*=>\\s*\\{`, 'gm');
	const next = new RegExp(`^[ \\t]*it\\('${escapeRegExp(nextName)}',`, 'gm');
	const already = new RegExp(`^[ \\t]*it\\('${escapeRegExp(newName)}',`, 'gm');
	const originals = [...source.matchAll(start)];
	const updates = [...source.matchAll(already)];
	if (originals.length === 0 && updates.length === 1) return source;
	if (originals.length !== 1 || updates.length !== 0)
		fail(path, `test original manquant/ambigu (${originals.length}) ou correction déjà ambiguë (${updates.length})`);
	const nextMatches = [...source.matchAll(next)];
	if (nextMatches.length !== 1 || nextMatches[0].index <= originals[0].index)
		fail(path, `test suivant manquant/ambigu (${nextMatches.length}): ${nextName}`);
	const startIndex = originals[0].index;
	const endIndex = nextMatches[0].index;
	const previousTest = source.slice(startIndex, endIndex);
	if (!/\}\);[ \t]*\n[ \t]*$/.test(previousTest))
		fail(path, 'limites du test inattendues ; aucun fichier modifié');
	const indent = originals[0][1];
	const body = newBody.split('\n').map(line => line ? `${indent}${line}` : line).join('\n');
	const replacement = `${indent}it('${newName}', () => {\n${body}\n${indent}});\n`;
	return source.slice(0, startIndex) + replacement + source.slice(endIndex);
}
function edit(path, callback) {
	const absolute = resolve(root, path);
	if (!existsSync(absolute)) fail(path, 'fichier introuvable (exécuter depuis la racine du monorepo)');
	const original = readFileSync(absolute, 'utf8');
	const newline = original.includes('\r\n') ? '\r\n' : '\n';
	const normalized = original.replace(/\r\n/g, '\n');
	const result = callback(normalized).replace(/\n/g, newline);
	if (result !== original) changes.set(path, result);
}

edit('packages/core/test/unit/dungeon/dungeon.encounter.test.ts', (source) =>
	replaceTest(
		source,
		'packages/core/test/unit/dungeon/dungeon.encounter.test.ts',
		'keeps gold/heal rewards disabled and private',
		'fails closed for a forged scenario index, moved position or consumed flag',
		'keeps gold pending private but treats IHeal entry as a normal movement',
		`		const cfg = config();
		expect(view(step(cfg, 2, 2, 1, 0))).toEqual({
			kind: 'gold',
			status: 'awaiting-gameplay-integration',
			mapId: 'katak_0',
			revision: 1
		});

		// 20K: entering IHeal no longer creates a pending event or heals the party.
		const arrived = step(cfg, 2, 3, 1, 0);
		const healFlag = getMtFlagIndex(cfg.map, 0, 3, 3);
		expect(arrived.position).toEqual({ x: 3, y: 3, l: 0 });
		expect(arrived.pending).toBeNull();
		expect(arrived.locked).toBe(false);
		expect(arrived.flags).not.toContain(healFlag);
		expect(view(arrived, cfg)).toBeNull();`
	)
);

edit('packages/core/test/unit/dungeon/dungeon.originalEvidence.test.ts', (source) =>
	replaceTest(
		source,
		'packages/core/test/unit/dungeon/dungeon.originalEvidence.test.ts',
		'keeps IHeal distinct from IGold: View.getItem does not set an IHeal flag',
		'refuses stale, already-claimed or forged pending values',
		'does not create pending heal evidence and consumes IHeal only on departure',
		`		const cfg = fixture();
		const session = enter(cfg, 2, 3, 1, 0);
		const flag = getMtFlagIndex(cfg.map, 0, 3, 3);

		// MT View.getItem does not mark IHeal. In 20K, entry stays unlocked.
		expect(session.pending).toBeNull();
		expect(session.position).toEqual({ x: 3, y: 3, l: 0 });
		expect(session.flags).not.toContain(flag);
		expect(() =>
			mtDungeonOriginalPendingEvidence({ configuration: cfg, session, definition: original })
		).toThrow(MtDungeonEvidenceError);

		// Remastered's one-use policy persists its flag on a successful departure.
		const departure = applyMtDungeonCommandBatch(cfg, session, [
			{ x: 3, y: 3, l: 0, dx: -1, dy: 0, dl: 0 }
		]);
		expect(departure.ok).toBe(true);
		if (!departure.ok) return;
		expect(departure.session.position).toEqual({ x: 2, y: 3, l: 0 });
		expect(departure.session.flags).toContain(flag);`
	)
);

console.log(`20K tests ${check ? 'précontrôle' : 'installation'} : ${changes.size} fichier(s) à modifier.`);
for (const path of changes.keys()) console.log(' - ' + path);
if (check) {
	console.log('Précontrôle terminé ; aucun fichier modifié.');
} else {
	for (const [path, content] of changes) writeFileSync(resolve(root, path), content);
	console.log('Terminé ; aucun fichier de gameplay ni fichier GitHub modifié.');
}
