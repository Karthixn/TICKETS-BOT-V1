import fs from 'fs';
import path from 'path';
import { REST, Routes } from 'discord.js';
import { config } from '../config/config.js';

export async function registerCommands(client) {
  const commandFiles = fs.readdirSync(path.join(process.cwd(), 'commands')).filter(f => f.endsWith('.js'));
  const body = [];
  for (const file of commandFiles) {
    const { default: command } = await import(`../commands/${file}`);
    body.push(command.data.toJSON());
  }
  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
    console.log('✅ Slash commands registered');
  } catch (e) {
    console.error('Failed to register commands', e);
  }
}
