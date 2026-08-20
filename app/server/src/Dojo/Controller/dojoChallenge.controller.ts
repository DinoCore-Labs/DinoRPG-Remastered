import { DINOZ_STATE } from '@dinorpg/core/models/dinoz/dinozState.js';
import { Challenge, challengeRanges, ChallengeType } from '@dinorpg/core/models/dojo/challenge.js';

import { prisma } from '../../prisma.js';

export function generateRandomChallenge(): Challenge {
	const challengeTypes = Object.values(ChallengeType);
	const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)] as ChallengeType;
	const [min, max] = challengeRanges[randomType];
	const randomGoal = Math.floor(Math.random() * (max - min + 1)) + min;

	return {
		type: randomType,
		goal: randomGoal
	};
}

export async function getDojoChallengePreparationRequest(userId: string) {
	const today = new Date();

	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			dinoz: {
				select: {
					id: true,
					state: true
				}
			},
			dojo: {
				select: {
					id: true,
					activeChallenge: true,
					team: {
						select: {
							dinozId: true,
							fighted: true
						}
					},
					DojoOpponents: {
						select: {
							dinozId: true,
							fighted: true,
							achieved: true
						}
					},
					DojoChallengeHistory: {
						where: {
							archivedAt: today
						},
						select: {
							achieved: true
						}
					}
				}
			}
		}
	});

	return user;
}

export async function getDojoDataForRanking(userId: string) {
	return prisma.dojo.findFirstOrThrow({
		where: {
			userId
		},
		select: {
			reputation: true,
			DojoChallengeHistory: true
		}
	});
}

export async function incrementDailyReset(dojoId: string) {
	await prisma.dojo.update({
		where: {
			id: dojoId
		},
		data: {
			dailyReset: { increment: 1 }
		}
	});
}

export async function getPlayerDinozInformationForTeam(userId: string) {
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			dinoz: {
				where: {
					OR: [
						{ state: null },
						{
							state: {
								not: {
									in: [DINOZ_STATE.frozen, DINOZ_STATE.sacrificed, DINOZ_STATE.selling, DINOZ_STATE.unfreezing]
								}
							}
						}
					]
				},
				select: {
					id: true,
					level: true,
					raceId: true
				}
			},
			dojo: {
				select: {
					id: true,
					tournamentTeamId: true
				}
			}
		}
	});
	return user;
}

export async function pickOpponentIds(team: { id: number; level: number }[], userId: string): Promise<number[]> {
	const opponentLevels = team.sort((a, b) => b.level - a.level).slice(0, 5);
	const parsedIds = opponentLevels.map(o => o.id);
	const opponentIds: number[] = [];
	console.log('Opponent levels:', opponentLevels);

	for (const dinoz of opponentLevels) {
		const enemy = await prisma.dinoz.findFirst({
			where: {
				userId: { not: userId },
				id: { notIn: parsedIds },
				level: { gte: Math.max(1, dinoz.level - 3), lte: dinoz.level + 3 }
			},
			select: { id: true }
		});

		if (enemy) {
			parsedIds.push(enemy.id);
			opponentIds.push(enemy.id);
		}
	}
	console.log('Picked opponent IDs:', opponentIds);
	return opponentIds;
}

export async function replaceMyTeam(dinozList: number[], opponentIds: number[], dojoId: string, challenge: Challenge) {
	await prisma.$transaction([
		prisma.dojoTeam.deleteMany({ where: { dojoId } }),
		prisma.dojoOpponents.deleteMany({ where: { dojoId } }),
		prisma.dojoTeam.createMany({ data: dinozList.map(dinozId => ({ dojoId, dinozId })) }),
		prisma.dojoOpponents.createMany({ data: opponentIds.map(dinozId => ({ dojoId, dinozId })) }),
		prisma.dojo.update({
			where: { id: dojoId },
			data: { activeChallenge: challenge }
		})
	]);
	const dojo = await prisma.dojo.findUniqueOrThrow({
		where: {
			id: dojoId
		},
		select: {
			id: true,
			dailyReset: true,
			user: {
				select: {
					id: true,
					name: true
				}
			},
			team: {
				select: {
					dinoz: {
						select: {
							id: true,
							name: true,
							level: true,
							display: true
						}
					},
					fighted: true
				}
			},
			activeChallenge: true,
			DojoOpponents: {
				select: {
					fighted: true,
					achieved: true,
					dinoz: {
						select: {
							id: true,
							display: true,
							level: true,
							name: true
						}
					}
				}
			},
			reputation: true
		}
	});
	return dojo;
}

export async function getChallengeTeam(userId: string) {
	const dojo = await prisma.dojo.findUnique({
		where: {
			userId: userId
		},
		select: {
			id: true,
			userId: true,
			dailyReset: true,
			team: {
				select: {
					dinoz: {
						select: {
							id: true,
							name: true,
							level: true,
							display: true
						}
					},
					fighted: true
				}
			},
			DojoOpponents: {
				select: {
					fighted: true,
					achieved: true,
					dinoz: {
						select: {
							id: true,
							display: true,
							level: true,
							name: true
						}
					}
				}
			},
			activeChallenge: true
		}
	});
	return dojo;
}

export async function cleanCurrentOpponentTeam(dojoId: string) {
	await prisma.dojoOpponents.deleteMany({
		where: {
			dojoId: dojoId
		}
	});
	await prisma.dojoTeam.updateMany({
		where: {
			dojoId: dojoId
		},
		data: {
			fighted: false
		}
	});
	return await prisma.dojoTeam.findMany({
		where: {
			dojoId: dojoId
		},
		select: {
			dinoz: {
				select: {
					id: true,
					name: true,
					level: true,
					display: true
				}
			},
			fighted: true
		}
	});
}

export async function addOpponent(dinozId: number, dojoId: string) {
	return await prisma.dojoOpponents.create({
		data: {
			dinoz: { connect: { id: dinozId } },
			dojo: { connect: { id: dojoId } }
		},
		select: {
			dinoz: {
				select: {
					id: true,
					name: true,
					level: true,
					display: true
				}
			},
			fighted: true,
			achieved: true
		}
	});
}

export async function createOpponentTeam(
	team: { id: number; level: number }[],
	myDojo: { id: string; userId: string }
) {
	const opponentIds = await pickOpponentIds(team, myDojo.userId);
	const opponents = [];

	for (const opponentId of opponentIds) {
		opponents.push(await addOpponent(opponentId, myDojo.id));
	}

	return opponents;
}
