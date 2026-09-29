import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

export type BotProgressionRequirement =
	| { type: 'status'; key: string }
	| { type: 'collection'; key: string }
	| { type: 'place'; placeId: PlaceEnum }
	| { type: 'level'; value: number };

export type BotProgressionAction =
	| {
			type: 'dialog';
			dialogId: string;
			placeId: PlaceEnum;
			preferredLinkIds: string[];
	  }
	| {
			type: 'dig';
			placeId: PlaceEnum;
			treasureId: string;
	  };

export type BotProgressionNode = {
	id: string;
	provides: BotProgressionRequirement[];
	requires: BotProgressionRequirement[];
	consumes?: BotProgressionRequirement[];
	action: BotProgressionAction;
};

export const BOT_LANTERN_PROGRESSION: BotProgressionNode[] = [
	{
		id: 'buoy',
		provides: [{ type: 'status', key: 'bouee' }],
		requires: [{ type: 'level', value: 5 }, { type: 'place', placeId: PlaceEnum.UNIVERSITE }],
		action: {
			type: 'dialog',
			dialogId: 'professor_eugene',
			placeId: PlaceEnum.UNIVERSITE,
			preferredLinkIds: ['talk', 'learn', 'water', 'water_fight']
		}
	},
	{
		id: 'climbing_gear',
		provides: [{ type: 'status', key: 'matesc' }],
		requires: [
			{ type: 'level', value: 7 },
			{ type: 'status', key: 'bouee' },
			{ type: 'place', placeId: PlaceEnum.UNIVERSITE }
		],
		action: {
			type: 'dialog',
			dialogId: 'professor_eugene',
			placeId: PlaceEnum.UNIVERSITE,
			preferredLinkIds: ['talk', 'learn_fire', 'fire_fight']
		}
	},
	{
		id: 'shovel',
		provides: [{ type: 'status', key: 'pelle' }],
		requires: [
			{ type: 'status', key: 'bouee' },
			{ type: 'place', placeId: PlaceEnum.MINES_DE_CORAIL }
		],
		action: {
			type: 'dialog',
			dialogId: 'coral_miner',
			placeId: PlaceEnum.MINES_DE_CORAIL,
			preferredLinkIds: ['yes']
		}
	},
	{
		id: 'joveboze_trigger',
		provides: [{ type: 'status', key: 'jvbz' }],
		requires: [
			{ type: 'status', key: 'bouee' },
			{ type: 'place', placeId: PlaceEnum.CHUTES_MUTANTES }
		],
		action: {
			type: 'dialog',
			dialogId: 'atlante_guard',
			placeId: PlaceEnum.CHUTES_MUTANTES,
			preferredLinkIds: ['rasca', 'where', 'call', 'appeau', 'old']
		}
	},
	{
		id: 'rascaphandre_decoy',
		provides: [{ type: 'status', key: 'rasca' }],
		requires: [
			{ type: 'status', key: 'jvbz' },
			{ type: 'place', placeId: PlaceEnum.PORT_DE_PRECHE }
		],
		action: {
			type: 'dialog',
			dialogId: 'joveboze',
			placeId: PlaceEnum.PORT_DE_PRECHE,
			preferredLinkIds: ['sry', 'go', 'attack']
		}
	},
	{
		id: 'basalt_shard',
		provides: [{ type: 'status', key: 'basalt' }],
		requires: [
			{ type: 'status', key: 'matesc' },
			{ type: 'status', key: 'pelle' },
			{ type: 'place', placeId: PlaceEnum.PENTES_DE_BASALTE }
		],
		action: {
			type: 'dig',
			placeId: PlaceEnum.PENTES_DE_BASALTE,
			treasureId: 'basalt'
		}
	},
	{
		id: 'pure_water',
		provides: [{ type: 'status', key: 'wpure' }],
		requires: [
			{ type: 'status', key: 'pelle' },
			{ type: 'place', placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE }
		],
		action: {
			type: 'dig',
			placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
			treasureId: 'pure_water'
		}
	},
	{
		id: 'swamp_mud',
		provides: [{ type: 'status', key: 'marais' }],
		requires: [
			{ type: 'status', key: 'bouee' },
			{ type: 'status', key: 'pelle' },
			{ type: 'place', placeId: PlaceEnum.MARAIS_COLLANT }
		],
		action: {
			type: 'dig',
			placeId: PlaceEnum.MARAIS_COLLANT,
			treasureId: 'swamp_mud'
		}
	},
	{
		id: 'zors_glove',
		provides: [{ type: 'status', key: 'gant' }],
		requires: [
			{ type: 'status', key: 'rasca' },
			{ type: 'status', key: 'basalt' },
			{ type: 'status', key: 'wpure' },
			{ type: 'status', key: 'marais' },
			{ type: 'place', placeId: PlaceEnum.DOME_SOULAFLOTTE }
		],
		consumes: [
			{ type: 'status', key: 'basalt' },
			{ type: 'status', key: 'wpure' },
			{ type: 'status', key: 'marais' }
		],
		action: {
			type: 'dialog',
			dialogId: 'archisage',
			placeId: PlaceEnum.DOME_SOULAFLOTTE,
			preferredLinkIds: ['enigm', 'next', 'tresor', 'quoi', 'show']
		}
	},
	{
		id: 'zenbro',
		provides: [{ type: 'status', key: 'zenbro' }],
		requires: [
			{ type: 'status', key: 'bouee' },
			{ type: 'place', placeId: PlaceEnum.CHUTES_MUTANTES }
		],
		action: {
			type: 'dialog',
			dialogId: 'master_hydargol',
			placeId: PlaceEnum.CHUTES_MUTANTES,
			preferredLinkIds: ['talk', 'help', 'get', 'where']
		}
	},
	{
		id: 'first_lily_leaf',
		provides: [{ type: 'status', key: 'nenuph' }],
		requires: [
			{ type: 'status', key: 'zenbro' },
			{ type: 'place', placeId: PlaceEnum.PORT_DE_PRECHE }
		],
		consumes: [{ type: 'status', key: 'zenbro' }],
		action: {
			type: 'dialog',
			dialogId: 'padamoine',
			placeId: PlaceEnum.PORT_DE_PRECHE,
			preferredLinkIds: ['help', 'get']
		}
	},
	{
		id: 'epic_pearl',
		provides: [{ type: 'collection', key: 'perle' }],
		requires: [
			{ type: 'status', key: 'nenuph' },
			{ type: 'place', placeId: PlaceEnum.CHUTES_MUTANTES }
		],
		consumes: [{ type: 'status', key: 'nenuph' }],
		action: {
			type: 'dialog',
			dialogId: 'master_hydargol',
			placeId: PlaceEnum.CHUTES_MUTANTES,
			preferredLinkIds: ['talk', 'give']
		}
	},
	{
		id: 'second_lily_leaf',
		provides: [
			{ type: 'status', key: 'nenuph' },
			{ type: 'status', key: 'chutes' }
		],
		requires: [
			{ type: 'collection', key: 'perle' },
			{ type: 'status', key: 'gant' },
			{ type: 'place', placeId: PlaceEnum.CHUTES_MUTANTES }
		],
		action: {
			type: 'dialog',
			dialogId: 'master_hydargol',
			placeId: PlaceEnum.CHUTES_MUTANTES,
			preferredLinkIds: ['talk', 'act', 'gant', 'why', 'super', 'ok']
		}
	},
	{
		id: 'lantern',
		provides: [{ type: 'status', key: 'lantrn' }],
		requires: [
			{ type: 'status', key: 'gant' },
			{ type: 'status', key: 'nenuph' },
			{ type: 'status', key: 'chutes' },
			{ type: 'place', placeId: PlaceEnum.COLLINES_HANTEES }
		],
		action: {
			type: 'dialog',
			dialogId: 'weird_man',
			placeId: PlaceEnum.COLLINES_HANTEES,
			preferredLinkIds: ['ignore', 'intro', 'seenWhat', 'show', 'fight']
		}
	}
];
