import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const root = resolve(args.find(arg => !arg.startsWith('--')) ?? '.');
const dryRun = args.includes('--check');
const sourceDir = dirname(fileURLToPath(import.meta.url));

const additions = [
	'packages/core/src/models/scenarios/data/clinicScenario.ts',
	'packages/core/src/models/place/clinicPlace.ts',
	'packages/core/test/unit/scenarios/clinicScenario.test.ts',
	'app/server/test/integration/clinic-place-view.test.ts'
];
const edits = new Map();

async function exists(relative) {
	try { await access(join(root, relative)); return true; }
	catch (error) { if (error?.code === 'ENOENT') return false; throw error; }
}
async function read(relative) {
	return readFile(join(root, relative), 'utf8');
}
function replaceOnce(text, oldText, newText, path) {
	const count = text.split(oldText).length - 1;
	if (count !== 1) throw new Error(`${path}: ancre absente ou ambiguë (${count}) : ${oldText.slice(0, 120)}`);
	return text.replace(oldText, newText);
}
async function edit(path, transform) {
	const source = await read(path);
	const lf = source.replace(/\r\n?/g, '\n');
	const updated = transform(lf);
	if (updated === lf) throw new Error(`${path}: aucun changement préparé`);
	edits.set(path, source.includes('\r\n') ? updated.replace(/\n/g, '\r\n') : updated);
}

for (const relative of [
	'packages/core/src/models/dialogs/data/clinic.dialog.ts',
	'app/server/src/Clan/Service/completedClanActionKeys.service.ts',
	'app/server/src/Clan/Service/clanActionDinoz.service.ts'
]) {
	if (!(await exists(relative))) throw new Error(`Étapes 1–3 nécessaires, fichier introuvable : ${relative}`);
}
for (const path of additions) {
	if (await exists(path)) throw new Error(`Correctif déjà appliqué ? Fichier existant : ${path}`);
}

const registry = 'packages/core/src/models/scenarios/scenarioList.ts';
await edit(registry, source => {
	source = replaceOnce(source,
		"import { dojoScenario } from './data/dojoScenario.js';",
		"import { clinicScenario } from './data/clinicScenario.js';\nimport { dojoScenario } from './data/dojoScenario.js';",
		registry
	);
	return replaceOnce(source,
		'\tkabegg: kabukiEggScenario',
		'\tkabegg: kabukiEggScenario,\n\tclinik: clinicScenario',
		registry
	);
});

const ficheType = 'packages/core/src/models/dinoz/dinozFiche.ts';
await edit(ficheType, source => replaceOnce(source,
	'\trace: DinozRace;\n\tplaceId: number;\n\tactions: ActionFiche[];',
	`\trace: DinozRace;
	placeId: number;
	/** MT clini2 (129) is visual only; placeId remains clinik (38). */
	displayPlaceId?: number;
	actions: ActionFiche[];`,
	ficheType
));

const mapper = 'app/server/src/utils/dinoz/dinozFiche.mapper.ts';
await edit(mapper, source => {
	if (!source.includes('completedClanActionKeys: string[] = []')) {
		throw new Error(`${mapper}: le raccord clanact de l’étape 2 est absent`);
	}
	source = replaceOnce(source,
		"import { DinozRestInfos } from '@dinorpg/core/models/dinoz/dinozRest.js';",
		"import { DinozRestInfos } from '@dinorpg/core/models/dinoz/dinozRest.js';\nimport { getClinicDisplayPlaceId } from '@dinorpg/core/models/place/clinicPlace.js';",
		mapper
	);
	return replaceOnce(source,
		'\t\tplaceId: dinoz.placeId,\n\t\titems:',
		'\t\tplaceId: dinoz.placeId,\n\t\tdisplayPlaceId: getClinicDisplayPlaceId(dinoz.placeId, completedClanActionKeys),\n\t\titems:',
		mapper
	);
});

const mapTab = 'app/client/src/components/common/MapTab.vue';
await edit(mapTab, source => replaceOnce(source,
	'\t\tgetPlaceName(placeId: number): string {\n\t\t\tconst place = placeList.find(place => place.placeId === placeId);',
	`\t\tgetPlaceName(placeId: number): string {
			// MT real="clinik", goto="clinik": un seul lieu sur la carte,
			// deux variantes visuelles selon le chantier du clan actuel.
			if (placeId === PlaceEnum.CLINIQUE && this.dinozData.displayPlaceId === PlaceEnum.CLINI2) {
				return 'clini2';
			}
			const place = placeList.find(place => place.placeId === placeId);`,
	mapTab
));

const locales = {
	FR: {
		scenario: 'Clinique de Dinoland',
		unbuilt: "C'est dans ce lieu que va se construire la nouvelle clinique de Dinoville...",
		builtName: 'Clinique de Dinoville',
		built: "C'est dans ce lieu que s'est construite la nouvelle clinique de Dinoville, les traitements prodigués aux patients sont réputés pour être les meilleurs de Dinoland."
	},
	EN: {
		scenario: 'Dinoland Clinic',
		unbuilt: 'This is where the new Dinotown Clinic will be built...',
		builtName: 'Dinotown Clinic',
		built: 'The new Dinotown Clinic has been built here. Its treatments are said to be the best in all of Dinoland.'
	},
	ES: {
		scenario: 'Clínica de Dinoland',
		unbuilt: 'Aquí se construirá la nueva clínica de Dinoville...',
		builtName: 'Clínica de Dinoville',
		built: 'Aquí se ha construido la nueva clínica de Dinoville. Sus tratamientos tienen fama de ser los mejores de Dinoland.'
	},
	DE: {
		scenario: 'Klinik von Dinoland',
		unbuilt: 'Hier soll die neue Klinik von Dinoville errichtet werden...',
		builtName: 'Klinik von Dinoville',
		built: 'Hier wurde die neue Klinik von Dinoville errichtet. Ihre Behandlungen gelten als die besten in ganz Dinoland.'
	}
};

for (const [lang, translation] of Object.entries(locales)) {
	const path = `app/client/src/i18n/locales/${lang}.json`;
	await edit(path, original => {
		let source = replaceOnce(original,
			'\n\t"scenarios": {',
			`\n\t"scenarios": {\n\t\t"clinik": { "name": ${JSON.stringify(translation.scenario)} },`,
			path
		);
		const parsed = JSON.parse(source);
		if (parsed.scenarios?.clinik?.name !== translation.scenario) {
			throw new Error(`${path}: le scénario n’a pas été intégré correctement`);
		}
		if (parsed.place?.name?.clini2 || parsed.place?.description?.clini2) {
			throw new Error(`${path}: la variante clini2 existe déjà`);
		}
		const regex = /^\t\t\t"clinik": (.+),$/gm;
		const matches = [...source.matchAll(regex)];
		if (matches.length !== 2) {
			throw new Error(`${path}: attendu 2 lignes de traduction clini[k] (nom + description), trouvé ${matches.length}`);
		}
		let index = 0;
		source = source.replace(regex, (_line, existingValue) => {
			const i = index++;
			if (i === 0) {
				return `\t\t\t"clinik": ${existingValue},\n\t\t\t"clini2": ${JSON.stringify(translation.builtName)},`;
			}
			return `\t\t\t"clinik": ${JSON.stringify(translation.unbuilt)},\n\t\t\t"clini2": ${JSON.stringify(translation.built)},`;
		});
		const after = JSON.parse(source);
		if (after.place.name.clini2 !== translation.builtName ||
			after.place.description.clinik !== translation.unbuilt ||
			after.place.description.clini2 !== translation.built) {
			throw new Error(`${path}: les textes de la clinique ne correspondent pas aux variantes prévues`);
		}
		return source;
	});
}

console.log(`Correctif scénario/lien clinik ⇄ clini2 : ${edits.size} fichiers modifiés, ${additions.length} fichiers créés.`);
if (dryRun) {
	console.log('Vérification réussie : aucune écriture effectuée (--check).');
	process.exit(0);
}
for (const relative of additions) {
	const destination = join(root, relative);
	await mkdir(dirname(destination), { recursive: true });
	await copyFile(join(sourceDir, 'files', relative), destination);
	console.log('+', relative);
}
for (const [path, content] of edits) {
	await writeFile(join(root, path), content, 'utf8');
	console.log('~', path);
}
console.log('Correctif appliqué en local. Aucune commande Git, aucun accès réseau.');
