import {
	type ChatInputCommandInteraction,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	REST,
	Routes,
	type SlashCommandBuilder
} from 'discord.js';
import dotenv from 'dotenv';

import { fixRolesCommand } from './commands/fixroles.js';
import { pingCommand } from './commands/ping.js';
import registerGuildMemberAddEvent from './events/guildMemberAdd.js';
import { handleXp } from './leveling/leveling.js';

dotenv.config();

// --- Types ---
type Command = {
	data: SlashCommandBuilder;
	execute: (interaction: ChatInputCommandInteraction) => Promise<any>;
};

// --- Client ---
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

// --- Commandes ---
const commands: Command[] = [pingCommand, fixRolesCommand];
const commandsMap = new Collection<string, Command>();

for (const cmd of commands) {
	commandsMap.set(cmd.data.name, cmd);
}

// --- Déploiement ---
async function deployCommands() {
	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

	await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!), {
		body: commands.map(c => c.data.toJSON())
	});

	console.log('✨ Commandes déployées');
}

// --- Événements ---
client.once(Events.ClientReady, () => {
	console.log(`🟢 Bot connecté en tant que ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const cmd = commandsMap.get(interaction.commandName);
	if (!cmd) return;

	await cmd.execute(interaction);
});

registerGuildMemberAddEvent(client);

client.on(Events.MessageCreate, async message => {
	handleXp(message);
});

// --- Start ---
await deployCommands();
client.login(process.env.DISCORD_TOKEN);
