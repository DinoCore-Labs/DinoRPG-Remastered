import { StatTracking } from '../enums/StatsTracking.js';
import { Goal } from './goalsType.js';

export const goals: Record<StatTracking, Goal> = {
	[StatTracking.PERLE]: {
		id: StatTracking.PERLE,
		name: {
			EN: 'Fountain Pearl',
			FR: 'Perle DE la Fontaine',
			DE: 'Perle aus dem Brunnen',
			ES: 'Perla DE la Fuente'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_perle.gif'
			}
		],
		description: {
			EN: 'The Fountain Pearl allows your dinoz to regenerate health every day at the Fountain of Youth.',
			FR: 'La perle DE la Fontaine permet à tous vos Dinoz DE pouvoir se régénerer chaque jour à la Fontaine DE Jouvence.',
			DE: 'Mit der Perle aus dem Brunnen können alle deine Dinoz sich jeden Tag am Jungbrunnen erholen.',
			ES: 'La Perla DE la Fuente permite a todos tus Dinos regenerarse cada día EN la Fuente DE la Juventud.'
		}
	},
	[StatTracking.PTEROZ]: {
		id: StatTracking.PTEROZ,
		name: {
			EN: 'Pteroz Trophy',
			FR: 'Trophée des Pteroz',
			DE: 'Trophäe der Pteroz',
			ES: 'Trofeo DE los Teroz'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_pteroz.gif'
			}
		],
		description: {
			EN: 'The Pteroz Trophy is awarded to players who have defeated the strange Pteroz. It also unlocks the Pteroz, making it available to buy in the Dinoz Shop.',
			FR: 'Le Trophée des Pteroz récompense les joueurs ayant vaincu le Ptéroz étrange, et donne accès aux Pteroz parmi les Dinoz disponibles dans la Boutique.',
			DE: 'Die Trophäe der Pteroz ist eine Belohung für Spieler, die den seltsamen Pteroz besiegt haben. Damit habt ihr im Geschäft die Möglichkeit, Pteroz als neue Dinogattung zu kaufen.',
			ES: 'El Trofeo DE los Teroz recompensa a los jugadores que hayan vencido al Teroz extraño. Asimismo, este objeto da acceso a la compra DE los Dinos Teroz EN la Tienda.'
		}
	},
	[StatTracking.HIPPO]: {
		id: StatTracking.HIPPO,
		name: {
			EN: 'Hippoclamps Trophy',
			FR: 'Trophée des Hippoclamps',
			DE: 'Trophäe der Hippoklampen',
			ES: 'Trofeo DE los Hippoclamp'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_hippo.gif'
			}
		],
		description: {
			EN: 'The Hippoclamps Trophy is awarded to players who have defeated the wild Hippoclamp. It also unlocks the Hippoclamps, making it available to buy in the Dinoz Shop.',
			FR: "Le Trophée des Hippoclamps récompense les joueurs ayant vaincu l'Hippoclamp sauvage, et donne accès aux Hippoclamps parmi les Dinoz disponibles dans la Boutique.",
			DE: 'Die Trophäe der Hippoklampen ist eine Belohnung für Spieler, die den wilden Hippoklampus besiegt haben. Damit habt ihr im Geschäft die Möglichkeit, Hippoklampen als neue Dinozgattung zu kaufen.',
			ES: 'El Trofeo DE los Hippoclamps recompensa a los jugadores que hayan vencido al Hippoclamp salvaje. Asimismo, este objeto da acceso a la compra DE los Dinos Hippoclamp EN la Tienda.'
		}
	},
	[StatTracking.ROCKY]: {
		id: StatTracking.ROCKY,
		name: {
			EN: 'Rockies Trophy',
			FR: 'Trophée des Rockys',
			DE: 'Trophäe der Rockys',
			ES: 'Trofeo DE los Rokkys'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_rocky.gif'
			}
		],
		description: {
			EN: 'The Rockies Trophy is awarded to players who have defeated the sleeping Rocky. It also unlocks the Rocky, making it available to buy in the Dinoz Shop.',
			FR: 'Le Trophée des Rockys récompense les joueurs ayant vaincu le Rocky endormi, et donne accès aux Rockys parmi les Dinoz disponibles dans la Boutique.',
			DE: 'Die Trophäe der Rockys ist eine Belohnung für Spieler, die den schläfrigen Rocky besiegt haben. Damit habt ihr im Geschäft die Möglichkeit, Rockys als neue Dinozgattung zu kaufen.',
			ES: 'El Trofeo DE los Rokkys recompensa a los jugadores que hayan vencido al Rokky dormido. Asimismo, este objeto da acceso a la compra DE los Dinos Rokky EN la Tienda.'
		}
	},
	[StatTracking.QUETZU]: {
		id: StatTracking.QUETZU,
		name: {
			EN: 'Quetzu Trophy',
			FR: 'Trophée des Quetzus',
			DE: 'Trophäe der Quetzu',
			ES: 'Trofeo DE los Quetzu'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_quetzu.gif'
			}
		],
		description: {
			EN: 'The Quetzu Trophy is given by Mandragore to players who have defeated the Archdorogon Grizorg. This unlocks the Quetzu, making it available to buy in the Dinoz shop.',
			FR: "Le Trophée des Quetzus a été remis par Mandragore aux joueurs ayant vaincu l'Archidorogon Grizorg, il donne accès aux Quetzu parmi les Dinoz disponibles dans la Boutique.",
			DE: 'Die Trophäe wurde dir von Mandragore nach dem Sieg über den Erzdorogon Grizorg verliehen. Sie gewährt dir u.a. Zugriff auf Quetzu im Dinoz-Geschäft.',
			ES: 'El Trofeo DE los Quetzu ha sido entregado por Mandrágora a los Maestros que hayan vencido al Archidorogón Grizorg. Da acceso al Dino Quetzu EN la Tienda.'
		}
	},
	[StatTracking.TOUR]: {
		id: StatTracking.TOUR,
		name: {
			EN: 'Dinoland Tour',
			FR: 'Tour DE Dinoland',
			DE: 'Dinolandtour',
			ES: 'Vuelta al mundo DE Dinoland'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 200,
				icon: 'collec_tour.gif'
			}
		],
		description: {
			EN: 'This yellow shirt is awarded for your participation in the Dinoland Tour! You are now one of the great Dinoland explorers.',
			FR: 'Ce maillot jaune vous récompense pour votre magnifique Tour DE Dinoland ! Vous faites désormais partie des grands explorateurs DE Dinoland.',
			DE: 'Dieses gelbe Trikot ist die Belohnung für deine großartige Dinolandtour! Du gehörst nun zu den großen Dinolanderforschern.',
			ES: 'Este maillot amarillo te recompensa por la vuelta al mundo DE Dinoland. Ya formas parte DE los grandes exploradores DE Dinoland.'
		}
	},
	[StatTracking.VENER]: {
		id: StatTracking.VENER,
		name: {
			EN: 'Venerable Eye',
			FR: "L'oeil du Vénérable",
			DE: 'Das Auge des Ehrwürdigen',
			ES: 'El ojo del Venerable'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 300,
				icon: 'collec_vener.gif'
			}
		],
		description: {
			EN: 'The Venerable Eye is an extremely rare item. Only the finest warriors can possess it! People say that it has incredibly powerful magical abilities.',
			FR: "L'Oeil du Vénérable est un objet extrêmement rare. Seuls les plus grands Guerriers peuvent l'obtenir ! On raconte qu'il aurait des propriétés magiques incroyablement puissantes...",
			DE: 'Das Auge des Ehrwürdigen ist ein extrem seltener Gegenstand. Nur die größten Krieger können ihn erhalten! Es wird erzählt, dass er unglaublich starke magische Eigenschaften hätte.',
			ES: 'El Ojo del Venerable ES un objeto extremadamente raro. Solo los más grandes Guerreros consiguen obtenerlo. Se dice que tiene propiedades mágicas increíblemente poderosas.'
		}
	},
	[StatTracking.TAURUS]: {
		id: StatTracking.TAURUS,
		name: {
			EN: 'Taurus the magnificent',
			FR: 'Taurus le magnifique',
			DE: 'Der fantastische Taurus',
			ES: 'Taurus el Magnífico'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_taurus.gif'
			}
		],
		description: {
			EN: "You helped Baobob to dispatch Taurus, the infamous Moueffe, to the depths of the Dark World. You're not ready to meet him again yet, although word of your courage is already spreading throughout Dinoland.",
			FR: "Vous avez aidé Baobob à refouler le puissant Moueffe infernal Taurus dans les profondeurs du Monde Sombre. Vous n'êtes pas prêt DE le revoir, votre courage commence déjà à traverser les frontières DE Dinoland.",
			DE: 'Du hast Bao Bob dabei geholfen, den mächtigen und teuflischen Moeffe Taurus zurück in die Tiefen der dunklen Welt zu schicken. Du bist nicht bereit, ihn wiederzusehen. Dein Mut überschreitet bereits die Grenzen von Dinoland.',
			ES: 'Has ayudado a Baobob a enviar al poderoso e infernal Moueffe Taurus a las profundidades del Mundo Sombra. Las historias sobre esta hazaña ya han dado la vuelta a todo Dinoland.'
		}
	},
	[StatTracking.MSG]: {
		id: StatTracking.MSG,
		name: {
			EN: 'Official Dinoland Stamps',
			FR: 'Timbres homologués',
			DE: 'Offizielle Briefmarken',
			ES: 'Sellos homologados'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_msg.gif'
			}
		],
		description: {
			EN: "This unlimited supply of stamps from the Dinoland Postal Militia is proof of your entitlement to stay in Dinoland for as long as you'd like.",
			FR: 'Ce stock illimité DE timbres homologués par les Services Postaux Dinoziens valide votre séjour à Dinoville.',
			DE: 'Mit diesem unbegrenzten Vorrat an offiziellen Briefmarken der Dinoz Post AG kannst du private Nachrichten versenden.',
			ES: 'Este almacén ilimitado DE sellos homologados por los Servicios Postales Dinonianos permite enviar mensajes privados.'
		}
	},
	[StatTracking.MAGNET]: {
		id: StatTracking.MAGNET,
		name: {
			EN: 'Negative Lodestone Shard',
			FR: 'Eclat DE Magnétite Négative',
			DE: 'Splitter aus negativem Magnetit',
			ES: 'Trozo DE Magnetita Negativa'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 300,
				icon: 'collec_magnet.gif'
			}
		],
		description: {
			EN: 'This Negative Lodestone Shard was given to you by the ing of the Rockies himself! Who knows what mysterious powers it holds.',
			FR: 'Cet éclat DE Magnétite Négative vous a été offert par le Roi des Rockys EN personne ! Qui sait quels pouvoirs mystérieux il possède...',
			DE: 'Dieser Splitter aus negativem Magnetit wurde dir vom König der Rockys höchstpersönlich übergeben! Wer weiß was für mysteriöse Kräfte er in sich birgt...',
			ES: '¡El Rey DE los Rokkys EN persona te ha ofrecido este trozo DE Magnetita Negativa! A saber los misteriosos poderes que esconde...'
		}
	},
	[StatTracking.PLUME]: {
		id: StatTracking.PLUME,
		name: {
			EN: 'Sidereal Feather',
			FR: 'Plume Sidérale',
			DE: 'Sternenfeder',
			ES: 'Pluma Sideral'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_plume.gif'
			}
		],
		description: {
			EN: 'This feather, a gift from a distant traveller, allows you to edit your presentation on your player profile.',
			FR: "Cette plume, cadeau DE quelqu'un venu DE très loin, permet d'éditer la présentation DE la fiche joueur.",
			DE: "Diese Feder ist ein Geschenk von jemandem, der von seeeehr weit her gekommen ist. Mit ihr kannst du das Spielerprofil bearbeiten und in den 'Roleplay'-Bereich gelangen, der sich im Forum befindet.",
			ES: 'Esta pluma ES un regalo DE procedencia muy lejana. Permite editar la presentación DE la ficha del jugador.'
		}
	},
	[StatTracking.KAURA]: {
		id: StatTracking.KAURA,
		name: {
			EN: 'Kabuki Aura',
			FR: 'Aura Kabuki',
			DE: 'Kabuki-Aura',
			ES: 'Aura Kabuki'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 300,
				icon: 'collec_kaura.gif'
			}
		],
		description: {
			EN: 'The Kabuki Aura gives you access to Totem Island where you may find Kabukis, survivors of the Huge Cataclysm!',
			FR: "Cette aura permet d'accéder à l'Ile du Totem et d'y retrouver - peut-être - des Kabuki ayant survécu au Grand Cataclysme !",
			DE: 'Mit dieser Aura kannst du auf die Toteminsel gehen und dort - vielleicht - Kabukis antreffen, die die Große Naturkatastrophe überlebt haben!',
			ES: 'Este aura permite acceder a la Isla del Tótem. ¡Quizás encuentres allí a Kabukis que hayan sobrevivido al Gran Cataclismo!'
		}
	},
	[StatTracking.DEMON]: {
		id: StatTracking.DEMON,
		name: {
			EN: 'Demon Scroll',
			FR: 'Parchemin du Démon',
			DE: 'Dämonische Pergamentrolle',
			ES: 'Pergamino del Demonio'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_demon.gif'
			}
		],
		description: {
			EN: 'This ancient scroll gives you access to the Demon Shop in the Twilight Cemetary!',
			FR: "Cet ancien parchemin vous permettra d'accèder à la Boutique Démoniaque au Cimetière du Crépuscule !",
			DE: 'Diese alte Pergamentrolle gewährt dir Zugang zur Dämonenboutique, die sich am Friedhof des Sonnenuntergangs befindet.',
			ES: 'Este antiguo pergamino te permite acceder a la Tienda Demoníaca EN el Cementerio del Crepúsculo.'
		}
	},
	[StatTracking.PMI]: {
		id: StatTracking.PMI,
		name: {
			EN: 'Illustrated Mission Guidebook',
			FR: 'Petit Missionaire Illustré',
			DE: 'Illustriertes Missionsbuch',
			ES: 'Pequeño Misionario Ilustrado'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_pmi.gif'
			}
		],
		description: {
			EN: 'The Illustrated Mission Guidebook lets you see the list of missions which have been completed by your Dinoz, and which remain to be completed.',
			FR: "Le Petit Missionnaire Illustré permet d'avoir accés à tout moment à la liste des missions effectuées et restant à faire pour vos Dinoz.",
			DE: 'Das illustrierte Missionsbuch zeigt dir alle Missionen, die deine Dinoz bereits abgeschlossen oder noch vor sich haben.',
			ES: 'El Pequeño Misionario Ilustrado te da acceso EN todo momento a la lista DE misiones efectuadas por tu Dino y las que le quedan por hacer..'
		}
	},
	[StatTracking.PDA]: {
		id: StatTracking.PDA,
		name: {
			EN: 'Diamantite Pebble',
			FR: 'Pierre EN Diamantite Agglomérée',
			DE: 'Stein aus gepresstem Diamantit',
			ES: 'Piedra EN Diamantito Aglomerado'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_pda.gif'
			}
		],
		description: {
			EN: 'The Diamantite Pebble is a stone which is packed with a naturally occurring array of elements which, when combined under pressure, allow the owner to see all their dinoz at a glance. The diamantite, on the other hand, is only for show.',
			FR: "La P.D.A. est une pierre remplie (chose surprenante) DE technologie formée naturellement et permettant à l'éleveur d'avoir un aperçu DE tous ses Dinoz EN un simple coup d'oeil. La Diamantite au contraire c'est juste pour la frime.",
			DE: 'Der Stein aus gepresstem Diamantit ist ein Stein, der mit natürlicher Technologie geformt wurde (was überraschend ist) und der den Züchtern erlaubt sich mit einem Blick eine Übersicht all seiner Dinoz zu verschaffen. Das Diamantit hingegen ist nur zum Angeben.',
			ES: 'La PDA ES una piedra producida con una tecnología especial que permite al maestro que la posea tener una visión general DE todos sus Dinos. Lo del Diamantito ES sólo para chulear.'
		}
	},
	[StatTracking.DICARB]: {
		id: StatTracking.DICARB,
		name: {
			EN: 'Arborian Dictionary',
			FR: 'Dictionnaire Arboris',
			DE: 'Wörterbuch Arborianisch',
			ES: 'Diccionario Arboris'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 400,
				icon: 'collec_dicarb.gif'
			}
		],
		description: {
			EN: 'A very old book, which you have managed to open, maybe now it can be used to decipher the Arborian language.',
			FR: "Un livre très ancien, vous avez réussi à l'ouvrir, il peut désormais servir à déchiffrer le langage Arboris.",
			DE: 'Ein antikes, staubiges Buch, mit dessen Hilfe du die Sprache Arborianisch übersetzen kannst.',
			ES: 'Un libro muy antiguo. ¡Has conseguido abrirlo! Ya puedes usarlo para descifrar el lenguaje Arboris.'
		}
	},
	[StatTracking.TID1]: {
		id: StatTracking.TID1,
		name: {
			EN: 'Zen Medal',
			FR: 'Médaille zen',
			DE: 'Zen Medaille',
			ES: 'Medalla Zen'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_tid1.gif'
			}
		],
		description: {
			EN: 'The zen medal is awarded to the top Dojo in Dinoland, there is no more powerful Dinoz master! You get all the glory, the fame and the respect of all other Dinoz masters...!!',
			FR: 'Félicitation pour avoir gagné le Tournoi Inter-Dojo ! La médaille zen récompense le meilleur Dojo existant à Dinoland, aucun maître Dinoz ne vous surpasse ! A vous la gloire, les flashs, le succès auprès des maîtres/maîtresses dinoz .... !!',
			DE: 'Herzlichen Glückwunsch, du hast das Dojo Turnier gewonnen! Nur das beste Dojo erhält die Zen Medaille. Kein anderer Dinozzüchter kann dir das Wasser reichen! Genieße den Ruhm! :)',
			ES: '¡Felicitaciones por haber ganado el Torneo Inter-Dojos!'
		}
	},
	[StatTracking.BELIUS]: {
		id: StatTracking.BELIUS,
		name: {
			EN: 'Belius the Illustrious',
			FR: "Belius l'illustre",
			DE: 'Belius',
			ES: 'Belius EL Ilustre'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_belius.gif'
			}
		],
		description: {
			EN: 'You have defeated the powerful Belius, the infernal Santaz. He has been sent back to the depths of the Dark World.',
			FR: 'Vous avez supprimé le puissant Santaz infernal Belius. Il est reparti dans les profondeurs du Monde Sombre.',
			DE: 'Du hast den mächtigen, teuflischen Santaz Belius vernichtet. Er ist in die Tiefen der dunklen Welt zurückgekehrt.',
			ES: 'Has vencido al poderoso Polvorón Infernal Belius y hecho que vuelva a las profundidades del Mundo Sombra.'
		}
	},
	[StatTracking.CAUSH]: {
		id: StatTracking.CAUSH,
		name: {
			EN: 'Mandragore Doll',
			FR: 'Poupée Mandragore',
			DE: 'Mandragore-Puppe',
			ES: 'Muñeco DE Mandrágora'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 300,
				icon: 'collec_caush.gif'
			}
		],
		description: {
			EN: 'A doll in the likeness of Mandragore, which can be used as a voodoo doll, punching-bag or a pillow, as you choose.\tIt is in pretty poor condition, the previous owner must have taken their frustrations out on it on a regular basis.',
			FR: "Une poupée à l'éffigie DE Mandragore, elle peut servir DE poupée vaudou, punching-ball ou DE coussin, c'est au choix. Elle est EN piteuse état, l'ancien propriétaire a dû passer ses nerfs dessus assez souvent.",
			DE: 'Die Puppe zeigt Mandragore da und kann als Voodoopuppe, Boxsack oder Kissen dienen - je nach Wetter und Laune. Sie ist in einem miserablen Zustand. Ihrem alten Besitzer müssen ziemlich oft die Nerven durchgegangen sein.',
			ES: 'Un muñeco con la forma DE Mandrágora puede servir como peluche o como cojín. Está EN muy mal estado, su antiguo dueño debió sufrir varias crisis DE nervios con él.'
		}
	},
	[StatTracking.FMEDAL]: {
		id: StatTracking.FMEDAL,
		name: {
			EN: '3-eyed Medallion',
			FR: 'Médaillon à 3 yeux',
			DE: '3-eyed Medallion',
			ES: 'Medallón DE 3 ojos'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 50,
				icon: 'collec_fmedal.gif'
			}
		],
		description: {
			EN: 'This medallion opens the portal to the celestial temple.',
			FR: 'Ce médaillon ouvre le portail vers le temple céleste.',
			DE: 'This medallion opens the portal to the celestial temple.',
			ES: 'Este medallón abre las puertas del templo celeste.'
		}
	},
	[StatTracking.LABOWI]: {
		id: StatTracking.LABOWI,
		name: {
			EN: 'Smogs Medallion',
			FR: 'Trophée des Smogs',
			DE: '',
			ES: 'Trofeo DE los Smogs'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 50,
				icon: 'collec_labowi.gif'
			}
		],
		description: {
			EN: 'This medallion proves that you have finished the smog quest.',
			FR: 'Ce trophée prouve que vous avez terminé la quête du Smog.',
			DE: '',
			ES: 'Este medallón prueba que has terminado la búsqueda del Smog.'
		}
	},
	[StatTracking.MOVES]: {
		id: StatTracking.MOVES,
		name: {
			EN: 'Adventurer',
			FR: 'Aventure',
			DE: 'Abenteurer',
			ES: 'Aventurero'
		},
		rare: 2,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_explor.gif',
				prefix: true,
				title: {
					EN: 'Tourist',
					FR: 'Touriste',
					DE: 'Tourist',
					ES: 'Turista'
				},
				description: {
					EN: 'What kind of adventurer are you?',
					FR: "Quel type d'aventurier êtes-vous ?",
					DE: 'So ein Typ Abenteurer bist du',
					ES: '¿Qué tipo DE aventurero eres?'
				}
			},
			{
				count: 50,
				points: 1,
				prefix: true,
				title: {
					EN: 'Marcher',
					FR: 'Marcheur',
					DE: 'Marschierer',
					ES: 'Caminante'
				}
			},
			{
				count: 100,
				points: 1,
				prefix: true,
				title: {
					EN: 'Walker',
					FR: 'Promeneur',
					DE: 'Spaziergänger',
					ES: 'Visionario'
				}
			},
			{
				count: 500,
				points: 1,
				prefix: true,
				title: {
					EN: 'Hiker',
					FR: 'Randonneur',
					DE: 'Wanderer',
					ES: 'Atleta'
				}
			},
			{
				count: 1000,
				points: 1,
				prefix: true,
				title: {
					EN: 'Adventurer',
					FR: 'Aventurier',
					DE: 'Abenteurer',
					ES: 'Aventurero'
				}
			},
			{
				count: 2000,
				points: 1,
				suffix: true,
				title: {
					EN: 'Brave Souls',
					FR: 'téméraire',
					DE: 'durch dick und dünn',
					ES: 'Temerario'
				}
			},
			{
				count: 5000,
				points: 1,
				title: {
					EN: 'Grand Adventurer',
					FR: 'Grand aventurier',
					DE: 'Großer Abenteurer',
					ES: 'Gran Aventurero'
				}
			},
			{
				count: 10000,
				points: 1,
				prefix: true,
				title: {
					EN: 'Explorer',
					FR: 'Explorateur',
					DE: 'Entdecker',
					ES: 'Explorador'
				}
			},
			{
				count: 25000,
				points: 1,
				suffix: true,
				title: {
					EN: 'discoveries',
					FR: 'intrépide',
					DE: 'ohne Furcht',
					ES: 'Intrépido'
				}
			},
			{
				count: 40000,
				points: 1,
				title: {
					EN: 'Grand Explorer',
					FR: 'Grand explorateur',
					DE: 'Großer Entdecker',
					ES: 'Gran Explorador'
				}
			},
			{
				count: 60000,
				points: 1,
				title: {
					EN: 'Globe-trotter',
					FR: 'Globe-trotteur',
					DE: 'Globetrotter',
					ES: 'Trotamundos'
				}
			},
			{
				count: 75000,
				points: 1,
				title: {
					EN: 'Supreme Explorer',
					FR: 'Explorateur suprême',
					DE: 'Oberster Entdecker',
					ES: 'Explorador Supremo'
				}
			},
			{
				count: 100000,
				points: 1,
				title: {
					EN: 'Legendary Pioneer',
					FR: 'Pionnier ultime',
					DE: 'Ultimativer Pionier',
					ES: 'Pionero Legendario'
				}
			},
			{
				count: 150000,
				points: 1,
				title: {
					EN: 'Dinoland Legend',
					FR: 'Légende DE Dinoland',
					DE: 'Dinoland-Legende',
					ES: 'Leyenda DE Dinoland'
				}
			}
		],
		description: {
			EN: 'What kind of adventurer are you?',
			FR: "Quel type d'aventurier êtes-vous?",
			DE: 'So ein Typ Abenteurer bist du',
			ES: '¿Qué tipo DE aventurero eres?'
		}
	},
	[StatTracking.DEATHS]: {
		id: StatTracking.DEATHS,
		name: {
			EN: 'Deaths',
			FR: 'Morts',
			DE: 'Tode',
			ES: 'Inmortal'
		},
		rare: 1,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_barbare.gif',
				title: {
					EN: 'Spirit Dinoz master',
					FR: 'Revenant DE loin',
					DE: 'Wiedergänger',
					ES: 'Mala Hierba'
				},
				description: {
					EN: 'How many times have you died in combat?',
					FR: 'Combien DE fois êtes-vous mort au combat ?',
					DE: 'So oft bist du im Kampf gefallen',
					ES: 'Cantidad DE veces que has muerto EN combate'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Comeback King',
					FR: 'Esprit torturé',
					DE: 'Gequälter Geist',
					ES: 'Alma Perseverante'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Master of Puppets',
					FR: 'Fantôme narcissique',
					DE: 'Selbstverliebtes Gespenst',
					ES: 'Reencanator Ultra'
				}
			},
			{
				count: 1000,
				points: 1,
				title: {
					EN: 'Reincarnator 3k',
					FR: 'Réincarnator 3000',
					DE: 'Reinkarnator 3000',
					ES: 'Ave Fénix'
				}
			},
			{
				count: 1500,
				points: 1,
				title: {
					EN: 'Mini Buddha',
					FR: "P'tit Bouddha",
					DE: 'Kleiner Buddha',
					ES: 'El Inmortal'
				}
			}
		],
		description: {
			EN: 'How many times have you died in combat?',
			FR: 'Combien DE fois êtes-vous mort au combat ?',
			DE: 'So oft bist du im Kampf gefallen.',
			ES: 'Cantidad DE veces que has muerto EN combate'
		}
	},
	[StatTracking.P_DAYS]: {
		id: StatTracking.P_DAYS,
		name: {
			EN: 'Education',
			FR: 'Eleveur',
			DE: 'Schüler',
			ES: 'Criador DE Dinos'
		},
		rare: 2,
		unlocks: [
			{
				count: 5,
				points: 1,
				icon: 'r_plume.gif',
				title: {
					EN: 'Studious Pupil',
					FR: 'Elève attentif',
					DE: 'Geduldiger Schüler',
					ES: 'Alumno Atento'
				},
				description: {
					EN: 'Number of days spent on the site.',
					FR: 'Nombre DE jours DE présence sur le site.',
					DE: 'Anzahl der in Dinoland verbrachten Tage',
					ES: 'Cantidad DE días presente EN el sitio.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Attentive Orator',
					FR: 'Orateur éclairé',
					DE: 'Aufgeklärter Redner',
					ES: 'Orador Luminoso'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Gifted Preacher',
					FR: 'Prêcheur accompli',
					DE: 'Vollkommener Prediger',
					ES: 'Profeta EN su Tierra'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Experienced Narrator',
					FR: 'Raconteur aguerri',
					DE: 'Abgehärteter Erzähler',
					ES: 'Lumbrera'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Archive Creator',
					FR: 'Grand conteur',
					DE: 'Großer Märchenerzähler',
					ES: 'Erudito'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					EN: 'Master Historian',
					FR: 'Maître Historien',
					DE: 'Professor für Geschichte',
					ES: 'Eminencia'
				}
			},
			{
				count: 600,
				points: 1,
				title: {
					EN: 'Ancient Oracle',
					FR: 'Grand Ancien',
					DE: 'Enzyklopädie',
					ES: 'Ancestro Mítico'
				}
			}
		],
		description: {
			EN: 'Number of days spent on the site',
			FR: 'Nombre DE jours DE présence sur le site',
			DE: 'Anzahl der in Dinoland verbrachten Tage',
			ES: 'Cantidad DE días presente EN el sitio'
		}
	},
	[StatTracking.LVL_UP]: {
		id: StatTracking.LVL_UP,
		name: {
			EN: 'Trainer',
			FR: 'Entraîneur',
			DE: 'Trainer',
			ES: 'Entrenador DE Dinos'
		},
		rare: 2,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'small_lup_fix.gif',
				title: {
					EN: 'Sunday Trainer',
					FR: 'Entraîneur du dimanche',
					DE: 'Freizeit-Trainer',
					ES: 'Entrenador Dominguero'
				},
				description: {
					EN: 'Number of Level-ups carried out.',
					FR: 'Nombre DE level-up réalisés.',
					DE: 'Anzahl der Level-Ups',
					ES: 'Cantidad DE subida DE niveles que has realizado.'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Apprentice Trainer',
					FR: 'Apprenti entraineur',
					DE: 'Trainer-Novize',
					ES: 'Aprendiz DE Entrenador'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Amateur Trainer',
					FR: 'Entraîneur amateur',
					DE: 'Amateur-Trainer',
					ES: 'Entrenador Amateur'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Experienced Trainer',
					FR: 'Entraîneur expérimenté',
					DE: 'Erfahrener Trainer',
					ES: 'Entrenador Experimentado'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					EN: 'Great Trainer',
					FR: 'Grand Entraîneur',
					DE: 'Großer Trainer',
					ES: 'Gran Entrenador'
				}
			},
			{
				count: 400,
				points: 1,
				title: {
					EN: 'Ultimate Trainer',
					FR: 'Entraîneur ultime',
					DE: 'Ultimativer Trainer',
					ES: 'Entrenador Supremo'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Grand Master',
					FR: 'Grand Maître',
					DE: 'Großmeister',
					ES: 'Excelentísimo Maestro'
				}
			}
		],
		description: {
			EN: 'Number of Level-ups carried out',
			FR: 'Nombre DE levelup réalisés',
			DE: 'Anzahl der Level-Ups',
			ES: 'Cantidad DE subidas DE niveles que has realizado'
		}
	},
	[StatTracking.KILL_M]: {
		id: StatTracking.KILL_M,
		name: {
			EN: 'Monster Killer',
			FR: 'Tueur DE monstres',
			DE: 'Monsterjäger',
			ES: 'Terror DE monstruos'
		},
		rare: 2,
		unlocks: [
			{
				count: 50,
				points: 1,
				icon: 'r_monster.gif',
				title: {
					EN: 'Monster Hunter',
					FR: 'Balayeur DE restes',
					DE: 'Freizeit-Jäger',
					ES: 'Barredor DE Restos'
				},
				description: {
					EN: 'Number of monsters killed on your adventures.',
					FR: 'Nombre DE monstres tués durant vos aventures.',
					DE: 'Anzahl der von dir getöteten Monster',
					ES: 'Cantidad DE monstruos que mataste EN tus aventuras.'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Scourge of Beasts',
					FR: 'Bourreau des corps',
					DE: 'Leichenschinder',
					ES: 'Cazador DE Monstruos'
				}
			},
			{
				count: 1000,
				points: 1,
				title: {
					EN: 'Monster Killer',
					FR: 'Chasseur DE monstres',
					DE: 'Monsterjäger',
					ES: 'Mercenario'
				}
			},
			{
				count: 2000,
				points: 1,
				title: {
					EN: 'Monster Annihilator',
					FR: 'Tueur barbare',
					DE: 'Barbarentöter',
					ES: 'Devorador DE Monstruos'
				}
			},
			{
				count: 5000,
				points: 1,
				title: {
					EN: 'Giant Killer',
					FR: 'Annihilateur DE géant',
					DE: 'Zerschmetterer der Riesen',
					ES: 'Aniquilador'
				}
			},
			{
				count: 10000,
				points: 1,
				title: {
					EN: 'Barbarian Destroyer',
					FR: 'Dévastateur DE colosses',
					DE: 'Verheerer der Kolosse',
					ES: 'Practicante del F.U.A.'
				}
			},
			{
				count: 20000,
				points: 1,
				title: {
					EN: 'Reaper of Titans',
					FR: 'Exterminateur DE Titans',
					DE: 'Vernichter der Titanen',
					ES: 'Matador'
				}
			},
			{
				count: 50000,
				points: 1,
				title: {
					EN: 'King of Chaos',
					FR: 'Roi du chaos',
					DE: 'König des Chaos',
					ES: 'Devorador DE Monstruos'
				}
			},
			{
				count: 100000,
				points: 1,
				title: {
					EN: 'God of Destruction',
					FR: 'Dieu DE la destruction',
					DE: 'Gott der Zerstörung',
					ES: 'Exterminador DE Monstruos'
				}
			}
		],
		description: {
			EN: 'Number of monsters killed on your adventures',
			FR: 'Nombre DE monstres tués durant vos aventures',
			DE: 'Anzahl der von dir getöteten Monster',
			ES: 'Cantidad DE monstruos que mataste EN tus aventuras'
		}
	},
	[StatTracking.KILL_D]: {
		id: StatTracking.KILL_D,
		name: {
			EN: 'Dinoz Challenger',
			FR: 'Challenger DE Dinoz',
			DE: 'Dinoz-Herausforderer',
			ES: 'Gladiador'
		},
		rare: 1,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'small_attack.gif',
				title: {
					EN: 'Timid adversary',
					FR: 'Combattant timide',
					DE: 'Schüchterner Kämpfer',
					ES: 'Combatiente Tímido'
				},
				description: {
					EN: 'Number of Dinoz defeated in events.',
					FR: 'Nombre DE Dinoz vaincus durant les évènements',
					DE: 'Anzahl der während Events besiegter Dinoz',
					ES: 'Cantidad DE Dinos vencidos EN los eventos'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Merciless Warrior',
					FR: 'Guerrier sans pitié',
					DE: 'Krieger ohne Erbarmen',
					ES: 'Guerrero Despiadado'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Night Terror',
					FR: 'Terreur nocturne',
					DE: 'Schrecken der Nacht',
					ES: 'Terror del Enemigo'
				}
			},
			{
				count: 2000,
				points: 1,
				title: {
					EN: 'Walking Nightmare',
					FR: 'Cauchemar ambulant',
					DE: 'Wandelnder Alptraum',
					ES: 'Pesadilla Andante'
				}
			},
			{
				count: 5000,
				points: 1,
				title: {
					EN: 'Master Reaper',
					FR: 'Faucheur absolu',
					DE: 'Schnitter',
					ES: 'Ídolo Guerrero'
				}
			},
			{
				count: 10000,
				points: 1,
				title: {
					EN: 'God of Death',
					FR: 'Dieu DE la mort',
					DE: 'Gott des Todes',
					ES: 'Dios DE la Muerte'
				}
			}
		],
		description: {
			EN: 'Number of Dinoz defeated in events',
			FR: 'Nombre DE Dinoz vaincus durant les évènements',
			DE: 'Anzahl der während Events besiegter Dinoz',
			ES: 'Cantidad DE Dinos vencidos EN los eventos'
		}
	},
	[StatTracking.HEAL_PV]: {
		id: StatTracking.HEAL_PV,
		name: {
			EN: 'Health Points Recovered',
			FR: 'Point DE vie récupérés',
			DE: 'Wiedergewonnene Lebenspunkte',
			ES: 'Puntos DE vida recuperados'
		},
		rare: 0,
		unlocks: [
			{
				count: 500,
				points: 1,
				icon: 'r_heal.gif',
				title: {
					EN: 'Sexy Nurse',
					FR: 'Infirmière sexy',
					DE: 'Sexy Krankenschwester',
					ES: 'Enfermero'
				},
				description: {
					EN: 'How many HP have you regained?',
					FR: 'Combien DE pv avez vous regagné ?',
					DE: 'Soviele Lebenspunkte hast du wiedergewonnen',
					ES: 'La cantidad DE puntos DE vida que has recuperado'
				}
			},
			{
				count: 5000,
				points: 1,
				title: {
					EN: 'Doctor without borders',
					FR: 'Médecin sans frontière',
					DE: 'Arzt ohne Grenzen',
					ES: 'Curandero'
				}
			},
			{
				count: 15000,
				points: 1,
				title: {
					EN: 'Superior Doctor',
					FR: 'Docteur supérieur',
					DE: 'Versierter Leibarzt',
					ES: 'Sanador'
				}
			},
			{
				count: 50000,
				points: 1,
				title: {
					EN: 'Majestic Healer',
					FR: 'Guérisseur majestueux',
					DE: 'Majestätischer Medizinmann',
					ES: 'Médico sin Fronteras'
				}
			},
			{
				count: 100000,
				points: 1,
				title: {
					EN: 'Chaos Surgeon',
					FR: 'Chirurgien du chaos',
					DE: 'Chirurg des Chaos',
					ES: 'Doctor Famoso'
				}
			},
			{
				count: 500000,
				points: 1,
				title: {
					EN: 'Divine Omnipractician',
					FR: 'Omnipraticien divin',
					DE: 'Hippokrates',
					ES: 'Cirujano Divino'
				}
			}
		],
		description: {
			EN: 'How many HP have you regained?',
			FR: 'Combien DE pv avez vous regagnés ?',
			DE: 'Soviele Lebenspunkte hast du wiedergewonnen',
			ES: 'La cantidad DE puntos DE vida que has recuperado'
		}
	},
	[StatTracking.UP_WOOD]: {
		id: StatTracking.UP_WOOD,
		name: {
			EN: 'Wood Specialist',
			FR: 'Spécialiste du bois',
			DE: 'Holzspezialist',
			ES: 'Especialista DE Madera'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_wood.gif',
				title: {
					EN: 'Tiny Acorn',
					FR: 'Jeune pi-mousse',
					DE: 'Jungspund',
					ES: 'Oledor DE Madera'
				},
				description: {
					EN: 'Number of Wood level-ups.',
					FR: "Nombre DE up réalisés sur l'élément bois.",
					DE: 'Anzahl der Level-Ups beim Holz-Element',
					ES: 'Cantidad DE subidas DE nivel realizadas EN elemento madera'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Young Shoot',
					FR: 'Belle au bois dormant',
					DE: 'Meister Eder',
					ES: 'Recogedor DE Ramas'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Sturdy Oak',
					FR: 'Gueule DE bois',
					DE: 'Erfahrener Schreiner',
					ES: 'Ayudante DE Carpintero'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Megalomaniac Carpenter',
					FR: 'Charpentier mégalomaniaque',
					DE: 'Begnadeter Zimmermann',
					ES: 'Carpintero Supremo'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					EN: 'Would a woodchuck chuck wood?',
					FR: 'Bûcheron ancestral',
					DE: 'Ehrwürdiger Holzfäller',
					ES: 'Leñador'
				}
			}
		],
		description: {
			EN: 'Number of Wood level-ups',
			FR: "Nombre DE up réalisés sur l'élément bois",
			DE: 'Anzahl der Level-Ups beim Holz-Element',
			ES: 'Cantidad DE subidas DE nivel realizadas EN elemento madera'
		}
	},
	[StatTracking.UP_FIRE]: {
		id: StatTracking.UP_FIRE,
		name: {
			EN: 'Fire Specialist',
			FR: 'Spécialiste du feu',
			DE: 'Feuerspezialist',
			ES: 'Especialista DE Fuego'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_fire.gif',
				title: {
					EN: 'Sparky',
					FR: 'Flammèche',
					DE: 'Flämmchen',
					ES: 'Chispa'
				},
				description: {
					EN: 'Number of Fire level-ups.',
					FR: "Nombre DE up réalisés sur l'élément feu.",
					DE: 'Anzahl der Level-Ups beim Feuer-Element',
					ES: 'Cantidad DE subidas DE nivel realizadas EN elemento fuego'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Firestarter',
					FR: 'Brasier des ténèbres',
					DE: 'Flamme der Finsternis',
					ES: 'Flama DE Vela'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Shadow Flame',
					FR: 'Flamme infernale',
					DE: 'Infernale Flamme',
					ES: 'Hoguera'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Infernal Furnace',
					FR: 'Maître du feu',
					DE: 'Meister der Flammen',
					ES: 'Maestro del Fuego'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					EN: 'Divine Pyromaniac',
					FR: 'Pyromane divin',
					DE: 'Göttlicher Pyromane',
					ES: 'Piromaníaco Supremo'
				}
			}
		],
		description: {
			EN: 'Number of Fire level-ups',
			FR: "Nombre DE up réalisés sur l'élément feu",
			DE: 'Anzahl der Level-Ups beim Feuer-Element',
			ES: 'Cantidad DE subidas DE nivel realizadas EN elemento fuego'
		}
	},
	[StatTracking.UP_LIGHTNING]: {
		id: StatTracking.UP_LIGHTNING,
		name: {
			EN: 'Lightning Specialist',
			FR: 'Spécialiste DE la foudre',
			DE: 'Blitzspezialist',
			ES: 'Especialista del Rayo'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_thunder.gif',
				title: {
					EN: 'Volta',
					FR: 'Triton grillé',
					DE: 'Kurzschluss',
					ES: 'Luciérnaga'
				},
				description: {
					EN: 'Number of Lightning level-ups.',
					FR: "Nombre DE up réalisés sur l'élément foudre.",
					DE: 'Anzahl der Level-Ups beim Blitz-Element',
					ES: 'Cantidad DE subidas DE nivel realizadas EN elemento rayo'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Overload',
					FR: 'Excès DE vitesse',
					DE: 'Überladung',
					ES: 'Ráfaga'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Caged Lightning',
					FR: 'Eclair DE génie',
					DE: 'Blitzschlag',
					ES: 'Flash'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Flash',
					FR: 'Guerrier foudroyant',
					DE: 'Blitzschleuderer',
					ES: 'Guerrero del Rayo'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					EN: 'GigaWatt',
					FR: 'Maître du Saint-Elme',
					DE: 'Mister 100.000 Volt',
					ES: 'Dios DE la Tormenta'
				}
			}
		],
		description: {
			EN: 'Number of Lightning level-ups',
			FR: "Nombre DE up réalisés sur l'élément foudre",
			DE: 'Anzahl der Level-Ups beim Blitz-Element',
			ES: 'Cantidad DE subidas DE nivel realizadas EN elemento rayo'
		}
	},
	[StatTracking.UP_AIR]: {
		id: StatTracking.UP_AIR,
		name: {
			EN: 'Air Specialist',
			FR: "Spécialiste DE l'air",
			DE: 'Luftspezialist',
			ES: 'Especialista del Aire'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_air.gif',
				title: {
					EN: 'Morning Breeze',
					FR: 'Gaz incolore',
					DE: 'Morgenhauch',
					ES: 'Gas'
				},
				description: {
					EN: 'Number of Air level-ups.',
					FR: "Nombre DE up réalisés sur l'élément air.",
					DE: 'Anzahl der Level-Ups beim Luft-Element',
					ES: 'Cantidad DE subidas DE nivel realizadas EN elemento aire.'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Fresh Wind',
					FR: 'Vent vif',
					DE: 'Frische Brise',
					ES: 'Brisa'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Free as the air',
					FR: 'Libre comme l’air',
					DE: 'Frei wie der Wind',
					ES: 'Viento'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Devastating Cyclone',
					FR: 'Cyclone dévastateur',
					DE: 'Verheerender Zyklon',
					ES: 'Tornado'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					EN: 'Rock you like a Hurricane',
					FR: 'Djinn furieux',
					DE: 'Wütender Hurrikan',
					ES: 'Ciclón'
				}
			}
		],
		description: {
			EN: 'Number of Air level-ups',
			FR: "Nombre DE up réalisés sur l'élément air",
			DE: 'Anzahl der Level-Ups beim Luft-Element',
			ES: 'Cantidad DE subidas DE nivel realizadas EN elemento aire'
		}
	},
	[StatTracking.UP_WATER]: {
		id: StatTracking.UP_WATER,
		name: {
			EN: 'Water Specialist',
			FR: "Spécialiste DE l'eau",
			DE: 'Wasserspezialist',
			ES: 'Especialista EN Agua'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_water.gif',
				title: {
					EN: 'Rubber Duck',
					FR: 'Canard DE bain',
					DE: 'Gummiente',
					ES: 'Pez'
				},
				description: {
					EN: 'Number of Water level-ups.',
					FR: "Nombre DE up réalisés sur l'élément eau.",
					DE: 'Anzahl der Level-Ups beim Wasser-Element',
					ES: 'Cantidad DE subidas DE nivel realizadas EN elemento agua'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Leaky Faucet',
					FR: "Marin d'eau douce",
					DE: 'Tropfender Wasserhahn',
					ES: 'Tiburón'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Heart of Ice',
					FR: 'Coeur DE glace',
					DE: 'Herz aus Eis',
					ES: 'Marea Alta'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Extreme flood',
					FR: 'Déluge extrême',
					DE: 'Sintflut',
					ES: 'Tsunami'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					EN: 'Aqueous Abyss',
					FR: 'Faille abyssale',
					DE: 'Wogender Abyss',
					ES: 'Maremoto'
				}
			}
		],
		description: {
			EN: 'Number of Water level-ups',
			FR: "Nombre DE up réalisés sur l'élément eau",
			DE: 'Anzahl der Level-Ups beim Wasser-Element',
			ES: 'Cantidad DE subidas DE nivel realizadas EN elemento agua'
		}
	},
	[StatTracking.BROKEN_SHOVEL]: {
		id: StatTracking.BROKEN_SHOVEL,
		name: {
			EN: 'Shovel Smasher',
			FR: 'Casseur DE pelles',
			DE: 'Schaufelzerbrecher',
			ES: 'Rompe-palas'
		},
		rare: 0,
		unlocks: [
			{
				count: 5,
				points: 1,
				icon: 'r_digger.gif',
				title: {
					EN: 'Earthworm',
					FR: 'Ver DE terre',
					DE: 'Regenwurm',
					ES: 'Gusano'
				},
				description: {
					EN: 'Number of broken shovels.',
					FR: 'Nombre DE pelles cassées.',
					DE: 'Anzahl der von dir zerbrochenen Schaufeln',
					ES: 'Cantidad DE palas rotas.'
				}
			},
			{
				count: 10,
				points: 1,
				title: {
					EN: 'Amateur Miner',
					FR: 'Mineur amateur',
					DE: 'Amateur-Bergmann',
					ES: 'Excavador'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Craftsman Miner',
					FR: 'Galibot',
					DE: 'Bergmann',
					ES: 'Ayudante DE Minero'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'JCB',
					FR: 'Porion',
					DE: 'Erfahrener Bergmann',
					ES: 'Minero'
				}
			},
			{
				count: 150,
				points: 1,
				title: {
					EN: 'Celebrity Excavator',
					FR: 'Taupe herculéenne',
					DE: 'Herkulesmaulwurf',
					ES: 'Topo'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					EN: 'Manic Miner',
					FR: 'Ravineur DE légende',
					DE: 'Legendärer Buddler',
					ES: 'Escavador tectónico'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					EN: 'Half-man, half-mole',
					FR: 'Excavateur souverain',
					DE: 'Ruhmreicher Gräber',
					ES: 'Visitante del Núcleo'
				}
			},
			{
				count: 2500,
				points: 0,
				title: {
					EN: 'Subterranean Master',
					FR: 'Maître des profondeurs',
					DE: 'Meister der Tiefen',
					ES: 'Dios DE las Profundidades'
				}
			}
		],
		description: {
			EN: 'Number of broken shovels',
			FR: 'Nombre DE pelles cassées',
			DE: 'Anzahl der von dir zerbrochenen Schaufeln',
			ES: 'Cantidad DE palas rotas'
		}
	},
	[StatTracking.CHASSE]: {
		id: StatTracking.CHASSE,
		name: {
			EN: 'Hunter',
			FR: 'Chasseur',
			DE: 'Jäger',
			ES: 'Cazador'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_hunt.gif',
				title: {
					EN: 'Dinoville Hunt Subscriber',
					FR: 'Galinette Cendrée',
					DE: 'Frischling',
					ES: 'Colocador DE Trampas'
				},
				description: {
					EN: "Nombre d'actions DE chasses réalisées.",
					FR: "Nombre d'actions DE chasses réalisées.",
					DE: 'Anzahl der durchgeführten Jagden',
					ES: 'Cantidad DE cazas realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Reader of Hunting, Shooting, Fishing etc.',
					FR: "Champion d'appeau",
					DE: 'Waidmann',
					ES: 'Aprendiz DE Cazador'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Weekend Huntsman',
					FR: 'Braconnier baraqué',
					DE: 'Breitschultriger Wilderer',
					ES: 'Cazador Profesional'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Sioux Trailfinder',
					FR: 'Pisteur véloce',
					DE: 'Flinker Fährtenleser',
					ES: 'Coleccionista'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Master Trapper',
					FR: 'Trappeur aguerri',
					DE: 'Abgehärteter Trapper',
					ES: 'Gran Coleccionista'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					EN: 'King of the Hunt',
					FR: 'Roi DE la chasse',
					DE: 'König der Jagd',
					ES: 'Rey Cazador'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					EN: 'God of the Hunt',
					FR: 'Dieu DE la chasse',
					DE: 'Gott der Jagd',
					ES: 'Dios DE la Caza'
				}
			}
		],
		description: {
			EN: "Number of times you've set out to kill stuff!",
			FR: "Nombre d'actions DE chasses réalisées",
			DE: 'Anzahl der von dir durchgeführten Jagden',
			ES: 'Cantidad DE cazas realizadas'
		}
	},
	[StatTracking.CUEILLE]: {
		id: StatTracking.CUEILLE,
		name: {
			EN: 'Harvester',
			FR: 'Cueilleur',
			DE: 'Ernter',
			ES: 'Recolector'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_gather.gif',
				title: {
					EN: 'Dinoville Harvest Subscriber',
					FR: 'Cueilleur romantique',
					DE: 'Blumenpflücker',
					ES: 'Recolector Romántico'
				},
				description: {
					EN: 'Number of harvesting operations carried out.',
					FR: "Nombre d'actions DE cueillette réalisées.",
					DE: 'Anzahl der von dir durchgeführten Ernten',
					ES: 'Cantidad DE recolecciones realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Evil Herb Collector',
					FR: 'Ramasseur DE mauvaises herbes',
					DE: 'Unkrautjäter',
					ES: 'Recolector Aficionado'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Time-served Picker',
					FR: 'Grapilleur expérimenté',
					DE: 'Erfahrener Pflücker',
					ES: 'Recolector Experimentado'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Modern Day Druid',
					FR: 'Druide des temps modernes',
					DE: 'Druide der Neuzeit',
					ES: 'Druida Moderno'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Powerful Sorcerer',
					FR: 'Puissant sorcier',
					DE: 'Mächtiger Hexer',
					ES: 'Alquimista'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					EN: 'King of the Harvest',
					FR: 'Roi des récoltes',
					DE: 'König der Ernte',
					ES: 'Rey DE la Cosecha'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					EN: 'God of the Harvest',
					FR: 'Dieu des récoltes',
					DE: 'Gott der Ernte',
					ES: 'Dios DE la Cosecha'
				}
			}
		],
		description: {
			EN: 'Number of harvesting operations carried out',
			FR: "Nombre d'actions DE cueillette réalisées",
			DE: 'Anzahl der von dir durchgeführten Ernten',
			ES: 'Cantidad DE recolecciones realizadas'
		}
	},
	[StatTracking.FISH]: {
		id: StatTracking.FISH,
		name: {
			EN: 'Fisherman',
			FR: 'Pêcheur',
			DE: 'Angler',
			ES: 'Pescador'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_peche.gif',
				title: {
					EN: 'Line Fisherman',
					FR: 'Pêcheur à la ligne',
					DE: 'Kescher',
					ES: 'Ayudante DE Pescador'
				},
				description: {
					EN: 'Number of fishing trips.',
					FR: "Nombre d'actions DE pêche réalisées.",
					DE: 'Anzahl deiner Angelausflüge',
					ES: 'Cantidad DE pescas realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Fly Fisherman',
					FR: 'Pêcheur à la mouche',
					DE: 'Fliegenfischer',
					ES: 'Pescador Aficionado'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Deadliest Catch',
					FR: 'Pêcheur EN haute mer',
					DE: 'Hochseefischer',
					ES: 'Pescador'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Fishing with Dynamite',
					FR: 'Pêcheur à la dynamite',
					DE: 'Dynamit-Angler',
					ES: 'Pescador DE Río'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Ultimate Fisherman',
					FR: 'Pêcheur ultime',
					DE: 'Ultimativer Angler',
					ES: 'Pescador DE Alta Mar'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					EN: 'King Fisherman',
					FR: 'Roi DE la Pêche',
					DE: 'König des Angelns',
					ES: 'Rey DE la Pesca'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					EN: 'God of Fishing',
					FR: 'Dieu DE la Pêche',
					DE: 'Gott des Angelns',
					ES: 'Dios DE la Pesca'
				}
			}
		],
		description: {
			EN: 'Number of fishing trips',
			FR: "Nombre d'actions DE pêche réalisées",
			DE: 'Anzahl deiner Angelausflüge',
			ES: 'Cantidad DE pescas realizadas'
		}
	},
	[StatTracking.ENERGY]: {
		id: StatTracking.ENERGY,
		name: {
			EN: 'Energizer',
			FR: 'Energétiseur',
			DE: 'Energizer',
			ES: 'Energético'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_comp.gif',
				title: {
					EN: "Energising? It's a bit scary!",
					FR: "Energétiser, je n'ose pas trop",
					DE: 'Energizen? Also ich weiß nicht...',
					ES: 'Pila AAA'
				},
				description: {
					EN: 'Number of actions carried out which regenerate energy.',
					FR: "Nombre d'actions d'énergétisation réalisées.",
					DE: 'Anzahl der Energizer-Aktionen',
					ES: 'Cantidad DE energizaciones realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Energising? It beats eating!',
					FR: "Energétiser, c'est mieux que manger",
					DE: 'Energizen? Besser als Essen',
					ES: 'Batería Alcalina'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Energising? I live for it!',
					FR: "Energétiser, c'est toute ma vie",
					DE: 'Energizen? Das ist mein Leben',
					ES: 'Pararrayos'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Fission Researcher',
					FR: 'Chercheur EN fission',
					DE: 'Atomforscher',
					ES: 'Maestro Atómico'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Atomic Master',
					FR: 'Maître des atomes',
					DE: 'Meister der Atome',
					ES: 'Central Nuclear'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					EN: 'King of Fusion',
					FR: 'Roi DE la fusion',
					DE: 'König der Fusion',
					ES: 'Rey DE la Fusión'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					EN: 'God of Fusion',
					FR: 'Dieu DE la fusion',
					DE: 'Gott der Fusion',
					ES: 'Dios DE la Fusión'
				}
			}
		],
		description: {
			EN: 'Number of actions carried out which regenerate energy',
			FR: "Nombre d'actions d'énergétisation réalisées",
			DE: 'Anzahl der Energizer-Aktionen',
			ES: 'Cantidad DE energizaciones realizadas'
		}
	},
	[StatTracking.SEEK]: {
		id: StatTracking.SEEK,
		name: {
			EN: 'Scavenger',
			FR: 'Fouilleur',
			DE: 'Graber',
			ES: 'Buscador'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_fouille.gif',
				title: {
					EN: 'Pebble Collector',
					FR: 'Ramasseur DE cailloux',
					DE: 'Kieswühler',
					ES: 'Recogedor DE piedritas'
				},
				description: {
					EN: 'Number of scavenges carried out.',
					FR: "Nombre d'actions DE fouilles réalisées.",
					DE: 'Anzahl der von dir ausgeführten Grabungen',
					ES: 'Cantidad DE excavaciones realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Skilled Scavenger',
					FR: 'Fouilleur assidu',
					DE: 'Eifriger Buddler',
					ES: 'Excavador aficionado'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Ruin Fan',
					FR: 'Amateur DE ruines',
					DE: 'Ruinennovize',
					ES: 'Excavador profesional'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Documented Architect',
					FR: 'Archéologue documenté',
					DE: 'Diplomierter Archäologe',
					ES: 'Maestro DE excavaciones'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Treasure Inventor',
					FR: 'Inventeur DE trésor',
					DE: 'Schatzfinder',
					ES: 'Buscatesoros'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					EN: '>Master of Discoveries',
					FR: 'Maître des décombres',
					DE: 'Herr der Ausgrabungen',
					ES: 'Arqueólogo'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					EN: 'Expert on Ancient Worlds',
					FR: 'Expert des mondes Antiques',
					DE: 'Fachmann für Antike',
					ES: 'Gran Descubridor'
				}
			}
		],
		description: {
			EN: 'Number of scavenges carried out',
			FR: "Nombre d'actions DE fouilles réalisées",
			DE: 'Anzahl der von dir ausgeführten Grabungen',
			ES: 'Cantidad DE excavaciones realizadas'
		}
	},
	[StatTracking.MARKET]: {
		id: StatTracking.MARKET,
		name: {
			EN: 'Salesman',
			FR: 'Vendeur',
			DE: 'Verkäufer',
			ES: 'Vendedor'
		},
		rare: 0,
		unlocks: [
			{
				count: 2,
				points: 1,
				icon: 'r_market.gif',
				title: {
					EN: 'Soul of Camelot',
					FR: 'Âme DE camelot',
					DE: 'Seele von Camelot',
					ES: 'Vendedor Debutante'
				},
				description: {
					EN: 'Number of sales made at the market.',
					FR: 'Nombre DE ventes conclues au marché.',
					DE: 'Anzahl der auf dem Markt verkauften Artikel',
					ES: 'Cantidad DE ventas EN el Mercado.'
				}
			},
			{
				count: 5,
				points: 1,
				title: {
					EN: 'Bric-a-brac stallkeeper',
					FR: 'Brocanteur futé',
					DE: 'Pfiffiger Trödelhändler',
					ES: 'Vendedor Ocasional'
				}
			},
			{
				count: 10,
				points: 1,
				title: {
					EN: 'Wise Trader',
					FR: 'Marchand avisé',
					DE: 'Besonnener Verkäufer',
					ES: 'Vendedor Reconocido'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					EN: 'Experienced Merchant',
					FR: 'Fournisseur expérimenté',
					DE: 'Erfahrener Anbieter',
					ES: 'Vendedor Experimentado'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Dinoz Broker',
					FR: 'Négociant EN Dinoz',
					DE: 'Gordon Dinoz',
					ES: 'Proveedor DE Dinos'
				}
			},
			{
				count: 100,
				points: 0,
				title: {
					EN: 'Master Trafficker',
					FR: 'Maître Trafiquant',
					DE: 'Meister der Verschieber',
					ES: 'Gran Distribuidor'
				}
			},
			{
				count: 500,
				points: 0,
				title: {
					EN: 'Traffick-King',
					FR: 'Roi Trafiquant',
					DE: 'König der Verschieber',
					ES: 'Traficante DE Dinos'
				}
			}
		],
		description: {
			EN: 'Number of sales made at the market',
			FR: 'Nombre DE ventes conclues au marché',
			DE: 'Anzahl der auf dem Markt verkauften Artikel',
			ES: 'Cantidad DE ventas EN el Mercado'
		}
	},
	[StatTracking.S_BUYER]: {
		id: StatTracking.S_BUYER,
		name: {
			EN: 'Buyer',
			FR: 'Acheteur',
			DE: 'Käufer',
			ES: 'Comprador'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_purse.gif',
				title: {
					EN: 'Bargain Hunter',
					FR: 'Chineur du dimanche',
					DE: 'Schnäppchenjäger',
					ES: 'Comprador Ocasional'
				},
				description: {
					EN: 'Number of purchases made in the shop',
					FR: "Nombre d'objet acquis EN boutique",
					DE: 'Anzahl der in Geschäften gekauften Artikel',
					ES: 'Cantidad DE objetos adquiridos EN la tienda'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Aware Buyer',
					FR: 'Acheteur averti',
					DE: 'Erfahrener Käufer',
					ES: 'Comprador Novato'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					EN: 'Compulsive Buyer',
					FR: 'Consommateur compulsif',
					DE: 'Zwanghafter Käufer',
					ES: 'Comprador Exigente'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					EN: 'Panic Buyer',
					FR: 'Acquéreur fièvreux',
					DE: 'Kaufsüchtiger',
					ES: 'Comprador Exquisito'
				}
			},
			{
				count: 2000,
				points: 1,
				title: {
					EN: 'Master Promoter',
					FR: 'Maître promoteur',
					DE: 'Meisterpromoter',
					ES: 'Casi Magnate'
				}
			},
			{
				count: 10000,
				points: 1,
				title: {
					EN: 'Caveat Emptor',
					FR: 'Géant DE la consommation',
					DE: 'Ungezügelter Konsument',
					ES: 'Magnate'
				}
			},
			{
				count: 25000,
				points: 0,
				title: {
					EN: 'Hardcore Gamer',
					FR: 'Hardcore gamer',
					DE: 'Hardcore-Gamer',
					ES: 'Super Magnate'
				}
			}
		],
		description: {
			EN: 'Number of purchases made in the shop',
			FR: "Nombre d'objets acquis EN boutique",
			DE: 'Anzahl der in Geschäften gekauften Artikel',
			ES: 'Cantidad DE objetos adquiridos EN la tienda'
		}
	},
	[StatTracking.CLANS]: {
		id: StatTracking.CLANS,
		name: {
			EN: 'Community Life',
			FR: 'Vie communautaire',
			DE: 'Leben in der Community',
			ES: 'Fama'
		},
		rare: 0,
		unlocks: [
			{
				count: 5,
				points: 1,
				icon: 'r_mercenaire.gif',
				prefix: true,
				title: {
					EN: 'Vagabond',
					FR: 'Vagabond',
					DE: 'Vagabund',
					ES: 'Vagabundo'
				},
				description: {
					EN: 'Number of clans this player has appeared in.',
					FR: 'Nombre DE clans dans lequel le joueur a été aperçu.',
					DE: 'Anzahl der Klans, in denen du schon einmal warst',
					ES: 'Cantidad DE clanes EN los que has sido identificado.'
				}
			},
			{
				count: 50,
				points: 0,
				prefix: true,
				title: {
					EN: 'Mercenary',
					FR: 'Mercenaire',
					DE: 'Söldner',
					ES: 'Mercenario'
				}
			},
			{
				count: 100,
				points: 0,
				prefix: true,
				title: {
					EN: 'Dorogon Knight',
					FR: 'Chevalier Dorogon',
					DE: 'Ritter der Dorogon',
					ES: 'Caballero Dorogón'
				}
			}
		],
		description: {
			EN: 'Number of clans this player has appeared in',
			FR: 'Nombre DE clans dans lequel le joueur a été aperçu',
			DE: 'Anzahl der Klans, in denen du schon einmal warst',
			ES: 'Cantidad DE clanes EN los que has sido identificado'
		}
	},
	[StatTracking.BEAUTY]: {
		id: StatTracking.BEAUTY,
		name: {
			EN: 'Beautician',
			FR: 'Plasticien',
			DE: 'Kosmetiker',
			ES: 'Estrella'
		},
		rare: 0,
		unlocks: [
			{
				count: 2,
				points: 1,
				icon: 'r_beauty.gif',
				title: {
					EN: 'Gifted Groomer',
					FR: 'Toiletteur doué',
					DE: 'Begabter Friseur',
					ES: 'Ojos lindos'
				},
				description: {
					EN: "Number of Beauty Contest titles won by this player's dinoz.",
					FR: 'Nombre DE titres DE beautés remportés par les Dinoz du joueur.',
					DE: 'Anzahl der von deinen Dinoz gewonnenen Schönheitstitel',
					ES: 'Cantidad DE títulos DE belleza.'
				}
			},
			{
				count: 5,
				points: 0,
				title: {
					EN: 'Qualified Make-up Artist',
					FR: 'Maquilleur chevronné',
					DE: 'Versierter Maskenbildner',
					ES: 'Buena pinta'
				}
			},
			{
				count: 10,
				points: 0,
				title: {
					EN: 'Aesthetic Designer',
					FR: 'Designer esthète',
					DE: 'Ästhet & Designer',
					ES: 'Guapo del barrrio'
				}
			},
			{
				count: 20,
				points: 0,
				title: {
					EN: 'Professional Beautician',
					FR: 'Plasticien professionnel',
					DE: 'Schönheitschirurg',
					ES: 'Perfil Griego'
				}
			},
			{
				count: 50,
				points: 0,
				title: {
					EN: 'Master Aesthetician',
					FR: 'Maître Apollon',
					DE: 'Meister Apollo',
					ES: 'Maestro Apolo'
				}
			}
		],
		description: {
			EN: "Number of Beauty Contest titles won by this player's dinoz",
			FR: 'Nombre DE titres DE beautés remportés par les Dinoz du joueur',
			DE: 'Anzahl der von deinen Dinoz gewonnenen Schönheitstitel',
			ES: 'Cantidad DE títulos DE belleza'
		}
	},
	[StatTracking.GDC_ATK]: {
		id: StatTracking.GDC_ATK,
		name: {
			EN: 'Attacker',
			FR: 'Assaillant',
			DE: 'Angreifer',
			ES: 'Atacante'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_attack.gif',
				title: {
					EN: 'Battlefield dwarf',
					FR: 'Nain des champs DE bataille',
					DE: 'Kampfzwerg',
					ES: 'Duende'
				},
				description: {
					EN: 'Number of attacks carried out against enemy castles.',
					FR: "Nombre d'attaques menées contre un château adverse.",
					DE: 'So oft hast du ein gegnerisches Schloss angegriffen',
					ES: 'Cantidad DE atacantes enviados al castillo enemigo.'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Scourge of the Sandbox',
					FR: 'Terreur des bacs à sable',
					DE: 'Sandkastenschreck',
					ES: 'Bárbaro'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Pit Pillager',
					FR: 'Screugnargneux',
					DE: 'Schlossstürmer',
					ES: 'Golpeador'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					EN: 'Barricade Basher',
					FR: 'Barbar’apapa',
					DE: 'Stürmender Barbar',
					ES: 'Guerrillero'
				}
			},
			{
				count: 800,
				points: 1,
				title: {
					EN: 'Scarecrusher',
					FR: 'Epouvantraille',
					DE: 'Herzloser Belagerer',
					ES: 'Demoledor'
				}
			},
			{
				count: 1500,
				points: 0,
				title: {
					EN: 'Hardcore Attacker',
					FR: 'Gros bourrin',
					DE: 'Gefürchteter Schleifer',
					ES: 'Rompecastillos'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					EN: 'Destructor General',
					FR: 'Roi destructeur',
					DE: 'Legendärer Zerstörer',
					ES: 'Gran Devastador'
				}
			},
			{
				count: 3000,
				points: 0,
				title: {
					EN: 'Almighty Destroyer',
					FR: 'Dieu destructeur',
					DE: 'Gott der Zerstörung',
					ES: 'Dios DE la Guerra'
				}
			}
		],
		description: {
			EN: 'Number of attacks carried out against enemy castles',
			FR: "Nombre d'attaques menées contre un château adverse",
			DE: 'So viele Male hast du ein gegnerisches Schloss angegriffen',
			ES: 'Cantidad DE atacantes enviados al castillo enemigo'
		}
	},
	[StatTracking.GDC_DEF]: {
		id: StatTracking.GDC_DEF,
		name: {
			EN: 'Defender',
			FR: 'Defenseur',
			DE: 'Verteidiger',
			ES: 'Defensor'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_defense.gif',
				title: {
					EN: 'Thorn in the foot',
					FR: 'Epine dans le pied',
					DE: 'Splitter im Fuß',
					ES: 'Vigilante'
				},
				description: {
					EN: 'Number of times you have defended your castle.',
					FR: 'Nombre DE fois où vous avez défendu votre château.',
					DE: 'So viele Male hast du dein Schloss verteidigt',
					ES: 'Cantidad DE veces que has defendido tu castillo.'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					EN: 'Mousetrap',
					FR: 'Piège à loup',
					DE: 'Wolfsfalle',
					ES: 'Guardián'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					EN: 'Stake Pit',
					FR: 'Barricade magique',
					DE: 'Magische Barrikade',
					ES: 'Escudero'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					EN: 'Bear Trap',
					FR: 'Chevalier émérite',
					DE: 'Gewandter Ritter',
					ES: 'Valiente'
				}
			},
			{
				count: 800,
				points: 1,
				title: {
					EN: 'Brave Heart',
					FR: 'Coeur vaillant',
					DE: 'Tapferes Herz',
					ES: 'Corazón Valiente'
				}
			},
			{
				count: 1500,
				points: 0,
				title: {
					EN: 'Defender Rampant',
					FR: 'Rempart sacré',
					DE: 'Gesegneter Schutzwall',
					ES: 'Gran Protector'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					EN: 'Brick Top',
					FR: 'Mur ultime',
					DE: 'Unüberwindbare Mauer',
					ES: 'Héroe Defensor'
				}
			},
			{
				count: 3000,
				points: 0,
				title: {
					EN: 'Knight of Legend',
					FR: 'Paladin légendaire',
					DE: 'Legendärer Paladin',
					ES: 'Defensor Legendario'
				}
			}
		],
		description: {
			EN: 'Number of times you have defended your castle',
			FR: 'Nombre DE fois où vous avez défendu votre château',
			DE: 'So viele Male hast du dein Schloss verteidigt',
			ES: 'Cantidad DE veces que has defendido tu castillo'
		}
	},
	[StatTracking.BGUM]: {
		id: StatTracking.BGUM,
		name: {
			EN: 'Dinoland Community',
			FR: 'Médaille cool',
			DE: 'Dinoland Community',
			ES: 'Heraldo DE Dinoland'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_bgum.gif',
				title: {
					EN: 'Kiss Cool™',
					FR: 'Bisou Cool™',
					DE: 'Lotse',
					ES: 'Simpático™'
				},
				description: {
					EN: 'For those who are committed to making Dinoland an even better place!',
					FR: 'Vous oeuvrez pour rendre le monde DE Dinoland encore meilleur !',
					DE: 'Du bist ein aktives Mitglieder der Dinoland-Community!',
					ES: '¡Maestros como tú hacen que Dinoland sea cada vez mejor!'
				}
			},
			{
				count: 5,
				points: 0,
				title: {
					EN: 'Proven Mediator',
					FR: 'Mediator accordé',
					DE: 'Beredter Vermittler',
					ES: 'Maestro reconocido'
				}
			},
			{
				count: 10,
				points: 0,
				title: {
					EN: 'Good Time Manager',
					FR: 'Tenancier du bon goût',
					DE: 'Guter Geschmack im Überfluss',
					ES: 'Maestro famoso'
				}
			},
			{
				count: 15,
				points: 0,
				title: {
					EN: 'Enlightener of the Dark World',
					FR: 'Eclaireur du monde sombre',
					DE: 'Erleuchter der dunklen Welt',
					ES: 'Iluminador del Mundo Sombra'
				}
			},
			{
				count: 20,
				points: 0,
				title: {
					EN: 'Michael the Guide v2.0',
					FR: 'Guide Michel 2.0',
					DE: 'Guide Michel 2.0',
					ES: 'Guía Michel 2.0'
				}
			},
			{
				count: 30,
				points: 0,
				title: {
					EN: "Papy Joe's Twin",
					FR: 'Jumeau DE Papy joe',
					DE: 'Papy Joes Zwilling',
					ES: 'Nieto DE Papy Jose'
				}
			},
			{
				count: 50,
				points: 0,
				title: {
					EN: "Bao's Ancestor",
					FR: 'Ancêtre DE Bao',
					DE: 'Vorfahre Baos',
					ES: 'Ancestro DE Bao'
				}
			},
			{
				count: 100,
				points: 0,
				title: {
					EN: 'Archdorogon',
					FR: 'Archidorogon',
					DE: 'Erzdorogon',
					ES: 'Archidorogón'
				}
			},
			{
				count: 150,
				points: 0,
				title: {
					EN: '6th Guardian of Dinoland',
					FR: '6ème Gardien DE Dinoland',
					DE: '6. Wächter von Dinoland',
					ES: '6to Guardián DE Dinoland'
				}
			}
		],
		description: {
			EN: 'The most giving of Dinoz masters',
			FR: 'La crême des maîtres Dinoz',
			DE: 'Die Crème DE la Crème der Dinozmeister',
			ES: 'Aportes al sitio y a la comunidad'
		}
	},
	[StatTracking.MERGUEZ]: {
		id: StatTracking.MERGUEZ,
		name: {
			EN: 'Merguez consumed',
			FR: 'Merguez consommées',
			DE: 'Verzehrte Merguez',
			ES: 'Salchichas consumidas'
		},
		rare: 2,
		unlocks: [],
		description: {
			EN: 'Number of merguez sausages consumed',
			FR: 'Nombre DE merguez consommées',
			DE: 'Anzahl der verzehrten Merguez',
			ES: 'Cantidad DE salchichas consumidas'
		}
	},
	[StatTracking.MEDAL_1]: {
		id: StatTracking.MEDAL_1,
		name: {
			EN: 'Gold Medal',
			FR: "Médaille d'or",
			DE: 'Goldmedaille',
			ES: 'Medalla dinolímpica DE oro'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_medgol.gif',
				title: {
					EN: 'Gold Medal',
					FR: "Médaille d'or",
					DE: 'Goldmedaille',
					ES: 'Medallista olímpico DE oro'
				},
				description: {
					EN: 'You finished first! Congratulations!',
					FR: 'Vous avez fini premier ! Félicitations !',
					DE: 'Herzlichen Glückwunsch, ihr seid erster!',
					ES: '¡Eres el Número 1 EN los juegos Dinolímpicos! ¡Hurraa!'
				}
			}
		],
		description: {
			EN: 'You are the Dinolympic Games Gold Medallist! Congratulations!',
			FR: 'Vous avez fini premier !',
			DE: 'Ihr seid erster!',
			ES: '¡Eres el Número 1 EN los juegos Dinolímpicos! ¡Hurraa!'
		}
	},
	[StatTracking.MEDAL_2]: {
		id: StatTracking.MEDAL_2,
		name: {
			EN: 'Silver medal',
			FR: "Médaille d'argent",
			DE: 'Silbermedaille',
			ES: 'Medalla dinolímpica DE plata'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_medsil.gif',
				title: {
					EN: 'Silver Medal',
					FR: "Médaille d'argent",
					DE: 'Silbermedaille',
					ES: 'Medallista olímpico DE plata'
				},
				description: {
					EN: 'You finished second! Bravo!',
					FR: 'Vous avez fini second ! Bravo !',
					DE: 'Bravo, ihr seid zweiter!',
					ES: '¡Segundo lugar EN los 1ros. Juegos Dinolímpicos Internacionales!'
				}
			}
		],
		description: {
			EN: 'The Silver Medallist in the 1st Dinolympic Games!',
			FR: 'Vous avez fini second !',
			DE: 'Bravo, ihr seid zweiter',
			ES: '¡Segundo lugar EN los 1ros. Juegos Dinolímpicos Internacionales!'
		}
	},
	[StatTracking.MEDAL_3]: {
		id: StatTracking.MEDAL_3,
		name: {
			EN: 'Bronze Medal',
			FR: 'Médaille DE bronze',
			DE: 'Bronzemedaille',
			ES: 'Medalla dinolímpica DE bronce'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_medbro.gif',
				title: {
					EN: 'Bronze Medal',
					FR: 'Médaille DE bronze',
					DE: 'Bronzemedaille',
					ES: 'Medallista olímpico DE bronce'
				},
				description: {
					EN: 'You finished third! Great performance!',
					FR: "Vous avez fini troisième ! C'est une très belle performance !",
					DE: 'Ihr seid auf Rang drei. Super Leistung!',
					ES: '¡Tercer lugar EN los 1ros. Juegos Dinolímpicos Internacionales!'
				}
			}
		],
		description: {
			EN: 'The Bronze medal winner in the 1st Dinolympic Games!',
			FR: 'Vous avez fini troisième !',
			DE: 'Ihr seid auf Rang drei!',
			ES: '¡Tercer lugar EN los 1ros. Juegos Dinolímpicos Internacionales!'
		}
	},
	[StatTracking.MEDAL_4]: {
		id: StatTracking.MEDAL_4,
		name: {
			EN: 'Participation Medal',
			FR: 'Médaille DE participation',
			DE: 'Teilnahmemedaille',
			ES: 'Medalla dinolímpica DE vidrio'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_medpla.gif',
				title: {
					EN: 'Dinolympic Medal',
					FR: 'Médaille DE participation',
					DE: 'Teilnahmemedaille',
					ES: 'Atleta olímpico'
				},
				description: {
					EN: 'Dinolympic Athlete - be proud of your achievements!',
					FR: 'Vous avez réussi à vous classer parmi les meilleurs participants !',
					DE: 'Ihr gehört zu den besten Teilnehmern!!',
					ES: '¡Te colocaste EN el Top 10 DE nuestro servidor EN los 1ros. Juegos Dinolímpicos!'
				}
			}
		],
		description: {
			EN: 'You were ranked amongst the top Dinolympic competitors!',
			FR: 'Vous avez réussi à vous classer parmi les meilleurs participants !',
			DE: 'Ihr gehört zu den besten Teilnehmern!',
			ES: '¡Te colocaste EN el Top 10 DE nuestro servidor EN los 1ros. Juegos Dinolímpicos!'
		}
	},
	[StatTracking.LEVELUP_1]: {
		id: StatTracking.LEVELUP_1,
		name: {
			EN: '1st Limit Broken',
			FR: '1ère limite brisée',
			DE: '1st Limit Broken',
			ES: '1er limite roto'
		},
		rare: 0,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'fx_lvlup1.gif',
				title: {
					EN: '2nd Limit Broken',
					FR: '1ère limite brisée',
					DE: '2nd Limit Broken',
					ES: '1er limite roto'
				},
				description: {
					EN: 'Your dinoz have evolved and reached level 60!',
					FR: "Vous avez fait évoluer vos dinoz jusqu'au niveau 60 !",
					DE: 'Your dinoz have evolved and reached level 60!',
					ES: '¡Has hecho evolucionar tus Dinos hasta el nivel 60!'
				}
			}
		],
		description: {
			EN: 'Your dinoz have evolved!',
			FR: 'Vos dinoz ont évolué !',
			DE: 'Your dinoz have evolved!',
			ES: '¡Tus dinos han evolucionado!'
		}
	},
	[StatTracking.LEVELUP_2]: {
		id: StatTracking.LEVELUP_2,
		name: {
			EN: '2nd Limit Broken',
			FR: '2ème limite brisée',
			DE: '2nd Limit Broken',
			ES: '2do limite roto'
		},
		rare: 0,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'fx_lvlup2.gif',
				title: {
					EN: '2nd Limit Broken',
					FR: '2ème limite brisée',
					DE: '2nd Limit Broken',
					ES: '2do limite roto'
				},
				description: {
					EN: 'Your dinoz have evolved and reached level 70!',
					FR: "Vous avez fait évoluer vos dinoz jusqu'au niveau 70 !",
					DE: 'Your dinoz have evolved and reached level 70!',
					ES: '¡Has hecho evolucionar tus Dinos hasta el nivel 70!'
				}
			}
		],
		description: {
			EN: 'Your dinoz have evolved!',
			FR: 'Vos dinoz ont évolué !',
			DE: 'Your dinoz have evolved!',
			ES: '¡Tus dinos han evolucionado!'
		}
	},
	[StatTracking.CARD]: {
		id: StatTracking.CARD,
		name: {
			EN: 'Merguez Deluxe Loyalty Card', // TODO: Translation pending review
			FR: 'Carte DE Fidélité Merguez Deluxe',
			DE: 'Merguez-Deluxe-Treuekarte', // TODO: Translation pending review
			ES: 'Tarjeta DE Fidelidad Salchichas Deluxe'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_card.webp'
			}
		],
		description: {
			EN: 'Grillée à la perfection et tamponnée par le Vendeur DE Merguez lui-même, cette carte sacrée récompense les estomacs les plus endurants. Après avoir englouti un nombre indécent DE merguez, vous voilà promu au rang DE Grand Gourmand Officiel. Dorénavant, vos achats explosent les compteurs : x100 merguez d’un coup, parce que x5, c’est pour les amateurs.', // TODO: No translation available
			FR: 'Grillée à la perfection et tamponnée par le Vendeur DE Merguez lui-même, cette carte sacrée récompense les estomacs les plus endurants. Après avoir englouti un nombre indécent DE merguez, vous voilà promu au rang DE Grand Gourmand Officiel. Dorénavant, vos achats explosent les compteurs : x100 merguez d’un coup, parce que x5, c’est pour les amateurs.',
			DE: 'Grillée à la perfection et tamponnée par le Vendeur DE Merguez lui-même, cette carte sacrée récompense les estomacs les plus endurants. Après avoir englouti un nombre indécent DE merguez, vous voilà promu au rang DE Grand Gourmand Officiel. Dorénavant, vos achats explosent les compteurs : x100 merguez d’un coup, parce que x5, c’est pour les amateurs.', // TODO: No translation available
			ES: 'Asada a la perfección y sellada por el Vendedor DE Salchichas EN persona. Esta carta sagrada recompensa a los estómagos más resistentes. Después DE haber devorado una cantidad indecente DE salchichas, ahora has sido ascendido al rango DE Gran Glotón Oficial.'
		}
	},
	[StatTracking.PAC]: {
		id: StatTracking.PAC,
		name: {
			EN: 'Scroll of Compiled Abilities',
			FR: 'Parchemin des Aptitudes Compilées',
			DE: 'Schriftrolle der Gesammelten Fähigkeiten',
			ES: 'Pergamino DE Competencias Compiladas'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_pac.webp'
			}
		],
		description: {
			EN: 'The Scroll of Compiled Abilities is a sophisticated artifact that lists instantly all the skills mastered by your Dinoz. It gives a clear overview and a detailed breakdown of each talent in one look.',
			FR: "Le Parchemin des Aptitudes Compilées est un artefact élégant qui répertorie instantanément l'ensemble des compétences maîtrisées par vos Dinoz, offrant un aperçu clair et détaillé DE leurs talents EN un seul regard.",
			DE: 'Die Schriftrolle der Gesammelten Fähigkeiten ist ein elegantes Artefakt, das alle von deinen Dinoz beherrschten Fähigkeiten auflistet und dir auf einen Blick eine klare und detaillierte Übersicht über deren Talente verschafft.',
			ES: 'El Pergamino DE Competencias Compiladas ES un artefacto elegante que registra instantáneamente todas las competencias dominadas por tus Dinos, ofreciendo una visión clara y detallada DE sus talentos DE un solo vistazo.'
		}
	}
};
