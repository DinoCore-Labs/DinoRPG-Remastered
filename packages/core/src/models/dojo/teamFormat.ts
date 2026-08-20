import { RaceEnum } from '../enums/Race.js';

export enum formatName {
	UNCOMMON,
	COMMON,
	FIRE,
	WATER,
	AIR,
	LIGHTNING,
	WOOD,
	FFA,
	BIPEDE,
	QUADRUPEDE,
	FLYING,
	ANTI_POISON,
	HIPPO
	// DEMONS
}

export type formatTeam = {
	name: string;
	teamSize?: number;
	raceMinimum?: number;
	poison?: boolean;
	levelLimit?: number;
	teamRace: RaceEnum[];
};

export const formatTID: Readonly<Record<formatName, formatTeam>> = {
	[formatName.UNCOMMON]: {
		name: 'uncommon',
		teamSize: 4,
		raceMinimum: 4,
		//levelLimit: 50,
		teamRace: [
			RaceEnum.HIPPOCLAMP,
			RaceEnum.PTEROZ,
			RaceEnum.ROCKY,
			RaceEnum.QUETZU,
			RaceEnum.SANTAZ,
			RaceEnum.FEROSS,
			RaceEnum.KABUKI,
			RaceEnum.TOUFUFU,
			RaceEnum.MAHAMUTI,
			RaceEnum.SOUFFLET,
			RaceEnum.SMOG,
			RaceEnum.TRICERAGNON
		]
	},
	[formatName.COMMON]: {
		name: 'common',
		teamSize: 4,
		raceMinimum: 3,
		//levelLimit: 50,
		teamRace: [
			RaceEnum.GORILLOZ,
			RaceEnum.WANWAN,
			RaceEnum.PIGMOU,
			RaceEnum.PLANAILLE,
			RaceEnum.SIRAIN,
			RaceEnum.MOUEFFE,
			RaceEnum.NUAGOZ,
			RaceEnum.WINKS,
			RaceEnum.CASTIVORE
		]
	},
	[formatName.FIRE]: {
		name: 'fire',
		teamSize: 3,
		raceMinimum: 3,
		//levelLimit: 50,
		teamRace: [
			RaceEnum.PIGMOU,
			RaceEnum.MOUEFFE,
			RaceEnum.PIGMOU_DEMON,
			RaceEnum.MOUEFFE_DEMON,
			RaceEnum.HIPPOCLAMP,
			RaceEnum.PTEROZ,
			RaceEnum.ROCKY,
			RaceEnum.QUETZU,
			RaceEnum.FEROSS,
			RaceEnum.TRICERAGNON
		]
	},
	[formatName.WATER]: {
		name: 'water',
		teamSize: 3,
		raceMinimum: 3,
		//levelLimit: 50,
		teamRace: [
			RaceEnum.SIRAIN,
			RaceEnum.NUAGOZ,
			RaceEnum.WINKS,
			RaceEnum.WINKS_DEMON,
			RaceEnum.HIPPOCLAMP,
			RaceEnum.FEROSS,
			RaceEnum.QUETZU,
			RaceEnum.KABUKI,
			RaceEnum.KABUKI_DEMON,
			RaceEnum.MAHAMUTI,
			RaceEnum.SMOG
		]
	},
	[formatName.AIR]: {
		name: 'air',
		teamSize: 3,
		raceMinimum: 3,
		//levelLimit: 50,
		teamRace: [
			RaceEnum.PLANAILLE,
			RaceEnum.NUAGOZ,
			RaceEnum.CASTIVORE,
			RaceEnum.PLANAILLE_DEMON,
			RaceEnum.HIPPOCLAMP,
			RaceEnum.PTEROZ,
			RaceEnum.SANTAZ,
			RaceEnum.KABUKI,
			RaceEnum.KABUKI_DEMON,
			RaceEnum.SOUFFLET,
			RaceEnum.SMOG,
			RaceEnum.TOUFUFU
		]
	},
	[formatName.LIGHTNING]: {
		name: 'lightning',
		teamSize: 3,
		raceMinimum: 3,
		//levelLimit: 50,
		teamRace: [
			RaceEnum.WANWAN,
			RaceEnum.PLANAILLE,
			RaceEnum.NUAGOZ,
			RaceEnum.WINKS,
			RaceEnum.WANWAN_DEMON,
			RaceEnum.PLANAILLE_DEMON,
			RaceEnum.WINKS_DEMON,
			RaceEnum.HIPPOCLAMP,
			RaceEnum.ROCKY,
			RaceEnum.TOUFUFU,
			RaceEnum.SMOG
		]
	},
	[formatName.WOOD]: {
		name: 'wood',
		teamSize: 3,
		raceMinimum: 2,
		//levelLimit: 50,
		teamRace: [
			RaceEnum.GORILLOZ,
			RaceEnum.WANWAN,
			RaceEnum.CASTIVORE,
			RaceEnum.GORILLOZ_DEMON,
			RaceEnum.WANWAN_DEMON,
			RaceEnum.HIPPOCLAMP,
			RaceEnum.FEROSS,
			RaceEnum.TOUFUFU,
			RaceEnum.MAHAMUTI,
			RaceEnum.TRICERAGNON
		]
	},
	[formatName.FFA]: {
		name: 'ffa',
		raceMinimum: 2,
		teamRace: [
			RaceEnum.GORILLOZ,
			RaceEnum.WANWAN,
			RaceEnum.PIGMOU,
			RaceEnum.PLANAILLE,
			RaceEnum.SIRAIN,
			RaceEnum.MOUEFFE,
			RaceEnum.NUAGOZ,
			RaceEnum.WINKS,
			RaceEnum.CASTIVORE,
			RaceEnum.GORILLOZ_DEMON,
			RaceEnum.WANWAN_DEMON,
			RaceEnum.PIGMOU_DEMON,
			RaceEnum.PLANAILLE_DEMON,
			RaceEnum.MOUEFFE_DEMON,
			RaceEnum.WINKS_DEMON,
			RaceEnum.HIPPOCLAMP,
			RaceEnum.PTEROZ,
			RaceEnum.ROCKY,
			RaceEnum.QUETZU,
			RaceEnum.SANTAZ,
			RaceEnum.FEROSS,
			RaceEnum.KABUKI,
			RaceEnum.KABUKI_DEMON,
			RaceEnum.TOUFUFU,
			RaceEnum.MAHAMUTI,
			RaceEnum.SOUFFLET,
			RaceEnum.SMOG,
			RaceEnum.TRICERAGNON
		]
	},
	[formatName.BIPEDE]: {
		name: 'bipede',
		raceMinimum: 2,
		teamRace: [RaceEnum.SIRAIN, RaceEnum.MOUEFFE, RaceEnum.ROCKY, RaceEnum.KABUKI, RaceEnum.TOUFUFU, RaceEnum.SMOG]
	},
	[formatName.QUADRUPEDE]: {
		name: 'quadrupede',
		raceMinimum: 2,
		teamRace: [
			RaceEnum.GORILLOZ,
			RaceEnum.WANWAN,
			RaceEnum.PIGMOU,
			RaceEnum.WINKS,
			RaceEnum.PTEROZ,
			RaceEnum.SANTAZ,
			RaceEnum.FEROSS,
			RaceEnum.MAHAMUTI,
			RaceEnum.TRICERAGNON
		]
	},
	[formatName.FLYING]: {
		name: 'flying',
		raceMinimum: 2,
		teamRace: [
			RaceEnum.PLANAILLE,
			RaceEnum.NUAGOZ,
			RaceEnum.CASTIVORE,
			RaceEnum.HIPPOCLAMP,
			RaceEnum.PTEROZ,
			RaceEnum.QUETZU,
			RaceEnum.SOUFFLET
		]
	},
	[formatName.ANTI_POISON]: {
		name: 'anti_poison',
		raceMinimum: 2,
		poison: false,
		teamRace: [
			RaceEnum.GORILLOZ,
			RaceEnum.WANWAN,
			RaceEnum.PIGMOU,
			RaceEnum.MOUEFFE,
			RaceEnum.ROCKY,
			RaceEnum.TRICERAGNON
		]
	},
	[formatName.HIPPO]: {
		name: 'hippo',
		raceMinimum: 1,
		teamRace: [RaceEnum.HIPPOCLAMP]
	}
	// [formatName.DEMONS]: {
	// 	name: 'demons',
	// 	teamSize: 4,
	// 	raceMinimum: 3,
	// 	//levelLimit: 50,
	// 	teamRace: [
	// 		RaceEnum.GORILLOZ_DEMON,
	// 		RaceEnum.WANWAN_DEMON,
	// 		RaceEnum.PIGMOU_DEMON,
	// 		RaceEnum.PLANAILLE_DEMON,
	// 		RaceEnum.MOUEFFE_DEMON,
	// 		RaceEnum.WINKS_DEMON
	// 	]
	// }
};
