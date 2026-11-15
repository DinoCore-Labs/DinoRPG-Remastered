import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const root = resolve(args.find(arg => !arg.startsWith('--')) ?? '.');
const check = args.includes('--check');
const base = dirname(fileURLToPath(import.meta.url));
const updates = new Map();
const additions = [
  'packages/core/src/models/clinic/clinicActivity.ts',
  'app/server/src/Clinic/Service/clinicActivity.service.ts',
  'app/server/test/unit/clinicActivity.service.test.ts'
];

async function exists(path) {
  try { await access(path); return true; }
  catch (err) { if (err?.code === 'ENOENT') return false; throw err; }
}
function changeExactlyOnce(source, regex, replacement, file, alreadyPattern = null) {
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  const matches = [...source.matchAll(re)];
  if (matches.length === 0 && alreadyPattern && alreadyPattern.test(source)) return source;
  if (matches.length !== 1) {
    throw new Error(`${file}: ancre absente ou ambiguë (${matches.length}) : ${regex.source.slice(0, 110)}`);
  }
  return source.replace(re, replacement);
}
async function prepare(file, transform) {
  const path = join(root, file);
  if (!(await exists(path))) throw new Error(`Fichier absent : ${file} (étapes 4 et 6 requises)`);
  const previous = await readFile(path, 'utf8');
  const lf = previous.replace(/\r\n?/g, '\n');
  const next = transform(lf);
  if (next !== lf) updates.set(file, previous.includes('\r\n') ? next.replace(/\n/g, '\r\n') : next);
}

const treat = 'app/server/src/Clinic/Service/clinicTreatment.service.ts';
await prepare(treat, src => {
  src = changeExactlyOnce(src,
    /state:\s*DinozState\.clinic,\s*stateTimer:\s*readyAt/,
    'state: DinozState.clinic, stateTimer: null', treat,
    /state:\s*DinozState\.clinic,\s*stateTimer:\s*null/);
  src = changeExactlyOnce(src,
    /\s*\|\|\s*dinoz\.stateTimer\?\.getTime\(\)\s*!==\s*treatment\.readyAt\.getTime\(\)/,
    '', treat, /dinoz\.userId !== userId\s*\|\|\s*dinoz\.state !== DinozState\.clinic\s*\)/);
  src = changeExactlyOnce(src,
    /state:\s*DinozState\.clinic,\s*stateTimer:\s*treatment\.readyAt/,
    'state: DinozState.clinic', treat,
    /where:\s*\{\s*id:\s*dinozId,\s*userId,\s*state:\s*DinozState\.clinic\s*\}/);
  // Do not even select the legacy timer when deciding whether a treatment is completed.
  src = changeExactlyOnce(src,
    /select:\s*\{\s*id:\s*true,\s*userId:\s*true,\s*state:\s*true,\s*stateTimer:\s*true,\s*maxLife:\s*true\s*\}/,
    'select: { id: true, userId: true, state: true, maxLife: true }', treat,
    /select:\s*\{\s*id:\s*true,\s*userId:\s*true,\s*state:\s*true,\s*maxLife:\s*true\s*\}/);
  return src;
});

const surgery = 'app/server/src/Clinic/Service/clinicSurgery.service.ts';
await prepare(surgery, src => {
  src = changeExactlyOnce(src,
    /state:\s*DinozState\.clinic,\s*stateTimer:\s*readyAt/,
    'state: DinozState.clinic, stateTimer: null', surgery,
    /state:\s*DinozState\.clinic,\s*stateTimer:\s*null/);
  src = changeExactlyOnce(src,
    /state:\s*DinozState\.clinic,\s*stateTimer:\s*surgery\.readyAt/,
    'state: DinozState.clinic', surgery,
    /where:\s*\{\s*id:\s*dinozId,\s*userId,\s*state:\s*DinozState\.clinic\s*\}/);
  return src;
});

const ficheType = 'packages/core/src/models/dinoz/dinozFiche.ts';
await prepare(ficheType, src => {
  if (!src.includes("import type { ClinicActivityStatus } from '../clinic/clinicActivity.js';")) {
    src = changeExactlyOnce(src, /(import \{ DinozCurrentMission \} from '\.\.\/missions\/missionCurrent\.js';)/,
      "import type { ClinicActivityStatus } from '../clinic/clinicActivity.js';\n$1", ficheType);
  }
  if (!src.includes('clinic?: ClinicActivityStatus | null;')) {
    src = changeExactlyOnce(src, /(\tstateTimer\?: string;)/, '$1\n\tclinic?: ClinicActivityStatus | null;', ficheType);
  }
  return src;
});

const fiche = 'app/server/src/Dinoz/Service/getDinozFiche.service.ts';
await prepare(fiche, src => {
  if (!src.includes("import { getActiveClinicStatuses } from '../../Clinic/Service/clinicActivity.service.js';")) {
    src = changeExactlyOnce(src, /(import \{ prisma \} from '\.\.\/\.\.\/prisma\.js';)/,
      "import { getActiveClinicStatuses } from '../../Clinic/Service/clinicActivity.service.js';\n$1", fiche);
  }
  if (!/\bret\.clinic\s*=/.test(src)) {
    // Step 2 introduced completedClanActionKeys as a fifth argument to
    // toDinozFiche(...). Attach the clinic status right before the existing
    // response instead of depending on its argument list.
    src = changeExactlyOnce(src,
      /^([ \t]*)return\s+reply\.send\(\s*ret\s*\);/m,
      (_match, indent) =>
        `${indent}// The deadline comes from ClinicTreatment/DinozSurgery, never Dinoz.stateTimer.\n` +
        `${indent}ret.clinic = (await getActiveClinicStatuses(authedId, [dinozId])).get(dinozId) ?? null;\n` +
        `${indent}return reply.send(ret);`,
      fiche);
  }
  return src;
});

const menu = 'app/server/src/Dinoz/Service/getDinozMenu.service.ts';
await prepare(menu, src => {
  if (!src.includes("import { getActiveClinicStatuses } from '../../Clinic/Service/clinicActivity.service.js';")) {
    src = changeExactlyOnce(src, /(import \{ prisma \} from '\.\.\/\.\.\/prisma\.js';)/,
      "import { getActiveClinicStatuses } from '../../Clinic/Service/clinicActivity.service.js';\n$1", menu);
  }
  if (!src.includes('const clinicStatuses = await getActiveClinicStatuses(')) {
    src = changeExactlyOnce(src,
      /^([ \t]*)const activeDinozCount\s*=\s*playerData\.dinoz\.filter\s*\(/m,
      (match, indent) =>
        `${indent}const clinicStatuses = await getActiveClinicStatuses(authedId, playerData.dinoz.map(dinoz => dinoz.id));\n` + match,
      menu);
  }
  if (!/\bfiche\.clinic\s*=\s*clinicStatuses\.get\(/.test(src)) {
    // The clinic place display patch also extends toDinozFiche(...) with
    // completedClanActionKeys. The final push is a stable insertion point.
    src = changeExactlyOnce(src,
      /^([ \t]*)dinozList\.push\(\s*fiche\s*\);/m,
      (_match, indent) =>
        `${indent}fiche.clinic = clinicStatuses.get(dinoz.id) ?? null;\n` +
        `${indent}dinozList.push(fiche);`,
      menu);
  }
  return src;
});

const panel = 'app/client/src/components/dinoz/DinozActions.vue';
await prepare(panel, src => {
  src = changeExactlyOnce(src,
    /(getClinicTreatmentCountdown\(\s*this\.dinoz\.state === DINOZ_STATE\.clinic,\s*)this\.dinoz\.stateTimer(\s*,)/,
    '$1this.dinoz.clinic?.readyAt$2', panel,
    /getClinicTreatmentCountdown\(\s*this\.dinoz\.state === DINOZ_STATE\.clinic,\s*this\.dinoz\.clinic\?\.readyAt\s*,/);
  return src;
});

const countdown = 'app/client/src/utils/clinicTreatmentCountdown.ts';
await prepare(countdown, src => {
  if (src.includes('stateTimer')) src = src.replace(/stateTimer/g, 'readyAt');
  if (!src.includes('readyAt')) throw new Error(`${countdown}: minuteur de la clinique introuvable`);
  return src;
});

// Preflight every addition before writing anything; never overwrite modified files.
const newContents = new Map();
for (const file of additions) {
  const proposed = await readFile(join(base, 'files', file), 'utf8');
  const target = join(root, file);
  if (await exists(target)) {
    const original = await readFile(target, 'utf8');
    if (original.replace(/\r\n?/g, '\n') !== proposed.replace(/\r\n?/g, '\n')) {
      throw new Error(`Fichier déjà présent avec des modifications locales : ${file}`);
    }
  } else newContents.set(file, proposed);
}

if (check) {
  console.log(`OK --check : ${updates.size} fichier(s) à modifier, ${newContents.size} à créer. Aucune écriture.`);
} else {
  for (const [file, contents] of updates) await writeFile(join(root, file), contents, 'utf8');
  for (const [file, contents] of newContents) {
    await mkdir(dirname(join(root, file)), { recursive: true });
    await writeFile(join(root, file), contents, 'utf8');
  }
  console.log(`Source de vérité clinique corrigée : ${updates.size} fichier(s) modifié(s), ${newContents.size} créé(s).`);
  console.log('Aucune migration Prisma, aucune modification Git.');
}
