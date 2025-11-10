import { createTicketPanel } from '../handlers/ticketPanel.js';
import { config } from '../config/config.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Ready: ${client.user.tag}`);
    if (config.supportChannel) {
      try {
        const ch = await client.channels.fetch(config.supportChannel);
        if (ch) await createTicketPanel(ch);
      } catch (e) {
        console.warn('Failed to post ticket panel:', e.message);
      }
    }
  }
};
