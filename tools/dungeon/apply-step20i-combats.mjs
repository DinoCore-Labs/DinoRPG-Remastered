/** 20I: automatic MT encounters; vetted update against 20G/20H, repeatable, no Git operations. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const plan = new Map();
const fileAt = p => resolve(root, p);
function edit(p, fn) {
  const file = fileAt(p);
  if (!existsSync(file)) throw new Error(`${p} is missing. Unzip at the project root.`);
  const old = plan.get(file) ?? readFileSync(file, 'utf8');
  plan.set(file, fn(old, p));
}
function replace(s, before, after, p) {
  const count = s.split(before).length - 1;
  if (count === 1) return s.replace(before, after);
  if (count === 0 && s.includes(after)) return s;
  throw new Error(`${p}: missing/ambiguous anchor: ${before.slice(0,110)} (${count} matches)`);
}
function insert(s, before, addition, marker, p) {
  if (s.includes(marker)) return s;
  return replace(s, before, addition + before, p);
}
function section(s, from, to, fn, p) {
  const a = s.indexOf(from), b = s.indexOf(to, a + from.length);
  if (a < 0 || b < 0 || s.indexOf(from, a+1) !== -1) throw new Error(`${p}: section boundary changed: ${from}`);
  return s.slice(0,a) + fn(s.slice(a,b),p) + s.slice(b);
}

// Preserve regular overworld generation without behavior changes. Dungeon roster
// only restricts the candidate pool, while reusing the power/weight/group algorithm.
edit('app/server/src/Fight/Service/fight.service.ts', (s,p) => {
  const start='export async function generateMonsterList(';
  const end='function orderFightTeamByActiveDinoz';
  return section(s,start,end,(part)=>{
    if (part.includes('dungeonMonsterKeys?: readonly string[]')) return part;
    part=replace(part, 'missionSourceDinozId?: number\n): Promise<MonsterFiche[]> {',
      'missionSourceDinozId?: number,\n\tdungeonMonsterKeys?: readonly string[]\n): Promise<MonsterFiche[]> {\n\tconst dungeonRoster = dungeonMonsterKeys === undefined ? null : new Set(dungeonMonsterKeys);',p);
    part=replace(part,'const availableMonsters = Object.values(monsterList).filter(monster => {',
      `const availableMonsters = Object.values(monsterList).filter(monster => {\n\t\t// MT dungeons have their own canonical XML monster roster.\n\t\tif (dungeonRoster !== null) return dungeonRoster.has(getMonsterKeyById(monster.id) ?? '');`,p);
    part=replace(part,'const availableMonsterHuntMonsters =\n\t\tactiveMonsterHunt?.monsters.filter(entry => {',
      'const availableMonsterHuntMonsters =\n\t\tdungeonRoster !== null ? [] : activeMonsterHunt?.monsters.filter(entry => {',p);
    part=replace(part,'if (isLeaderMissionMonster(monster)) {',
      'if (dungeonRoster === null && isLeaderMissionMonster(monster)) {',p);
    part=replace(part,'if (\n\t\tmissionKillForce &&', 'if (\n\t\tdungeonRoster === null &&\n\t\tmissionKillForce &&',p);
    part=replace(part,'while (monsterLevel < teamPowerLevel) {',
      'while (monsterLevel < teamPowerLevel) {\n\t\tif (dungeonRoster !== null && monsterArray.length >= 24) break;',p);
    part=replace(part,'for (let i = 0; i < count; i++) {\n\t\t\tmonsterLevel += selectedMonster.level;',
      'for (let i = 0; i < count; i++) {\n\t\t\tif (dungeonRoster !== null && monsterArray.length >= 24) break;\n\t\t\tmonsterLevel += selectedMonster.level;',p);
    part=replace(part,'if (activeEventNames.has(GameEvent.VALENTINE)',
      'if (dungeonRoster === null && activeEventNames.has(GameEvent.VALENTINE)',p);
    return part;
  },p);
});

// Legacy service retains its name for compatibility with existing dev tools,
// but its fight writer now powers the production guardian API as well.
edit('app/server/src/Dungeon/Service/mtDungeonGuardianTrial.service.ts', (s,p) => {
  s=insert(s,"import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';",
    "import { getMonsterKeyById } from '@dinorpg/core/models/monster/monsterKeyMap.js';\n",
    "import { getMonsterKeyById }",p);
  s=replace(s,'import { calculateFightVsMonsters, rewardFightVsMonsters } from',
    'import { calculateFightVsMonsters, generateMonsterList, rewardFightVsMonsters } from',p);
  s=section(s,'export async function prepareMtGuardianTrial(', '/** Execute once.', (part) => {
    if (part.includes('const generated = await generateMonsterList(')) return part;
    // Remove DEV restrictions exclusively from public production preparation.
    part=part.replaceAll('\tensureEnabled();\n','');
    part=replace(part,
      '\t\tconst intent = intentFor(session);\n\t\tknownMonster(intent.monsterKeys[0]);',
      '\t\tconst intent = intentFor(session);',p);
    // Prior prepared attempts must remain valid and stable: no second RNG draw.
    part=replace(part,
      "old.pendingJson !== intent.pendingJson ||\n\t\t\t\tJSON.stringify(old.monsterKeys) !== JSON.stringify(intent.monsterKeys)",
      "old.pendingJson !== intent.pendingJson ||\n\t\t\t\t!old.monsterKeys.length",p);
    part=replace(part,
      '\t\tconst token = randomUUID();',
      `\t\t// Generate enemy party using normal Remastered level/power/group rules,\n\t\t// limited to the exact MT dungeon XML monster keys.\n\t\tconst dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));\n\t\tconst definition = getMtDungeonArchive().definition(dungeonId);\n\t\tconst entrance = Object.values(placeListv2).find(place => place.name === definition.enter.place);\n\t\tconst user = await getDinozFightDataRequest(identity.leaderDinozId, identity.userId);\n\t\tconst party = user?.dinoz ?? [];\n\t\tconst leader = party.find(d => d.id === identity.leaderDinozId);\n\t\tif (!entrance || !leader || !party.length || party.some(d => d.placeId !== entrance.placeId || d.life <= 0 || !d.fight || d.state !== null || d.concentration !== null))\n\t\t\tthrow new MtDungeonGuardianTrialError('group-unavailable');\n\t\tconst generated = await generateMonsterList([leader, ...party.filter(d => d.id !== leader.id)], entrance.placeId, undefined, definition.monsters);\n\t\tconst monsterKeys = generated.map(monster => getMonsterKeyById(monster.id));\n\t\tif (!monsterKeys.length || monsterKeys.some(key => !key || !definition.monsters.includes(key)))\n\t\t\tthrow new MtDungeonGuardianTrialError('unknown-monster');\n\t\tconst token = randomUUID();`,p);
    part=replace(part, '\t\t\t\t\tmonsterKeys: [...intent.monsterKeys],', '\t\t\t\t\tmonsterKeys: monsterKeys as string[],',p);
    part=replace(part, 'return { token, revision, monsterKeys: [...intent.monsterKeys], experimental: true as const };', 'return { token, revision, monsterKeys: monsterKeys as string[], experimental: false as const };',p);
    return part;
  },p);
  // Remove the gating from resolver body (preview remains explicitly dev-only).
  s=section(s,'export async function resolveMtGuardianTrial(', '\n}\n', (part)=>{
    part=part.replaceAll('\tensureEnabled();\n','');
    part=replace(part,'\t\tconst monster = knownMonster(intent.monsterKeys[0]);',
      `\t\tconst dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));\n\t\tconst allowed = new Set(getMtDungeonArchive().definition(dungeonId).monsters);\n\t\tif (!attempt.monsterKeys.length || attempt.monsterKeys.length > 24 || attempt.monsterKeys.some(key => !allowed.has(key)))\n\t\t\tthrow new MtDungeonGuardianTrialError('unknown-monster');\n\t\tconst monsters = attempt.monsterKeys.map(knownMonster);`,p);
    part=replace(part,'\t\tif (JSON.stringify(intent.monsterKeys) !== JSON.stringify(attempt.monsterKeys))\n\t\t\tthrow new MtDungeonGuardianTrialError(\'conflict\');\n','',p);
    part=replace(part,'leader.placeId, [monster], attempt.fightSeed','leader.placeId, monsters, attempt.fightSeed',p);
    part=replace(part,'rewardFightVsMonsters(squad, [monster], fight, leader.placeId, user, {',
      'rewardFightVsMonsters(squad, monsters, fight, leader.placeId, user, {',p);
    part=replace(part,'await prisma.$transaction(async tx => {\n\t\t\t\t// The fight engine',
      `await prisma.$transaction(async tx => {\n\t\t\t\t// Exactly one fight action per party member, whether won or lost.\n\t\t\t\tconst consumed = await tx.dinoz.updateMany({\n\t\t\t\t\twhere: { userId: identity.userId, id: { in: squad.map(d => d.id) }, fight: true },\n\t\t\t\t\tdata: { fight: false }\n\t\t\t\t});\n\t\t\t\tif (consumed.count !== squad.length) throw new MtDungeonGuardianTrialError('conflict');\n\t\t\t\t// The fight engine`,p);
    return part;
  },p);
  return s;
});

edit('app/server/src/Dungeon/Service/mtDungeonFight.service.ts',(s,p)=>replace(s,
  'await prisma.$transaction(async tx => {\n\t\t\t\t// The fight engine has already persisted all HP losses.',
  `await prisma.$transaction(async tx => {\n\t\t\t\t// Consume one daily fight action for every Dinoz in this dungeon fight.\n\t\t\t\tconst consumed = await tx.dinoz.updateMany({\n\t\t\t\t\twhere: { userId: identity.userId, id: { in: team.map(d => d.id) }, fight: true },\n\t\t\t\t\tdata: { fight: false }\n\t\t\t\t});\n\t\t\t\tif (consumed.count !== team.length) throw new MtDungeonFightError('conflict');\n\t\t\t\t// The fight engine has already persisted all HP losses.`,p));

edit('app/server/src/Dungeon/Routes/mtDungeon.routes.ts',(s,p)=>{
  const route=`\t/** Real MT door guardian fight; never accepts monster list or combat result from HTTP. */
\tapp.post('/:leaderDinozId/guardian/fight/prepare', { preHandler: app.authenticate }, async (req, reply) => {
\t\tconst params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
\t\tconst body = z.object({ revision: z.number().int().nonnegative() }).strict().safeParse(req.body);
\t\tif (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-guardian-request' });
\t\ttry {
\t\t\treturn reply.send(await prepareMtGuardianTrial({ userId: req.user.id, leaderDinozId: params.data }, body.data.revision));
\t\t} catch (error) {
\t\t\tif (error instanceof MtDungeonGuardianTrialError) return reply.code(error.code === 'not-found' ? 404 : 409).send({ code: error.code });
\t\t\tthrow error;
\t\t}
\t});
\tapp.post('/:leaderDinozId/guardian/fight/resolve', { preHandler: app.authenticate }, async (req, reply) => {
\t\tconst params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
\t\tconst body = z.object({ token: z.string().uuid() }).strict().safeParse(req.body);
\t\tif (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-guardian-request' });
\t\ttry {
\t\t\treturn reply.send(await resolveMtGuardianTrial({ userId: req.user.id, leaderDinozId: params.data }, body.data.token));
\t\t} catch (error) {
\t\t\tif (error instanceof MtDungeonGuardianTrialError) return reply.code(error.code === 'not-found' ? 404 : 409).send({ code: error.code });
\t\t\tthrow error;
\t\t}
\t});

`;
  return insert(s,"\t/** Allow recovery of an already-defeated party",route,"app.post('/:leaderDinozId/guardian/fight/prepare'",p);
});

edit('app/client/src/services/mtDungeon.service.ts',(s,p)=>insert(s,
  '\tprepareGuardianTrial(id: number, revision: number): Promise<',
  `\tprepareGuardianFight(id: number, revision: number): Promise<{ token: string }> {
\t\treturn api.post(\`/dungeon/mt/\${id}/guardian/fight/prepare\`, { revision });
\t},
\tresolveGuardianFight(id: number, token: string): Promise<FightResult> {
\t\treturn api.post(\`/dungeon/mt/\${id}/guardian/fight/resolve\`, { token });
\t},
`, 'prepareGuardianFight(id: number',p));

edit('app/client/src/pages/MtMagneticCavernsPage.vue',(s,p)=>{
  s=insert(s, "import MtOriginalDungeonCanvas from '../components/dungeon/MtOriginalDungeonCanvas.vue';", "import { mtDungeonCombatTrigger } from '../components/dungeon/mtDungeonCombatTrigger.js';\n", "import { mtDungeonCombatTrigger }",p);
  // Keep a manual fallback button if automatic preparation fails: pending is never lost.
  s=replace(s,
    "<template v-if=\"session.pending.kind === 'guardian' && devCapabilities?.guardianFight\">",
    "<template v-if=\"session.pending.kind === 'guardian'\">",p);
  s=replace(s,
    '<button type="button" :disabled="busy" @click="fightGuardian">Combattre le gardien (test)</button>',
    '<button type="button" :disabled="busy" @click="fightGuardian">Combattre le gardien</button>',p);
  s=replace(s,
    "if (pending.kind === 'guardian')\n\t\treturn !!devCapabilities.value?.guardianSkip || !!devCapabilities.value?.guardianFight;",
    "if (pending.kind === 'guardian') return true;",p);
  s=replace(s,
    "if (session.value?.pending?.kind !== 'guardian' || !devCapabilities.value?.guardianFight) return;",
    "if (session.value?.pending?.kind !== 'guardian') return;",p);
  s=replace(s,
    'MtDungeonService.prepareGuardianTrial(leaderId, session.value!.revision)',
    'MtDungeonService.prepareGuardianFight(leaderId, session.value!.revision)',p);
  s=replace(s,
    'MtDungeonService.resolveGuardianTrial(leaderId, token)',
    'MtDungeonService.resolveGuardianFight(leaderId, token)',p);
  // The old 1-monster preview is no longer a valid description of real encounters.
  s=replace(s,
    "Gardien de test : <strong>{{ guardianTrial.monsterKey }}</strong> — composition provisoire issue du",
    "Gardien MT : <strong>{{ guardianTrial.monsterKey }}</strong> — apparence issue du",p);
  s=replace(s,
    "Le combat utilise le moteur Remastered ; il peut modifier la vie des Dinoz et attribuer de l'XP ou des",
    "Le combat utilise le moteur Remastered ; il consomme l'action de combat des Dinoz et peut attribuer de l'XP ou des",p);
  // Auto launch after authoritative arrival. Works for door guardians AND mandatory scenario fights.
  if (!s.includes('MtDungeonService.prepareGuardianFight(leaderId, result.session.revision)')) s=replace(s,
    `\t\tawait afterMutation(result.session);\n\t\tif (typeof result.goldAwarded === 'number') {`,
    `\t\tawait afterMutation(result.session);\n\t\tif (mtDungeonCombatTrigger(result.session.pending, encounter.value) === 'guardian') {\n\t\t\tconst { token } = await MtDungeonService.prepareGuardianFight(leaderId, result.session.revision);\n\t\t\tconst fightResult = await MtDungeonService.resolveGuardianFight(leaderId, token);\n\t\t\tsessionStore().setFightResult(fightResult);\n\t\t\tawait router.push({ name: 'FightPage', params: { dinozId: String(leaderId) } });\n\t\t\treturn;\n\t\t}\n\t\tif (mtDungeonCombatTrigger(result.session.pending, encounter.value) === 'scenario') {\n\t\t\tconst { token } = await MtDungeonService.prepareFight(leaderId, result.session.revision);\n\t\t\tconst fightResult = await MtDungeonService.resolveFight(leaderId, token);\n\t\t\tsessionStore().setFightResult(fightResult);\n\t\t\tawait router.push({ name: 'FightPage', params: { dinozId: String(leaderId) } });\n\t\t\treturn;\n\t\t}\n\t\tif (typeof result.goldAwarded === 'number') {`,p);
  return s;
});

for(const [filename,code] of plan) {
  if (readFileSync(filename,'utf8')!==code) {
    if (!process.argv.includes('--check')) writeFileSync(filename,code,'utf8');
    console.log(process.argv.includes('--check') ? 'Would update' : 'Updated', filename.slice(root.length+1));
  }
}
console.log(process.argv.includes('--check') ? '20I preflight passed (no files written).' : 'MT 20I encounters integrated (no Git operation).');
