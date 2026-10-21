/**
 * Step 20D patcher. Modifies only known branch snippets, refuses unknown states,
 * stages every modified file in memory first, and makes backup copies.
 * Run from DinoRPG-Remastered repository root. NEVER touches Git remotes.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const changes = new Map();
const mod = path => {
    if (!existsSync(join(root, path))) throw new Error(`Fichier absent: ${path}`);
    if (!changes.has(path)) changes.set(path, readFileSync(join(root, path), 'utf8').replace(/\r\n/g, '\n'));
    return changes.get(path);
};
const exact = (path, before, after) => {
    const str = mod(path);
    if (str.includes(after)) return; // already applied
    const a = str.indexOf(before), b = str.lastIndexOf(before);
    if (a < 0 || a !== b) throw new Error(`Ancre absente/ambigüe: ${path}: ${before.slice(0, 85)}`);
    changes.set(path, str.slice(0, a) + after + str.slice(a + before.length));
};
const injectAfter = (path, before, added) => exact(path, before, before + added);
const injectBefore = (path, before, added) => exact(path, before, added + before);
const copy = path => {
    const source = join(packageRoot, path);
    if (!existsSync(source)) throw new Error(`Fichier du correctif absent: ${path}`);
    const destination = join(root, path);
    if (existsSync(destination) && readFileSync(destination, 'utf8') !== readFileSync(source, 'utf8'))
        throw new Error(`Fichier à créer déjà différent: ${path}`);
    changes.set(path, readFileSync(source, 'utf8'));
};

// 1. Avoid duplicate IHeal awards. The map stays original; only a server-set
// session flag distinguishes the bright/unused and dark/spent green patches.
const core = 'packages/core/src/models/dungeon/dungeon.session.ts';
exact(core,
    `\tevents: readonly MtCellEvent[],\n\tcommand: DungeonCommand\n): MtPendingInteraction | null {`,
    `\tevents: readonly MtCellEvent[],\n\tcommand: DungeonCommand,\n\tconsumedFlags: ReadonlySet<number>\n): MtPendingInteraction | null {`);
exact(core,
    `\t\tconst item = event.item;\n\t\tif (item.kind === 'IGold' || item.kind === 'IHeal' || item.kind === 'IScenario')`,
    `\t\tconst item = event.item;\n\t\tif (item.kind === 'IHeal' && consumedFlags.has(getMtFlagIndex(map, from.l, item.x, item.y))) continue;\n\t\tif (item.kind === 'IGold' || item.kind === 'IHeal' || item.kind === 'IScenario')`);
exact(core,
    `const pending = makePending(cfg.map, result.position, decision.position, decision.events, command);`,
    `const pending = makePending(cfg.map, result.position, decision.position, decision.events, command, new Set(result.flags));`);
exact(core,
    `\t\tif (event.flag !== null) result.flags = [...new Set([...result.flags, event.flag])].sort((a, b) => a - b);`,
    `\t\tif (event.flag !== null) result.flags = [...new Set([...result.flags, event.flag])].sort((a, b) => a - b);\n\t\tif (event.kind === 'heal') {\n\t\t\t// Remastered one-use policy; original View.hx does not set IHeal's flag.\n\t\t\tconst actual = cfg.map.levels[event.to.l]?.rooms.some(room =>\n\t\t\t\troom.item?.kind === 'IHeal' && room.item.x === event.to.x && room.item.y === event.to.y\n\t\t\t);\n\t\t\tif (!actual) throw new Error('Invalid original MT healing zone.');\n\t\t\tresult.flags = [...new Set([...result.flags, getMtFlagIndex(cfg.map, event.to.l, event.to.x, event.to.y)])].sort((a, b) => a - b);\n\t\t}`);

// 2. Pure command replay stays testable: a trusted server injection atomically
// commits actual HP changes + session (as opposed to a fake client success).
const service = 'app/server/src/Dungeon/Service/mtDungeonSession.service.ts';
injectAfter(service,
    `\tbeforeOpen?(identity: MtSessionIdentity, mapId: string): Promise<void>;\n`,
    `\t/** Transactional IHeal settlement; must commit HP and session together. */\n\tsettleHeal?(identity: MtSessionIdentity, oldRevision: number, pending: MtDungeonSession, cfg: MtSessionConfiguration): Promise<MtDungeonSession>;\n`);
exact(service,
    `\t\tif (!result.ok) return result;\n\t\tif (!(await deps.repository.compareAndSwap(identity, run.revision, result.session)))`,
    `\t\tif (!result.ok) return result;\n\t\tif (result.session.pending?.kind === 'heal') {\n\t\t\tif (!deps.settleHeal) throw new MtDungeonSessionError('invalid-run');\n\t\t\tconst session = await deps.settleHeal(identity, run.revision, result.session, cfg);\n\t\t\treturn { ok: true, accepted: result.accepted, session, pending: null };\n\t\t}\n\t\tif (!(await deps.repository.compareAndSwap(identity, run.revision, result.session)))`);

// Known healing errors are gameplay conflicts, not HTTP 500.
const routes = 'app/server/src/Dungeon/Routes/mtDungeon.routes.ts';
injectAfter(routes,
    `import { getMtDungeonPendingEncounter } from '../Service/mtDungeonEncounter.service.js';\n`,
    `import { MtDungeonHealError } from '../Service/mtDungeonHeal.service.js';\n`);
injectAfter(routes,
    `function handleKnownError(error: unknown): { status: number; code: string } | null {\n`,
    `\tif (error instanceof MtDungeonHealError) return { status: 409, code: error.code };\n`);

const runtime = 'app/server/src/Dungeon/Service/mtDungeonRuntime.service.ts';
injectAfter(runtime,
    `import { prismaMtDungeonRunRepository } from '../Repository/prismaMtDungeonRun.repository.js';\n`,
    `import { settleMtDungeonHealArrival } from './mtDungeonHeal.service.js';\n`);
injectAfter(runtime,
    `\t\trepository: prismaMtDungeonRunRepository,\n`,
    `\t\tsettleHeal: settleMtDungeonHealArrival,\n`);

// 3. Enforce on server actions, not merely by disabling a client button.
const item='app/server/src/Inventory/Service/useItem.service.ts';
injectAfter(item,
    `import { prisma } from '../../prisma.js';\n`,
    `import { assertNoMtDungeonHealing } from '../../Dungeon/mtDungeonHealingGuard.js';\n`);
exact(item,
    `\tconst effects: ItemFeedBack[] = [];`,
    `\t// Includes special Pampleboum healing; never consume an item before denying.\n\tif (\n\t\titem.effect?.category === ItemEffect.HEAL ||\n\t\titem.effect?.category === ItemEffect.RESURRECT ||\n\t\t(item.effect?.category === ItemEffect.SPECIAL && item.effect.value === 'pampleboum')\n\t) await assertNoMtDungeonHealing(authed.id, dinoz.id);\n\tconst effects: ItemFeedBack[] = [];`);

const rest = 'app/server/src/Dinoz/Service/restDinoz.service.ts';
injectAfter(rest,
    `import { prisma } from '../../prisma.js';\n`,
    `import { assertNoMtDungeonHealing } from '../../Dungeon/mtDungeonHealingGuard.js';\nimport { withUserGameplayLock } from '../../utils/database/userGameplayLock.js';\n`);
injectBefore(rest,
    `\t\tawait startRest(tx, dinozId);`,
    `\t\tawait assertNoMtDungeonHealing(userId, dinozId, tx);\n`);
exact(rest,
    `\tawait prisma.$transaction(async tx => {`,
    `\treturn withUserGameplayLock(userId, async () => {\n\tawait prisma.$transaction(async tx => {`);
exact(rest,
    `\t});\n\treturn reply.send({ ok: true });\n}`,
    `\t});\n\treturn reply.send({ ok: true });\n\t});\n}`);

const regen = 'app/server/src/Dinoz/Controller/getRestDinoz.controller.ts';
injectAfter(regen,
    `import { Skill } from '@dinorpg/core/models/skills/skillList.js';\n`,
    `import { assertNoMtDungeonHealing } from '../../Dungeon/mtDungeonHealingGuard.js';\n`);
exact(regen,
    `\t\t\tid: true,\n\t\t\tlife: true,\n\t\t\tmaxLife: true,`,
    `\t\t\tid: true,\n\t\t\tuserId: true,\n\t\t\tlife: true,\n\t\t\tmaxLife: true,`);
injectAfter(regen,
    `\tif (!d || d.state !== 'resting' || !d.stateTimer) return null;\n`,
    `\tawait assertNoMtDungeonHealing(d.userId, dinozId, tx);\n`);

const dialog = 'app/server/src/Dialog/Controller/dialog.effects.ts';
// Import added next to existing imports, without guessing relative path format.
if (!mod(dialog).includes(`from '../../Dungeon/mtDungeonHealingGuard.js'`)) {
    const s=mod(dialog);
    const imports=[...s.matchAll(/^import .*;\r?\n/gm)];
    if(!imports.length)throw new Error('Import introuvable dans dialog.effects.ts');
    const at=imports[imports.length-1].index+imports[imports.length-1][0].length;
    changes.set(dialog,s.slice(0,at)+`import { assertNoMtDungeonHealing } from '../../Dungeon/mtDungeonHealingGuard.js';\n`+s.slice(at));
}
injectAfter(dialog,
    `\tif (!Number.isInteger(amount)) {\n\t\tthrow new Error(\`Heal amount must be an integer, received "\${amount}"\`);\n\t}\n`,
    `\tif (amount > 0) await assertNoMtDungeonHealing(context.user.id, context.dinoz.id, tx);\n`);

// 4. The Flash original item timelines have 7 (lit) / 8 (dull). These frames
// are not among the 201 exported PNGs. The temporary Pixi green patch doesn't
// modify any terrain texture; replace when genuine SWF frames are recovered.
const canvas = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
injectBefore(canvas, `function paintFog(scene: MtDungeonScene): void {`,
`/** Temporary healing-zone stand-in: original item SWF frames 7/8 not exported. */
function paintHealZones(scene: MtDungeonScene): void {
\tfor (const zone of scene.features) {
\t\tif (zone.kind !== 'heal') continue;
\t\tconst x = (zone.x - scene.viewport.ix) * 40;
\t\tconst y = (zone.y - scene.viewport.iy) * 40;
\t\tconst glow = new Graphics()
\t\t\t.roundRect(x + 4, y + 4, 32, 32, 7)
\t\t\t.fill({ color: zone.consumed ? 0x1b432a : 0x59ff6a, alpha: zone.consumed ? 0.30 : 0.48 });
\t\tif (!zone.consumed) glow.filters = [new BlurFilter({ strength: 5, quality: 2 })];
\t\tground.addChild(glow);
\t\tconst zoneMark = new Graphics()
\t\t\t.roundRect(x + 6, y + 6, 28, 28, 6)
\t\t\t.fill({ color: zone.consumed ? 0x23542a : 0x8bff85, alpha: zone.consumed ? 0.49 : 0.78 })
\t\t\t.roundRect(x + 6, y + 6, 28, 28, 6)
\t\t\t.stroke({ color: zone.consumed ? 0x2a6b36 : 0xb4ffb0, width: 2, alpha: 0.85 });
\t\tground.addChild(zoneMark);
\t}
}

`);
exact(canvas,
    `\tfor (const sprite of plan.sprites) paintSprite(sprite, scene);\n\n\tpaintFog(scene);`,
    `\tfor (const sprite of plan.sprites) paintSprite(sprite, scene);\n\n\tpaintHealZones(scene);\n\tpaintFog(scene);`);

for (const path of [
    'app/server/src/Dungeon/Service/mtDungeonHeal.service.ts',
    'app/server/src/Dungeon/mtDungeonHealingGuard.ts',
    'app/server/test/unit/dungeon/mtDungeonHealGuard.test.ts',
    'packages/core/test/unit/dungeon/dungeon.heal.test.ts'
]) copy(path);

// Preflight completed. No mutation until all anchors and new files pass.
let written=0;
for (const [path,content] of changes) {
    const target=join(root,path);
    mkdirSync(dirname(target),{recursive:true});
    if(existsSync(target)) {
        const original=readFileSync(target,'utf8');
        if(original.replace(/\r\n/g, '\n')===content)continue;
        const backup=target+'.before-step20d';
        if(!existsSync(backup))copyFileSync(target,backup);
    }
    writeFileSync(target,content,'utf8');
    written++;
}
console.log(`Étape 20D : ${written} fichier(s) écrit(s). Aucun accès à GitHub.`);
