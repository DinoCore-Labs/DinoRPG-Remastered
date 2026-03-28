import { CompareMode, Condition, RandomBasis } from '../../conditions/conditions.js';

type ParserState = {
	source: string;
	position: number;
};

function fail(state: ParserState, message: string): never {
	throw new Error(`${message} in "${state.source}" at position ${state.position}`);
}

function peek(state: ParserState): string | undefined {
	return state.source[state.position];
}

function consume(state: ParserState): string {
	const char = state.source[state.position];
	if (!char) fail(state, 'Unexpected end of expression');
	state.position += 1;
	return char;
}

function parseCompareMode(state: ParserState): CompareMode {
	const char = peek(state);

	if (char === '+') {
		state.position += 1;
		return 'gte';
	}

	if (char === '-') {
		state.position += 1;
		return 'lte';
	}

	return 'eq';
}

function parseIdent(state: ParserState): string {
	const start = state.position;

	while (true) {
		const char = peek(state);
		if (!char) break;

		const isLower = char >= 'a' && char <= 'z';
		const isUpper = char >= 'A' && char <= 'Z';
		const isDigit = char >= '0' && char <= '9';
		const isUnderscore = char === '_';

		if (!isLower && !isUpper && !isDigit && !isUnderscore) break;
		state.position += 1;
	}

	if (start === state.position) {
		fail(state, 'Expected identifier');
	}

	return state.source.slice(start, state.position);
}

function parseIntValue(state: ParserState): number {
	const start = state.position;

	while (true) {
		const char = peek(state);
		if (!char || char < '0' || char > '9') break;
		state.position += 1;
	}

	if (start === state.position) {
		fail(state, 'Expected integer');
	}

	return Number(state.source.slice(start, state.position));
}

function parseDateLiteral(state: ParserState): string {
	const start = state.position;

	while (true) {
		const char = peek(state);
		if (!char) break;

		const isDigit = char >= '0' && char <= '9';
		const isDash = char === '-';
		const isSpace = char === ' ';
		const isColon = char === ':';

		if (!isDigit && !isDash && !isSpace && !isColon) break;
		state.position += 1;
	}

	if (start === state.position) {
		fail(state, 'Expected date literal');
	}

	return state.source.slice(start, state.position);
}

function expect(state: ParserState, expected: string) {
	const char = consume(state);
	if (char !== expected) {
		fail(state, `Expected "${expected}" but got "${char}"`);
	}
}

function parseCommand(command: string, state: ParserState): Condition {
	expect(state, '(');

	switch (command) {
		case 'true':
			expect(state, ')');
			return { type: 'true' };

		case 'false':
		case 'disable':
			expect(state, ')');
			return { type: 'false' };

		case 'date': {
			const value = parseDateLiteral(state);
			if (peek(state) === ',') consume(state);
			const compare = parseCompareMode(state);
			expect(state, ')');
			return { type: 'date', value, compare };
		}

		case 'caushrock': {
			const direction = parseIntValue(state);
			expect(state, ')');
			return { type: 'caushrock', direction };
		}

		case 'level': {
			const value = parseIntValue(state);
			expect(state, ')');
			return { type: 'level', value };
		}

		case 'fx': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'effect', key };
		}

		case 'collec': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'collection', key };
		}

		case 'time': {
			const value = parseIntValue(state);
			expect(state, ')');
			return { type: 'time', value, user: false };
		}

		case 'utime': {
			const value = parseIntValue(state);
			expect(state, ')');
			return { type: 'time', value, user: true };
		}

		case 'mission': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'mission', key, status: { type: 'done' } };
		}

		case 'curmission': {
			const key = parseIdent(state);
			let step: number | undefined;

			if (peek(state) === ',') {
				consume(state);
				step = parseIntValue(state);
			}

			expect(state, ')');
			return { type: 'mission', key, status: { type: 'current', step } };
		}

		case 'skill': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'skill', key };
		}

		case 'canfight': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'canfight', key };
		}

		case 'pos': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'position', key };
		}

		case 'hasobject': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'hasobject', key };
		}

		case 'random': {
			const max = parseIntValue(state);
			let target = 0;
			let compare: CompareMode = 'eq';

			if (peek(state) === ',') {
				consume(state);
				target = parseIntValue(state);
				compare = parseCompareMode(state);
			}

			expect(state, ')');
			return { type: 'random', max, target, seeded: false, compare };
		}

		case 'dayrand':
		case 'drand':
		case 'hourrand': {
			const max = parseIntValue(state);
			let target = 0;
			let compare: CompareMode = 'eq';

			if (peek(state) === ',') {
				consume(state);
				target = parseIntValue(state) - 1;
				compare = parseCompareMode(state);
			}

			expect(state, ')');

			const basis: RandomBasis = command === 'dayrand' ? 'day' : command === 'hourrand' ? 'hour' : 'dialog';

			return { type: 'random', max, target, seeded: true, basis, compare };
		}

		case 'admin':
			expect(state, ')');
			return { type: 'admin' };

		case 'scenario': {
			const key = parseIdent(state);
			expect(state, ',');
			const phase = parseIntValue(state);
			const compare = parseCompareMode(state);
			expect(state, ')');
			return { type: 'scenario', key, phase, compare };
		}

		case 'uvar': {
			const key = parseIdent(state);
			let value = 1;
			let compare: CompareMode = 'gte';

			if (peek(state) === ',') {
				consume(state);
				value = parseIntValue(state);
				compare = parseCompareMode(state);
			}

			expect(state, ')');
			return { type: 'uvar', key, value, compare };
		}

		case 'gvar': {
			const key = parseIdent(state);
			let value = 1;
			let compare: CompareMode = 'gte';

			if (peek(state) === ',') {
				consume(state);
				value = parseIntValue(state);
				compare = parseCompareMode(state);
			}

			expect(state, ')');
			return { type: 'gvar', key, value, compare };
		}

		case 'life': {
			const value = parseIntValue(state);
			const compare = parseCompareMode(state);
			expect(state, ')');
			return { type: 'life', value, compare };
		}

		case 'dinoz': {
			const value = parseIntValue(state);
			expect(state, ')');
			return { type: 'dinoz', value };
		}

		case 'race': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'race', key };
		}

		case 'equip': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'equip', key };
		}

		case 'swait': {
			const key = parseIdent(state);
			expect(state, ',');
			const hours = parseIntValue(state);
			expect(state, ')');
			return { type: 'swait', key, hours };
		}

		case 'dungeon': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'dungeon', key };
		}

		case 'hasingr': {
			const key = parseIdent(state);
			let qty = 1;
			let compare: CompareMode = 'gte';

			if (peek(state) === ',') {
				consume(state);
				qty = parseIntValue(state);
				compare = parseCompareMode(state);
			}

			expect(state, ')');
			return { type: 'hasingredient', key, qty, compare };
		}

		case 'active': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'active', key };
		}

		case 'clanact': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'clanact', key };
		}

		case 'status': {
			const value = parseIntValue(state);
			expect(state, ')');
			return { type: 'status', value };
		}

		case 'friend': {
			if (peek(state) === ')') {
				expect(state, ')');
				return { type: 'friend' };
			}

			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'friend', key };
		}

		case 'event': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'event', key };
		}

		case 'promo': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'promo', key };
		}

		case 'war': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'war', key };
		}

		case 'config': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'config', key };
		}

		case 'tag': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'tag', key };
		}

		case 'tab': {
			const key = parseIdent(state);
			expect(state, ')');
			return { type: 'tab', key };
		}

		case 'hour': {
			const value = parseIntValue(state);
			const compare = parseCompareMode(state);
			expect(state, ')');
			return { type: 'hour', value, compare };
		}

		default:
			fail(state, `Unknown command "${command}"`);
	}
}

function parseExpr(state: ParserState, allowChain = true): Condition {
	const char = peek(state);

	let expr: Condition;

	if (!char) {
		fail(state, 'Unexpected end of expression');
	}

	if (char === '!') {
		consume(state);
		expr = { type: 'not', condition: parseExpr(state, false) };
	} else if (char === '(') {
		consume(state);
		expr = parseExpr(state, true);
		expect(state, ')');
	} else {
		const command = parseIdent(state).toLowerCase();
		expr = parseCommand(command, state);
	}

	if (!allowChain) {
		return expr;
	}

	const next = peek(state);

	if (!next || next === ')') {
		return expr;
	}

	if (next === '+') {
		consume(state);
		return {
			type: 'and',
			left: expr,
			right: parseExpr(state, true)
		};
	}

	if (next === '|') {
		consume(state);
		return {
			type: 'or',
			left: expr,
			right: parseExpr(state, true)
		};
	}

	fail(state, `Unexpected character "${next}"`);
}

export function parseCondition(source: string): Condition {
	const state: ParserState = {
		source,
		position: 0
	};

	const condition = parseExpr(state, true);

	if (state.position < source.length) {
		fail(state, 'Expression too long');
	}

	return condition;
}
