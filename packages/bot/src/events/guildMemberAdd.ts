import { type Client, EmbedBuilder, Events, NewsChannel } from 'discord.js';

export default function registerGuildMemberAddEvent(client: Client) {
	client.on(Events.GuildMemberAdd, async member => {
		console.log('➡ Nouveau membre :', member.user.tag);

		//
		// 1) Ajouter le rôle niveau 0
		//
		const roleId = process.env.ROLE_LVL0!;
		const role = member.guild.roles.cache.get(roleId);

		if (role) {
			try {
				await member.roles.add(role);
				console.log(`✔ Rôle ajouté à ${member.user.tag}`);
			} catch (err) {
				console.error("❌ Impossible d'ajouter le rôle :", err);
			}
		} else {
			console.error('❌ Rôle niveau 0 introuvable !');
		}

		//
		// 2) Salon de bienvenue
		//
		const welcomeChannelId = process.env.WELCOME_CHANNEL_ID!;
		console.log('WELCOME_CHANNEL_ID =', process.env.WELCOME_CHANNEL_ID);

		const channel = member.guild.channels.cache.get(welcomeChannelId);
		console.log('CHANNEL TYPE =', channel?.type);
		console.log('CHANNEL EXISTS =', member.guild.channels.cache.has(process.env.WELCOME_CHANNEL_ID!));

		if (!channel || !(channel instanceof NewsChannel)) {
			console.error('❌ Salon de bienvenue introuvable.');
			return;
		}

		//
		// 3) Embed stylé DinoRPG
		//
		const embed = new EmbedBuilder()
			.setColor('#ff9933')
			.setTitle('🥚 Un nouvel aventurier arrive !')
			.setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
			.setDescription(
				`Bienvenue à **<@${member.id}>** sur le serveur **DinoRPG** !\n\n` +
					`Tu commences ton aventure au rang : **Joueur Débutant 🥚**.\n` +
					`Explore, discute, gagne de l'XP et deviens un véritable **Maître Dinoz** ! 🐉`
			)
			.setFooter({ text: 'DinoRPG Remastered — Aventure et Exploration' })
			.setTimestamp();

		await channel.send({ embeds: [embed] });
	});
}
