import { Boss, bossList } from './bossList.js';
import type { MonsterFiche } from './monsterFiche.js';
import type { MonsterKey } from './monsterKey.js';
import { Monster, monsterList } from './monsterList.js';

type MonsterLikeId = Monster | Boss;

export const monsterIdByKey: Readonly<Record<MonsterKey, MonsterLikeId>> = {
	goupi: Monster.GOUPIGNON,
	goupi2: Monster.GOUPIGNON2,
	goupi3: Monster.GOUPIGNON3,
	wolf: Monster.WOLF,
	gluon: Monster.GLUON,
	gvert: Monster.GREEN_GIANT,
	coq: Monster.COQDUR,
	pirask: Monster.PIRASK,

	flam: Monster.FLAM,
	goblin: Monster.GOBLIN,
	barche: Monster.BARCHE,
	cobra: Monster.COBRA,

	pira: Monster.PIRA,
	pira2: Monster.PIRA2,
	kazka: Monster.KAZKA,
	anguil: Monster.ANGUIL,
	borg: Monster.BORG,

	korgon: Monster.KORGON,
	ronciv: Monster.RONCIV,
	bat: Monster.BAT,
	grdien: Monster.GRDIEN,

	worm2: Monster.WORM2,
	worm: Monster.WORM,
	scorp: Monster.SCORP,
	cactus: Monster.CACTUS,
	brig1: Monster.BRIG1_ALL,
	brig1h: Monster.BRIG1_HOME,
	brig2: Monster.BRIG2_ALL,
	brig2h: Monster.BRIG2_HOME,
	brig3: Monster.BRIG3_ALL,
	brig3h: Monster.BRIG3_HOME,

	gropi: Monster.GROPI,
	mimic: Monster.MIMIC,
	earth2: Monster.EARTH2,

	rkrgns: Monster.KORGON_REINFORCEMENT,
	mugard: Monster.VEGETOX_GUARD,
	veginf: Monster.VEGETOX_GUARD_2,
	frutox: Monster.FRUTOX_DEFENDER,
	egrllz: Monster.GORILLOZ_SPIRIT,
	bamboo: Monster.BAMBOOZ_SPROUTING,

	piglou: Monster.PIGLOUNOU,
	piglo2: Monster.PIGLOUBI,
	piglo3: Monster.PIGLOUGLOU,
	piglo4: Monster.SUPER_PIGLOU,
	piglo5: Monster.ULTRA_PIGLOU,

	febrez: Monster.FEBREZA,
	piraos: Monster.PIRHANOS,
	pirao2: Monster.PIRHANOS_2,
	garouz: Monster.WEREZORE,
	amanpe: Monster.AMENCIAO,
	amanp2: Monster.AMENPENNE,
	feufol: Monster.WILL_O,
	darkgp: Monster.DARK_SMASHROOM,
	sangsa: Monster.DARK_LEECH,
	sangs2: Monster.LONG_LEGGED_LEECH,
	wormom: Monster.EARTHWORM_MATRIARCH,
	wormy: Monster.EARTHWORM_BABY,
	groule: Monster.GROULEM,
	wbour1: Monster.TW_BIGBEASTLY_1,
	pikouz: Monster.STINGOZ,
	thief: Monster.SCORPWINK_THIEF,
	thief2: Monster.SCORPWINK_THIEF_2,
	tripo2: Monster.TRIPOU_THE_SOFTY,
	coward: Monster.EMMEMA_BANDIT,
	baraba: Monster.BARABABOR,
	baratr: Monster.BARATRIBOR,
	vol1: Monster.MERGUEZ_THIEF,
	elhelp: Monster.ELEMENTAL_DISCIPLE,
	minimo: Monster.MINIMOUK,
	minim2: Monster.MINIMOUK_2,
	mosqui: Monster.MOUKTIZ,
	mantoo: Monster.MANTOOZE,
	ffrutx: Monster.FRUKOPTER,
	singmu: Monster.DEMYOM,
	singm2: Monster.DEMYOM_2,
	rapaca: Monster.RAPACARAPACE,
	rapac2: Monster.RAPACARAPACE_2,
	bao: Monster.BAOBOB,
	cyclo: Monster.SOLDIER,
	cyclo2: Monster.CAPITAIN,
	ecu: Monster.ECURENNE,
	groms: Monster.GROMSTER,
	grom2: Monster.PINK_GROMSTER,
	grom3: Monster.SNOW_GROMSTER,
	chima: Monster.CHIMCHEREE,
	lapouf: Monster.LAPOUF,

	pteroz: Boss.PTEROZ,
	hippoclamp: Boss.HIPPOCLAMP,
	rocky: Boss.ROCKY,

	any: Monster.ANY
};

function getMonsterFicheById(id: MonsterLikeId): MonsterFiche {
	const fiche = monsterList[id as Monster] ?? bossList[id as Boss];
	if (!fiche) {
		throw new Error(`Unknown monster/boss id "${id}" in monsterKeyMap`);
	}
	return fiche;
}

export const monsterByKey: Readonly<Record<MonsterKey, MonsterFiche>> = Object.freeze(
	Object.fromEntries(
		Object.entries(monsterIdByKey).map(([key, monsterId]) => [key, getMonsterFicheById(monsterId)])
	) as Record<MonsterKey, MonsterFiche>
);

export const monsterKeyById: Readonly<Partial<Record<MonsterLikeId, MonsterKey>>> = Object.freeze(
	Object.fromEntries(Object.entries(monsterIdByKey).map(([key, monsterId]) => [monsterId, key])) as Partial<
		Record<MonsterLikeId, MonsterKey>
	>
);

export function getMonsterKeyById(id: Monster | Boss): MonsterKey | null {
	return monsterKeyById[id] ?? null;
}
