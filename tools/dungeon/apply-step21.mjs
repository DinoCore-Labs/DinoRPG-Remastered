import { readFileSync, writeFileSync } from 'node:fs';

function update(path, replacements) {
  let code = readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (!code.includes(from)) throw new Error(`Anchor missing in ${path}: ${from.slice(0, 90)}`);
    if (code.split(from).length !== (from.includes("activeMessage.kind") ? 3 : 2)) throw new Error(`Ambiguous anchor in ${path}: ${from.slice(0, 90)}`);
    code = from.includes("activeMessage.kind") ? code.replaceAll(from, to) : code.replace(from, to);
  }
  writeFileSync(path, code);
  console.log(`Updated ${path}`);
}

update('packages/core/src/models/dungeon/dungeon.session.ts', [
  ["blockedDoor?: 'missing-key';", "blockedDoor?: 'missing-key';\n\t\t\trequiredKey?: number;"],
  ["const missingKey = decision.events.some(event => event.kind === 'locked-door');", "const lockedDoor = decision.events.find(event => event.kind === 'locked-door');"],
  ["...(missingKey ? { blockedDoor: 'missing-key' as const } : {})", "...(lockedDoor?.kind === 'locked-door'\n\t\t\t\t\t? { blockedDoor: 'missing-key' as const, requiredKey: lockedDoor.requiredKey }\n\t\t\t\t\t: {})"]
]);
update('app/client/src/services/mtDungeon.service.ts', [
  ["blockedDoor?: 'missing-key';", "blockedDoor?: 'missing-key';\n\t\trequiredKey?: number;"]
]);
update('app/client/src/pages/MtMagneticCavernsPage.vue', [
  ["activeMessage.kind === 'entry' || activeMessage.kind === 'irma' ? 'notice' : 'dialog'", "activeMessage.kind === 'entry' || activeMessage.kind === 'irma' || activeMessage.kind === 'pickup' ? 'notice' : 'dialog'"],
  ["const irmaMessage = ref<string | null>(null);", "const irmaMessage = ref<string | null>(null);\nconst pickupMessage = ref<string | null>(null);"],
  ["type MtNarrativeKind = 'entry' | 'exit' | 'scenario' | 'scenario-combat' | 'irma';", "type MtNarrativeKind = 'entry' | 'exit' | 'scenario' | 'scenario-combat' | 'irma' | 'pickup';"],
  ["if (session.value && irmaMessage.value)", "if (session.value && pickupMessage.value)\n\t\treturn { kind: 'pickup', title: '', text: pickupMessage.value, confirmLabel: 'Continuer' };\n\tif (session.value && irmaMessage.value)"],
  ["function closeMessage(): void {\n\tconst kind = activeMessage.value?.kind;", "function closeMessage(): void {\n\tconst kind = activeMessage.value?.kind;\n\tif (kind === 'pickup') pickupMessage.value = null;"],
  ["function confirmMessage(): void {\n\tconst kind = activeMessage.value?.kind;", "function confirmMessage(): void {\n\tconst kind = activeMessage.value?.kind;\n\tif (kind === 'pickup') pickupMessage.value = null;"],
  ["notice.value = 'Cette porte est verrouillée. Il faut trouver sa clé dans le donjon.';", "pickupMessage.value = Number.isInteger(result.requiredKey)\n\t\t\t\t? `Cette porte est verrouillée. Il vous faut la clé n°${result.requiredKey}.`\n\t\t\t\t: 'Cette porte est verrouillée. Il faut trouver sa clé dans le donjon.';"],
  ["await afterMutation(result.session);\n\t\tif (await settleMtBoundary(result.session)) return;", "await afterMutation(result.session);\n\t\tconst collectedKeys = result.session.keys.flatMap((owned, id) =>\n\t\t\towned && !previous.keys[id] ? [id] : []\n\t\t);\n\t\tif (collectedKeys.length > 0)\n\t\t\tpickupMessage.value = collectedKeys.length === 1\n\t\t\t\t? `Vous avez trouvé la clé n°${collectedKeys[0]}.`\n\t\t\t\t: `Vous avez trouvé les clés n°${collectedKeys.join(', ')}.`;\n\t\tif (await settleMtBoundary(result.session)) return;"],
  ["notice.value =\n\t\t\t\tresult.goldAwarded > 0\n\t\t\t\t\t? `Trésor récupéré : +${result.goldAwarded} or.`\n\t\t\t\t\t: 'Trésor récupéré (valeur MT brute : 0).';", "pickupMessage.value = result.goldAwarded > 0\n\t\t\t\t? `Vous avez récupéré ${result.goldAwarded} pièces d'or !`\n\t\t\t\t: 'Ce trésor ne contient plus de pièces d’or.';"]
]);
console.log('Step 21 applied. Run pnpm typecheck/tests for client, server, core.');
