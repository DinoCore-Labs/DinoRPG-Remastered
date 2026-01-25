import { type ChatInputCommandInteraction, PermissionFlagsBits, Role, SlashCommandBuilder } from 'discord.js';

import { fetchAllMembers } from '../utils/fetchAllMembers.js';

export const fixRolesCommand = {
	data: new SlashCommandBuilder()
		.setName('fixroles')
		.setDescription('Assigne le rôle Joueur Débutant à tous les membres présents.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction: ChatInputCommandInteraction) {
		const guild = interaction.guild;
		if (!guild) return interaction.reply('Erreur : pas de serveur.');

		const ROLE_ID = process.env.ROLE_LVL0!;
		const role = guild.roles.cache.get(ROLE_ID);

		if (!role) {
			return interaction.reply('❌ Rôle Joueur Débutant introuvable.');
		}

		await interaction.reply('⏳ Synchronisation des membres…');

		const members = await fetchAllMembers(guild.id, process.env.DISCORD_TOKEN!);

		console.log('→ Membres récupérés via REST :', members.length);

		let count = 0;

		for (const memberData of members) {
			const member = await guild.members.fetch(memberData.user.id).catch(() => null);
			if (!member || member.user.bot) continue;

			const alreadyHas = member.roles.cache.has(ROLE_ID);
			if (!alreadyHas) {
				try {
					await member.roles.add(role);
					count++;
				} catch (err) {
					console.error('Erreur rôle pour :', member.user.tag, err);
				}
			}
		}

		await interaction.editReply(`✅ Terminé ! Rôle ajouté à **${count}** membres.`);
	}
};
