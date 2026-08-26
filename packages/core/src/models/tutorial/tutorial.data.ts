import { type TutorialObjective, type TutorialObjectiveKey, tutorialObjectiveKeys } from './tutorial.js';

export const tutorialObjectives: Record<TutorialObjectiveKey, TutorialObjective> = {
	dinoz: {
		id: 'dinoz',
		validation: {
			type: 'event',
			event: 'DINOZ_ADOPTED'
		},
		begin: {
			url: 'shop/dinoz',
			fast: false
		},
		end: {},
		helpers: [
			{
				id: 'compare',
				selector: '#detail_0',
				url: 'shop/dinoz'
			},
			{
				id: 'name',
				selector: '#centerContent form .field',
				url: 'dino/*'
			}
		],
		rewards: [],
		next: 'speak'
	},
	speak: {
		id: 'speak',
		validation: {
			type: 'event',
			event: 'GUIDE_MICHEL_SPOKEN'
		},
		begin: {
			url: 'dino/*/!act',
			fast: false
		},
		end: {
			url: 'dino/*/'
		},
		helpers: [
			{
				id: 'dinoz',
				selector: '#dinozList ul li:first',
				url: '!dino'
			},
			{
				id: 'answers',
				selector: '#answers',
				url: 'dino/*/act/dialog/guide'
			},
			{
				id: 'michel',
				selector: '#act_dialog_guide_icon',
				url: 'dino/*'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 100
			}
		],
		next: 'move'
	},
	move: {
		id: 'move',
		validation: {
			type: 'condition',
			condition: {
				type: 'uvar',
				key: 'moves',
				value: 1,
				compare: 'gte'
			}
		},
		begin: {
			url: 'dino/*'
		},
		end: {
			url: 'dino/*'
		},
		helpers: [
			{
				id: 'map',
				selector: '#map',
				cond: {
					type: 'tab',
					key: 'map'
				}
			},
			{
				id: 'combat',
				selector: '#combat',
				url: 'dino/*/act/move'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'port'
	},
	port: {
		id: 'port',
		validation: {
			type: 'condition',
			condition: {
				type: 'position',
				key: 'port'
			}
		},
		begin: {
			url: 'dino/**'
		},
		end: {
			url: 'dino/*'
		},
		helpers: [
			{
				id: 'map',
				selector: '#map',
				cond: {
					type: 'tab',
					key: 'map'
				}
			}
		],
		rewards: [
			{
				type: 'item',
				key: 'irma',
				quantity: 1
			}
		],
		next: 'pub'
	},
	pub: {
		id: 'pub',
		validation: {
			type: 'condition',
			condition: {
				type: 'scenario',
				key: 'intro',
				progression: 2,
				compare: 'gte'
			}
		},
		begin: {
			url: 'dino/*'
		},
		end: {
			url: 'dino/*'
		},
		helpers: [
			{
				id: 'pilier',
				selector: '#act_dialog_intro__2'
			}
		],
		rewards: [
			{
				type: 'item',
				key: 'irma',
				quantity: 1
			}
		],
		next: 'baobob'
	},
	baobob: {
		id: 'baobob',
		cond: {
			type: 'scenario',
			key: 'intro',
			progression: 2,
			compare: 'gte'
		},
		validation: {
			type: 'condition',
			condition: {
				type: 'scenario',
				key: 'intro',
				progression: 6,
				compare: 'gte'
			}
		},
		begin: {
			visible: false
		},
		end: {
			url: 'dino/*'
		},
		helpers: [
			{
				id: 'intro4',
				selector: '#act_dialog_intro__4',
				url: 'dino/*'
			},
			{
				id: 'intro5',
				selector: '#act_dialog_intro__5',
				url: 'dino/*'
			},
			{
				id: 'intro6',
				selector: '#act_dialog_intro__6',
				url: 'dino/*'
			},
			{
				id: 'intro7',
				selector: '#act_dialog_intro__7',
				url: 'dino/*'
			},
			{
				id: 'levelup',
				selector: '#act_levelup',
				url: 'dino/*'
			},
			{
				id: 'skill',
				selector: '#swf_levelup',
				url: 'dino/*/act/levelup'
			},
			{
				id: 'heal',
				selector: 'div#inventory table',
				cond: {
					type: 'life',
					value: 20,
					compare: 'lte'
				},
				url: 'dino/*'
			}
		],
		rewards: [
			{
				type: 'item',
				key: 'irma',
				quantity: 1
			}
		],
		next: 'papy'
	},
	papy: {
		id: 'papy',
		validation: {
			type: 'condition',
			condition: {
				type: 'or',
				left: {
					type: 'mission',
					key: 'fish',
					status: {
						type: 'current'
					}
				},
				right: {
					type: 'mission',
					key: 'dog',
					status: {
						type: 'current'
					}
				}
			}
		},
		begin: {
			url: 'dino/*'
		},
		end: {},
		helpers: [
			{
				id: 'dinoz',
				selector: '#dinozList ul li:first',
				url: '!dino'
			},
			{
				id: 'map',
				selector: '#map',
				url: 'dino/*'
			},
			{
				id: 'papy',
				selector: '#act_dialog_papy',
				url: 'dino/*'
			},
			{
				id: 'mission',
				selector: 'div.mission table tr.new:first',
				url: 'dino/*/act/mission/list'
			}
		],
		rewards: [
			{
				type: 'item',
				key: 'angel',
				quantity: 1
			}
		],
		next: 'shop'
	},
	shop: {
		id: 'shop',
		validation: {
			type: 'condition',
			condition: {
				type: 'uvar',
				key: 'sbuyer',
				value: 1,
				compare: 'gte'
			}
		},
		begin: {},
		end: {},
		helpers: [
			{
				id: 'shop',
				selector: '#menu_shop'
			},
			{
				id: 'burger',
				selector: '#obj_burger',
				url: 'shop'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'burger'
	},
	burger: {
		id: 'burger',
		validation: {
			type: 'condition',
			condition: {
				type: 'uvar',
				key: 'healpv',
				value: 1,
				compare: 'gte'
			}
		},
		begin: {},
		end: {},
		helpers: [
			{
				id: 'burger',
				selector: '#inv_burger_use',
				url: 'dino/**'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'clan'
	},
	clan: {
		id: 'clan',
		validation: {
			type: 'event',
			event: 'CLAN_PAGE_VISITED'
		},
		begin: {},
		end: {},
		helpers: [
			{
				id: 'clan',
				selector: '#clans_page',
				url: '!clan'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'user'
	},
	user: {
		id: 'user',
		validation: {
			type: 'event',
			event: 'ACCOUNT_PAGE_VISITED'
		},
		begin: {
			url: '!user'
		},
		end: {},
		helpers: [
			{
				id: 'account',
				selector: '#account_page',
				url: '!user'
			}
		],
		rewards: [
			{
				type: 'gold',
				amount: 500
			}
		],
		next: 'end'
	},
	end: {
		id: 'end',
		validation: {
			type: 'event',
			event: 'TUTORIAL_FINISHED'
		},
		begin: {},
		end: {},
		helpers: [],
		rewards: [
			{
				type: 'gold',
				amount: 1000
			}
		]
	}
};

export function getTutorialObjective(progression: number): TutorialObjective | null {
	const key = tutorialObjectiveKeys[progression];
	return key ? tutorialObjectives[key] : null;
}
