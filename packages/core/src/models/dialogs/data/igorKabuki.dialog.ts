import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Ingredient } from '../../ingredients/ingredientList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

// Motion Twin source: DinoRPG/xml/{fr,en,es,de}/dialogs/igor.xml
// Original scenario progression: 5 -> 10 -> 11 -> 12 -> 13 -> 14 -> 15 -> 16 -> 17.

export const igorKabukiIntroDialog = defineDialog({
	id: 'igor_kabuki_intro',
	place: PlaceEnum.UNIVERSITE,
	name: 'npc.igorKabuki.name',
	pnj: { image: false, gfx: 'igor', frame: 'speak', background: '1' },
	cond: parseCondition('scenario(kabuki,5)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.begin',
			fast: true,
			next: ['speak', 'bye']
		},
		bye: {
			id: 'bye',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.bye',
			fast: true
		},
		speak: {
			id: 'speak',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.speak',
			next: ['legend', 'bye']
		},
		legend: {
			id: 'legend',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.legend',
			next: ['cata', 'bye']
		},
		cata: {
			id: 'cata',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.cata',
			next: ['next', 'bye']
		},
		next: {
			id: 'next',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.next',
			next: ['kabuki', 'bye']
		},
		kabuki: {
			id: 'kabuki',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.kabuki',
			next: ['oh', 'bye']
		},
		oh: {
			id: 'oh',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.oh',
			next: ['yes', 'no']
		},
		no: {
			id: 'no',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.no',
			fast: true
		},
		yes: {
			id: 'yes',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.yes',
			next: ['show', 'bye']
		},
		show: {
			id: 'show',
			text: 'npc.igorKabuki.dialog.igor_kabuki_intro.show',
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 10 }]
		}
	},
	links: {
		speak: {
			id: 'speak',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.speak'
		},
		bye: {
			id: 'bye',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.bye'
		},
		legend: {
			id: 'legend',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.legend'
		},
		cata: {
			id: 'cata',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.cata'
		},
		next: {
			id: 'next',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.next'
		},
		kabuki: {
			id: 'kabuki',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.kabuki'
		},
		oh: {
			id: 'oh',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.oh'
		},
		yes: {
			id: 'yes',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.yes'
		},
		no: {
			id: 'no',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.no'
		},
		show: {
			id: 'show',
			text: 'npc.igorKabuki.choice.igor_kabuki_intro.show'
		}
	},
	inject: []
});

export const igorKabukiDecodedDialog = defineDialog({
	id: 'igor_kabuki_decoded',
	place: PlaceEnum.UNIVERSITE,
	name: 'npc.igorKabuki.name',
	pnj: { image: false, gfx: 'igor', frame: 'speak', background: '1' },
	cond: parseCondition('scenario(kabuki,10)+(admin()|swait(kabuki,35))'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.igorKabuki.dialog.igor_kabuki_decoded.begin',
			next: ['next']
		},
		next: {
			id: 'next',
			text: 'npc.igorKabuki.dialog.igor_kabuki_decoded.next',
			next: ['aura']
		},
		aura: {
			id: 'aura',
			text: 'npc.igorKabuki.dialog.igor_kabuki_decoded.aura',
			next: ['how']
		},
		how: {
			id: 'how',
			text: 'npc.igorKabuki.dialog.igor_kabuki_decoded.how',
			next: ['ingr']
		},
		ingr: {
			id: 'ingr',
			text: 'npc.igorKabuki.dialog.igor_kabuki_decoded.ingr',
			next: ['ingr2']
		},
		ingr2: {
			id: 'ingr2',
			text: 'npc.igorKabuki.dialog.igor_kabuki_decoded.ingr2',
			next: ['again', 'ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.igorKabuki.dialog.igor_kabuki_decoded.ok',
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 11 }]
		}
	},
	links: {
		next: {
			id: 'next',
			text: 'npc.igorKabuki.choice.igor_kabuki_decoded.next'
		},
		aura: {
			id: 'aura',
			text: 'npc.igorKabuki.choice.igor_kabuki_decoded.aura'
		},
		how: {
			id: 'how',
			text: 'npc.igorKabuki.choice.igor_kabuki_decoded.how'
		},
		ingr: {
			id: 'ingr',
			text: 'npc.igorKabuki.choice.igor_kabuki_decoded.ingr'
		},
		ingr2: {
			id: 'ingr2',
			text: 'npc.igorKabuki.choice.igor_kabuki_decoded.ingr2'
		},
		again: {
			id: 'again',
			text: 'npc.igorKabuki.choice.igor_kabuki_decoded.again',
			target: 'next'
		},
		ok: {
			id: 'ok',
			text: 'npc.igorKabuki.choice.igor_kabuki_decoded.ok'
		}
	},
	inject: []
});

export const igorKabukiIngredientsDialog = defineDialog({
	id: 'igor_kabuki_ingredients',
	place: PlaceEnum.UNIVERSITE,
	name: 'npc.igorKabuki.name',
	pnj: { image: false, gfx: 'igor', frame: 'speak', background: '1' },
	cond: parseCondition('scenario(kabuki,11+)+scenario(kabuki,16-)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.igorKabuki.dialog.igor_kabuki_ingredients.begin',
			next: ['i1', 'i2', 'i3', 'i4', 'i5', 'i6']
		},
		i1: {
			id: 'i1',
			text: 'npc.igorKabuki.dialog.igor_kabuki_ingredients.i1',
			next: ['begin'],
			special: [{ type: 'useIngredient', ingredientId: Ingredient.MEROU_LUJIDANE, count: 5 }],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 12 }]
		},
		i2: {
			id: 'i2',
			text: 'npc.igorKabuki.dialog.igor_kabuki_ingredients.i2',
			next: ['begin'],
			special: [{ type: 'useIngredient', ingredientId: Ingredient.FEUILLES_DE_PELINAE, count: 5 }],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 13 }]
		},
		i3: {
			id: 'i3',
			text: 'npc.igorKabuki.dialog.igor_kabuki_ingredients.i3',
			next: ['begin'],
			special: [{ type: 'useIngredient', ingredientId: Ingredient.TOUFFE_DE_FOURRURE, count: 5 }],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 14 }]
		},
		i4: {
			id: 'i4',
			text: 'npc.igorKabuki.dialog.igor_kabuki_ingredients.i4',
			next: ['begin'],
			special: [{ type: 'useIngredient', ingredientId: Ingredient.SILEX_TAILLE, count: 2 }],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 15 }]
		},
		i5: {
			id: 'i5',
			text: 'npc.igorKabuki.dialog.igor_kabuki_ingredients.i5',
			next: ['begin'],
			special: [{ type: 'useIngredient', ingredientId: Ingredient.ENERGIE_AIR, count: 1 }],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 16 }]
		},
		i6: {
			id: 'i6',
			text: 'npc.igorKabuki.dialog.igor_kabuki_ingredients.i6',
			special: [{ type: 'useIngredient', ingredientId: Ingredient.ENERGIE_EAU, count: 1 }],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 17 }]
		}
	},
	links: {
		begin: {
			id: 'begin',
			text: 'npc.igorKabuki.choice.igor_kabuki_ingredients.begin'
		},
		i1: {
			id: 'i1',
			text: 'npc.igorKabuki.choice.igor_kabuki_ingredients.i1',
			cond: parseCondition('scenario(kabuki,11)')
		},
		i2: {
			id: 'i2',
			text: 'npc.igorKabuki.choice.igor_kabuki_ingredients.i2',
			cond: parseCondition('scenario(kabuki,12)')
		},
		i3: {
			id: 'i3',
			text: 'npc.igorKabuki.choice.igor_kabuki_ingredients.i3',
			cond: parseCondition('scenario(kabuki,13)')
		},
		i4: {
			id: 'i4',
			text: 'npc.igorKabuki.choice.igor_kabuki_ingredients.i4',
			cond: parseCondition('scenario(kabuki,14)')
		},
		i5: {
			id: 'i5',
			text: 'npc.igorKabuki.choice.igor_kabuki_ingredients.i5',
			cond: parseCondition('scenario(kabuki,15)')
		},
		i6: {
			id: 'i6',
			text: 'npc.igorKabuki.choice.igor_kabuki_ingredients.i6',
			cond: parseCondition('scenario(kabuki,16)')
		}
	},
	inject: []
});
