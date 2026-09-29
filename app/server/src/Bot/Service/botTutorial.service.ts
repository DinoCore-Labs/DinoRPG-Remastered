import { handleTutorialEvent, getCurrentTutorial } from '../../Tutorial/Controller/tutorial.controller.js';

export type BotTutorialAction = 'tutorial_speak';

export async function getBotTutorialAction(userId: string): Promise<BotTutorialAction | null> {
	const tutorial = await getCurrentTutorial(userId);
	if (!tutorial || tutorial.completed || !tutorial.objective) {
		return null;
	}

	switch (tutorial.objective.id) {
		case 'speak':
			return 'tutorial_speak';
		default:
			return null;
	}
}

export async function executeBotTutorialAction(userId: string, dinozId: number, action: BotTutorialAction) {
	switch (action) {
		case 'tutorial_speak':
			return handleTutorialEvent({
				userId,
				dinozId,
				event: 'GUIDE_MICHEL_SPOKEN'
			});
	}
}
