import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const c = (source: string) => parseCondition(source);

export const elementalMasterDialog = defineDialog({
	id: 'elMaster',
	place: PlaceEnum.FOSSELAVE,
	name: 'npc.elMaster.name',
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'elmaster',
		frame: 'speak',
		background: '1'
	},
	cond: c('mission(pigeon)+mission(ritual)+mission(shipmt)'),
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.elMaster.dialog.begin',
			next: ['talk', 'talk2', 'talk3']
		},
		talk: {
			id: 'talk',
			text: 'npc.elMaster.dialog.talk',
			next: ['ask']
		},
		ask: {
			id: 'ask',
			text: 'npc.elMaster.dialog.ask',
			next: ['ask2']
		},
		ask2: {
			id: 'ask2',
			text: 'npc.elMaster.dialog.ask2',
			next: ['mission']
		},
		mission: {
			id: 'mission',
			text: '',
			next: [],
			special: [{ type: 'missions', group: 'elmaster' }]
		},
		talk2: {
			id: 'talk2',
			text: 'npc.elMaster.dialog.talk2',
			next: ['mission', 'maudit']
		},
		talk3: {
			id: 'talk3',
			text: 'npc.elMaster.dialog.talk3',
			next: ['maudit', 'sphere']
		},
		maudit: {
			id: 'maudit',
			text: 'npc.elMaster.dialog.maudit',
			next: ['maudit2']
		},
		maudit2: {
			id: 'maudit2',
			text: 'npc.elMaster.dialog.maudit2',
			next: ['maudit3']
		},
		maudit3: {
			id: 'maudit3',
			text: 'npc.elMaster.dialog.maudit3',
			next: ['maudit4']
		},
		maudit4: {
			id: 'maudit4',
			text: 'npc.elMaster.dialog.maudit4',
			next: []
		},
		sphere: {
			id: 'sphere',
			text: 'npc.elMaster.dialog.sphere',
			next: ['sphere2']
		},
		sphere2: {
			id: 'sphere2',
			text: 'npc.elMaster.dialog.sphere2',
			next: ['sphere3']
		},
		sphere3: {
			id: 'sphere3',
			text: 'npc.elMaster.dialog.sphere3',
			next: ['sphere4']
		},
		sphere4: {
			id: 'sphere4',
			text: 'npc.elMaster.dialog.sphere4',
			next: ['sphere5']
		},
		sphere5: {
			id: 'sphere5',
			text: 'npc.elMaster.dialog.sphere5',
			next: ['sphere6']
		},
		sphere6: {
			id: 'sphere6',
			text: 'npc.elMaster.dialog.sphere6',
			next: ['again', 'sphere7', 'already']
		},
		sphere7: {
			id: 'sphere7',
			text: 'npc.elMaster.dialog.sphere7',
			effects: [
				{ type: 'noEffect', effect: 'sphere' },
				{
					type: 'giveRandomItem',
					itemIds: [Item.FIRE_SPHERE, Item.WOOD_SPHERE, Item.WATER_SPHERE, Item.LIGHTNING_SPHERE, Item.AIR_SPHERE]
				}
			],
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.elMaster.dialog.end',
			next: []
		}
	},
	links: {
		talk: {
			id: 'talk',
			text: 'npc.elMaster.choice.talk',
			cond: c('!mission(elma)')
		},
		talk2: {
			id: 'talk2',
			text: 'npc.elMaster.choice.talk',
			cond: c('mission(elma)+!mission(elmawater)')
		},
		talk3: {
			id: 'talk3',
			text: 'npc.elMaster.choice.talk',
			cond: c('mission(elmawater)')
		},
		ask: {
			id: 'ask',
			text: 'npc.elMaster.choice.ask'
		},
		ask2: {
			id: 'ask2',
			text: 'npc.elMaster.choice.ask2'
		},
		mission: {
			id: 'mission',
			text: 'npc.elMaster.choice.mission'
		},
		maudit: {
			id: 'maudit',
			text: 'npc.elMaster.choice.maudit',
			cond: c('fx(maudit)')
		},
		sphere: {
			id: 'sphere',
			text: 'npc.elMaster.choice.sphere'
		},
		maudit2: {
			id: 'maudit2',
			text: 'npc.elMaster.choice.dot'
		},
		maudit3: {
			id: 'maudit3',
			text: 'npc.elMaster.choice.dot'
		},
		maudit4: {
			id: 'maudit4',
			text: 'npc.elMaster.choice.dot'
		},
		sphere2: {
			id: 'sphere2',
			text: 'npc.elMaster.choice.dot'
		},
		sphere3: {
			id: 'sphere3',
			text: 'npc.elMaster.choice.sphere3'
		},
		sphere4: {
			id: 'sphere4',
			text: 'npc.elMaster.choice.sphere4'
		},
		sphere5: {
			id: 'sphere5',
			text: 'npc.elMaster.choice.dot'
		},
		sphere6: {
			id: 'sphere6',
			text: 'npc.elMaster.choice.dot'
		},
		again: {
			id: 'again',
			text: 'npc.elMaster.choice.again',
			target: 'sphere4'
		},
		sphere7: {
			id: 'sphere7',
			text: 'npc.elMaster.choice.understand',
			cond: c('fx(sphere)')
		},
		already: {
			id: 'already',
			text: 'npc.elMaster.choice.understand',
			target: 'end',
			cond: c('!fx(sphere)')
		},
		end: {
			id: 'end',
			text: 'npc.elMaster.choice.end'
		}
	}
});
