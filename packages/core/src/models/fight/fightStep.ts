import { ElementType } from '../enums/ElementType.js';
import { Item } from '../items/itemList.js';
import { Skill } from '../skills/skillList.js';
import { FighterType } from './fighterType.js';
import { FightStatus } from './fightStatus.js';
import { EntranceEffect, LifeEffect, NotificationList } from './transpiler.js';

export interface StepFighter {
	id: number;
	name: string;
	type: FighterType;
	attacker: boolean;
}

export interface InitStepFighter {
	id: number;
	display: string;
	name: string;
	type: FighterType;
	attacker: boolean;
	maxLife: number;
	maxEnergy: number;
	energy: number;
	startingHp: number;
}

export enum LeaveAnimation {
	RUN,
	BLACKHOLE,
	FLYING
}

// A time limit is set for the fight. Use this only once at the beginning of the fight.
export interface TimeLimitStep {
	action: 'timeLimit';
	time: number;
}

export interface ArriveStep {
	action: 'arrive';
	fid: number;
	entrance?: EntranceEffect;
	scale?: number;
}

export interface LeaveStep {
	action: 'leave';
	fighter: StepFighter;
	animation?: LeaveAnimation;
}

export interface ResistStep {
	action: 'resist';
	dinoz: StepFighter;
}

export interface HitStep {
	action: 'hit';
	fighter: StepFighter;
	target: StepFighter;
	damage: number | null;
	critical: boolean;
	elements: ElementType[];
	skill?: Skill;
}

export interface AttemptHitStep {
	action: 'attemptHit';
	fighter: StepFighter;
	target: StepFighter;
}

export interface DeathStep {
	action: 'death';
	fighter: StepFighter;
}

export interface MoveStep {
	action: 'moveTo';
	fid: number;
	tid: number;
	skill?: Skill;
	sameSpace?: boolean;
	countered?: boolean;
}

export interface CounterStep {
	action: 'counter';
	fighter: StepFighter;
	opponent: StepFighter;
}

export interface MoveBackStep {
	action: 'moveBack';
	fid: number;
}

export interface FlipStep {
	action: 'flip';
	fid: number;
}

export interface SurviveStep {
	action: 'survive';
	dinoz: StepFighter;
}

export interface SkillAnnounceStep {
	action: 'skillAnnounce';
	fid: number;
	skill: Skill;
}

export interface SkillActivateStep {
	action: 'skillActivate';
	fid: number;
	skill: Skill;
	targets: {
		tid: number;
		damages?: number | null;
	}[];
}

export interface SkillExpireStep {
	action: 'skillExpire';
	dinoz: StepFighter;
	skill: Skill;
}

export interface NotifyStep {
	action: 'notify';
	fids: number[];
	notification: NotificationList;
}

export interface LooseHpStep {
	action: 'looseHp';
	fid: number;
	hp: number;
	fx: LifeEffect;
}

export interface HealStep {
	action: 'heal';
	fighter: StepFighter;
	hp: number;
	fx: LifeEffect;
}

export interface AddStatusStep {
	action: 'addStatus';
	fighter: StepFighter;
	status: FightStatus;
}

export interface RemoveStatusStep {
	action: 'removeStatus';
	fighter: StepFighter;
	status: FightStatus;
}

export interface ItemUseStep {
	action: 'itemUse';
	fighter: StepFighter;
	itemId: Item;
}

export interface ActivateEnvironmentStep {
	action: 'activateEnvironment';
	environment: Skill;
}

export interface ExpireEnvironmentStep {
	action: 'expireEnvironment';
	environment: Skill;
}

export interface SetCostumeStep {
	action: 'setCostume';
	fighter: StepFighter;
	costume: string;
}

export interface RemoveCostumeStep {
	action: 'removeCostume';
	fighter: StepFighter;
}

export interface HypnotizeStep {
	action: 'hypnotize';
	fighter: StepFighter;
	target: StepFighter;
}

export interface EndHypnosisStep {
	action: 'endHypnosis';
	fighter: StepFighter;
	ally: StepFighter;
}

export interface GainEnergyStep {
	action: 'gainEnergy';
	fighter: StepFighter;
	energy: number;
}

export interface ReduceEnergyStep {
	action: 'reduceEnergy';
	fighter: StepFighter;
}

export interface LoseSphereStep {
	action: 'loseSphere';
	fighter: StepFighter;
	element: ElementType;
}

export interface DisabledItemsStep {
	action: 'disabledItems';
	fighter: StepFighter;
	items: Item[];
}

export interface StealGoldStep {
	action: 'stealGold';
	fighter: StepFighter;
	target: StepFighter;
	gold: number;
}

export interface CursedStep {
	action: 'cursed';
	fighter: StepFighter;
}

export interface ReviveStep {
	action: 'revive';
	fighter: StepFighter;
}

// Describes that a new turn started, which fighter's turn it is and the time elapsed since the previous turn
// The main goal is to tell the front and which fighters regenerated energy, and remove some of the "energy recovered" steps
// in the fight history
export interface NewTurnStep {
	action: 'newTurn';
	fighter: StepFighter;
	delta: number;
}

// Describe a new turn starte but it is only about checking on status
export interface StatusTurnStep {
	action: 'statusTurn';
	fighter: StepFighter;
	delta: number;
}

// The fighter passes its turn due to exceeding combo or no energy.
export interface TiredStep {
	action: 'tired';
	fighter: StepFighter;
}

// The fighter performs the given animation (if supported)
export interface AnimationStep {
	action: 'anim';
	fid: number;
	anim: string;
}

// The given FX is "attached" (displayed) on the fighter.
export interface AttachStep {
	action: 'attach';
	fid: number;
	fx: string;
}

export type FightStep =
	| TimeLimitStep
	| ArriveStep
	| LeaveStep
	| ResistStep
	| HitStep
	| AttemptHitStep
	| DeathStep
	| MoveStep
	| CounterStep
	| MoveBackStep
	| SurviveStep
	| SkillAnnounceStep
	| SkillActivateStep
	| SkillExpireStep
	| NotifyStep
	| LooseHpStep
	| HealStep
	| AddStatusStep
	| RemoveStatusStep
	| ItemUseStep
	| ActivateEnvironmentStep
	| ExpireEnvironmentStep
	| SetCostumeStep
	| RemoveCostumeStep
	| HypnotizeStep
	| EndHypnosisStep
	| GainEnergyStep
	| ReduceEnergyStep
	| LoseSphereStep
	| DisabledItemsStep
	| StealGoldStep
	| CursedStep
	| ReviveStep
	| NewTurnStep
	| StatusTurnStep
	| TiredStep
	| FlipStep
	| AnimationStep
	| AttachStep;
