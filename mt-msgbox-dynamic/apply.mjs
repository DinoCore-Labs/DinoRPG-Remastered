import { readFileSync, writeFileSync } from 'node:fs';

// Run at monorepo root. Validate every unique anchor before changing either file.
const paths = [
  'app/client/src/components/dungeon/MtDungeonMessageBox.vue',
  'app/client/src/pages/DungeonPage.vue'
];
const files = paths.map(path => ({ path, content: readFileSync(path, 'utf8') }));
const replace = (content, oldText, newText, path) => {
  const count = content.split(oldText).length - 1;
  if (count !== 1) throw new Error(`${path}: expected one occurrence, found ${count}: ${oldText.slice(0,90)}`);
  return content.replace(oldText, newText);
};
let component = files[0].content;
component = replace(component,
  `<img class="mt-msgbox__tab" :src="'/dungeon/mt/item_scroll.png'" aria-hidden="true" />`,
  `<img v-if="iconUrl" class="mt-msgbox__tab" :src="iconUrl" alt="" aria-hidden="true" />`,paths[0]);
component = replace(component,
  `<script setup lang="ts">`,
  `<script setup lang="ts">\nimport { computed } from 'vue';\n\n// MT's original scene/message icons; never interpolate untrusted strings into asset URLs.\nconst ITEM_ICONS: Readonly<Record<string, string>> = {\n\tchest: 'item_chest.png',\n\tscroll: 'item_scroll.png',\n\tskel: 'item_skel.png',\n\tgold: 'item_gold.png',\n\tkey: 'item_key_01.png'\n};`,paths[0]);
component = replace(component,
  `\t\tplacement?: 'screen' | 'viewport';`,
  `\t\tplacement?: 'screen' | 'viewport';\n\t\ticon?: string | null;`,paths[0]);
component = replace(component,
  `const emit = defineEmits<{ confirm: []; close: [] }>();`,
  `const iconUrl = computed(() => {\n\tconst filename = props.icon ? ITEM_ICONS[props.icon] : undefined;\n\treturn filename ? \`/dungeon/mt/\${filename}\` : null;\n});\nconst emit = defineEmits<{ confirm: []; close: [] }>();`,paths[0]);

let page = files[1].content;
// Both message boxes use the same prop. Match whole lines so indentation
// cannot cause the short anchor to match the long one.
const cancelLabelLine = /^(\s*):cancel-label="activeMessage\.cancelLabel"[ \t]*$/gm;
const cancelLines = [...page.matchAll(cancelLabelLine)];
if (cancelLines.length !== 2) {
  throw new Error(`${paths[1]}: expected two msgBox cancel labels, found ${cancelLines.length}`);
}
page = page.replace(cancelLabelLine, (_line, indent) =>
  `${indent}:cancel-label="activeMessage.cancelLabel"\n${indent}:icon="activeMessage.icon"`
);
page = replace(page,
  `const pickupMessage = ref<string | null>(null);`,
  `const pickupMessage = ref<string | null>(null);\nconst pickupIcon = ref<string | null>(null);`,paths[1]);
page = replace(page,
  `type MtNarrative = { kind: MtNarrativeKind; title: string; text: string; confirmLabel: string; cancelLabel?: string };`,
  `type MtNarrative = { kind: MtNarrativeKind; title: string; text: string; confirmLabel: string; cancelLabel?: string; icon?: string | null };`,paths[1]);
page = replace(page,
  `return { kind: 'pickup', title: '', text: pickupMessage.value, confirmLabel: t('dungeon.continue') };`,
  `return { kind: 'pickup', title: '', text: pickupMessage.value, confirmLabel: t('dungeon.continue'), icon: pickupIcon.value };`,paths[1]);
page = replace(page,
  `\t\t\t\ttext: current.text,\n\t\t\t\tconfirmLabel: t('dungeon.readCollect'),`,
  `\t\t\t\ttext: current.text,\n\t\t\t\ticon: current.messageIcon ?? null,\n\t\t\t\tconfirmLabel: t('dungeon.readCollect'),`,paths[1]);
page = replace(page,
  `\t\t\t\ttext: current.text,\n\t\t\t\tconfirmLabel: t('dungeon.fight'),`,
  `\t\t\t\ttext: current.text,\n\t\t\t\ticon: current.messageIcon ?? null,\n\t\t\t\tconfirmLabel: t('dungeon.fight'),`,paths[1]);
// All ways of dismissing a pickup must clear the matching icon.
const dismiss = `if (kind === 'pickup') pickupMessage.value = null;`;
if (page.split(dismiss).length - 1 !== 2) throw new Error('Expected two pickup dismiss paths');
page = page.replaceAll(dismiss,`if (kind === 'pickup') {\n\t\tpickupMessage.value = null;\n\t\tpickupIcon.value = null;\n\t}`);
page = replace(page,
  `\t\tif (result.blockedDoor === 'missing-key') {`,
  `\t\tif (result.blockedDoor === 'missing-key') {\n\t\t\tpickupIcon.value = null;`,paths[1]);
page = replace(page,
  `\t\tif (collectedKeys.length > 0)\n\t\t\tpickupMessage.value =`,
  `\t\tif (collectedKeys.length > 0) {\n\t\t\tpickupIcon.value = 'key';\n\t\t\tpickupMessage.value =`,paths[1]);
page = replace(page,
  `: collectedKeys.map(id => mtDungeonKeyPickupMessage(leaderId, result.session.mapId, id, t)).join('\\n');`,
  `: collectedKeys.map(id => mtDungeonKeyPickupMessage(leaderId, result.session.mapId, id, t)).join('\\n');\n\t\t}`,paths[1]);
page = replace(page,
  `\t\tif (typeof result.goldAwarded === 'number') {`,
  `\t\tif (typeof result.goldAwarded === 'number') {\n\t\t\tpickupIcon.value = 'gold';`,paths[1]);
for(const [i,file] of files.entries()) writeFileSync(file.path, i===0?component:page);
console.log('MT msgBox: dynamic icon wired, gold/key pickup icons added; original scenario icon forwarded.');
