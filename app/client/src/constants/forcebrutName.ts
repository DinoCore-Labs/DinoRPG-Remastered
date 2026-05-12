const FORCEBRUT_TITLES = [
	'le Grand',
	'le Magnifique',
	"l'Arme Ultime",
	'le Tueur',
	"l'Exterminateur",
	'le Gentil',
	'le Timide',
	'le Catcheur',
	"l'Eternel",
	'le Puissant',
	'le Boss',
	'le Dératiseur',
	'le Faible',
	'le Peureux',
	'el Toreador',
	'the Killer',
	'le Géant',
	'le Gladiateur',
	'le Conquérant',
	'le Prétentieux',
	'le Dompteur',
	'le Lauréat',
	'le Superbe',
	'le Fier',
	'le Charmeur',
	'le Brillant',
	'le Sorcier',
	"l'Eternel",
	'le Prodigieux',
	'le Bienveillant'
] as const;

const FORCEBRUT_QUALITIES = [
	'du 75',
	'du 33',
	'de Dinoville',
	'Enchanté',
	'Magique',
	'Rouge',
	'Noir',
	'Surdoué',
	'Indigent',
	'Surpuissant',
	'Destructeur',
	'Apocalyptique',
	'2000',
	'3000',
	'Poilu',
	'Acéré',
	'en Acier',
	'en Or',
	'en Carton',
	'vu à la Télé',
	'Fantastique',
	'Insignifiant',
	'Inutile',
	'Idiot',
	'Périmé',
	'Invisible'
] as const;

function hashString(value: string): number {
	let hash = 0;

	for (let i = 0; i < value.length; i++) {
		hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
	}

	return hash;
}

export function getForcebrutTournamentName(input: { name: string; display?: string; step?: number }) {
	const seed = `${input.name}-${input.display ?? ''}-${input.step ?? 0}`;
	const hash = hashString(seed);

	const title = FORCEBRUT_TITLES[hash % FORCEBRUT_TITLES.length];
	const quality = FORCEBRUT_QUALITIES[Math.floor(hash / FORCEBRUT_TITLES.length) % FORCEBRUT_QUALITIES.length];

	return `${input.name} ${title} ${quality}`;
}
