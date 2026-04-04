import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { bossList } from '../../monster/bossList.js';
import { monsterList } from '../../monster/monsterList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const professorEugeneDialog = defineDialog({
	id: 'professor_eugene',
	place: PlaceEnum.UNIVERSITE,
	name: 'npc.eugene.name',
	pnj: {
		image: false,
		gfx: 'professor',
		frame: 'speak',
		background: '1'
	},
	cond: { type: 'true' },
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.eugene.dialog.begin',
			next: ['talk']
		},

		talk: {
			id: 'talk',
			text: 'npc.eugene.dialog.talk',
			next: ['question', 'nothing', 'nothing2', 'learn', 'learn_water', 'learn_fire', 'learn_done']
		},
		// APPRENTISSAGE
		nothing: {
			id: 'nothing',
			text: 'npc.eugene.dialog.nothing',
			next: []
		},
		nothing2: {
			id: 'nothing2',
			text: 'npc.eugene.dialog.nothing2',
			next: []
		},
		learn: {
			id: 'learn',
			text: 'npc.eugene.dialog.learn',
			next: ['water', 'fire']
		},
		water: {
			id: 'water',
			text: 'npc.eugene.dialog.water',
			next: ['water_fight', 'back']
		},
		fire: {
			id: 'fire',
			text: 'npc.eugene.dialog.fire',
			next: ['fire_fight', 'back']
		},
		water_fight: {
			id: 'water_fight',
			text: 'npc.eugene.dialog.water_fight',
			next: [],
			special: [
				{ type: 'startFight', fightId: [bossList.ELEMENTAIRE_EAU] },
				{
					type: 'status',
					status: 'bouee'
				}
			]
		},
		fire_fight: {
			id: 'fire_fight',
			text: 'npc.eugene.dialog.fire_fight',
			next: [],
			special: [
				{ type: 'startFight', fightId: [bossList.ELEMENTAIRE_FEU] },
				{
					type: 'status',
					status: 'matesc'
				}
			]
		},
		learn_water: {
			id: 'learn_water',
			text: 'npc.eugene.dialog.learn_water',
			next: ['water_fight']
		},
		learn_fire: {
			id: 'learn_fire',
			text: 'npc.eugene.dialog.learn_fire',
			next: ['fire_fight']
		},
		learn_done: {
			id: 'learn_done',
			text: 'npc.eugene.dialog.learn_done',
			next: []
		},
		// QUESTIONS
		question: {
			id: 'question',
			text: 'npc.eugene.dialog.question',
			next: ['dinoville', 'gtc', 'atlante', 'stone', 'gant', 'noquestion']
		},
		dinoville: {
			id: 'dinoville',
			text: 'npc.eugene.dialog.dinoville',
			next: ['menu']
		},
		atlante: {
			id: 'atlante',
			text: 'npc.eugene.dialog.atlante',
			next: ['menu']
		},
		gtc: {
			id: 'gtc',
			text: 'npc.eugene.dialog.gtc',
			next: ['menu']
		},
		gant: {
			id: 'gant',
			text: 'npc.eugene.dialog.gant',
			next: ['menu']
		},
		stone: {
			id: 'stone',
			text: 'npc.eugene.dialog.stone',
			next: ['stone_yes', 'stone_no']
		},
		stone_yes: {
			id: 'stone_yes',
			text: 'npc.eugene.dialog.stone_yes',
			next: [],
			effects: [
				{ type: 'noEffect', effect: 'astone' },
				{ type: 'effect', effect: 'totem' }
			]
		},
		noquestion: {
			id: 'noquestion',
			text: 'npc.eugene.dialog.noquestion',
			next: []
		},
		exit: {
			id: 'exit',
			text: 'npc.dialog.exit',
			next: []
		}
	},
	links: {
		// Entrée
		talk: {
			id: 'talk',
			text: 'npc.eugene.choice.talk',
			target: 'talk'
		},
		// Menu principal
		question: {
			id: 'question',
			text: 'npc.eugene.choice.question',
			target: 'question'
		},
		nothing: {
			id: 'nothing',
			text: 'npc.eugene.choice.learn',
			target: 'nothing',
			cond: parseCondition('!level(5)')
		},
		learn: {
			id: 'learn',
			text: 'npc.eugene.choice.learn',
			target: 'learn',
			cond: parseCondition('level(5)+!fx(bouee)+!fx(matesc)')
		},
		nothing2: {
			id: 'nothing2',
			text: 'npc.eugene.choice.learn',
			target: 'nothing2',
			cond: parseCondition('!level(7)+(fx(bouee)|fx(matesc))')
		},
		learn_water: {
			id: 'learn_water',
			text: 'npc.eugene.choice.learn',
			target: 'learn_water',
			cond: parseCondition('level(7)+fx(matesc)+!fx(bouee)')
		},
		learn_fire: {
			id: 'learn_fire',
			text: 'npc.eugene.choice.learn',
			target: 'learn_fire',
			cond: parseCondition('level(7)+fx(bouee)+!fx(matesc)')
		},
		learn_done: {
			id: 'learn_done',
			text: 'npc.eugene.choice.learn',
			target: 'learn_done',
			cond: parseCondition('fx(bouee)+fx(matesc)')
		},
		// Choix apprentissage
		water: {
			id: 'water',
			text: 'npc.eugene.choice.water',
			target: 'water'
		},
		fire: {
			id: 'fire',
			text: 'npc.eugene.choice.fire',
			target: 'fire'
		},
		water_fight: {
			id: 'water_fight',
			text: 'npc.eugene.choice.fight',
			target: 'water_fight'
		},
		fire_fight: {
			id: 'fire_fight',
			text: 'npc.eugene.choice.fight',
			target: 'fire_fight'
		},
		back: {
			id: 'back',
			text: 'npc.eugene.choice.back',
			target: 'learn'
		},
		// Questions
		dinoville: {
			id: 'dinoville',
			text: 'npc.eugene.choice.dinoville',
			target: 'dinoville'
		},
		atlante: {
			id: 'atlante',
			text: 'npc.eugene.choice.atlante',
			target: 'atlante',
			cond: parseCondition('level(8)')
		},
		gtc: {
			id: 'gtc',
			text: 'npc.eugene.choice.gtc',
			target: 'gtc',
			cond: parseCondition('level(5)')
		},
		gant: {
			id: 'gant',
			text: 'npc.eugene.choice.gant',
			target: 'gant',
			cond: parseCondition('fx(gant)')
		},
		stone: {
			id: 'stone',
			text: 'npc.eugene.choice.stone',
			target: 'stone',
			cond: parseCondition('fx(astone)')
		},
		noquestion: {
			id: 'noquestion',
			text: 'npc.eugene.choice.noquestion',
			target: 'noquestion'
		},
		menu: {
			id: 'menu',
			text: 'npc.eugene.choice.back',
			target: 'question'
		},
		// Pierre
		stone_yes: {
			id: 'stone_yes',
			text: 'npc.eugene.choice.stone_yes',
			target: 'stone_yes'
		},
		stone_no: {
			id: 'stone_no',
			text: 'npc.eugene.choice.stone_no',
			target: 'question'
		}
	},
	inject: []
});
