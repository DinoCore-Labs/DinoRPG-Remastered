import { StatTracking } from '../models/enums/StatsTracking.js';
import { goals } from '../models/goals/goals.js';
import { Goal, Unlock } from '../models/goals/goalsType.js';
import { UserStats } from '../models/user/userStats.js';
import { ExpectedError } from '../models/utils/expectedError.js';

/**
 * Get the total points for a game
 * @param goals
 * @returns
 */
export const getTotalPoints = (goals: Record<StatTracking, Goal>) =>
	Object.values(goals).reduce(
		(total, goal) => total + goal.unlocks.reduce((total, unlock) => total + unlock.points, 0),
		0
	);

/**
 * Adjust goal points so that the total is 1000
 * @param goals
 * @returns
 */
export const adjustGoals = (goals: Record<StatTracking, Goal>): Record<StatTracking, Goal> => {
	const totalPoints = getTotalPoints(goals);
	const adjustmentRatio = 1000 / totalPoints;

	const adjustedGoals = Object.values(goals).map(goal => ({
		...(goal as Goal),
		unlocks: (goal as Goal).unlocks.map(unlock => ({
			...unlock,
			points: Math.round(unlock.points * adjustmentRatio)
		}))
	}));

	return Object.fromEntries(adjustedGoals.map(goal => [goal.id, goal])) as Record<StatTracking, Goal>;
};

/**
 * Get a goal by id
 */
export function getGoal(id: StatTracking): Goal {
	const goal = goals[id];
	if (!goal) throw new ExpectedError('Invalid StatTracking id.');
	return goal;
}

/**
 * Get the unlocked goals for a given number of points
 */
export function getUnlockedGoals(stat: UserStats): Unlock[] {
	// Adjust goal points so that the total is 1000
	const adjustedGoals = adjustGoals(goals);
	const goal = adjustedGoals[stat.stat];
	if (!goal) return [];

	const unlocked = goal.unlocks.filter(unlock => unlock.count <= stat.quantity);
	return unlocked;
}

/**
 * Convert prisma output to UserStats
 */
export function convertToUserStats(rawStats: { stat: string; quantity: number }[]): UserStats[] {
	return rawStats
		.filter((s): s is { stat: StatTracking; quantity: number } =>
			Object.values(StatTracking).includes(s.stat as StatTracking)
		)
		.map(s => ({
			stat: s.stat,
			quantity: s.quantity
		}));
}
