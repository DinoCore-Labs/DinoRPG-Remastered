import fs from 'node:fs';

const files = {
  type: 'packages/core/src/models/fight/fightResult.ts',
  guardian: 'app/server/src/Dungeon/Service/mtDungeonGuardianTrial.service.ts',
  scenario: 'app/server/src/Dungeon/Service/mtDungeonFight.service.ts',
  bounce: 'app/client/src/components/fight/FightBounce.vue'
};
const data = Object.fromEntries(Object.entries(files).map(([key, path]) => {
  if (!fs.existsSync(path)) throw new Error(`Fichier introuvable : ${path}. Aucun fichier modifié.`);
  return [key, fs.readFileSync(path, 'utf8')];
}));
function changeOnce(text, regex, replacement, label) {
  const matches = [...text.matchAll(regex)];
  if (matches.length !== 1) throw new Error(`${label} : attendu 1 correspondance, trouvé ${matches.length}. Aucun fichier modifié.`);
  return text.replace(regex, replacement);
}

if (!data.type.includes('dungeonReturn?: { leaderDinozId: number; mapId: string };')) {
  data.type = changeOnce(data.type, /\tsource\?: FightSource;/g,
    '\tsource?: FightSource;\n\t/** Server-authored dungeon combat return context. */\n\tdungeonReturn?: { leaderDinozId: number; mapId: string };', 'FightResult');
}
for (const name of ['guardian', 'scenario']) {
  if (!data[name].includes('result.dungeonReturn = { leaderDinozId: identity.leaderDinozId, mapId: session.mapId };')) {
    data[name] = changeOnce(data[name], /([ \t]*)const stored = JSON\.parse\(JSON\.stringify\(result\)\) as Prisma\.InputJsonValue;/g,
      (_, indent) => `${indent}// Include the verified dungeon origin in stored and returned fight results.\n${indent}result.dungeonReturn = { leaderDinozId: identity.leaderDinozId, mapId: session.mapId };\n${indent}const stored = JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue;`, `${name} reward`);
  }
}
const newBlock = `\t\t\t\t// Only an explicitly tagged dungeon fight can return to DungeonPage.
\t\t\t\tconst dungeonReturn = this.fight.dungeonReturn;
\t\t\t\tif (dungeonReturn) {
\t\t\t\t\ttry {
\t\t\t\t\t\tconst active = await MtDungeonService.getSession(dungeonReturn.leaderDinozId);
\t\t\t\t\t\tconst expectedDungeon = dungeonReturn.mapId.replace(/_[0-9]+$/, '');
\t\t\t\t\t\tif (!active.mapId.startsWith(expectedDungeon + '_')) {
\t\t\t\t\t\t\tthrow new Error('La session active ne correspond pas au donjon du combat.');
\t\t\t\t\t\t}
\t\t\t\t\t\tawait this.$router.replace({ name: 'DungeonPage', params: { id: String(dungeonReturn.leaderDinozId) } });
\t\t\t\t\t\treturn;
\t\t\t\t\t} catch (error) {
\t\t\t\t\t\tif (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
\t\t\t\t\t\t// The server ended the dungeon run (e.g. leader KO or entire team defeated).
\t\t\t\t\t\tawait this.$router.replace({ name: 'DinozPage', params: { id: String(dungeonReturn.leaderDinozId) } });
\t\t\t\t\t\treturn;
\t\t\t\t\t}
\t\t\t\t}

`;
if (!data.bounce.includes('const dungeonReturn = this.fight.dungeonReturn;')) {
  // The step-33 and step-34 navigation implementations differ; replace the
  // navigation section of returnToDinoz, not its contents by exact whitespace.
  const segment = /(\basync returnToDinoz\(\): Promise<void> \{[\s\S]*?\bthis\.loadingContinue = true;[\s\S]*?\t\t\ttry \{\r?\n)([\s\S]*?)(?=\t\t\t\t\/\/ Preserve the dialogue continuation after ordinary fights\.)/g;
  data.bounce = changeOnce(data.bounce, segment, (_, prefix) => prefix + newBlock, 'FightBounce returnToDinoz');
}
// Improve error reporting without depending on the message of an older patch.
if (!data.bounce.includes("console.error('Échec de retour après combat', error);")) {
  const catchOld = /(\t\t\t\} catch) \{\r?\n(\t\t\t\tthis\.\$toast\.open\(\{\r?\n\t\t\t\t\tmessage: )('(?:Impossible de vérifier la session du donjon\. Réessaie\.|Impossible de revenir après le combat\. Réessaie\.|Retour après combat impossible\. Réessaie\.)')/g;
  const matches = [...data.bounce.matchAll(catchOld)];
  if (matches.length === 1) {
    data.bounce = data.bounce.replace(catchOld, "\t\t\t} catch (error) {\n\t\t\t\tconsole.error('Échec de retour après combat', error);\n\t\t\t\tthis.$toast.open({\n\t\t\t\t\tmessage: 'Retour après combat impossible. Réessaie.'");
  }
}
// Validate all transformations before any write, including on subsequent runs.
if (!data.type.includes('dungeonReturn?: { leaderDinozId: number; mapId: string };') ||
    !['guardian','scenario'].every(name => data[name].includes('result.dungeonReturn = { leaderDinozId: identity.leaderDinozId, mapId: session.mapId };')) ||
    !data.bounce.includes('const dungeonReturn = this.fight.dungeonReturn;') ||
    data.bounce.includes("name: 'MtMagneticCavernsPage'")) {
  throw new Error('Validation finale de l’étape 35 échouée. Aucun fichier modifié.');
}
let modified = 0;
for (const [key, path] of Object.entries(files)) {
  const old = fs.readFileSync(path, 'utf8');
  if (old !== data[key]) { fs.writeFileSync(path, data[key]); modified++; }
}
console.log(modified ? `Étape 35 v2 appliquée (${modified} fichier(s)).` : 'Étape 35 v2 déjà installée, aucune modification.');
