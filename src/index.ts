import { Client, Intents } from 'discord.js';
import { jsonSchema } from './utils';

const settings = jsonSchema('settings.json', 'resources/settings.schema.json', true),
      client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

