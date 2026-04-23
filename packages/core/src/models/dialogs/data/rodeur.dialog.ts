import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const strangeRangerIntroDialog = defineDialog({
	id: 'strange_ranger_intro',
	place: PlaceEnum.FORGES_DU_GTC,
	name: 'npc.rodeur.name',
	pnj: {
		image: false,
		gfx: 'rodeur',
		frame: 'speak',
		background: '1'
	},
	cond: parseCondition('!mission(rodriz)+level(15)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.rodeur.dialog.intro.begin',
			next: ['go', 'talk', 'talk2']
		},
		go: {
			id: 'go',
			text: 'npc.rodeur.dialog.intro.go',
			fast: true
		},
		talk: {
			id: 'talk',
			text: 'npc.rodeur.dialog.intro.talk',
			next: ['go', 'yes']
		},
		yes: {
			id: 'yes',
			text: 'npc.rodeur.dialog.intro.yes',
			next: ['go', 'read']
		},
		read: {
			id: 'read',
			text: 'npc.rodeur.dialog.intro.read',
			next: ['go', 'help']
		},
		help: {
			id: 'help',
			text: 'npc.rodeur.dialog.intro.help',
			special: [
				{
					type: 'missions',
					group: 'rodeur'
				}
			]
		},
		talk2: {
			id: 'talk2',
			text: 'npc.rodeur.dialog.intro.talk2'
		}
	},
	links: {
		go: {
			id: 'go',
			text: 'npc.rodeur.choice.go'
		},
		talk: {
			id: 'talk',
			text: 'npc.rodeur.choice.talk',
			cond: parseCondition('!mission(rodriz)')
		},
		talk2: {
			id: 'talk2',
			text: 'npc.rodeur.choice.talk',
			cond: parseCondition('mission(rodriz)')
		},
		yes: {
			id: 'yes',
			text: 'npc.rodeur.choice.yes'
		},
		read: {
			id: 'read',
			text: 'npc.rodeur.choice.read'
		},
		help: {
			id: 'help',
			text: 'npc.rodeur.choice.help'
		}
	}
});

export const strangeRangerTechDialog = defineDialog({
	id: 'strange_ranger_tech',
	place: PlaceEnum.FORGES_DU_GTC,
	name: 'npc.rodeur.name',
	pnj: {
		image: false,
		gfx: 'rodeur',
		frame: 'speak',
		background: '1'
	},
	cond: parseCondition('mission(rodriz)+!mission(rodlif)+level(20)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.rodeur.dialog.tech.begin',
			next: ['qual', 'qual2']
		},
		qual: {
			id: 'qual',
			text: 'npc.rodeur.dialog.tech.qual',
			next: ['caush', 'ether']
		},
		qual2: {
			id: 'qual2',
			text: 'npc.rodeur.dialog.tech.qual2'
		},
		caush: {
			id: 'caush',
			text: 'npc.rodeur.dialog.tech.caush',
			next: ['ether', 'next']
		},
		ether: {
			id: 'ether',
			text: 'npc.rodeur.dialog.tech.ether',
			next: ['caush', 'next']
		},
		next: {
			id: 'next',
			text: 'npc.rodeur.dialog.tech.next',
			next: ['more']
		},
		more: {
			id: 'more',
			text: 'npc.rodeur.dialog.tech.more',
			next: ['mission']
		},
		mission: {
			id: 'mission',
			text: 'npc.rodeur.dialog.tech.mission',
			special: [
				{
					type: 'missions',
					group: 'rodeur'
				}
			]
		}
	},
	links: {
		qual: {
			id: 'qual',
			text: 'npc.rodeur.choice.qual',
			cond: parseCondition('!mission(rodlif)')
		},
		qual2: {
			id: 'qual2',
			text: 'npc.rodeur.choice.qual',
			cond: parseCondition('mission(rodlif)')
		},
		caush: {
			id: 'caush',
			text: 'npc.rodeur.choice.caush'
		},
		ether: {
			id: 'ether',
			text: 'npc.rodeur.choice.ether'
		},
		next: {
			id: 'next',
			text: 'npc.rodeur.choice.next'
		},
		more: {
			id: 'more',
			text: 'npc.rodeur.choice.more'
		},
		mission: {
			id: 'mission',
			text: 'npc.rodeur.choice.mission'
		}
	}
});

export const strangeRangerRewardDialog = defineDialog({
	id: 'strange_ranger_reward',
	place: PlaceEnum.FORGES_DU_GTC,
	name: 'npc.rodeur.name',
	pnj: {
		image: false,
		gfx: 'rodeur',
		frame: 'speak',
		background: '1'
	},
	cond: parseCondition('mission(rodlif)+!hasobject(tik_bracelet)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.rodeur.dialog.reward.begin',
			next: ['next2']
		},
		next2: {
			id: 'next2',
			text: 'npc.rodeur.dialog.reward.next2',
			needCheck: false,
			effects: [
				{
					type: 'giveItem',
					itemId: Item.TIK_BRACELET,
					count: 1
				}
			]
		}
	},
	links: {
		next2: {
			id: 'next2',
			text: 'npc.rodeur.choice.next2'
		}
	}
});

export const strangeRangerAfterSpyDialog = defineDialog({
	id: 'strange_ranger_after_spy',
	place: PlaceEnum.DINOPLAZA,
	name: 'npc.rodeur.name',
	pnj: {
		image: false,
		gfx: 'rodeur3',
		frame: 'fixe',
		background: '5'
	},
	cond: parseCondition('scenario(caush,44+)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.rodeur.dialog.afterSpy.begin',
			fast: true
		}
	},
	links: {}
});
