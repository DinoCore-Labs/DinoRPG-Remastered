import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⛔ On est dans: packages/bot/dist/leveling
// ⛔ Donc on remonte à: packages/bot/

// Remonte depuis dist/leveling → dist → bot →
const rootBotFolder = path.join(__dirname, '..', '..');

// 📁 Le vrai dossier "data" doit être ici :
const dataFolder = path.join(rootBotFolder, 'data');

// 📄 Le fichier XP doit être ici :
const filePath = path.join(dataFolder, 'xp.json');

// 🔥 Création dossier "data"
if (!fs.existsSync(dataFolder)) {
	fs.mkdirSync(dataFolder, { recursive: true });
}

// 🔥 Création fichier xp.json
if (!fs.existsSync(filePath)) {
	fs.writeFileSync(filePath, '{}');
}

let xpData: Record<string, { xp: number; level: number }> = {};

try {
	xpData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
} catch {
	xpData = {};
}

export function getXp(userId: string) {
	if (!xpData[userId]) {
		xpData[userId] = { xp: 0, level: 0 };
	}
	return xpData[userId];
}

export function addXp(userId: string, amount: number) {
	const data = getXp(userId);
	data.xp += amount;
	saveXp();
	return data;
}

export function setLevel(userId: string, level: number) {
	const data = getXp(userId);
	data.level = level;
	saveXp();
}

function saveXp() {
	fs.writeFileSync(filePath, JSON.stringify(xpData, null, 2));
}
