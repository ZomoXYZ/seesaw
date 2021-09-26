import { Client, Intents } from 'discord.js';
import { handleInteraction, registerCommands } from './slash';
import { jsonSchemaOrExit, Settings } from './utils';

const settings = jsonSchemaOrExit<Settings>('settings.json', 'resources/settings.schema.json'),
      client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

client.on('ready', client => {
    console.log(`logged in as ${client.user.username}`);
    client.guilds.cache.forEach(g => registerCommands(client.user.id, g.id, settings.api.discordToken));
});

client.on('interactionCreate', handleInteraction);

client.on('guildCreate', g => {
    if (client && client.user)
        registerCommands(client.user.id, g.id, settings.api.discordToken);
});
      
client.login(settings.api.discordToken);