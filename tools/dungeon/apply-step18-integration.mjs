/** Step 18 installer: safe, idempotent, CRLF-safe integration into existing routes/catalogue. */
import fs from 'node:fs';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const specs = [
	'app/server/src/Dungeon/Routes/mtDungeon.routes.ts',
	'app/client/src/components/dungeon/mtOriginalSpriteCatalog.ts',
	'app/client/test/unit/dungeon/mtOriginalSpriteCatalog.test.ts'
];
const sources = new Map();
for (const name of specs) {
	const file = path.resolve(name);
	if (!fs.existsSync(file)) throw new Error(`Missing file: ${name} (run from repository root)`);
	sources.set(name, fs.readFileSync(file, 'utf8'));
}
function one(source, needle, file) {
	const i = source.indexOf(needle);
	if (i < 0 || source.indexOf(needle, i + needle.length) >= 0)
		throw new Error(`Missing or ambiguous insertion anchor in ${file}: ${needle.slice(0, 65)}`);
	return i;
}
const outputs = new Map();
{
	const name = specs[0];
	let source = sources.get(name);
	if (!source.includes('skipMtGuardianInDevelopment')) {
		const anchor = "import type { FastifyInstance } from 'fastify';";
		one(source, anchor, name);
		source = source.replace(
			anchor,
			`import {\n  mtDungeonDevToolsEnabled, MtDungeonDevToolsError, skipMtGuardianInDevelopment,\n  leaveMtCavernsInDevelopment\n} from '../Service/mtDungeonDevTools.service.js';\n${anchor}`
		);
		const signature = 'export async function mtDungeonRoutes(app: FastifyInstance) {';
		one(source, signature, name);
		const body = `
  // These routes are NOT present unless explicitly opted in on a development server.
  if (mtDungeonDevToolsEnabled()) {
    const devRevision = z.object({ revision: z.number().int().nonnegative() }).strict();
    app.get('/dev/capabilities', { preHandler: app.authenticate }, async () => ({
      guardianSkip: true, surfaceExit: true
    }));
    app.post('/:leaderDinozId/dev/guardian/skip', { preHandler: app.authenticate }, async (req, reply) => {
      const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
      const body = devRevision.safeParse(req.body);
      if (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-dev-request' });
      try {
        return reply.send(await skipMtGuardianInDevelopment(
          { userId: req.user.id, leaderDinozId: params.data }, body.data.revision
        ));
      } catch (error) {
        if (error instanceof MtDungeonDevToolsError)
          return reply.code(error.code === 'not-found' || error.code === 'disabled' ? 404 : 409).send({ code: error.code });
        const known = handleKnownError(error);
        if (known) return reply.code(known.status).send({ code: known.code });
        throw error;
      }
    });
    app.post('/:leaderDinozId/dev/surface/exit', { preHandler: app.authenticate }, async (req, reply) => {
      const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
      const body = devRevision.safeParse(req.body);
      if (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-dev-request' });
      try {
        await leaveMtCavernsInDevelopment(
          { userId: req.user.id, leaderDinozId: params.data }, body.data.revision
        );
        return reply.send({ ok: true });
      } catch (error) {
        if (error instanceof MtDungeonDevToolsError)
          return reply.code(error.code === 'not-found' || error.code === 'disabled' ? 404 : 409).send({ code: error.code });
        const known = handleKnownError(error);
        if (known) return reply.code(known.status).send({ code: known.code });
        throw error;
      }
    });
  }
`;
		source = source.replace(signature, signature + body);
	}
	outputs.set(name, source);
}
{
	const name = specs[1];
	let source = sources.get(name);
	const original = /return\s+feature\.frame\s*===\s*5\s*\?\s*'item_stair_up\.png'\s*:\s*'item_stair_down\.png'\s*;/g;
	const replacement = "return feature.frame === 6 ? 'item_stair_up.png' : 'item_stair_down.png';";
	if (!source.includes(replacement)) {
		if ([...source.matchAll(original)].length !== 1)
			throw new Error(`Cannot locate exactly one stair mapping in ${name}`);
		source = source.replace(original, replacement);
	}
	outputs.set(name, source);
}
{
	const name = specs[2];
	let source = sources.get(name);
	const original = "['item_door_h_01.png', 'item_door_v_open.png', 'item_stair_up.png', 'item_stair_down.png']";
	const replacement = "['item_door_h_01.png', 'item_door_v_open.png', 'item_stair_down.png', 'item_stair_up.png']";
	if (!source.includes(replacement)) {
		one(source, original, name);
		source = source.replace(original, replacement);
	}
	outputs.set(name, source);
}
// All sources validated before any disk mutation.
for (const [name, output] of outputs) {
	const original = sources.get(name);
	if (original === output) {
		console.log(`UNCHANGED ${name}`);
		continue;
	}
	const newline = original.includes('\r\n') ? '\r\n' : '\n';
	const formatted = output.replace(/\r\n/g, '\n').replace(/\n/g, newline);
	if (apply) {
		fs.writeFileSync(path.resolve(name), formatted);
		console.log(`PATCHED ${name}`);
	} else console.log(`WOULD PATCH ${name}`);
}
console.log(apply ? 'Step 18 applied.' : 'Dry run complete (no files changed).');
