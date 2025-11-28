import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const pingCommand = {
	data: new SlashCommandBuilder().setName('ping').setDescription("Renvoie 'Pong!'"),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('🏓 Pong !');
	}
};
