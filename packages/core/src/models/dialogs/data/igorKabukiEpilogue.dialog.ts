import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Boss, bossList } from '../../monster/bossList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

// MT source: DinoRPG/xml/{fr,en,es,de}/dialogs/igor.xml, last two dialogs.
// Fight progression only after victory in the current engine; MT phase 19 has a special forced-outcome script.

export const igorKabukiAuraDialog = defineDialog({
	id: 'igor_kabuki_aura',
	place: PlaceEnum.UNIVERSITE,
	name: 'npc.igorKabuki.name',
	pnj: { image: false, gfx: 'igor', frame: 'speak', background: '1' },
	cond: parseCondition('scenario(kabuki,17)+(admin()|swait(kabuki,70))'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.igorKabuki.dialog.igor_kabuki_aura.begin',
			next: ['aura']
		},
		aura: {
			id: 'aura',
			text: 'npc.igorKabuki.dialog.igor_kabuki_aura.aura',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.igorKabuki.dialog.igor_kabuki_aura.ok',
			fast: true,
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 18 }]
		}
	},
	links: {
		aura: {
			id: 'aura',
			text: 'npc.igorKabuki.choice.igor_kabuki_aura.aura'
		},
		ok: {
			id: 'ok',
			text: 'npc.igorKabuki.choice.igor_kabuki_aura.ok'
		}
	},
	inject: []
});

export const igorKabukiBetrayalDialog = defineDialog({
	id: 'igor_kabuki_betrayal',
	place: PlaceEnum.MINES_DE_CORAIL,
	name: 'npc.igorKabuki.name',
	pnj: { image: false, gfx: 'igorBad', frame: 'speak', background: '1' },
	cond: parseCondition('scenario(kabuki,18)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.igorKabuki.dialog.igor_kabuki_betrayal.begin',
			next: ['why']
		},
		why: {
			id: 'why',
			text: 'npc.igorKabuki.dialog.igor_kabuki_betrayal.why',
			next: ['attack']
		},
		attack: {
			id: 'attack',
			text: 'npc.igorKabuki.dialog.igor_kabuki_betrayal.attack',
			fast: true,
			special: [
				{
					type: 'startFight',
					fightId: [
						bossList[Boss.PR_IGOR],
						bossList[Boss.IGOR_BARBARA],
						bossList[Boss.IGOR_CHOUPETTE],
						bossList[Boss.IGOR_POUPOULE]
					]
				}
			]
		},
		attack_win: {
			id: 'attack_win',
			text: 'npc.igorKabuki.dialog.igor_kabuki_betrayal.attack',
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 19 }]
		}
	},
	links: {
		why: {
			id: 'why',
			text: 'npc.igorKabuki.choice.igor_kabuki_betrayal.why'
		},
		attack: {
			id: 'attack',
			text: 'npc.igorKabuki.choice.igor_kabuki_betrayal.attack'
		}
	},
	inject: []
});
