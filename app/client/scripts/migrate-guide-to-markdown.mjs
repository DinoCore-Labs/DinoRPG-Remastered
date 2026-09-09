import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LANGUAGES = ['FR', 'EN', 'ES', 'DE'];

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = resolve(SCRIPT_DIR, '..');

const LOCALES_DIR = join(CLIENT_DIR, 'src', 'i18n', 'locales');
const GUIDE_DIR = join(CLIENT_DIR, 'src', 'content', 'guide');

const text = key => ({ type: 'text', key });
const heading = key => ({ type: 'heading', key });
const image = (path, name) => ({ type: 'image', path, name });
const list = items => ({ type: 'list', items });

const item = (key, path = 'icons', name = 'info_button') => ({
	key,
	path,
	name
});

const infoList = (...keys) => list(keys.map(key => item(key)));

const GUIDE_SECTIONS = [
	{
		slug: 'intro',
		titleKey: 'guide.sections.intro',
		blocks: [text('guide.text.intro')]
	},
	{
		slug: 'adopt',
		titleKey: 'guide.sections.adopt',
		blocks: [text('guide.text.adopt'), image('guide', 'adopt'), text('guide.text.adopt2')]
	},
	{
		slug: 'name',
		titleKey: 'guide.sections.name',
		blocks: [text('guide.text.name'), image('guide', 'name'), text('guide.text.name2')]
	},
	{
		slug: 'card',
		titleKey: 'guide.sections.card',
		blocks: [
			text('guide.text.card'),
			image('guide', 'card'),
			text('guide.text.card2'),
			infoList('guide.text.card2-1', 'guide.text.card2-2', 'guide.text.card2-3'),
			text('guide.text.card3')
		]
	},
	{
		slug: 'move',
		titleKey: 'guide.sections.move',
		blocks: [
			text('guide.text.move'),
			image('guide', 'move'),
			text('guide.text.move2'),
			infoList('guide.text.move2-1'),
			text('guide.text.move3')
		]
	},
	{
		slug: 'fight',
		titleKey: 'guide.sections.fight',
		blocks: [
			text('guide.text.fight'),
			image('guide', 'fight'),

			text('guide.text.fight2'),
			infoList('guide.text.fight2-1', 'guide.text.fight2-2', 'guide.text.fight2-3', 'guide.text.fight2-4'),

			heading('guide.text.fight3'),
			text('guide.text.fight3-1'),
			list([
				item('guide.text.fight3-1-1', 'elements', 'elem_fire'),
				item('guide.text.fight3-1-2', 'elements', 'elem_wood'),
				item('guide.text.fight3-1-3', 'elements', 'elem_water'),
				item('guide.text.fight3-1-4', 'elements', 'elem_lightning'),
				item('guide.text.fight3-1-5', 'elements', 'elem_air')
			]),
			text('guide.text.fight3-2'),
			image('guide', 'elements'),
			text('guide.text.fight3-3'),

			heading('guide.text.fight4'),
			text('guide.text.fight4-1'),
			image('guide', 'assault'),
			text('guide.text.fight4-2'),
			infoList('guide.text.fight4-2-1', 'guide.text.fight4-2-2', 'guide.text.fight4-2-3', 'guide.text.fight4-2-4'),
			text('guide.text.fight4-3'),

			heading('guide.text.fight5'),
			text('guide.text.fight5-1'),

			heading('common.gains'),
			text('guide.text.fight6-1'),

			heading('guide.text.fight7'),
			image('guide', 'energy'),
			text('guide.text.fight7-1'),

			heading('guide.text.fight8'),
			text('guide.text.fight8-1'),
			list([
				item('guide.text.fight8-1-1', 'guide', 'status_sleep'),
				item('guide.text.fight8-1-2', 'guide', 'status_untouchable'),
				item('guide.text.fight8-1-3', 'guide', 'status_slow_down'),
				item('guide.text.fight8-1-4', 'guide', 'status_faster'),
				item('guide.text.fight8-1-5', 'guide', 'status_petrified'),
				item('guide.text.fight8-1-6', 'guide', 'status_assault_bonus'),
				item('guide.text.fight8-1-7', 'guide', 'status_poisoned'),
				item('guide.text.fight8-1-8', 'guide', 'status_locked'),
				item('guide.text.fight8-1-9', 'guide', 'status_dazzled'),
				item('guide.text.fight8-1-10', 'guide', 'status_protected'),
				item('guide.text.fight8-1-11', 'guide', 'status_mute'),
				item('guide.text.fight8-1-12', 'guide', 'status_sharingan'),
				item('guide.text.fight8-1-13', 'guide', 'status_blocked_inventory'),
				item('guide.text.fight8-1-14', 'guide', 'status_energy_penalty'),
				item('guide.text.fight8-1-15', 'guide', 'status_energy_bonus'),
				item('guide.text.fight8-1-16', 'guide', 'status_bonus_def_fire'),
				item('guide.text.fight8-1-17', 'guide', 'status_bonus_def_wood'),
				item('guide.text.fight8-1-18', 'guide', 'status_bonus_def_water'),
				item('guide.text.fight8-1-19', 'guide', 'status_bonus_def_lightning'),
				item('guide.text.fight8-1-20', 'guide', 'status_bonus_def_air'),
				item('guide.text.fight8-1-21', 'guide', 'status_initiative_bonus'),
				item('guide.text.fight8-1-22', 'guide', 'status_initiative_penalty'),
				item('guide.text.fight8-1-23', 'guide', 'status_dodge_bonus'),
				item('guide.text.fight8-1-24', 'guide', 'status_def_bonus')
			])
		]
	},
	{
		slug: 'heal',
		titleKey: 'guide.sections.heal',
		blocks: [text('guide.text.heal'), image('guide', 'heal'), heading('guide.text.heal2'), text('guide.text.heal2-1')]
	},
	{
		slug: 'death',
		titleKey: 'guide.sections.death',
		blocks: [text('guide.text.death'), infoList('guide.text.death-1', 'guide.text.death-2'), text('guide.text.death2')]
	},
	{
		slug: 'exp',
		titleKey: 'guide.sections.exp',
		blocks: [
			text('guide.text.exp'),
			image('guide', 'exp'),
			heading('guide.text.exp2'),
			text('guide.text.exp2-1'),
			heading('guide.text.exp3'),
			text('guide.text.exp3-1')
		]
	},
	{
		slug: 'missions',
		titleKey: 'guide.sections.missions',
		blocks: [text('guide.text.missions'), image('guide', 'missions'), text('guide.text.missions2')]
	},
	{
		slug: 'status',
		titleKey: 'guide.sections.status',
		blocks: [text('guide.text.status')]
	},
	{
		slug: 'equipment',
		titleKey: 'guide.sections.equipment',
		blocks: [text('guide.text.equipment'), image('guide', 'equipment'), text('guide.text.equipment2')]
	},
	{
		slug: 'epic',
		titleKey: 'guide.sections.epic',
		blocks: [text('guide.text.epic')]
	},
	{
		slug: 'group',
		titleKey: 'guide.sections.group',
		blocks: [text('guide.text.group'), image('guide', 'group'), text('guide.text.group2')]
	},
	{
		slug: 'ingredient',
		titleKey: 'guide.sections.ingredient',
		blocks: [text('guide.text.ingredient'), image('guide', 'gather'), text('guide.text.ingredient2')]
	},
	{
		slug: 'clans',
		titleKey: 'guide.sections.clans',
		blocks: [
			text('guide.text.clans'),
			heading('guide.text.clans1'),
			text('guide.text.clans1-1'),
			heading('guide.text.clans2'),
			text('guide.text.clans2-1')
		]
	},
	{
		slug: 'dojo',
		titleKey: 'guide.sections.dojo',
		blocks: [
			text('guide.text.dojos'),
			list([item('guide.text.dojos-1', 'act', 'act_train')]),
			text('guide.text.dojos-2'),

			heading('guide.text.dojos1'),
			text('guide.text.dojos1-1'),

			heading('guide.text.dojos2'),
			text('guide.text.dojos2-1'),
			list([item('guide.text.dojos2-2', 'act', 'act_defi')]),

			heading('guide.text.dojos3'),
			text('guide.text.dojos3-1'),
			list([item('guide.text.dojos3-2', 'act', 'act_tournament')]),
			text('guide.text.dojos3-3'),

			heading('guide.text.dojos4'),
			list([item('guide.text.dojos4-1', 'act', 'act_history')]),

			heading('guide.text.dojos5'),
			infoList(
				'guide.text.dojos5-1',
				'guide.text.dojos5-2',
				'guide.text.dojos5-3',
				'guide.text.dojos5-4',
				'guide.text.dojos5-5',
				'guide.text.dojos5-6'
			)
		]
	},
	{
		slug: 'gdc',
		titleKey: 'guide.sections.gdc',
		blocks: [
			text('guide.text.gdc'),

			heading('guide.text.gdc1'),
			text('guide.text.gdc1-1'),
			infoList('guide.text.gdc1-2', 'guide.text.gdc1-3', 'guide.text.gdc1-4'),

			heading('guide.text.gdc2'),
			text('guide.text.gdc2-1'),
			image('guide', 'castle'),
			text('guide.text.gdc2-2'),
			infoList('guide.text.gdc2-2-1', 'guide.text.gdc2-2-2'),

			heading('guide.text.gdc3'),
			text('guide.text.gdc3-1'),

			heading('guide.text.gdc4'),
			text('guide.text.gdc4-1'),
			image('guide', 'attack_castle'),

			heading('guide.text.gdc5'),
			text('guide.text.gdc5-1'),
			image('guide', 'def_castle'),

			heading('guide.text.gdc6'),
			text('guide.text.gdc6-1')
		]
	},
	{
		slug: 'cdc',
		titleKey: 'guide.sections.cdc',
		blocks: [
			text('guide.text.cdc'),

			heading('guide.text.cdc1'),
			text('guide.text.cdc1-1'),

			heading('guide.text.cdc2'),
			text('guide.text.cdc2-1'),
			image('guide', 'battle_cdc'),
			text('guide.text.cdc2-2'),

			heading('guide.text.cdc3'),
			text('guide.text.cdc3-1'),

			heading('guide.text.cdc4'),
			text('guide.text.cdc4-1'),
			image('guide', 'position_cdc'),
			text('guide.text.cdc4-2')
		]
	},
	{
		slug: 'question',
		titleKey: 'guide.sections.question',
		blocks: [
			text('guide.text.questions'),
			infoList(
				'guide.text.questions1',
				'guide.text.questions2',
				'guide.text.questions3',
				'guide.text.questions4',
				'guide.text.questions5',
				'guide.text.questions6'
			)
		]
	},
	{
		slug: 'support',
		titleKey: 'guide.sections.support',
		blocks: [
			heading('guide.text.support'),
			text('guide.text.support-1'),

			text('guide.text.support1'),
			infoList('guide.text.support1-1', 'guide.text.support1-2', 'guide.text.support1-3'),

			text('guide.text.support2'),
			infoList('guide.text.support2-1', 'guide.text.support2-2', 'guide.text.support2-3', 'guide.text.support2-4'),

			text('guide.text.support3'),
			infoList('guide.text.support3-1', 'guide.text.support3-2')
		]
	},
	{
		slug: 'security',
		titleKey: 'guide.sections.security',
		blocks: [heading('guide.text.security'), text('guide.text.security-1')]
	}
];

function getValue(source, path) {
	const value = path.split('.').reduce((current, key) => current?.[key], source);

	if (typeof value !== 'string') {
		throw new Error(`Missing string translation: ${path}`);
	}

	return value;
}

function normalizeRichText(value) {
	return String(value)
		.replace(/\s*&&\s*&&\s*/g, '\n\n')
		.replace(/\s*&&\s*/g, '\n\n')
		.trim();
}

function indentListContinuation(value) {
	return value.replace(/\n\n/g, '\n\n  ');
}

function renderBlock(block, locale, sectionTitle) {
	switch (block.type) {
		case 'text':
			return normalizeRichText(getValue(locale, block.key));

		case 'heading':
			return `## ${normalizeRichText(getValue(locale, block.key)).replace(/\n+/g, ' ')}`;

		case 'image':
			return `![${sectionTitle}](asset://${block.path}/${block.name})`;

		case 'list':
			return block.items
				.map(listItem => {
					const content = indentListContinuation(normalizeRichText(getValue(locale, listItem.key)));

					return `- ![](asset://${listItem.path}/${listItem.name}) ${content}`;
				})
				.join('\n');

		default:
			throw new Error(`Unsupported guide block: ${block.type}`);
	}
}

function renderSection(locale, section) {
	const title = getValue(locale, section.titleKey);

	const body = section.blocks.map(block => renderBlock(block, locale, title)).join('\n\n');

	return `# ${title}\n\n${body}\n`;
}

async function readLocale(language) {
	const path = join(LOCALES_DIR, `${language}.json`);
	const raw = await readFile(path, 'utf8');

	return {
		path,
		raw,
		data: JSON.parse(raw)
	};
}

async function generateMarkdown() {
	await mkdir(GUIDE_DIR, {
		recursive: true
	});

	let generated = 0;

	for (const language of LANGUAGES) {
		const { data } = await readLocale(language);

		for (const section of GUIDE_SECTIONS) {
			const destination = join(GUIDE_DIR, `${section.slug}${language}.md`);

			await writeFile(destination, renderSection(data, section), 'utf8');

			generated += 1;
		}
	}

	const expected = LANGUAGES.length * GUIDE_SECTIONS.length;

	if (generated !== expected) {
		throw new Error(`Expected ${expected} guide files, generated ${generated}.`);
	}

	console.log(`Generated ${generated} Markdown guide files in ${GUIDE_DIR}`);
}

function findObjectEnd(raw, objectStart) {
	let depth = 0;
	let inString = false;
	let escaped = false;

	for (let index = objectStart; index < raw.length; index += 1) {
		const char = raw[index];

		if (inString) {
			if (escaped) {
				escaped = false;
			} else if (char === '\\') {
				escaped = true;
			} else if (char === '"') {
				inString = false;
			}

			continue;
		}

		if (char === '"') {
			inString = true;
		} else if (char === '{') {
			depth += 1;
		} else if (char === '}') {
			depth -= 1;

			if (depth === 0) {
				return index + 1;
			}
		}
	}

	throw new Error('Could not find the end of the guide object.');
}

function replaceGuideObject(raw, data) {
	const marker = '\t"guide": {';
	const propertyStart = raw.indexOf(marker);

	if (propertyStart === -1) {
		throw new Error('Top-level guide object not found.');
	}

	const objectStart = raw.indexOf('{', propertyStart);
	const objectEnd = findObjectEnd(raw, objectStart);

	const replacement = [
		'\t"guide": {',
		`\t\t"title": ${JSON.stringify(getValue(data, 'guide.title'))},`,
		`\t\t"stop": ${JSON.stringify(getValue(data, 'guide.text.stop'))}`,
		'\t}'
	].join('\n');

	return `${raw.slice(0, propertyStart)}${replacement}${raw.slice(objectEnd)}`;
}

async function cleanupI18n() {
	for (const language of LANGUAGES) {
		const { path, raw, data } = await readLocale(language);
		const updated = replaceGuideObject(raw, data);

		// Vérification avant écriture :
		// on refuse d'enregistrer un JSON invalide.
		JSON.parse(updated);

		await writeFile(path, updated, 'utf8');
	}

	console.log('Removed guide sections/text translations from FR/EN/ES/DE locale files.');
}

async function verifyMarkdown() {
	for (const language of LANGUAGES) {
		for (const section of GUIDE_SECTIONS) {
			const path = join(GUIDE_DIR, `${section.slug}${language}.md`);

			const source = await readFile(path, 'utf8');

			if (!source.startsWith('# ')) {
				throw new Error(`Missing H1 title in ${path}`);
			}
		}
	}

	console.log(`Verified ${LANGUAGES.length * GUIDE_SECTIONS.length} Markdown guide files.`);
}

const command = process.argv[2] ?? 'generate';

if (command === 'generate') {
	await generateMarkdown();
} else if (command === 'verify') {
	await verifyMarkdown();
} else if (command === 'cleanup-i18n') {
	await cleanupI18n();
} else {
	throw new Error(`Unknown command "${command}". Use generate, verify or cleanup-i18n.`);
}
