import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { monsterByKey } from '../../monster/monsterKeyMap.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const condition = (value: string) => parseCondition(value);

/**
 * Garde affiché à la Citadelle avant la première
 * audience auprès du Roi des Rockys.
 *
 * Le dialogue reste disponible tant que la progression
 * Magnétite est égale à 0.
 */
export const sGardeMagnetFirstDialog = defineDialog({
	id: 'sGarde_magnet0',
	place: PlaceEnum.CITADELLE_DU_ROI,
	name: 'npc.sGarde.name',
	pnj: {
		image: false,
		gfx: 'sgarde',
		frame: 'speak',
		background: '1'
	},
	cond: condition('scenario(magnet,0)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.sGarde.dialog.magnet0.begin'
		}
	},
	links: {}
});

/**
 * Première audience auprès du Roi des Rockys.
 *
 * Le dialogue est disponible à la progression 1.
 *
 * Refuser :
 * - termine simplement le dialogue ;
 * - conserve magnet = 1.
 *
 * Accepter :
 * - permet de terminer toute la conversation ;
 * - passe magnet de 1 à 2 dans la phase leave.
 */
export const rockyKingMagnetiteIntroDialog = defineDialog({
	id: 'rocky_king_magnet1',
	place: PlaceEnum.CITADELLE_DU_ROI,
	name: 'npc.rockyKing.name',
	cond: condition('scenario(magnet,1)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'rocking',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.rockyKing.dialog.magnet1.begin',
			next: ['enter'],
			fast: true
		},
		enter: {
			id: 'enter',
			text: 'npc.rockyKing.dialog.magnet1.enter',
			next: ['events']
		},
		events: {
			id: 'events',
			text: 'npc.rockyKing.dialog.magnet1.events',
			next: ['magnet']
		},
		magnet: {
			id: 'magnet',
			text: 'npc.rockyKing.dialog.magnet1.magnet',
			next: ['magnet2']
		},
		magnet2: {
			id: 'magnet2',
			text: 'npc.rockyKing.dialog.magnet1.magnet2',
			next: ['events2']
		},
		events2: {
			id: 'events2',
			text: 'npc.rockyKing.dialog.magnet1.events2',
			next: ['again', 'me']
		},
		me: {
			id: 'me',
			text: 'npc.rockyKing.dialog.magnet1.me',
			next: ['team']
		},
		team: {
			id: 'team',
			text: 'npc.rockyKing.dialog.magnet1.team',
			next: ['team2']
		},
		team2: {
			id: 'team2',
			text: 'npc.rockyKing.dialog.magnet1.team2',
			next: ['again2', 'accept', 'refuse']
		},
		refuse: {
			id: 'refuse',
			text: 'npc.rockyKing.dialog.magnet1.refuse'
		},
		accept: {
			id: 'accept',
			text: 'npc.rockyKing.dialog.magnet1.accept',
			next: ['leave']
		},
		leave: {
			id: 'leave',
			text: 'npc.rockyKing.dialog.magnet1.leave',
			fast: true,
			/**
			 * La progression ne change qu'après
			 * avoir accepté puis terminé l'audience.
			 */
			effects: [
				{
					type: 'scenario',
					scenario: 'magnet',
					phase: 2
				}
			]
		}
	},
	links: {
		enter: {
			id: 'enter',
			text: 'npc.rockyKing.choice.magnet1.enter'
		},
		events: {
			id: 'events',
			text: 'npc.rockyKing.choice.magnet1.events'
		},
		magnet: {
			id: 'magnet',
			text: 'npc.rockyKing.choice.magnet1.magnet'
		},
		magnet2: {
			id: 'magnet2',
			text: 'npc.rockyKing.choice.magnet1.magnet2'
		},
		events2: {
			id: 'events2',
			text: 'npc.rockyKing.choice.magnet1.events2'
		},
		/**
		 * Retour vers la phase events.
		 */
		again: {
			id: 'again',
			text: 'npc.rockyKing.choice.magnet1.again',
			target: 'events'
		},
		me: {
			id: 'me',
			text: 'npc.rockyKing.choice.magnet1.me'
		},
		team: {
			id: 'team',
			text: 'npc.rockyKing.choice.magnet1.team'
		},
		team2: {
			id: 'team2',
			text: 'npc.rockyKing.choice.magnet1.team2'
		},
		/**
		 * Recommence l'explication à partir
		 * du rapport avec le joueur.
		 */
		again2: {
			id: 'again2',
			text: 'npc.rockyKing.choice.magnet1.again2',
			target: 'me'
		},
		accept: {
			id: 'accept',
			text: 'npc.rockyKing.choice.magnet1.accept'
		},
		refuse: {
			id: 'refuse',
			text: 'npc.rockyKing.choice.magnet1.refuse'
		},
		leave: {
			id: 'leave',
			text: 'npc.rockyKing.choice.magnet1.leave'
		}
	}
});

/**
 * Apparition du Rôdeur étrange pendant le scénario Magnétite.
 *
 * Conditions originales :
 * - scénario magnet à la progression 2 ;
 * - le Dinoz actif ne possède pas encore rodtmp.
 *
 * Après l'interaction, rodtmp est ajouté au Dinoz actif.
 * La progression du scénario reste à 2.
 */
export const magnetiteStrangeRangerDialog = defineDialog({
	id: 'magnetite_strange_ranger',
	place: PlaceEnum.SYPHON_SIFFLEUR,
	name: 'npc.rodeur.name',
	cond: condition('scenario(magnet,2)+!fx(rodtmp)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'rodeur2',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.rodeur.dialog.magnet2.begin',
			next: ['view']
		},
		view: {
			id: 'view',
			text: 'npc.rodeur.dialog.magnet2.view',
			next: [],
			fast: true,
			effects: [
				{
					type: 'effect',
					effect: 'rodtmp'
				}
			]
		}
	},
	links: {
		view: {
			id: 'view',
			text: 'npc.rodeur.choice.magnet2View'
		}
	}
});

export const magnetiteTeamWCaptainDialog = defineDialog({
	id: 'magnetite_team_w_captain',
	place: PlaceEnum.REPAIRE_DE_LA_TEAM_W,
	name: 'npc.teamWCaptain.name',
	cond: condition('scenario(magnet,6)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'wteamc',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.teamWCaptain.dialog.magnet6.begin',
			next: ['who']
		},
		who: {
			id: 'who',
			text: 'npc.teamWCaptain.dialog.magnet6.who',
			next: ['dont', 'tell']
		},
		dont: {
			id: 'dont',
			text: 'npc.teamWCaptain.dialog.magnet6.dont',
			next: ['dont2', 'tell']
		},
		dont2: {
			id: 'dont2',
			text: 'npc.teamWCaptain.dialog.magnet6.dont2',
			next: []
		},
		tell: {
			id: 'tell',
			text: 'npc.teamWCaptain.dialog.magnet6.tell',
			next: ['hist1'],
			fast: true
		},
		hist1: {
			id: 'hist1',
			text: 'npc.teamWCaptain.dialog.magnet6.hist1',
			next: ['hist2']
		},
		hist2: {
			id: 'hist2',
			text: 'npc.teamWCaptain.dialog.magnet6.hist2',
			next: ['hist3']
		},
		hist3: {
			id: 'hist3',
			text: 'npc.teamWCaptain.dialog.magnet6.hist3',
			next: ['hist4']
		},
		hist4: {
			id: 'hist4',
			text: 'npc.teamWCaptain.dialog.magnet6.hist4',
			next: ['hist5']
		},
		hist5: {
			id: 'hist5',
			text: 'npc.teamWCaptain.dialog.magnet6.hist5',
			next: ['ask', 'again']
		},
		ask: {
			id: 'ask',
			text: 'npc.teamWCaptain.dialog.magnet6.ask',
			next: ['yes', 'no']
		},
		no: {
			id: 'no',
			text: 'npc.teamWCaptain.dialog.magnet6.no',
			next: []
		},
		yes: {
			id: 'yes',
			text: 'npc.teamWCaptain.dialog.magnet6.yes',
			next: [],
			effects: [
				{
					type: 'scenario',
					scenario: 'magnet',
					phase: 7
				}
			]
		}
	},
	links: {
		who: {
			id: 'who',
			text: 'npc.teamWCaptain.choice.magnet6.who'
		},
		dont: {
			id: 'dont',
			text: 'npc.teamWCaptain.choice.magnet6.dont'
		},
		tell: {
			id: 'tell',
			text: 'npc.teamWCaptain.choice.magnet6.tell'
		},
		dont2: {
			id: 'dont2',
			text: 'npc.teamWCaptain.choice.magnet6.dont2'
		},
		hist1: {
			id: 'hist1',
			text: 'npc.teamWCaptain.choice.continue'
		},
		hist2: {
			id: 'hist2',
			text: 'npc.teamWCaptain.choice.continue'
		},
		hist3: {
			id: 'hist3',
			text: 'npc.teamWCaptain.choice.continue'
		},
		hist4: {
			id: 'hist4',
			text: 'npc.teamWCaptain.choice.continue'
		},
		hist5: {
			id: 'hist5',
			text: 'npc.teamWCaptain.choice.continue'
		},
		ask: {
			id: 'ask',
			text: 'npc.teamWCaptain.choice.magnet6.ask'
		},
		again: {
			id: 'again',
			text: 'npc.teamWCaptain.choice.magnet6.again',
			target: 'hist1'
		},
		yes: {
			id: 'yes',
			text: 'npc.teamWCaptain.choice.magnet6.yes'
		},
		no: {
			id: 'no',
			text: 'npc.teamWCaptain.choice.magnet6.no'
		}
	}
});

export const magnetiteTeamWCaptainWaitingDialog = defineDialog({
	id: 'magnetite_team_w_captain_waiting',
	place: PlaceEnum.REPAIRE_DE_LA_TEAM_W,
	name: 'npc.teamWCaptain.name',
	cond: condition('scenario(magnet,7)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'wteamc',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.teamWCaptain.dialog.magnet7.begin',
			next: []
		}
	},
	links: {}
});

/**
 * Seconde audience auprès du Roi des Rockys.
 *
 * Le dialogue devient disponible après que le joueur
 * a accepté de défendre la cause de la Team-W :
 * - magnet = 7 ;
 * - il reste rejouable à magnet = 8.
 *
 * À la fin de l'audience, le Roi demande au joueur de :
 * - réunir les trois ingrédients perpétuels ;
 * - trouver le Sage Antique ;
 * - obtenir la Potion Anti Sehd.
 *
 * La phase bye passe la progression à magnet = 8.
 */
export const rockyKingMagnetiteSehdDialog = defineDialog({
	id: 'rocky_king_magnet7',
	place: PlaceEnum.CITADELLE_DU_ROI,
	name: 'npc.rockyKing.name',
	cond: condition('scenario(magnet,7)|scenario(magnet,8)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'rocking',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.rockyKing.dialog.magnet7.begin',
			next: ['next']
		},
		next: {
			id: 'next',
			text: 'npc.rockyKing.dialog.magnet7.next',
			next: ['talk']
		},
		talk: {
			id: 'talk',
			text: 'npc.rockyKing.dialog.magnet7.talk',
			next: ['cont'],
			fast: true
		},
		cont: {
			id: 'cont',
			text: 'npc.rockyKing.dialog.magnet7.cont',
			next: ['serv']
		},
		serv: {
			id: 'serv',
			text: 'npc.rockyKing.dialog.magnet7.serv',
			next: ['sehd']
		},
		sehd: {
			id: 'sehd',
			text: 'npc.rockyKing.dialog.magnet7.sehd',
			next: ['control']
		},
		control: {
			id: 'control',
			text: 'npc.rockyKing.dialog.magnet7.control',
			next: ['serv2']
		},
		serv2: {
			id: 'serv2',
			text: 'npc.rockyKing.dialog.magnet7.serv2',
			next: ['ingr']
		},
		ingr: {
			id: 'ingr',
			text: 'npc.rockyKing.dialog.magnet7.ingr',
			next: ['sage']
		},
		sage: {
			id: 'sage',
			text: 'npc.rockyKing.dialog.magnet7.sage',
			next: ['face']
		},
		face: {
			id: 'face',
			text: 'npc.rockyKing.dialog.magnet7.face',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.rockyKing.dialog.magnet7.end',
			next: ['bye']
		},
		bye: {
			id: 'bye',
			text: 'npc.rockyKing.dialog.magnet7.bye',
			fast: true,
			effects: [
				{
					type: 'scenario',
					scenario: 'magnet',
					phase: 8
				}
			]
		}
	},
	links: {
		next: {
			id: 'next',
			text: 'npc.rockyKing.choice.magnet7.next'
		},
		talk: {
			id: 'talk',
			text: 'npc.rockyKing.choice.magnet7.talk'
		},
		cont: {
			id: 'cont',
			text: 'npc.rockyKing.choice.magnet7.cont'
		},
		serv: {
			id: 'serv',
			text: 'npc.rockyKing.choice.magnet7.serv'
		},
		sehd: {
			id: 'sehd',
			text: 'npc.rockyKing.choice.magnet7.sehd'
		},
		control: {
			id: 'control',
			text: 'npc.rockyKing.choice.magnet7.control'
		},
		serv2: {
			id: 'serv2',
			text: 'npc.rockyKing.choice.magnet7.serv2'
		},
		ingr: {
			id: 'ingr',
			text: 'npc.rockyKing.choice.magnet7.ingr'
		},
		sage: {
			id: 'sage',
			text: 'npc.rockyKing.choice.magnet7.sage'
		},
		face: {
			id: 'face',
			text: 'npc.rockyKing.choice.magnet7.face'
		},
		end: {
			id: 'end',
			text: 'npc.rockyKing.choice.magnet7.end'
		},
		bye: {
			id: 'bye',
			text: 'npc.rockyKing.choice.magnet7.bye'
		}
	}
});

/**
 * Appel à l'aide du Garde de la Citadelle.
 *
 * Ce dialogue devient disponible après le vol
 * de la Potion Anti-Sehd et le retour à la Citadelle.
 *
 * Le déclenchement réel du combat final sera ajouté
 * dans l'étape consacrée au combat scénarisé.
 */
export const magnetiteCitadelGuardAssaultDialog = defineDialog({
	id: 'magnetite_citadel_guard_assault',
	place: PlaceEnum.CITADELLE_DU_ROI,
	name: 'npc.sGarde.name',
	cond: condition('scenario(magnet,10)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'sgarde',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.sGarde.dialog.magnet10.begin',
			next: ['fight', 'no']
		},
		fight: {
			id: 'fight',
			text: 'npc.sGarde.dialog.magnet10.fight',
			special: [
				{
					type: 'startFight',
					/**
					 * Le monstre déclaré ici permet au moteur
					 * de dialogue d'identifier cette phase
					 * comme une phase de combat.
					 *
					 * La composition complète est construite
					 * côté serveur par le contrôleur Magnétite.
					 */
					fightId: [monsterByKey.wbour2]
				}
			]
		},
		no: {
			id: 'no',
			text: 'npc.sGarde.dialog.magnet10.no'
		}
	},
	links: {
		fight: {
			id: 'fight',
			text: 'npc.sGarde.choice.magnet10.fight'
		},
		no: {
			id: 'no',
			text: 'npc.sGarde.choice.magnet10.no'
		}
	}
});

/**
 * Dialogue de reprise après la victoire
 * à la Citadelle Royale.
 *
 * Le dialogue séparé permet au joueur de reprendre
 * les explications du Capitaine si la conversation
 * ouverte après le combat a été interrompue.
 *
 * La dernière phase fait passer le scénario
 * de magnet = 11 à magnet = 12.
 */
export const magnetiteTeamWCaptainDebriefDialog = defineDialog({
	id: 'magnetite_team_w_captain_debrief',
	place: PlaceEnum.CITADELLE_DU_ROI,
	name: 'npc.teamWCaptain.name',
	cond: condition('scenario(magnet,11)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'wteamc',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.teamWCaptain.dialog.magnet11.begin',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.teamWCaptain.dialog.magnet11.ok',
			next: ['thanks']
		},
		thanks: {
			id: 'thanks',
			text: 'npc.teamWCaptain.dialog.magnet11.thanks',
			next: ['how']
		},
		how: {
			id: 'how',
			text: 'npc.teamWCaptain.dialog.magnet11.how',
			next: ['not']
		},
		not: {
			id: 'not',
			text: 'npc.teamWCaptain.dialog.magnet11.not',
			next: ['thanks2']
		},
		thanks2: {
			id: 'thanks2',
			text: 'npc.teamWCaptain.dialog.magnet11.thanks2',
			fast: true,
			effects: [
				{
					type: 'scenario',
					scenario: 'magnet',
					phase: 12
				}
			]
		}
	},
	links: {
		ok: {
			id: 'ok',
			text: 'npc.teamWCaptain.choice.magnet11.ok'
		},
		thanks: {
			id: 'thanks',
			text: 'npc.teamWCaptain.choice.magnet11.thanks'
		},
		how: {
			id: 'how',
			text: 'npc.teamWCaptain.choice.magnet11.how'
		},
		not: {
			id: 'not',
			text: 'npc.teamWCaptain.choice.magnet11.not'
		},
		thanks2: {
			id: 'thanks2',
			text: 'npc.teamWCaptain.choice.magnet11.thanks2'
		}
	}
});
