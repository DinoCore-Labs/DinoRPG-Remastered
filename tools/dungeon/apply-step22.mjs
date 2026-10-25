import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(path, before, after) {
  const old = readFileSync(path, 'utf8');
  if (old.includes(after)) { console.log(`Already applied: ${path}`); return; }
  const chunks = old.split(before);
  if (chunks.length !== 2) throw new Error(`Missing/ambiguous anchor: ${path}: ${before.slice(0,80)}`);
  writeFileSync(path, chunks.join(after));
  console.log(`Updated ${path}`);
}
const page = 'app/client/src/pages/MtMagneticCavernsPage.vue';
// Stop clicks on onscreen arrows while the Flash-style pickup/door message is visible.
replaceOnce(page,
  '\t\tpartyNeedsIrma.value ||\n\t\t!partyActionsLoaded.value ||',
  '\t\tpartyNeedsIrma.value ||\n\t\t!!activeMessage.value ||\n\t\t!partyActionsLoaded.value ||'
);
const tests = 'packages/core/test/unit/dungeon/dungeon.doors-persistence.test.ts';
replaceOnce(tests,
  "\t\texpect(response.blockedDoor).toBe('missing-key');",
  "\t\texpect(response.blockedDoor).toBe('missing-key');\n\t\texpect(response.requiredKey).toBe(2);"
);
replaceOnce(tests,
  "\t\texpect(wrongKey.blockedDoor).toBe('missing-key');",
  "\t\texpect(wrongKey.blockedDoor).toBe('missing-key');\n\t\texpect(wrongKey.requiredKey).toBe(2);"
);
replaceOnce(tests,
  "\t\texpect(key.blockedDoor).toBeUndefined();",
  "\t\texpect(key.blockedDoor).toBeUndefined();\n\t\texpect(key.requiredKey).toBeUndefined();"
);
console.log('Step 22 complete. Use pnpm --filter @dinorpg/core test -- dungeon.doors-persistence and pnpm --filter @dinorpg/client test.');
