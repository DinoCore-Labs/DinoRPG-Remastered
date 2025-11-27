import type { Message } from 'discord.js';
import { TextChannel } from 'discord.js';

import { LEVEL_UP_MESSAGES } from './levelup-messages.js';
import { XP_LEVELS } from './xp-config.js';
import { addXp, getXp, setLevel } from './xp-data.js';

export async function handleXp(message: Message) {
	const userId = message.author.id;

	if (message.author.bot) return;
	if (message.content.length < 5) return;
	if (message.content.startsWith('http')) return;

	const xpGain = Math.floor(Math.random() * 3) + 1; // 1 à 3 XP
	const user = addXp(userId, xpGain);

	let newLevel = user.level;

	for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
		if (user.xp >= XP_LEVELS[i].xp) {
			newLevel = i;
			break;
		}
	}

	if (newLevel !== user.level) {
		const guild = message.guild;
		const member = await guild!.members.fetch(userId);

		// Retirer anciens rôles
		for (const lvl of XP_LEVELS) {
			if (member.roles.cache.has(lvl.role)) {
				await member.roles.remove(lvl.role);
			}
		}

		const levelInfo = XP_LEVELS[newLevel];

		await member.roles.add(levelInfo.role);

		setLevel(userId, newLevel);

		if (message.channel instanceof TextChannel) {
			const text = LEVEL_UP_MESSAGES[newLevel]?.replace('<@USER>', `<@${userId}>`);

			if (text && message.channel instanceof TextChannel) {
				await message.channel.send(text);
			}
		}
	}
}
