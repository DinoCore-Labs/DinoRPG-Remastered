import { RaceEnum } from '../enums/Race.js';

export const RARE_TOURNAMENT_RACES: RaceEnum[] = [
	RaceEnum.MOUEFFE_DEMON,
	RaceEnum.PIGMOU_DEMON,
	RaceEnum.WINKS_DEMON,
	RaceEnum.PLANAILLE_DEMON,
	RaceEnum.GORILLOZ_DEMON,
	RaceEnum.WANWAN_DEMON,
	RaceEnum.KABUKI_DEMON,
	RaceEnum.SANTAZ,
	RaceEnum.FEROSS,
	RaceEnum.KABUKI,
	RaceEnum.MAHAMUTI,
	RaceEnum.SOUFFLET,
	RaceEnum.TOUFUFU,
	RaceEnum.QUETZU,
	RaceEnum.SMOG,
	RaceEnum.TRICERAGNON
];

const ALL_RACES: RaceEnum[] = Object.values(RaceEnum).filter((v): v is RaceEnum => typeof v === 'number');

export const COMMON_TOURNAMENT_RACES: RaceEnum[] = ALL_RACES.filter(race => !RARE_TOURNAMENT_RACES.includes(race));
