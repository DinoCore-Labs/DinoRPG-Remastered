import { DinozItems } from '@dinorpg/core/models/dinoz/dinozItems.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ConditionEnum } from '@dinorpg/core/models/enums/Parser.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { currentEvents, EventDetails, GameEvent } from '@dinorpg/core/models/events/events.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightProcessResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { bossList } from '@dinorpg/core/models/monster/bossList.js';
import { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { placeList, SWAMP_FOG_DAYS } from '@dinorpg/core/models/place/placeList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { calculatePvExp, getMaxXp } from '@dinorpg/core/utils/dinozUtils.js';

import { Dinoz, DinozSkills, DinozStatus, User } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../../Dinoz/Controller/dinozStatus.controller.js';
import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { removeItemFromDinoz } from '../../Inventory/Controller/removeItemFromDinoz.controller.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { addMoney, removeMoney } from '../../User/Controller/money.controller.js';
import { calculateXPBonus, isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import {
	DinozToGetFighter,
	FightConfiguration,
	FightRules,
	MONSTER_FIGHT_RULES
} from '../../utils/fight/fight.mapper.js';
import randomBetween from '../../utils/fight/randomBetween.js';
import weightedRandom from '../../utils/fight/weightedRandom.js';

//import { getActualStep } from '@drpg/core/utils/MissionUtils';
//import { createCatch, removeCatch, updateCatch } from '../dao/dinozCatchDao.js';
//import { scenarioChecker } from '../utils/scenarioChecker.js';
//import { getPlayerEventProgression, increasePlayerEventProgression } from '../dao/eventsDao.js';
