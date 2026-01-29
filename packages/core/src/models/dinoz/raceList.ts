import { RaceEnum } from '../enums/Race.js';
import { Skill } from '../skills/skillList.js';
import { DinozRace } from './dinozRace.js';

// If price is 0 that means the dinoz cannot be purchased via the dinoz shop.
// For a demon dinoz, the price is the number of demon tickets.
export const raceList: Record<RaceEnum, DinozRace> = {
	[RaceEnum.MOUEFFE]: {
		raceId: RaceEnum.MOUEFFE,
		isDemon: false,
		name: 'moueffe',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 10,
			wood: 4,
			water: 2,
			lightning: 1,
			air: 3
		},
		price: 16000,
		swfLetter: '00'
	},
	[RaceEnum.MOUEFFE_DEMON]: {
		raceId: RaceEnum.MOUEFFE_DEMON,
		isDemon: true,
		name: 'moueffe_demon',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 10,
			wood: 4,
			water: 2,
			lightning: 1,
			air: 3
		},
		price: 600,
		swfLetter: '0A',
		skillId: [Skill.FORCE_DE_LUMIERE]
	},
	[RaceEnum.PIGMOU]: {
		raceId: RaceEnum.PIGMOU,
		isDemon: false,
		name: 'pigmou',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 12,
			wood: 3,
			water: 2,
			lightning: 2,
			air: 1
		},
		price: 20000,
		swfLetter: '10',
		skillId: [Skill.CHARGE_CORNUE]
	},
	[RaceEnum.PIGMOU_DEMON]: {
		raceId: RaceEnum.PIGMOU_DEMON,
		isDemon: true,
		name: 'pigmou_demon',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 12,
			wood: 3,
			water: 2,
			lightning: 2,
			air: 1
		},
		price: 800,
		swfLetter: '1A',
		skillId: [Skill.CHARGE_PIGMOU]
	},
	[RaceEnum.WINKS]: {
		raceId: RaceEnum.WINKS,
		isDemon: false,
		name: 'winks',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 1,
			wood: 2,
			water: 9,
			lightning: 6,
			air: 2
		},
		price: 20000,
		swfLetter: '20',
		skillId: [Skill.COQUE]
	},
	[RaceEnum.WINKS_DEMON]: {
		raceId: RaceEnum.WINKS_DEMON,
		isDemon: true,
		name: 'winks_demon',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 1,
			wood: 2,
			water: 9,
			lightning: 6,
			air: 2
		},
		price: 700,
		swfLetter: '2A',
		skillId: [Skill.DUR_A_CUIRE]
	},
	[RaceEnum.PLANAILLE]: {
		raceId: RaceEnum.PLANAILLE,
		isDemon: false,
		name: 'planaille',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 0,
		upChance: {
			fire: 2,
			wood: 2,
			water: 2,
			lightning: 10,
			air: 4
		},
		price: 16000,
		swfLetter: '30'
	},
	[RaceEnum.PLANAILLE_DEMON]: {
		raceId: RaceEnum.PLANAILLE_DEMON,
		isDemon: true,
		name: 'planaille_demon',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 5,
		nbrAir: 0,
		upChance: {
			fire: 2,
			wood: 2,
			water: 2,
			lightning: 10,
			air: 4
		},
		price: 700,
		swfLetter: '3A',
		skillId: [Skill.FORCE_DES_TENEBRES]
	},
	[RaceEnum.CASTIVORE]: {
		raceId: RaceEnum.CASTIVORE,
		isDemon: false,
		name: 'castivore',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 1,
		upChance: {
			fire: 2,
			wood: 8,
			water: 3,
			lightning: 2,
			air: 5
		},
		price: 16000,
		swfLetter: '40'
	},
	[RaceEnum.ROCKY]: {
		raceId: RaceEnum.ROCKY,
		isDemon: false,
		name: 'rocky',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 4,
			wood: 2,
			water: 2,
			lightning: 11,
			air: 1
		},
		price: 18000,
		swfLetter: '50',
		skillId: [Skill.ROCK]
	},
	[RaceEnum.PTEROZ]: {
		raceId: RaceEnum.PTEROZ,
		isDemon: false,
		name: 'pteroz',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 3,
		upChance: {
			fire: 8,
			wood: 2,
			water: 1,
			lightning: 3,
			air: 6
		},
		price: 22000,
		swfLetter: '60'
	},
	[RaceEnum.NUAGOZ]: {
		raceId: RaceEnum.NUAGOZ,
		isDemon: false,
		name: 'nuagoz',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 1,
			wood: 1,
			water: 6,
			lightning: 6,
			air: 6
		},
		price: 16000,
		swfLetter: '70'
	},
	[RaceEnum.SIRAIN]: {
		raceId: RaceEnum.SIRAIN,
		isDemon: false,
		name: 'sirain',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 2,
			water: 11,
			lightning: 2,
			air: 2
		},
		price: 16000,
		swfLetter: '80'
	},
	[RaceEnum.HIPPOCLAMP]: {
		raceId: RaceEnum.HIPPOCLAMP,
		isDemon: false,
		name: 'hippoclamp',
		nbrFire: 1,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 4,
			wood: 4,
			water: 4,
			lightning: 4,
			air: 4
		},
		price: 28000,
		swfLetter: '90'
	},
	[RaceEnum.GORILLOZ]: {
		raceId: RaceEnum.GORILLOZ,
		isDemon: false,
		name: 'gorilloz',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 13,
			water: 1,
			lightning: 2,
			air: 1
		},
		price: 16000,
		swfLetter: 'A0'
	},
	[RaceEnum.GORILLOZ_DEMON]: {
		raceId: RaceEnum.GORILLOZ_DEMON,
		isDemon: true,
		name: 'gorilloz_demon',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 13,
			water: 1,
			lightning: 2,
			air: 1
		},
		price: 700,
		swfLetter: 'AA',
		skillId: [Skill.GROS_COSTAUD]
	},
	[RaceEnum.WANWAN]: {
		raceId: RaceEnum.WANWAN,
		isDemon: false,
		name: 'wanwan',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 6,
			water: 1,
			lightning: 8,
			air: 2
		},
		price: 19000,
		swfLetter: 'B0'
	},
	[RaceEnum.WANWAN_DEMON]: {
		raceId: RaceEnum.WANWAN_DEMON,
		isDemon: true,
		name: 'wanwan_demon',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 6,
			water: 1,
			lightning: 8,
			air: 2
		},
		price: 900,
		swfLetter: 'BA',
		skillId: [Skill.FRENESIE_COLLECTIVE]
	},
	[RaceEnum.SANTAZ]: {
		raceId: RaceEnum.SANTAZ,
		isDemon: false,
		name: 'santaz',
		nbrFire: 1,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 2,
		upChance: {
			fire: 1,
			wood: 4,
			water: 2,
			lightning: 1,
			air: 12
		},
		price: 35000,
		swfLetter: 'C0',
		skillId: [Skill.PIETINEMENT]
	},
	[RaceEnum.FEROSS]: {
		raceId: RaceEnum.FEROSS,
		isDemon: false,
		name: 'feross',
		nbrFire: 1,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 6,
			wood: 6,
			water: 6,
			lightning: 1,
			air: 1
		},
		price: 35000,
		swfLetter: 'D0',
		skillId: [Skill.CUIRASSE]
	},
	[RaceEnum.KABUKI]: {
		raceId: RaceEnum.KABUKI,
		isDemon: false,
		name: 'kabuki',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 3,
		upChance: {
			fire: 2,
			wood: 2,
			water: 6,
			lightning: 2,
			air: 8
		},
		price: 35000,
		swfLetter: 'E0',
		skillId: [Skill.INSAISISSABLE]
	},
	[RaceEnum.KABUKI_DEMON]: {
		raceId: RaceEnum.KABUKI_DEMON,
		isDemon: true,
		name: 'kabuki_demon',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 3,
		upChance: {
			fire: 2,
			wood: 2,
			water: 6,
			lightning: 2,
			air: 8
		},
		price: 800,
		swfLetter: 'EA',
		skillId: [Skill.INSAISISSABLE, Skill.ORIGINE_CAUSHEMESHENNE]
	},
	[RaceEnum.MAHAMUTI]: {
		raceId: RaceEnum.MAHAMUTI,
		isDemon: false,
		name: 'mahamuti',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 1,
			wood: 8,
			water: 8,
			lightning: 2,
			air: 1
		},
		price: 35000,
		swfLetter: 'F0',
		skillId: [Skill.ECRASEMENT]
	},
	[RaceEnum.SOUFFLET]: {
		raceId: RaceEnum.SOUFFLET,
		isDemon: false,
		name: 'soufflet',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 2,
		upChance: {
			fire: 0,
			wood: 4,
			water: 4,
			lightning: 4,
			air: 8
		},
		price: 35000,
		swfLetter: 'G0',
		skillId: [Skill.NAPOMAGICIEN]
	},
	[RaceEnum.TOUFUFU]: {
		raceId: RaceEnum.TOUFUFU,
		isDemon: false,
		name: 'toufufu',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 0,
		upChance: {
			fire: 2,
			wood: 6,
			water: 1,
			lightning: 6,
			air: 5
		},
		price: 35000,
		swfLetter: 'H0',
		skillId: [Skill.DEPLACEMENT_INSTANTANE]
	},
	[RaceEnum.QUETZU]: {
		raceId: RaceEnum.QUETZU,
		isDemon: false,
		name: 'quetzu',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 8,
			wood: 2,
			water: 8,
			lightning: 2,
			air: 0
		},
		price: 35000,
		swfLetter: 'I0'
	},
	[RaceEnum.SMOG]: {
		raceId: RaceEnum.SMOG,
		isDemon: false,
		name: 'smog',
		nbrFire: 1,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 2,
		upChance: {
			fire: 2,
			wood: 0,
			water: 4,
			lightning: 8,
			air: 6
		},
		price: 35000,
		swfLetter: 'J0'
	},
	[RaceEnum.TRICERAGNON]: {
		raceId: RaceEnum.TRICERAGNON,
		isDemon: false,
		name: 'triceragnon',
		nbrFire: 2,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 8,
			wood: 8,
			water: 0,
			lightning: 2,
			air: 2
		},
		price: 35000,
		swfLetter: 'K0',
		skillId: [Skill.BIGMAGNON]
	}
};
