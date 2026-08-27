import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

const baoPnj = {
	image: false,
	gfx: 'bob',
	frame: 'blabla',
	background: '2'
};

export const introPortDialog: DialogDefinition = {
	id: 'intro_port',
	name: 'npc.intro.names.barPatron',
	place: PlaceEnum.PORT_DE_PRECHE,
	cond: parseCondition('scenario(intro,1)'),
	pnj: {
		image: false,
		gfx: 'pilier',
		frame: 'speak',
		background: '1'
	},
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.intro.port.dialog.begin',
			next: ['poivrot']
		},
		poivrot: {
			id: 'poivrot',
			text: 'npc.intro.port.dialog.poivrot',
			next: ['bao']
		},
		bao: {
			id: 'bao',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.port.dialog.bao',
			next: ['guerre'],
			pnj: baoPnj
		},
		guerre: {
			id: 'guerre',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.port.dialog.guerre',
			next: ['boit'],
			pnj: baoPnj
		},
		boit: {
			id: 'boit',
			name: 'npc.intro.names.barPatron',
			text: 'npc.intro.port.dialog.boit',
			next: ['glop'],
			pnj: {
				gfx: 'pilier'
			}
		},
		glop: {
			id: 'glop',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.port.dialog.glop',
			next: ['raison'],
			pnj: baoPnj
		},
		raison: {
			id: 'raison',
			name: 'npc.intro.names.barPatron',
			text: 'npc.intro.port.dialog.raison',
			next: ['gloups'],
			pnj: {
				gfx: 'pilier'
			}
		},
		gloups: {
			id: 'gloups',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.port.dialog.gloups',
			next: ['explo'],
			pnj: {
				gfx: 'bob',
				frame: 'boom',
				background: '2'
			}
		},
		explo: {
			id: 'explo',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.port.dialog.explo',
			next: ['fight'],
			pnj: baoPnj
		},
		fight: {
			id: 'fight',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.port.dialog.fight',
			next: [],
			pnj: baoPnj,
			special: [
				{
					type: 'fightGroup',
					monsters: ['darki1'],
					friends: ['bao']
				}
			]
		},
		fight_win: {
			id: 'fight_win',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.port.dialog.fightWin',
			next: ['fin'],
			pnj: baoPnj,
			effects: [
				{
					type: 'scenario',
					scenario: 'intro',
					phase: 2
				},
				{
					type: 'tutorialRefresh'
				}
			]
		},
		fin: {
			id: 'fin',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.port.dialog.fin',
			next: [],
			pnj: baoPnj,
			effects: [
				{
					type: 'moveRandom',
					places: [PlaceEnum.ILE_WAIKIKI],
					all: true
				}
			]
		}
	},
	links: {
		poivrot: {
			id: 'poivrot',
			text: 'npc.intro.port.choice.poivrot',
			target: 'poivrot'
		},
		bao: {
			id: 'bao',
			text: 'npc.intro.port.choice.bao',
			target: 'bao'
		},
		guerre: {
			id: 'guerre',
			text: 'npc.intro.port.choice.guerre',
			target: 'guerre'
		},
		boit: {
			id: 'boit',
			text: 'npc.intro.port.choice.boit',
			target: 'boit'
		},
		glop: {
			id: 'glop',
			text: 'npc.intro.port.choice.glop',
			target: 'glop'
		},
		raison: {
			id: 'raison',
			text: 'npc.intro.port.choice.raison',
			target: 'raison'
		},
		gloups: {
			id: 'gloups',
			text: 'npc.intro.port.choice.gloups',
			target: 'gloups'
		},
		explo: {
			id: 'explo',
			text: 'npc.intro.port.choice.explo',
			target: 'explo'
		},
		fight: {
			id: 'fight',
			text: 'npc.intro.port.choice.fight',
			target: 'fight'
		},
		fin: {
			id: 'fin',
			text: 'npc.intro.port.choice.fin',
			target: 'fin'
		}
	}
};

export const introPortEscortDialog: DialogDefinition = {
	id: 'intro_port_escort',
	name: 'npc.intro.names.baoBobFormal',
	place: PlaceEnum.PORT_DE_PRECHE,
	cond: parseCondition('scenario(intro,2+)+scenario(intro,5-)'),
	pnj: baoPnj,
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.intro.portEscort.dialog.begin',
			next: ['go']
		},
		go: {
			id: 'go',
			text: 'npc.intro.portEscort.dialog.go',
			fast: true,
			next: [],
			pnj: {
				frame: 'stop'
			},
			effects: [
				{
					type: 'moveRandom',
					places: [PlaceEnum.ILE_WAIKIKI],
					all: true
				}
			]
		}
	},
	links: {
		go: {
			id: 'go',
			text: 'npc.intro.portEscort.choice.go',
			target: 'go'
		}
	}
};

export const introWaikikiDialog: DialogDefinition = {
	id: 'intro_waikiki',
	name: 'npc.intro.names.baoBobFormal',
	place: PlaceEnum.ILE_WAIKIKI,
	cond: parseCondition('scenario(intro,2)'),
	pnj: {
		...baoPnj,
		background: '3'
	},
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.intro.waikiki.dialog.begin',
			next: ['pop']
		},
		pop: {
			id: 'pop',
			text: 'npc.intro.waikiki.dialog.pop',
			next: ['combat']
		},
		fight: {
			id: 'fight',
			text: 'npc.intro.waikiki.dialog.fight',
			next: [],
			special: [
				{
					type: 'fightGroup',
					monsters: ['darki2'],
					friends: ['bao']
				}
			]
		},
		fight_win: {
			id: 'fight_win',
			text: 'npc.intro.waikiki.dialog.fightWin',
			next: ['papy'],
			effects: [
				{
					type: 'scenario',
					scenario: 'intro',
					phase: 3
				},
				{
					type: 'tutorialRefresh'
				}
			]
		},
		papy: {
			id: 'papy',
			name: 'npc.intro.names.baoBob',
			text: 'npc.intro.waikiki.dialog.papy',
			next: ['papy2'],
			pnj: {
				gfx: 'papy',
				frame: 'flou',
				background: '2'
			}
		},
		papy2: {
			id: 'papy2',
			text: 'npc.intro.waikiki.dialog.papy2',
			next: [],
			pnj: {
				frame: 'stop'
			}
		}
	},
	links: {
		pop: {
			id: 'pop',
			text: 'npc.intro.waikiki.choice.pop',
			target: 'pop'
		},
		combat: {
			id: 'combat',
			text: 'npc.intro.waikiki.choice.combat',
			target: 'fight'
		},
		papy: {
			id: 'papy',
			text: 'npc.intro.waikiki.choice.papy',
			target: 'papy'
		},
		papy2: {
			id: 'papy2',
			text: 'npc.intro.waikiki.choice.papy2',
			target: 'papy2'
		}
	}
};

export const introSwampDialog: DialogDefinition = {
	id: 'intro_swamp',
	name: 'npc.intro.names.baoBobFormal',
	place: PlaceEnum.MARAIS_COLLANT,
	cond: parseCondition('scenario(intro,3)'),
	pnj: {
		...baoPnj,
		background: '3'
	},
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.intro.swamp.dialog.begin',
			next: ['baston']
		},
		baston: {
			id: 'baston',
			text: 'npc.intro.swamp.dialog.baston',
			next: ['battle']
		},
		battle: {
			id: 'battle',
			text: 'npc.intro.swamp.dialog.battle',
			next: ['fight']
		},
		fight: {
			id: 'fight',
			text: 'npc.intro.swamp.dialog.fight',
			next: [],
			special: [
				{
					type: 'fightGroup',
					monsters: ['darki3', 'darki2'],
					friends: ['bao']
				}
			]
		},
		fight_win: {
			id: 'fight_win',
			text: 'npc.intro.swamp.dialog.fightWin',
			next: ['zenith'],
			effects: [
				{
					type: 'scenario',
					scenario: 'intro',
					phase: 4
				},
				{
					type: 'tutorialRefresh'
				}
			]
		},
		zenith: {
			id: 'zenith',
			name: 'npc.intro.names.baoBob',
			text: 'npc.intro.swamp.dialog.zenith',
			next: ['zenith2'],
			pnj: {
				gfx: 'zenit',
				frame: 'flou',
				background: '3'
			}
		},
		zenith2: {
			id: 'zenith2',
			text: 'npc.intro.swamp.dialog.zenith2',
			next: [],
			pnj: {
				frame: 'stop'
			}
		}
	},
	links: {
		baston: {
			id: 'baston',
			text: 'npc.intro.swamp.choice.baston',
			target: 'baston'
		},
		battle: {
			id: 'battle',
			text: 'npc.intro.swamp.choice.battle',
			target: 'battle'
		},
		fight: {
			id: 'fight',
			text: 'npc.intro.swamp.choice.fight',
			target: 'fight'
		},
		zenith: {
			id: 'zenith',
			text: 'npc.intro.swamp.choice.zenith',
			target: 'zenith'
		},
		zenith2: {
			id: 'zenith2',
			text: 'npc.intro.swamp.choice.zenith2',
			target: 'zenith2'
		}
	}
};

export const introFallsBaoDialog: DialogDefinition = {
	id: 'intro_falls_bao',
	name: 'npc.intro.names.baoBobFormal',
	place: PlaceEnum.CHUTES_MUTANTES,
	cond: parseCondition('scenario(intro,4)'),
	pnj: {
		...baoPnj,
		background: '4'
	},
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.intro.fallsBao.dialog.begin',
			next: ['shaman']
		},
		shaman: {
			id: 'shaman',
			name: 'npc.intro.names.baoBob',
			text: 'npc.intro.fallsBao.dialog.shaman',
			next: ['gard'],
			pnj: {
				gfx: 'shaman',
				frame: 'flou',
				background: '4'
			}
		},
		gard: {
			id: 'gard',
			text: 'npc.intro.fallsBao.dialog.gard',
			next: ['aura']
		},
		aura: {
			id: 'aura',
			text: 'npc.intro.fallsBao.dialog.aura',
			next: [],
			pnj: {
				frame: 'grr'
			},
			effects: [
				{
					type: 'scenario',
					scenario: 'intro',
					phase: 5
				},
				{
					type: 'tutorialRefresh'
				}
			]
		}
	},
	links: {
		shaman: {
			id: 'shaman',
			text: 'npc.intro.fallsBao.choice.shaman',
			target: 'shaman'
		},
		gard: {
			id: 'gard',
			text: 'npc.intro.fallsBao.choice.gard',
			target: 'gard'
		},
		aura: {
			id: 'aura',
			text: 'npc.intro.fallsBao.choice.aura',
			target: 'aura'
		}
	}
};

export const introFallsTaurusDialog: DialogDefinition = {
	id: 'intro_falls_taurus',
	name: 'npc.intro.names.unknown',
	place: PlaceEnum.CHUTES_MUTANTES,
	cond: parseCondition('scenario(intro,5)'),
	pnj: {
		image: false,
		gfx: 'taurus',
		frame: 'stop',
		background: '4'
	},
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.intro.fallsTaurus.dialog.begin',
			next: ['taurus']
		},
		taurus: {
			id: 'taurus',
			name: 'npc.intro.names.taurus',
			text: 'npc.intro.fallsTaurus.dialog.taurus',
			next: ['vade'],
			pnj: {
				frame: 'blabla'
			}
		},
		vade: {
			id: 'vade',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.fallsTaurus.dialog.vade',
			next: ['demon'],
			pnj: {
				gfx: 'taurus',
				frame: 'grr',
				background: '4'
			}
		},
		fight: {
			id: 'fight',
			name: 'npc.intro.names.taurus',
			text: 'npc.intro.fallsTaurus.dialog.fight',
			next: [],
			pnj: {
				gfx: 'taurus',
				frame: 'blabla',
				background: '4'
			},
			special: [
				{
					type: 'fightGroup',
					monsters: ['taurus'],
					friends: ['bao']
				}
			]
		},
		fight_win: {
			id: 'fight_win',
			name: 'npc.intro.names.taurus',
			text: 'npc.intro.fallsTaurus.dialog.fightWin',
			next: ['ouf'],
			effects: [
				{
					type: 'scenario',
					scenario: 'intro',
					phase: 6
				},
				{
					type: 'tutorialRefresh'
				}
			]
		},
		ouf: {
			id: 'ouf',
			name: 'npc.intro.names.baoBobFormal',
			text: 'npc.intro.fallsTaurus.dialog.ouf',
			next: ['move'],
			pnj: {
				gfx: 'bob',
				frame: 'blabla',
				background: '4'
			},
			effects: [
				{
					type: 'collection',
					collection: 'taurus'
				}
			]
		},
		move: {
			id: 'move',
			text: 'npc.intro.fallsTaurus.dialog.move',
			next: [],
			effects: [
				{
					type: 'moveRandom',
					places: [PlaceEnum.DINOVILLE],
					all: true
				}
			]
		}
	},
	links: {
		taurus: {
			id: 'taurus',
			text: 'npc.intro.fallsTaurus.choice.taurus',
			target: 'taurus'
		},
		vade: {
			id: 'vade',
			text: 'npc.intro.fallsTaurus.choice.vade',
			target: 'vade'
		},
		demon: {
			id: 'demon',
			text: 'npc.intro.fallsTaurus.choice.demon',
			target: 'fight'
		},
		ouf: {
			id: 'ouf',
			text: 'npc.intro.fallsTaurus.choice.ouf',
			target: 'ouf'
		},
		move: {
			id: 'move',
			text: 'npc.intro.fallsTaurus.choice.move',
			target: 'move'
		}
	}
};
