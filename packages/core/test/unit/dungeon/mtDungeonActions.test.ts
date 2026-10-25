import { Action, actionList } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { describe, expect, it } from 'vitest';

describe('Motion Twin dungeon actions', () => {
	it('exposes the original dungeon_enter action with its confirmation and train icon', () => {
		expect(actionList[Action.DUNGEON_ENTER]).toMatchObject({
			name: 'dungeon_enter',
			imgName: 'act_train',
			confirm: true,
			confirmMessageKey: 'action.description.dungeon_enter'
		});
	});
	it('exposes dungeon as map navigation, not a second entry', () => {
		expect(actionList[Action.DUNGEON]).toMatchObject({
			name: 'dungeon',
			imgName: 'act_train'
		});
		expect(actionList[Action.DUNGEON].confirm).toBeUndefined();
		expect(actionList[Action.DUNGEON].prop).toBeUndefined();
	});
});
