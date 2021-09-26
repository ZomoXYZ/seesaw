// controls basic interaction with both node and discord

import { Client, Intents } from 'discord.js';
import { handleInteraction, registerCommands } from './slash';
import { jsonSchemaOrExit, Settings } from './utils';

export const settings = jsonSchemaOrExit<Settings>('settings.json', 'resources/settings.schema.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

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