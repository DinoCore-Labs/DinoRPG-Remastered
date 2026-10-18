/**
 * MT stage 19 integration: safe incremental patch on top of stage 18.
 * - Does not depend on indentation or CRLF (Windows-friendly).
 * - Checks every target BEFORE writing anything.
 * - Adds routes once and checks independent sections for partial installations.
 * - Simulate by default; use --apply to write.
 */
import fs from 'node:fs';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const routeFile = 'app/server/src/Dungeon/Routes/mtDungeon.routes.ts';
const spriteFile = 'app/client/src/components/dungeon/mtOriginalSpriteCatalog.ts';
const files = [routeFile, spriteFile];
const original = new Map();
const updated = new Map();
for (const file of files) {
	if (!fs.existsSync(file)) throw new Error(`Fichier absent : ${file} (lancer à la racine du dépôt)`);
	original.set(file, fs.readFileSync(file, 'utf8'));
}
function singleMatch(source, regex, file, label) {
	const all = [
		...source.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g'))
	];
	if (all.length !== 1) throw new Error(`${file}: ${label} introuvable ou ambigu (${all.length} occurrences).`);
	return all[0];
}
function preservingEol(file, source) {
	const eol = original.get(file).includes('\r\n') ? '\r\n' : '\n';
	return source.replace(/\r\n/g, '\n').replace(/\n/g, eol);
}
{
	const file = routeFile;
	let s = original.get(file);
	// No assumptions about indentation. This marker is added by step 18.
	if (!s.includes('mtDungeonDevToolsEnabled')) throw new Error(`${file}: intégrer l'étape 18 avant l'étape 19.`);

	const importName = '../Service/mtDungeonGuardianTrial.service.js';
	if (!s.includes(importName)) {
		const match = singleMatch(
			s,
			/import\s+type\s*\{\s*FastifyInstance\s*\}\s*from\s*(['"])fastify\1\s*;/,
			file,
			'import FastifyInstance'
		);
		const block = `import {
  getMtGuardianTrialPreview, mtDungeonGuardianTrialEnabled,
  MtDungeonGuardianTrialError, prepareMtGuardianTrial, resolveMtGuardianTrial
} from '${importName}';\n`;
		s = s.slice(0, match.index) + block + s.slice(match.index);
	}

	if (!/guardianFight\s*:/.test(s)) {
		const match = singleMatch(s, /guardianSkip\s*:\s*true\s*,\s*surfaceExit\s*:\s*true\b/, file, 'capacités étape 18');
		s =
			s.slice(0, match.index) +
			match[0] +
			', guardianFight: mtDungeonGuardianTrialEnabled()' +
			s.slice(match.index + match[0].length);
	}

	const routeSuffixes = [
		'/:leaderDinozId/dev/guardian/fight/preview',
		'/:leaderDinozId/dev/guardian/fight/prepare',
		'/:leaderDinozId/dev/guardian/fight/resolve'
	];
	const present = routeSuffixes.map(route => s.includes(route));
	if (present.some(Boolean) && !present.every(Boolean))
		throw new Error(
			`${file}: routes étape 19 partiellement intégrées. Vérifier preview/prepare/resolve avant de réappliquer.`
		);
	if (!present.every(Boolean)) {
		const match = singleMatch(
			s,
			/^([ \t]*)app\s*\.\s*post\s*\(\s*(['"])\/:leaderDinozId\/dev\/guardian\/skip\2/m,
			file,
			'route guardian/skip (étape 18)'
		);
		// Insert beside the skip endpoint INSIDE the existing development-only routes block.
		const lead = match[1];
		const snippet = `    // Genuine Remastered fights with a provisional ONE-monster guardian team.
    // Hidden completely when the explicit extra development flag is absent.
    if (mtDungeonGuardianTrialEnabled()) {
      const handleGuardianTrialError = (error: unknown) => {
        if (!(error instanceof MtDungeonGuardianTrialError)) return null;
        const status = error.code === 'not-found' || error.code === 'disabled' ? 404 :
          error.code === 'unknown-monster' ? 422 : 409;
        return { status, code: error.code };
      };
      app.get('/:leaderDinozId/dev/guardian/fight/preview', { preHandler: app.authenticate }, async (req, reply) => {
        const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
        if (!params.success) return reply.code(400).send({ code: 'invalid-leader' });
        try { return reply.send(await getMtGuardianTrialPreview({ userId: req.user.id, leaderDinozId: params.data })); }
        catch (error) { const known = handleGuardianTrialError(error); if (known) return reply.code(known.status).send({ code: known.code }); throw error; }
      });
      app.post('/:leaderDinozId/dev/guardian/fight/prepare', { preHandler: app.authenticate }, async (req, reply) => {
        const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
        const body = z.object({ revision: z.number().int().nonnegative() }).strict().safeParse(req.body);
        if (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-guardian-trial' });
        try { return reply.send(await prepareMtGuardianTrial({ userId: req.user.id, leaderDinozId: params.data }, body.data.revision)); }
        catch (error) { const known = handleGuardianTrialError(error); if (known) return reply.code(known.status).send({ code: known.code }); throw error; }
      });
      app.post('/:leaderDinozId/dev/guardian/fight/resolve', { preHandler: app.authenticate }, async (req, reply) => {
        const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
        const body = z.object({ token: z.string().uuid() }).strict().safeParse(req.body);
        if (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-guardian-trial' });
        try { return reply.send(await resolveMtGuardianTrial({ userId: req.user.id, leaderDinozId: params.data }, body.data.token)); }
        catch (error) { const known = handleGuardianTrialError(error); if (known) return reply.code(known.status).send({ code: known.code }); throw error; }
      });
    }
`;
		const adapted = snippet.replace(/^[ ]{4}/gm, lead);
		s = s.slice(0, match.index) + adapted + s.slice(match.index);
	}
	updated.set(file, s);
}
{
	const file = spriteFile;
	let s = original.get(file);
	const marker = "return 'item_skel.png'; // Temporary original MT marker";
	if (!s.includes(marker)) {
		// Replace ONLY the guardian switch branch, never another 'return null'.
		const match = singleMatch(
			s,
			/case\s+['"]guardian['"]\s*:\s*unresolved\.add\(\s*['"]Gardien Dinoz : rendu externe _smonster SWF non encore porté['"]\s*\)\s*;\s*return\s+null\s*;/,
			file,
			'branche sprite guardian originale'
		);
		const eol = s.includes('\r\n') ? '\r\n' : '\n';
		const indent = (s.slice(0, match.index).match(/(?:^|\n)([ \t]*)[^\n]*$/) ?? [, ''])[1];
		const replacement = `case 'guardian':${eol}${indent}  unresolved.add('Gardien : marqueur item_skel temporaire (le vrai _smonster SWF reste à porter)');${eol}${indent}  ${marker}`;
		s = s.slice(0, match.index) + replacement + s.slice(match.index + match[0].length);
	}
	updated.set(file, s);
}
// Atomic at validation level: do not write until BOTH patches have been checked.
for (const file of files) {
	const before = original.get(file);
	const after = preservingEol(file, updated.get(file));
	if (before === after) {
		console.log('UNCHANGED', file);
		continue;
	}
	if (apply) {
		fs.writeFileSync(path.resolve(file), after);
		console.log('PATCHED', file);
	} else {
		console.log('WOULD PATCH', file);
	}
}
console.log(apply ? 'Étape 19 intégrée.' : 'Simulation terminée : aucun fichier modifié.');
