import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client, GatewayIntentBits, Partials, Collection, Events } from "discord.js";
import { registerCommands } from "./utils/registerCommands.js";
import { config } from "./config/config.js";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Collections for commands, tickets, and stats
client.commands = new Collection();
client.tickets = new Map();
client.staffStats = { closed: {}, ratings: [] };

// ✅ Load all command files
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const commandModule = await import(`./commands/${file}`);
      const command = commandModule.default || commandModule;

      if (!command?.data || !command?.execute) {
        console.warn(`⚠️ Skipping invalid command file: ${file}`);
        continue;
      }

      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    } catch (err) {
      console.error(`❌ Error loading command ${file}:`, err);
    }
  }
} else {
  console.warn("⚠️ Commands folder not found.");
}

// ✅ Load all event files
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));

  for (const file of eventFiles) {
    try {
      const eventModule = await import(`./events/${file}`);
      const event = eventModule.default || eventModule;

      if (!event?.name || !event?.execute) {
        console.warn(`⚠️ Skipping invalid event file: ${file}`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`✅ Loaded event: ${event.name}`);
    } catch (err) {
      console.error(`❌ Error loading event ${file}:`, err);
    }
  }
} else {
  console.warn("⚠️ Events folder not found.");
}

// ✅ When bot is ready
client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    await registerCommands(client);
    console.log("✅ Slash commands registered successfully.");
  } catch (err) {
    console.error("❌ Failed to register slash commands:", err);
  }
});

// ✅ Log in
client.login(config.token).catch((err) => {
  console.error("❌ Failed to login:", err);
});
