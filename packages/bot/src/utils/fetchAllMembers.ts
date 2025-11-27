import { REST, Routes } from 'discord.js';

export async function fetchAllMembers(guildId: string, token: string) {
	const rest = new REST({ version: '10' }).setToken(token);

	let allMembers: any[] = [];
	let after: string | undefined = undefined;
	const limit = 1000;

	while (true) {
		const query: any = { limit };
		if (after) query.after = after;

		const members: any[] = (await rest.get(Routes.guildMembers(guildId), { query })) as any[];

		allMembers = allMembers.concat(members);

		if (members.length < limit) break;

		after = members[members.length - 1].user.id;
	}

	return allMembers;
}
