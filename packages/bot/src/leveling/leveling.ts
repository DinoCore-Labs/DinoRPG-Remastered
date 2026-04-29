import type { Message } from 'discord.js';
import { TextChannel } from 'discord.js';

import { LEVEL_UP_MESSAGES } from './levelup-messages.js';
import { XP_LEVELS } from './xp-config.js';
import { addXp, setLevel } from './xp-data.js';

export async function handleXp(message: Message) {
	const userId = message.author.id;
	if (message.author.bot) return;
	if (message.content.length < 5) return;
	if (message.content.startsWith('http')) return;
	const guild = message.guild;
	if (!guild) return;
	const xpGain = Math.floor(Math.random() * 3) + 1;
	const user = addXp(userId, xpGain);
	let newLevel = user.level;
	for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
		if (user.xp >= XP_LEVELS[i].xp) {
			newLevel = i;
			break;
		}
	}
	if (newLevel === user.level) return;
	const member = await guild.members.fetch(userId);
	const levelInfo = XP_LEVELS[newLevel];
	if (!levelInfo.role) {
		console.error(`[bot] Missing role id for level ${newLevel}. Check ROLE_LVL${newLevel} in .env`);
		return;
	}
	const role = guild.roles.cache.get(levelInfo.role) ?? (await guild.roles.fetch(levelInfo.role).catch(() => null));
	if (!role) {
		console.error(`[bot] Role not found for level ${newLevel}: ${levelInfo.role}`);
		return;
	}
	for (const lvl of XP_LEVELS) {
		if (lvl.role && member.roles.cache.has(lvl.role)) {
			await member.roles.remove(lvl.role);
		}
	}
	await member.roles.add(role);
	setLevel(userId, newLevel);
	if (message.channel instanceof TextChannel) {
		const text = LEVEL_UP_MESSAGES[newLevel]?.replace('<@USER>', `<@${userId}>`);
		if (text) {
			await message.channel.send(text);
		}
	}
}
