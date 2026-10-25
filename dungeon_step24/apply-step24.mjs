import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  msg: 'app/client/src/components/dungeon/MtDungeonMessageBox.vue',
  test: 'app/client/test/unit/dungeon/mtDungeonSceneItems.test.ts'
};
const files = Object.fromEntries(Object.entries(paths).map(([key, rel]) => {
  const filename = path.join(root, rel);
  if (!fs.existsSync(filename)) throw new Error(`Missing file: ${rel}. Run from monorepo root.`);
  return [key, { filename, data: fs.readFileSync(filename, 'utf8') }];
}));

// Avoid Vite converting this public asset into a module import during Vue test transformation.
const beforeImg = 'src="/dungeon/mt/item_scroll.png"';
const afterImg = ':src="\'/dungeon/mt/item_scroll.png\'"';
if (files.msg.data.includes(beforeImg)) {
  if (files.msg.data.split(beforeImg).length !== 2) throw new Error('Ambiguous MsgBox image source');
  files.msg.data = files.msg.data.replace(beforeImg, afterImg);
} else if (!files.msg.data.includes(afterImg)) {
  throw new Error('MsgBox image source differs; no files written');
}

// This heal sprite was recovered after the initial test was authored.
const testRe = /it\(['"]does not fabricate an absent original heal PNG or unsupported icon['"],\s*\(\)\s*=>\s*\{[\s\S]*?\n\s*\}\);/g;
const fixed = `it('renders the recovered heal sprite without inventing unsupported scenario icons', () => {
		const scene = emptyScene();
		scene.features = [
			{ kind: 'heal', x: 2, y: 2, consumed: false },
			{ kind: 'scenario-icon', x: 3, y: 2, icon: 'missing_mystery' }
		];
		const plan = createMtSpritePlan(scene);
		expect(plan.sprites.map(s => s.file)).toEqual(['item_heal.png']);
		expect(plan.sprites[0]).toMatchObject({
			url: '/dungeon/mt/item_heal.png',
			label: 'item:heal:item_heal.png',
			x: 80,
			y: 80
		});
		expect(plan.unresolved.some(e => e.includes('missing_mystery'))).toBe(true);
	});`;
if (testRe.test(files.test.data)) {
  testRe.lastIndex = 0;
  files.test.data = files.test.data.replace(testRe, fixed);
} else if (!files.test.data.includes("it('renders the recovered heal sprite without inventing unsupported scenario icons'")) {
  throw new Error('SceneItems heal test differs; no files written');
}

for (const [key, file] of Object.entries(files)) {
  const current = fs.readFileSync(file.filename, 'utf8');
  if (current !== file.data) {
    fs.writeFileSync(file.filename, file.data, 'utf8');
    console.log(`Updated ${paths[key]}`);
  } else console.log(`Already up to date: ${paths[key]}`);
}
console.log('Step 24 applied successfully.');
