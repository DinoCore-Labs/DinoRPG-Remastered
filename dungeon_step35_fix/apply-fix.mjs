import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  model: 'packages/core/src/models/fight/fightResult.ts',
  scenario: 'app/server/src/Dungeon/Service/mtDungeonFight.service.ts',
  guardian: 'app/server/src/Dungeon/Service/mtDungeonGuardianTrial.service.ts'
};
const files = Object.fromEntries(Object.entries(paths).map(([key, rel]) => {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) throw new Error(`Fichier introuvable : ${rel}. Exécute le script à la racine du monorepo.`);
  return [key, { full, text: fs.readFileSync(full, 'utf8') }];
}));

function replaceSingle(source, needle, replacement, label) {
  const n = source.split(needle).length - 1;
  if (n !== 1) throw new Error(`${label}: ${n} occurrences (attendu 1). Aucun fichier modifié.`);
  return source.replace(needle, replacement);
}

let model = files.model.text;
if (!/\bdungeonReturn\s*\?\s*:/.test(model)) {
  model = replaceSingle(model, '\tdialogReturn?: FightDialogReturn;',
    '\tdialogReturn?: FightDialogReturn;\n\t/** Context for a fight initiated within an MT dungeon. */\n\tdungeonReturn?: { leaderDinozId: number; mapId: string };', 'FightResult');
}

function patchService(source, label) {
  const context = `const dungeonResult: FightResult = {\n\t\t\t\t...result,\n\t\t\t\tdungeonReturn: { leaderDinozId: identity.leaderDinozId, mapId: session.mapId }\n\t\t\t};`;
  if (!source.includes('const dungeonResult: FightResult')) {
    // An earlier failed installer may have inserted a direct assignment.
    const assignment = /\bresult\.dungeonReturn\s*=\s*\{\s*leaderDinozId:\s*identity\.leaderDinozId,\s*mapId:\s*session\.mapId\s*\};/;
    if (assignment.test(source)) {
      source = source.replace(assignment, context);
    } else {
      source = replaceSingle(source,
        '\t\t\tconst stored = JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue;',
        '\t\t\t' + context + '\n\t\t\tconst stored = JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue;',
        `${label} insertion`);
    }
  }
  if (source.includes('const dungeonResult: FightResult')) {
    if (source.includes('const stored = JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue;'))
      source = replaceSingle(source, 'const stored = JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue;',
        'const stored = JSON.parse(JSON.stringify(dungeonResult)) as Prisma.InputJsonValue;', `${label} persistence`);
    // Exactly one service-level plain result return (not the stored-attempt return).
    if (/\n\t\t\treturn result;/.test(source))
      source = replaceSingle(source, '\n\t\t\treturn result;', '\n\t\t\treturn dungeonResult;', `${label} return`);
  }
  if (!source.includes('const dungeonResult: FightResult') || !source.includes('JSON.stringify(dungeonResult)') || !source.includes('return dungeonResult;'))
    throw new Error(`${label}: contexte FightResult incomplet. Aucun fichier modifié.`);
  return source;
}

const scenario = patchService(files.scenario.text, 'scenario');
const guardian = patchService(files.guardian.text, 'guardian');
const edits = [['model', model], ['scenario', scenario], ['guardian', guardian]];
for (const [key, output] of edits) {
  if (output !== files[key].text) fs.writeFileSync(files[key].full, output);
}
console.log('Correctif appliqué : FightResult + combats scénario + gardiens.');
