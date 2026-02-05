import { GatherType } from '../enums/GatherType.js';

export enum Action {
	FIGHT = 'fight',
	FOLLOW = 'follow',
	UNFOLLOW = 'unfollow',
	CHANGE_LEADER = 'change_leader',
	DISBAND = 'disband',
	SHOP = 'shop',
	ITINERANTSHOP = 'itinerant_shop',
	LEVEL_UP = 'levelup',
	NPC = 'npc',
	RESURRECT = 'resurrect',
	MISSION = 'mission',
	DIG = 'dig',
	CONCENTRATE = 'concentrate',
	MARKET = 'market',
	FISH = 'fish',
	CUEILLE = 'cueille',
	ENERGY = 'energy',
	HUNT = 'hunt',
	SEEK = 'seek',
	ANNIV = 'anniv',
	DAILY = 'daily',
	XMAS = 'xmas',
	IRMA = 'irma',
	IRMAS = 'irmas',
	ACTION = 'action',
	CONGEL = 'congel',
	STOP_CONGEL = 'stop_congel',
	REST = 'rest',
	STOP_REST = 'stop_rest',
	REINCARNATION = 'reincarnation',
	FB_TOURNAMENT = 'fb_tournament'
}

export interface ActionFiche {
	name: Action | GatherType;
	imgName: string;
	prop?: number | string;
	special?: boolean;
	forDinoz?: number;
}

export const actionList: Readonly<Record<Action, ActionFiche>> = {
	[Action.FIGHT]: {
		name: Action.FIGHT,
		imgName: 'act_fight'
	},
	[Action.FOLLOW]: {
		name: Action.FOLLOW,
		imgName: 'act_follow'
	},
	[Action.UNFOLLOW]: {
		name: Action.UNFOLLOW,
		imgName: 'act_follow_stop'
	},
	[Action.CHANGE_LEADER]: {
		name: Action.CHANGE_LEADER,
		imgName: 'act_leader'
	},
	[Action.DISBAND]: {
		name: Action.DISBAND,
		imgName: 'act_follow_stop'
	},
	[Action.SHOP]: {
		name: Action.SHOP,
		imgName: 'act_shop'
	},
	[Action.ITINERANTSHOP]: {
		name: Action.ITINERANTSHOP,
		imgName: 'act_shop'
	},
	[Action.LEVEL_UP]: {
		name: Action.LEVEL_UP,
		imgName: 'act_levelup'
	},
	[Action.NPC]: {
		name: Action.NPC,
		imgName: 'act_talk'
	},
	[Action.RESURRECT]: {
		name: Action.RESURRECT,
		imgName: 'act_resurrect'
	},
	[Action.MISSION]: {
		name: Action.MISSION,
		imgName: 'act_mission'
	},
	[Action.DIG]: {
		name: Action.DIG,
		imgName: 'act_dig'
	},
	//TODO: display text for front
	[Action.CONCENTRATE]: {
		name: Action.CONCENTRATE,
		imgName: 'act_default'
	},
	[Action.MARKET]: {
		name: Action.MARKET,
		imgName: 'act_market'
	},
	[Action.FISH]: {
		name: Action.FISH,
		imgName: 'act_fish'
	},
	[Action.CUEILLE]: {
		name: Action.CUEILLE,
		imgName: 'act_cueille'
	},
	[Action.ENERGY]: {
		name: Action.ENERGY,
		imgName: 'act_energy'
	},
	[Action.HUNT]: {
		name: Action.HUNT,
		imgName: 'act_hunt'
	},
	[Action.SEEK]: {
		name: Action.SEEK,
		imgName: 'act_seek'
	},
	[Action.ANNIV]: {
		name: Action.ANNIV,
		imgName: 'act_default'
	},
	[Action.DAILY]: {
		name: Action.DAILY,
		imgName: 'act_default'
	},
	[Action.XMAS]: {
		name: Action.XMAS,
		imgName: 'act_default'
	},
	[Action.IRMA]: {
		name: Action.IRMA,
		imgName: 'act_irma'
	},
	[Action.IRMAS]: {
		name: Action.IRMAS,
		imgName: 'act_irmas'
	},
	[Action.ACTION]: {
		name: Action.ACTION,
		imgName: 'act_action'
	},
	[Action.CONGEL]: {
		name: Action.CONGEL,
		imgName: 'act_congel'
	},
	[Action.STOP_CONGEL]: {
		name: Action.STOP_CONGEL,
		imgName: 'act_stop_congel'
	},
	[Action.REST]: {
		name: Action.REST,
		imgName: 'act_rest'
	},
	[Action.STOP_REST]: {
		name: Action.STOP_REST,
		imgName: 'act_stop_rest'
	},
	[Action.REINCARNATION]: {
		name: Action.REINCARNATION,
		imgName: 'act_resurrect'
	},
	[Action.FB_TOURNAMENT]: {
		name: Action.FB_TOURNAMENT,
		imgName: 'act_tournament'
	}
};
