/**
 * Strict reader for Motion Twin's xml/fr/dungeons.xml (static, trusted asset).
 * Historical semantics: DinoRPG/src/data/Dungeon.hx (DungeonXML.parse).
 * This is NOT a generic-purpose XML library; it rejects unknown markup.
 * Original data © Motion Twin — CC BY-NC-SA 4.0.
 */
import type { Condition } from '../conditions/conditions.js';

export interface MtDungeonScenarioDefinition {
	/** Position in the <stage> scenario list. This is the IScenario value in the map. */
	index: number;
	text: string | null;
	icon: string | null;
	messageIcon: string | null;
	reload: boolean;
	kind:
		| { type: 'none' }
		| { type: 'object'; key: string; count: number }
		| { type: 'collection'; key: string }
		| { type: 'monsters'; keys: string[] }
		| { type: 'block'; scenarioIndexes: number[] };
}

export interface MtDungeonDefinition {
	id: string;
	name: string;
	gold: number;
	condition: string | null;
	monsters: string[];
	tower: boolean;
	enter: { place: string; text: string };
	exit: { place: string; text: string };
	stages: { skin: string; scenarios: MtDungeonScenarioDefinition[] }[];
}

type XmlNode = { tag: string; attrs: Record<string, string>; children: XmlNode[]; text: string };

function parseAttributes(source: string): Record<string, string> {
	const result: Record<string, string> = Object.create(null) as Record<string, string>;
	let rest = source.trim();
	const pattern = /^([a-z][\w-]*)\s*=\s*"([^"]*)"\s*/;
	while (rest) {
		const match = pattern.exec(rest);
		if (!match) throw new Error(`Invalid MT dungeon XML attribute: ${rest.slice(0, 60)}`);
		if (Object.hasOwn(result, match[1]!)) throw new Error(`Duplicate XML attribute ${match[1]}`);
		result[match[1]!] = match[2]!;
		rest = rest.slice(match[0].length);
	}
	return result;
}

function xmlText(text: string): string {
	const predefined: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
	return text.replace(/&(#x[\da-fA-F]+|#\d+|[a-z]+);/g, (_, entity: string) => {
		if (entity[0] === '#') {
			const n = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
			if (!Number.isInteger(n) || n <= 0 || n > 0x10ffff) throw new Error('Invalid XML entity.');
			return String.fromCodePoint(n);
		}
		if (!(entity in predefined)) throw new Error(`Unknown XML entity: ${entity}`);
		return predefined[entity]!;
	});
}

function parseDocument(source: string): XmlNode {
	const content = source.replace(/^\uFEFF/, '').replace(/<!--[\s\S]*?-->/g, '');
	if (content.includes('<!')) throw new Error('Declarations/DTDs are not permitted in MT XML.');
	const tokens = content.match(/<(?:(?:"[^"]*"|'[^']*'|[^'">])*)>|[^<]+/g) ?? [];
	if (tokens.join('') !== content) throw new Error('Malformed MT dungeon XML.');
	const root: XmlNode = { tag: '_root', attrs: {}, children: [], text: '' };
	const stack = [root];
	for (const token of tokens) {
		if (token.startsWith('<?') && token.endsWith('?>')) continue;
		if (!token.startsWith('<')) {
			stack.at(-1)!.text += token;
			continue;
		}
		if (token.startsWith('</')) {
			const name = token.slice(2, -1).trim();
			if (stack.length === 1 || stack.at(-1)!.tag !== name) throw new Error(`Mismatched XML close: ${name}`);
			stack.pop();
			continue;
		}
		const selfClosing = token.endsWith('/>');
		const inside = token.slice(1, selfClosing ? -2 : -1).trim();
		const name = /^([a-z][\w-]*)(?:\s+|$)/.exec(inside);
		if (!name) throw new Error(`Invalid XML node: ${inside.slice(0, 60)}`);
		const child: XmlNode = {
			tag: name[1]!,
			attrs: parseAttributes(inside.slice(name[0].length)),
			children: [],
			text: ''
		};
		stack.at(-1)!.children.push(child);
		if (!selfClosing) stack.push(child);
	}
	if (stack.length !== 1 || root.children.length !== 1 || root.children[0]!.tag !== 'dungeons')
		throw new Error('Expected a single <dungeons> root.');
	return root.children[0]!;
}

function required(node: XmlNode, name: string): string {
	const value = node.attrs[name];
	if (!value) throw new Error(`Missing ${name} on <${node.tag}>.`);
	return xmlText(value);
}
function one(node: XmlNode, tag: string): XmlNode {
	const found = node.children.filter(child => child.tag === tag);
	if (found.length !== 1) throw new Error(`Expected one <${tag}> inside <${node.tag}>.`);
	return found[0]!;
}
function positiveCount(value: string | undefined): number {
	const n = value === undefined ? 1 : Number(value);
	if (!Number.isSafeInteger(n) || n <= 0) throw new Error('Invalid MT scenario count.');
	return n;
}
function scenario(node: XmlNode, index: number): MtDungeonScenarioDefinition {
	const a = node.attrs;
	const kinds = ['obj', 'collec', 'monsters', 'block'].filter(k => Object.hasOwn(a, k));
	if (kinds.length > 1) throw new Error(`Ambiguous scenario kind at ${index}.`);
	const text = xmlText(node.text.trim()) || null;
	let kind: MtDungeonScenarioDefinition['kind'];
	switch (kinds[0]) {
		case 'obj':
			kind = { type: 'object', key: a.obj!, count: positiveCount(a.count) };
			break;
		case 'collec':
			kind = { type: 'collection', key: a.collec! };
			break;
		case 'monsters':
			kind = { type: 'monsters', keys: a.monsters!.split(':') };
			break;
		case 'block': {
			const scenarioIndexes = a.block!.split(':').map(Number);
			if (scenarioIndexes.some(n => !Number.isSafeInteger(n) || n < 0))
				throw new Error('Invalid block scenario index.');
			kind = { type: 'block', scenarioIndexes };
			break;
		}
		default:
			kind = { type: 'none' };
	}
	const icon = a.icon ?? (kind.type === 'object' || kind.type === 'collection' ? 'chest' : null);
	const messageIcon = a.micon ?? (kind.type === 'object' || kind.type === 'collection' ? 'chest' : null);
	return { index, text, icon, messageIcon, reload: Object.hasOwn(a, 'reload'), kind };
}

export function parseMtDungeonDefinitions(source: string): MtDungeonDefinition[] {
	const root = parseDocument(source);
	const result: MtDungeonDefinition[] = [];
	const seen = new Set<string>();
	for (const node of root.children) {
		if (node.tag !== 'd') throw new Error(`Unknown dungeon child <${node.tag}>.`);
		const id = required(node, 'id');
		if (!/^[a-z][a-z\d]*$/.test(id) || seen.has(id)) throw new Error(`Invalid/duplicate dungeon ID: ${id}`);
		seen.add(id);
		const enter = one(node, 'enter');
		const exit = one(node, 'exit');
		const stages = node.children
			.filter(c => c.tag === 'stage')
			.map(stage => ({
				skin: required(stage, 'skin'),
				scenarios: stage.children.map((s, index) => {
					if (s.tag !== 'scenario') throw new Error(`Unexpected tag <${s.tag}> inside <stage>.`);
					return scenario(s, index);
				})
			}));
		if (!stages.length) throw new Error(`Dungeon ${id} has no stage.`);
		const gold = Number(required(node, 'gold'));
		if (!Number.isSafeInteger(gold) || gold < 0) throw new Error('Invalid dungeon gold.');
		result.push({
			id,
			name: required(node, 'name'),
			gold,
			condition: node.attrs.cond ?? null,
			monsters: required(node, 'monsters').split(':'),
			tower: Object.hasOwn(node.attrs, 'tower'),
			enter: { place: required(enter, 'place'), text: xmlText(enter.text.trim()) },
			exit: { place: required(exit, 'place'), text: xmlText(exit.text.trim()) },
			stages
		});
	}
	return result;
}

/** Translate only the three MT entry-expression forms present in the six archived definitions. Reject others. */
export function mtDungeonEntryCondition(expression: string | null): Condition {
	if (!expression) return { type: 'true' };
	let m = /^active\(([a-z][\w]*)\)$/.exec(expression);
	if (m) return { type: 'active', key: m[1]! };
	m = /^mission\(([a-z][\w]*)\)$/.exec(expression);
	if (m) return { type: 'mission', key: m[1]!, status: { type: 'current' } };
	m = /^scenario\(([a-z][\w]*),(\d+)\+\)$/.exec(expression);
	if (m) return { type: 'scenario', key: m[1]!, progression: Number(m[2]), compare: 'gte' };
	throw new Error(`Unsupported original dungeon condition: ${expression}`);
}
