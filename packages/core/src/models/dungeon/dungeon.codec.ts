import type { DungeonDoor, DungeonItemKind, DungeonLevel, DungeonRoom, DungeonStructure } from './dungeon.types.js';

/** Alphabet historique `mt.BitCodec` : pas l'alphabet Base64 standard. */
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
const ITEM_KINDS = ['IKey', 'IGold', 'IHeal', 'IScenario'] as const satisfies readonly DungeonItemKind[];

export class DungeonCodecError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DungeonCodecError';
	}
}

interface Signature {
	width: number;
	height: number;
	levels: number;
	rooms: number;
	monsters: number;
	scenarios: number;
	keys: number;
}

export interface DecodedDungeon {
	structure: DungeonStructure;
	/** Signature descriptive de Motion Twin si fournie. */
	signature: Readonly<Signature> | null;
	/** Quatre caractères `mt.BitCodec.crcStr`, conservés intacts et non vérifiés. */
	checksum: string;
	/** Bits inutilisés pour remplir le dernier caractère de six bits. */
	paddingBits: number;
	/** True uniquement si le CRC historique a été vérifié (jamais dans ce port partiel). */
	checksumVerified: false;
}

function assertValid(ok: unknown, explanation: string): asserts ok {
	if (!ok) throw new DungeonCodecError(explanation);
}

function bitWidth(v: number): number {
	let n = 1;
	while (v >= 2 ** n) n++;
	return n;
}

class MtBitReader {
	private position = 0;
	private readonly dataBits: number;

	constructor(private readonly input: string) {
		assertValid(input.length >= 5, 'La carte ne contient pas de corps encodé et de CRC.');
		assertValid(
			[...input].every(ch => ALPHABET.includes(ch)),
			'Caractère interdit dans le flux MT.'
		);
		this.dataBits = (input.length - 4) * 6;
	}

	read(count: number): number {
		assertValid(Number.isInteger(count) && count >= 0 && count <= 31, `Largeur de champ incorrecte : ${count}`);
		assertValid(this.position + count <= this.dataBits, 'Fin du flux MT avant la fin de la carte.');
		let result = 0;
		for (let i = 0; i < count; i++) {
			const bitPos = this.position++;
			const word = ALPHABET.indexOf(this.input[Math.floor(bitPos / 6)]!);
			result = result * 2 + ((word >> (5 - (bitPos % 6))) & 1);
		}
		return result;
	}

	get paddingBits(): number {
		return this.dataBits - this.position;
	}
}

function splitRawMap(source: string): { signature: Signature | null; encoded: string } {
	const value = source.replace(/^\uFEFF/, '').trim();
	if (!value.startsWith('[[')) return { signature: null, encoded: value };
	const match = /^\[\[(\d+)x(\d+)x(\d+)\s+(\d+)R\s+(\d+)M\s+(\d+)S\s+(\d+)K\]\]/.exec(value);
	assertValid(match, 'Signature de carte Motion Twin illisible.');
	const [width, height, levels, rooms, monsters, scenarios, keys] = match.slice(1).map(Number);
	return {
		signature: {
			width: width!,
			height: height!,
			levels: levels!,
			rooms: rooms!,
			monsters: monsters!,
			scenarios: scenarios!,
			keys: keys!
		},
		encoded: value.slice(match[0].length)
	};
}

/** Reprise de `decodeTable()` / `saveBits()` de `DungeonCodec.hx`. */
function decodeTable(
	reader: MtBitReader,
	table: boolean[][],
	x: number,
	y: number,
	width: number,
	height: number
): void {
	const total = width * height;
	const runBits = bitWidth(total - 1);
	let written = 0;
	let cellValue = false;
	while (written < total) {
		let run: number;
		if (reader.read(1) === 0) run = reader.read(2);
		else if (reader.read(1) === 0) run = reader.read(3) + 1;
		else run = reader.read(runBits) + 1;
		assertValid(written + run <= total, 'Série RLE dépassant les dimensions de la salle.');
		for (let k = 0; k < run; k++) {
			// Encodage d'origine : parcours x puis y (colonne-major).
			const offset = written + k;
			table[x + Math.floor(offset / height)]![y + (offset % height)] = cellValue;
		}
		written += run;
		cellValue = !cellValue;
	}
}

/** Décode le contenu `xml/dungeons/<id>_<étape>.xml` sans altérer les cartes. */
export function decodeMtDungeon(source: string): DecodedDungeon {
	const { signature, encoded } = splitRawMap(source);
	const reader = new MtBitReader(encoded);
	const width = reader.read(8);
	const height = reader.read(8);
	const levelCount = reader.read(8);
	const roomBits = reader.read(5);
	assertValid(width > 0 && height > 0 && levelCount > 0, 'Dimensions ou nombre de niveaux invalides.');
	assertValid(roomBits > 0 && roomBits <= 31, 'Largeur des identifiants de salles invalide.');
	const xyBits = bitWidth(Math.max(width, height));
	const whBits = xyBits - 1;
	const levels: DungeonLevel[] = [];
	let nextRoomId = 0;
	let monsterCount = 0;
	let scenarioCount = 0;
	let keyCount = 0;

	for (let levelIndex = 0; levelIndex < levelCount; levelIndex++) {
		const table = Array.from({ length: width }, () => Array<boolean>(height).fill(false));
		const rooms: DungeonRoom[] = [];
		const roomCount = reader.read(roomBits);
		for (let i = 0; i < roomCount; i++) {
			const x = reader.read(xyBits);
			const y = reader.read(xyBits);
			const w = reader.read(whBits);
			const h = reader.read(whBits);
			assertValid(w > 0 && h > 0 && x + w <= width && y + h <= height, 'Salle hors de la carte.');
			decodeTable(reader, table, x, y, w, h);
			const doors: DungeonDoor[] = [];
			const doorCount = reader.read(5);
			for (let d = 0; d < doorCount; d++) {
				const doorX = reader.read(xyBits);
				const doorY = reader.read(xyBits);
				const mode = reader.read(2);
				const door: DungeonDoor = {
					x: doorX,
					y: doorY,
					up: mode === 0 ? false : mode === 1 ? true : null,
					key: mode === 3 ? reader.read(6) : null
				};
				assertValid(doorX < width && doorY < height, 'Porte ou escalier hors de la carte.');
				if (mode === 2) monsterCount++;
				// Le codec original force chaque cellule de porte à `true`.
				table[doorX]![doorY] = true;
				doors.push(door);
			}
			let item: DungeonRoom['item'] = null;
			if (reader.read(1) === 1) {
				const itemX = reader.read(xyBits);
				const itemY = reader.read(xyBits);
				const kindIndex = reader.read(4);
				const value = reader.read(8);
				assertValid(itemX < width && itemY < height, 'Objet hors de la carte.');
				assertValid(kindIndex < ITEM_KINDS.length, 'Type d’objet MT inconnu.');
				const kind = ITEM_KINDS[kindIndex]!;
				if (kind === 'IKey') keyCount++;
				if (kind === 'IScenario') scenarioCount++;
				item = { x: itemX, y: itemY, kind, value };
			}
			rooms.push({ id: nextRoomId++, x, y, w, h, doors, item });
		}
		levels.push({ table, rooms });
	}

	const start = { x: reader.read(xyBits), y: reader.read(xyBits), l: reader.read(8) };
	const exit = { x: reader.read(xyBits), y: reader.read(xyBits), l: reader.read(8) };
	for (const [label, p] of [
		['entrée', start],
		['sortie', exit]
	] as const) {
		assertValid(p.l < levels.length && p.x < width && p.y < height, `Coordonnées ${label} hors limites.`);
	}
	assertValid(reader.paddingBits >= 0 && reader.paddingBits <= 5, 'Octets supplémentaires inattendus avant le CRC MT.');
	if (signature) {
		assertValid(
			signature.width === width &&
				signature.height === height &&
				signature.levels === levelCount &&
				signature.rooms === nextRoomId &&
				signature.monsters === monsterCount &&
				signature.scenarios === scenarioCount &&
				signature.keys === keyCount,
			'La signature descriptive de Motion Twin ne correspond pas à la carte décodée.'
		);
	}
	return {
		structure: { width, height, levels, start, exit },
		signature,
		checksum: encoded.slice(-4),
		paddingBits: reader.paddingBits,
		checksumVerified: false
	};
}
