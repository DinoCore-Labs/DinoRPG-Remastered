export const MT_STAGE = {
	canvasWidth: 488,
	canvasHeight: 300,
	battlefieldWidth: 400,
	battlefieldHeight: 300,
	battlefieldOffsetX: 44,
	framesPerSecond: 25
};
export const ACTION_NAMES = [
	'Add',
	'Announce',
	'Object',
	'Lost',
	'Status',
	'NoStatus',
	'Regen',
	'Damages',
	'Skill',
	'Dead',
	'Goto',
	'Return',
	'Pause',
	'Finish',
	'AddCastle',
	'TimeLimit',
	'AttackCastle',
	'Display',
	'Text',
	'Talk',
	'Escape',
	'MoveTo',
	'Flip',
	'SpawnToy',
	'DestroyToy',
	'Wait',
	'Log',
	'Notify',
	'Energy',
	'MaxEnergy',
	'Emote',
	'Shake'
];
export function actionName(value) {
	if (typeof value === 'number') return ACTION_NAMES[value] ?? null;
	const name = value.trim();
	return ACTION_NAMES.includes(name) ? name : null;
}
export function numeric(value, fallback = 0) {
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
export function identifier(value) {
	return typeof value === 'number' && Number.isSafeInteger(value) ? value : null;
}
