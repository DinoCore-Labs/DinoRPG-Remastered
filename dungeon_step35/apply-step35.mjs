import fs from 'node:fs';

const files = {
  type: 'packages/core/src/models/fight/fightResult.ts',
  guardian: 'app/server/src/Dungeon/Service/mtDungeonGuardianTrial.service.ts',
  scenario: 'app/server/src/Dungeon/Service/mtDungeonFight.service.ts',
  bounce: 'app/client/src/components/fight/FightBounce.vue'
};
const data = Object.fromEntries(Object.entries(files).map(([name, path]) => {
  if (!fs.existsSync(path)) throw new Error(`Fichier introuvable : ${path}`);
  return [name, fs.readFileSync(path, 'utf8')];
}));
function replaceUnique(source, regex, replacement, label) {
  const matches = [...source.matchAll(regex)];
  if (matches.length !== 1) throw new Error(`${label} : ${matches.length} correspondance(s), attendu 1. Aucun fichier modifié.`);
  return source.replace(regex, replacement);
}
const already = data.type.includes('dungeonReturn?: {') && data.bounce.includes('fight.dungeonReturn?.leaderDinozId');
if (already) { console.log('Étape 35 déjà installée.'); process.exit(0); }
if (Object.values(data).some(s => s.includes('STEP_35_DUNGEON_RETURN'))) {
  throw new Error('Étape 35 installée partiellement ; vérifie les fichiers avant de recommencer. Aucun fichier modifié.');
}
// Add optional shared metadata. Existing fights remain unchanged.
data.type = replaceUnique(data.type, /\tsource\?: FightSource;/g,
  '\tsource?: FightSource;\n\t/** STEP_35_DUNGEON_RETURN: server-authored origin for MT dungeon fight navigation. */\n\tdungeonReturn?: { leaderDinozId: number; mapId: string };', 'FightResult');
for (const name of ['guardian', 'scenario']) {
  data[name] = replaceUnique(data[name], /\t\t\tconst stored = JSON\.parse\(JSON\.stringify\(result\)\) as Prisma\.InputJsonValue;/g,
    '\t\t\t// STEP_35_DUNGEON_RETURN: include the trusted dungeon origin in stored and returned FightResult.\n\t\t\tresult.dungeonReturn = { leaderDinozId: identity.leaderDinozId, mapId: session.mapId };\n\t\t\tconst stored = JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue;', `${name} reward`);
}
// Eliminate stale stepp / MtMagneticCavernsPage logic and limit session lookup to actual dungeon fights.
const bounceStart = /\t\t\t\t\/\/ A follower shares the dungeon session of its leader\.[\s\S]*?\n\t\t\t\t\/\/ Preserve the dialogue continuation after ordinary fights\./g;
const newBlock = `\t\t\t\t// STEP_35_DUNGEON_RETURN: only dungeon fights have this server-authored context.\n\t\t\t\tconst dungeonReturn = this.fight.dungeonReturn;\n\t\t\t\tif (dungeonReturn) {\n\t\t\t\t\ttry {\n\t\t\t\t\t\tconst active = await MtDungeonService.getSession(dungeonReturn.leaderDinozId);\n\t\t\t\t\t\tif (active.mapId !== dungeonReturn.mapId && !active.mapId.startsWith(dungeonReturn.mapId.replace(/_[0-9]+$/, '') + '_')) {\n\t\t\t\t\t\t\tthrow new Error('La session active ne correspond pas au donjon du combat.');\n\t\t\t\t\t\t}\n\t\t\t\t\t\tawait this.$router.replace({ name: 'DungeonPage', params: { id: String(dungeonReturn.leaderDinozId) } });\n\t\t\t\t\t\treturn;\n\t\t\t\t\t} catch (error) {\n\t\t\t\t\t\t// Only a confirmed 404 indicates a terminated run (KO/death).\n\t\t\t\t\t\tif (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;\n\t\t\t\t\t\tawait this.$router.replace({ name: 'DinozPage', params: { id: String(dungeonReturn.leaderDinozId) } });\n\t\t\t\t\t\treturn;\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\t// Preserve the dialogue continuation after ordinary fights.`;
data.bounce = replaceUnique(data.bounce, bounceStart, newBlock, 'FightBounce old navigation');
data.bounce = replaceUnique(data.bounce, /\t\t\t} catch \{\n\t\t\t\tthis\.\$toast\.open\(\{\n\t\t\t\t\tmessage: 'Impossible de vérifier la session du donjon\. Réessaie\.',/g,
  "\t\t\t} catch (error) {\n\t\t\t\tconsole.error('Échec de retour après combat', error);\n\t\t\t\tthis.$toast.open({\n\t\t\t\t\tmessage: 'Retour après combat impossible. Réessaie.',", 'FightBounce error');
// All transformations succeeded; only now write.
for (const [key, path] of Object.entries(files)) fs.writeFileSync(path, data[key]);
console.log('Étape 35 installée : contexte de donjon sérialisé dans FightResult et retour générique corrigé.');
