import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { DinozConcentrationState, Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

const REQUIRED_DINOZ_COUNT = 7;

type Transaction = Prisma.TransactionClient;

type StartConcentrationResult = {
	sessionId: number;
	participantCount: number;
	portalOpened: boolean;
};

function buildScopeKey(user: { id: string; clanId: number | null }): string {
	if (user.clanId !== null) {
		return `clan:${user.clanId}`;
	}
	return `user:${user.id}`;
}

/**
 * Empêche deux Dinoz du même joueur/clan de modifier la session
 * exactement au même moment.
 *
 * Le verrou est automatiquement libéré à la fin de la transaction.
 */
async function lockConcentrationScope(tx: Transaction, scopeKey: string): Promise<void> {
	await tx.$executeRaw`
		SELECT pg_advisory_xact_lock(hashtext(${scopeKey}))
	`;
}

async function getOwnedDinozScope(tx: Transaction, userId: string, dinozId: number): Promise<string> {
	const dinoz = await tx.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			id: true,
			userId: true,
			user: {
				select: {
					id: true,
					clanId: true
				}
			}
		}
	});
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', {
			params: {
				dinozId
			}
		});
	}
	if (dinoz.userId !== userId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId
			}
		});
	}
	return buildScopeKey(dinoz.user);
}

function hasStatus(statuses: Array<{ statusId: number }>, statusId: DinozStatusId): boolean {
	return statuses.some(status => status.statusId === statusId);
}

/**
 * Démarre la concentration depuis une transaction existante.
 *
 * Cette fonction sera appelée par le moteur de dialogue.
 */
export async function startDinozConcentration(
	tx: Transaction,
	userId: string,
	dinozId: number
): Promise<StartConcentrationResult> {
	const scopeKey = await getOwnedDinozScope(tx, userId, dinozId);
	/*
	 * Toutes les modifications d'une même portée sont sérialisées.
	 * Cela empêche deux "septième Dinoz" d'être ajoutés simultanément.
	 */
	await lockConcentrationScope(tx, scopeKey);
	/*
	 * Nous rechargeons le Dinoz après avoir obtenu le verrou.
	 * Son état a pu être modifié pendant l'attente.
	 */
	const dinoz = await tx.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			id: true,
			userId: true,
			placeId: true,
			life: true,
			state: true,
			leaderId: true,
			followers: {
				select: {
					id: true
				}
			},
			status: {
				select: {
					statusId: true
				}
			},
			concentration: {
				select: {
					dinozId: true
				}
			}
		}
	});
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', {
			params: {
				dinozId
			}
		});
	}
	if (dinoz.userId !== userId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId
			}
		});
	}
	if (dinoz.placeId !== PlaceEnum.BAO_BOB) {
		throw new ExpectedError('concentrationInvalidPlace', {
			params: {
				dinozId,
				expectedPlaceId: PlaceEnum.BAO_BOB
			}
		});
	}
	if (dinoz.life <= 0) {
		throw new ExpectedError('concentrationDeadDinoz', {
			params: {
				dinozId
			}
		});
	}
	if (dinoz.state !== null) {
		throw new ExpectedError('concentrationUnavailableDinoz', {
			params: {
				dinozId
			}
		});
	}
	if (dinoz.leaderId !== null || dinoz.followers.length > 0) {
		await tx.dinoz.updateMany({
			where: {
				OR: [
					{
						id: dinozId
					},
					{
						leaderId: dinozId
					}
				]
			},
			data: {
				leaderId: null
			}
		});
	}
	/*
	 * Le dialogue de Mr Bao est déjà conditionné par fx(palmes).
	 * Nous répétons néanmoins la validation côté serveur.
	 */
	if (!hasStatus(dinoz.status, DinozStatusId.FLIPPERS)) {
		throw new ExpectedError('concentrationMissingFlippers', {
			params: {
				dinozId
			}
		});
	}
	if (hasStatus(dinoz.status, DinozStatusId.SYLVENOIRE_KEY)) {
		throw new ExpectedError('concentrationSylvenoireKey', {
			params: {
				dinozId
			}
		});
	}
	if (dinoz.concentration) {
		throw new ExpectedError('dinozAlreadyConcentrating', {
			params: {
				dinozId
			}
		});
	}
	let session = await tx.dinozConcentrationSession.findUnique({
		where: {
			scopeKey
		},
		select: {
			id: true,
			state: true
		}
	});
	if (!session) {
		session = await tx.dinozConcentrationSession.create({
			data: {
				scopeKey
			},
			select: {
				id: true,
				state: true
			}
		});
	}
	/*
	 * Une session ouverte n'accepte plus de nouveaux participants.
	 * Seuls les sept Dinoz déjà enregistrés peuvent entrer.
	 */
	if (session.state === DinozConcentrationState.OPEN) {
		throw new ExpectedError('concentrationAlreadyOpen', {
			params: {
				dinozId
			}
		});
	}
	const currentParticipantCount = await tx.dinozConcentration.count({
		where: {
			sessionId: session.id
		}
	});
	if (currentParticipantCount >= REQUIRED_DINOZ_COUNT) {
		throw new ExpectedError('concentrationFull', {
			params: {
				dinozId,
				required: REQUIRED_DINOZ_COUNT
			}
		});
	}
	await tx.dinozConcentration.create({
		data: {
			dinozId,
			sessionId: session.id
		}
	});
	const participantCount = currentParticipantCount + 1;
	const portalOpened = participantCount === REQUIRED_DINOZ_COUNT;
	if (portalOpened) {
		await tx.dinozConcentrationSession.update({
			where: {
				id: session.id
			},
			data: {
				state: DinozConcentrationState.OPEN,
				openedAt: new Date()
			}
		});
	}
	return {
		sessionId: session.id,
		participantCount,
		portalOpened
	};
}

async function getOwnedParticipation(tx: Transaction, userId: string, dinozId: number) {
	const participation = await tx.dinozConcentration.findUnique({
		where: {
			dinozId
		},
		select: {
			dinozId: true,
			sessionId: true,
			session: {
				select: {
					id: true,
					scopeKey: true,
					state: true
				}
			},
			dinoz: {
				select: {
					id: true,
					userId: true,
					placeId: true,
					life: true,
					status: {
						select: {
							statusId: true
						}
					}
				}
			}
		}
	});
	if (!participation) {
		throw new ExpectedError('dinozNotConcentrating', {
			params: {
				dinozId
			}
		});
	}
	if (participation.dinoz.userId !== userId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId
			}
		});
	}
	return participation;
}

/**
 * Annule la concentration.
 *
 * L'annulation est interdite dès que les sept Dinoz sont présents.
 */
export async function stopDinozConcentration(userId: string, dinozId: number): Promise<void> {
	await prisma.$transaction(async tx => {
		const initialParticipation = await getOwnedParticipation(tx, userId, dinozId);
		await lockConcentrationScope(tx, initialParticipation.session.scopeKey);
		/*
		 * Relecture après obtention du verrou.
		 */
		const participation = await getOwnedParticipation(tx, userId, dinozId);
		if (participation.session.state === DinozConcentrationState.OPEN) {
			throw new ExpectedError('concentrationCannotStopAfterOpening', {
				params: {
					dinozId
				}
			});
		}
		await tx.dinozConcentration.delete({
			where: {
				dinozId
			}
		});
		const remainingParticipants = await tx.dinozConcentration.count({
			where: {
				sessionId: participation.sessionId
			}
		});
		/*
		 * Si plus aucun Dinoz ne se concentre,
		 * la session active n'a plus de raison d'exister.
		 */
		if (remainingParticipants === 0) {
			await tx.dinozConcentrationSession.delete({
				where: {
					id: participation.sessionId
				}
			});
		}
	});
}

/**
 * Téléporte un Dinoz dans le Monde sombre.
 */
export async function enterDarkPortal(userId: string, dinozId: number): Promise<void> {
	await prisma.$transaction(async tx => {
		const initialParticipation = await getOwnedParticipation(tx, userId, dinozId);
		await lockConcentrationScope(tx, initialParticipation.session.scopeKey);
		const participation = await getOwnedParticipation(tx, userId, dinozId);
		if (participation.session.state !== DinozConcentrationState.OPEN) {
			throw new ExpectedError('concentrationNotCompleted', {
				params: {
					dinozId,
					required: REQUIRED_DINOZ_COUNT
				}
			});
		}
		if (participation.dinoz.placeId !== PlaceEnum.BAO_BOB) {
			throw new ExpectedError('concentrationInvalidPlace', {
				params: {
					dinozId,
					expectedPlaceId: PlaceEnum.BAO_BOB
				}
			});
		}
		if (participation.dinoz.life <= 0) {
			throw new ExpectedError('concentrationDeadDinoz', {
				params: {
					dinozId
				}
			});
		}
		if (hasStatus(participation.dinoz.status, DinozStatusId.SYLVENOIRE_KEY)) {
			throw new ExpectedError('concentrationSylvenoireKey', {
				params: {
					dinozId
				}
			});
		}
		await tx.dinoz.update({
			where: {
				id: dinozId
			},
			data: {
				placeId: PlaceEnum.PORTAIL
			}
		});
		/*
		 * Le Dinoz quitte les participants, mais la session reste OPEN.
		 * Les autres Dinoz peuvent donc continuer à entrer.
		 */
		await tx.dinozConcentration.delete({
			where: {
				dinozId
			}
		});
		const remainingParticipants = await tx.dinozConcentration.count({
			where: {
				sessionId: participation.sessionId
			}
		});
		if (remainingParticipants === 0) {
			await tx.dinozConcentrationSession.delete({
				where: {
					id: participation.sessionId
				}
			});
		}
	});
}

/**
 * Garde générique à appeler dans les autres actions sensibles.
 */
export async function assertDinozNotConcentrating(dinozId: number): Promise<void> {
	const concentration = await prisma.dinozConcentration.findUnique({
		where: {
			dinozId
		},
		select: {
			dinozId: true
		}
	});
	if (concentration) {
		throw new ExpectedError('dinozConcentrating', {
			params: {
				dinozId
			}
		});
	}
}
