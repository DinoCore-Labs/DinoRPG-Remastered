import { PlaceEnum } from '../enums/PlaceEnum.js';
import { FighterRecap } from '../fight/fightResult.js';
import { FightStep } from '../fight/fightStep.js';
import { UserToolTip } from '../user/userToolTip.js';

export interface DojoFightResume {
	id: string;
	fighters: FighterRecap[];
	history: FightStep[];
	result: boolean;
	seed: string;
	leftPlayer: UserToolTip;
	rightPlayer: UserToolTip;
	place: PlaceEnum;
}
