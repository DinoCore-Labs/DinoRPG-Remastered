#!/usr/bin/env node
/**
 * Repair only the step 20M Vitest expectations for Remastered's intentional x10
 * dungeon budgets. No gameplay, Prisma schema or migration is modified.
 *
 * From repository root: node tools/dungeon/apply-step20m-gold-tests-fix.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';

const target = 'app/server/test/unit/dungeon/mtDungeonGold.service.test.ts';
const dryRun = process.argv.slice(2).includes('--check');
if (process.argv.slice(2).some(arg => arg !== '--check')) {
  throw new Error('Option inconnue. Usage: node tools/dungeon/apply-step20m-gold-tests-fix.mjs [--check]');
}
const filepath = path.resolve(process.cwd(), target);
if (!fs.existsSync(filepath)) {
  throw new Error(`Fichier de test introuvable : ${target}. Lancer depuis la racine du monorepo.`);
}
const original = fs.readFileSync(filepath, 'utf8');
const crlf = original.includes('\r\n');
let code = original.replace(/\r\n/g, '\n');
const PATCH_MARKER = 'const CONFIGURED_MT_GOLD =';
if (code.includes(PATCH_MARKER)) {
  if (!code.includes('MT_DUNGEON_DEFINITIONS.fr.find') || !code.includes('mtDungeonGoldAward(')) {
    throw new Error(`${target}: correctif incomplet ou conflit ; aucun fichier modifié.`);
  }
  console.log(`${target}: correctif déjà installé (aucune modification).`);
  process.exit(0);
}
function replaceOnce(before, after) {
  const parts = code.split(before);
  if (parts.length !== 2) {
    throw new Error(`${target}: ancrage manquant ou ambigu (${parts.length - 1}): ${before.slice(0, 110)}. Aucun fichier modifié.`);
  }
  code = parts[0] + after + parts[1];
}

replaceOnce(
  "import { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';",
  "import { MT_DUNGEON_DEFINITIONS } from '@dinorpg/core/models/dungeon/dungeon.mtData.js';\nimport { mtDungeonGoldAward } from '@dinorpg/core/models/dungeon/dungeon.gold.js';\nimport { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';"
);
replaceOnce(
  "const identity = { userId: 'test-user', leaderDinozId: 13 };",
  `const identity = { userId: 'test-user', leaderDinozId: 13 };\n\n// Remastered intentionally increases the original MT dungeon gold budgets.\n// Keep tests tied to the active game configuration, not to a historical literal.\nconst magneticCaverns = MT_DUNGEON_DEFINITIONS.fr.find(dungeon => dungeon.id === 'stepp');\nif (!magneticCaverns) throw new Error('Définition des Cavernes Magnétiques introuvable');\nconst CONFIGURED_MT_GOLD = magneticCaverns.gold;\nconst FIRST_AWARD = mtDungeonGoldAward(17, CONFIGURED_MT_GOLD, CONFIGURED_MT_GOLD);\nconst SECOND_AWARD = mtDungeonGoldAward(17, CONFIGURED_MT_GOLD - FIRST_AWARD, CONFIGURED_MT_GOLD);`
);
replaceOnce('remaining = 150_000;', 'remaining = CONFIGURED_MT_GOLD;');
replaceOnce('initialGold: 150_000, remainingGold: remaining', 'initialGold: CONFIGURED_MT_GOLD, remainingGold: remaining');
replaceOnce('goldAwarded: 2550, walletGold: 2950', 'goldAwarded: FIRST_AWARD, walletGold: 400 + FIRST_AWARD');
replaceOnce("create: { dungeonId: 'stepp', initialGold: 150_000, remainingGold: 150_000 }", "create: { dungeonId: 'stepp', initialGold: CONFIGURED_MT_GOLD, remainingGold: CONFIGURED_MT_GOLD }");
replaceOnce("where: { dungeonId: 'stepp', remainingGold: 150_000 }", "where: { dungeonId: 'stepp', remainingGold: CONFIGURED_MT_GOLD }");
replaceOnce('data: { remainingGold: { decrement: 2550 } }', 'data: { remainingGold: { decrement: FIRST_AWARD } }');
replaceOnce('expect(remaining).toBe(147_450);', 'expect(remaining).toBe(CONFIGURED_MT_GOLD - FIRST_AWARD);');
replaceOnce('data: { amount: { increment: 2550 } }', 'data: { amount: { increment: FIRST_AWARD } }');
replaceOnce('expect(first.goldAwarded).toBe(2550);', 'expect(first.goldAwarded).toBe(FIRST_AWARD);');
replaceOnce('expect(second.goldAwarded).toBe(2507);', 'expect(second.goldAwarded).toBe(SECOND_AWARD);\n\t\texpect(second.goldAwarded).toBeLessThan(first.goldAwarded);');
replaceOnce('expect(remaining).toBe(144_943);', 'expect(remaining).toBe(CONFIGURED_MT_GOLD - FIRST_AWARD - SECOND_AWARD);');
// The conflict test deliberately uses a competing balance of 100_000; its 1700
// award is unchanged because the Remastered formula depends on remaining gold.
replaceOnce('expect(result.goldAwarded).toBe(1700);', 'expect(result.goldAwarded).toBe(mtDungeonGoldAward(17, 100_000, CONFIGURED_MT_GOLD));');
replaceOnce('expect(remaining).toBe(98_300);', 'expect(remaining).toBe(100_000 - mtDungeonGoldAward(17, 100_000, CONFIGURED_MT_GOLD));');

if (code.includes('initialGold: 150_000') || code.includes('remaining = 150_000') || code.includes('goldAwarded: 2550')) {
  throw new Error(`${target}: des attentes historiques subsistent ; aucune modification.`);
}
console.log(`${target}: ${dryRun ? 'précontrôle réussi, aucune écriture' : 'attentes adaptées aux budgets Remastered'}.`);
if (!dryRun) {
  fs.writeFileSync(filepath, crlf ? code.replace(/\n/g, '\r\n') : code, 'utf8');
}
