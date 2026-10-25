import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dungeonPath = resolve('app/client/src/pages/DungeonPage.vue');
const bouncePath = resolve('app/client/src/components/fight/FightBounce.vue');
let dungeon = readFileSync(dungeonPath, 'utf8');
let bounce = readFileSync(bouncePath, 'utf8');
const oldDungeon = dungeon;
const oldBounce = bounce;

// A dungeon fight must carry its origin explicitly, even if the local Dinoz store is stale.
const fightDestination = /await router\.push\(\{ name: 'FightPage', params: \{ dinozId: String\(leaderId\) \} \}\);/g;
const destinations = [...dungeon.matchAll(fightDestination)];
if (destinations.length !== 4 && !dungeon.includes("query: { mtDungeonLeader: String(leaderId) }")) {
  throw new Error(`DungeonPage: attendu 4 départs vers FightPage, trouvé ${destinations.length}. Aucun fichier modifié.`);
}
if (destinations.length) {
  dungeon = dungeon.replace(fightDestination,
    "await router.push({ name: 'FightPage', params: { dinozId: String(leaderId) }, query: { mtDungeonLeader: String(leaderId) } });");
}

// Replace only the session-detection part of FightBounce. Works on original branch or step 33.
const block = /\t{4}\/\/ (?:A follower shares the dungeon session of its leader\.|All original MT dungeons share the same generic exploration page\.)[\s\S]*?(?=\n\t{4}\/\/ Preserve the dialogue continuation after ordinary fights\.)/;
const revisedBlock = `\t\t\t\t// Origin is passed by DungeonPage instead of inferred from potentially stale Dinoz store.
\t\t\t\tconst origin = this.$route.query.mtDungeonLeader;
\t\t\t\tconst explicitLeader = typeof origin === 'string' && /^[1-9]\\d*$/.test(origin) ? Number(origin) : null;
\t\t\t\tconst candidateLeader = explicitLeader ?? (this.dinozStore.getDinoz(this.dinozId)?.leaderId ?? this.dinozId);
\t\t\t\tlet activeDungeon = false;
\t\t\t\ttry {
\t\t\t\t\tawait MtDungeonService.getSession(candidateLeader);
\t\t\t\t\tactiveDungeon = true;
\t\t\t\t} catch (error) {
\t\t\t\t\t// A real 404 after combat means the dungeon run ended (leader KO / party wiped).
\t\t\t\t\tif (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
\t\t\t\t}
\t\t\t\tif (activeDungeon) {
\t\t\t\t\tawait this.$router.replace({ name: 'DungeonPage', params: { id: String(candidateLeader) } });
\t\t\t\t\treturn;
\t\t\t\t}
`;
if (!bounce.includes('const origin = this.$route.query.mtDungeonLeader;')) {
  if (!block.test(bounce)) throw new Error('FightBounce: bloc de retour introuvable. Aucun fichier modifié.');
  bounce = bounce.replace(block, revisedBlock);
}
if (dungeon !== oldDungeon) writeFileSync(dungeonPath, dungeon);
if (bounce !== oldBounce) writeFileSync(bouncePath, bounce);
console.log('Étape 34 : contexte du donjon transmis au combat et utilisé pour le retour.');
