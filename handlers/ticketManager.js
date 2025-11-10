import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
} from 'discord.js';
import { config } from '../config/config.js';
import { footer } from '../utils/footer.js';
import { saveTranscriptToFile } from './transcript.js';

// ──────────────────────────────────────────────
// 🔢 Separate counters for each category
let ticketCounters = {
  Support: 0,
  "FRP Inquiry": 0,
  "HoodFRP Inquiry": 0
};

// ──────────────────────────────────────────────
// 🧰 Safe reply helper
async function safeReply(interaction, options) {
  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply(options);
    } else {
      await interaction.followUp(options);
    }
  } catch (err) {
    console.warn('safeReply error:', err.message);
  }
}

// ──────────────────────────────────────────────
// 🪪 Create ticket
export async function createTicketChannel(interaction, categoryId, typeLabel, modalData = null) {
  if (!interaction.deferred && !interaction.replied)
    await interaction.deferReply({ ephemeral: true });

  const user = interaction.user;
  const guild = interaction.guild;

  // Check if user already has ticket of this category
  const existing = Array.from(interaction.client.tickets.values()).find(
    (t) => t.userId === user.id && t.type === typeLabel
  );

  if (existing) {
    return safeReply(interaction, {
      content: `⚠️ You already have an open ${typeLabel} ticket: <#${existing.channelId}>.`,
      ephemeral: true
    });
  }

  // Increment category counter
  ticketCounters[typeLabel] = (ticketCounters[typeLabel] || 0) + 1;
  const ticketNum = ticketCounters[typeLabel];

  const channel = await guild.channels.create({
    name: `${typeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${user.username
      .toLowerCase()
      .slice(0, 8)}-${ticketNum}`,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
    ]
  });

  if (config.staffRole) {
    await channel.permissionOverwrites.create(config.staffRole, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });
  }

  const timeStr = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
  const embed = new EmbedBuilder()
    .setTitle(`${typeLabel} - Ticket #${ticketNum}`)
    .setDescription(
      `Welcome, <@${user.id}>! You have opened a ticket regarding ${typeLabel}.\n\nPlease describe your issue in detail.`
    )
    .addFields(
      { name: 'Category', value: typeLabel, inline: true },
      { name: 'Opened By', value: `<@${user.id}>`, inline: true },
      { name: 'Ticket #', value: `${ticketNum}`, inline: true },
      { name: 'Time', value: timeStr }
    )
    .setColor(config.brandColor)
    .setFooter(footer());

  if (modalData) {
    for (const [k, v] of Object.entries(modalData)) {
      embed.addFields({ name: k, value: String(v).slice(0, 1024), inline: false });
    }
  }

  const staffRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`claim_${typeLabel}_${ticketNum}`).setLabel('🙋 Claim Ticket').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`adduser_${typeLabel}_${ticketNum}`).setLabel('👤 Add User').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`close_${typeLabel}_${ticketNum}`).setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Danger)
  );

  await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [staffRow] });

  const meta = {
    id: ticketNum,
    userId: user.id,
    channelId: channel.id,
    type: typeLabel,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    claimedBy: null
  };

  interaction.client.tickets.set(`${typeLabel}_${user.id}`, meta);

  await safeReply(interaction, {
    content: `✅ ${typeLabel} Ticket #${ticketNum} created: <#${channel.id}>`,
    ephemeral: true
  });
}

// ──────────────────────────────────────────────
// 🙋 Claim Ticket
export async function handleClaim(interaction, ticketType, ticketNum) {
  if (!interaction.member.roles.cache.has(config.staffRole))
    return safeReply(interaction, { content: '🚫 You must be staff to claim.', ephemeral: true });

  if (!interaction.deferred && !interaction.replied)
    await interaction.deferReply({ ephemeral: true });

  const meta = Array.from(interaction.client.tickets.values()).find(
    (t) => t.id === Number(ticketNum) && t.type === ticketType
  );
  if (!meta)
    return safeReply(interaction, { content: 'Ticket not found.', ephemeral: true });

  meta.claimedBy = interaction.user.id;
  interaction.client.tickets.set(`${ticketType}_${meta.userId}`, meta);

  const ch = interaction.channel;
  const msgs = await ch.messages.fetch({ limit: 20 });
  const msg = msgs.find(
    (m) => m.embeds.length && m.embeds[0].title?.includes(`#${ticketNum}`)
  );
  if (msg) {
    const e = EmbedBuilder.from(msg.embeds[0]);
    e.setDescription(`${e.data.description}\n\n**This ticket has been claimed by <@${interaction.user.id}>.**`);
    await msg.edit({ embeds: [e] });
  }

  await safeReply(interaction, { content: `✅ You claimed ${ticketType} Ticket #${ticketNum}.`, ephemeral: true });
}

// ──────────────────────────────────────────────
// 👤 Add User
export async function handleAddUser(interaction, ticketType, ticketNum) {
  if (!interaction.member.roles.cache.has(config.staffRole))
    return safeReply(interaction, { content: '🚫 You must be staff to use this.', ephemeral: true });

  if (!interaction.deferred && !interaction.replied)
    await interaction.deferReply({ ephemeral: true });

  await safeReply(interaction, { content: 'Reply with the **Mention the user** to add (30s timeout).', ephemeral: true });

  const filter = (m) => m.author.id === interaction.user.id;
  const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });
  if (!collected.size)
    return safeReply(interaction, { content: '❌ No User ID provided. Aborted.', ephemeral: true });

  const idToAdd = collected.first().content.replace(/[^0-9]/g, '');
  try {
    await interaction.channel.permissionOverwrites.create(idToAdd, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });
    await safeReply(interaction, { content: `✅ Added <@${idToAdd}> to this ticket.`, ephemeral: true });
  } catch (e) {
    await safeReply(interaction, { content: `⚠️ Failed to add user: ${e.message}`, ephemeral: true });
  }
}

// ──────────────────────────────────────────────
// 🔒 Close Ticket
export async function handleClose(interaction, ticketType, ticketNum) {
  if (!interaction.member.roles.cache.has(config.staffRole))
    return safeReply(interaction, { content: '🚫 You must be staff to close tickets.', ephemeral: true });

  if (!interaction.deferred && !interaction.replied)
    await interaction.deferReply({ ephemeral: true });

  await safeReply(interaction, {
    content: 'Type `confirm` in this channel within 30s to close this ticket.',
    ephemeral: true
  });

  const filter = (m) => m.author.id === interaction.user.id;
  const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });

  if (!collected.size)
    return safeReply(interaction, { content: '❌ Ticket close cancelled (no confirmation).', ephemeral: true });

  if (collected.first().content.toLowerCase() !== 'confirm')
    return safeReply(interaction, { content: '❌ Cancelled (wrong confirmation).', ephemeral: true });

  await safeReply(interaction, { content: '🔒 Closing ticket...', ephemeral: true });
  await closeTicket(interaction.client, ticketType, ticketNum, interaction.user.id);
}

// ──────────────────────────────────────────────
// 🧾 Close logic + transcript + rating
export async function closeTicket(client, typeLabel, ticketNum, closedById) {
  const meta = Array.from(client.tickets.values()).find(
    (t) => t.id === Number(ticketNum) && t.type === typeLabel
  );
  if (!meta) return;

  const guild = client.guilds.cache.get(config.guildId);
  const ch = guild.channels.cache.get(meta.channelId);

  const file = await saveTranscriptToFile(ch, `${typeLabel}-${ticketNum}`);

  try {
    const logCh = await guild.channels.fetch(config.logChannel);
    const embed = new EmbedBuilder()
      .setTitle(`Ticket Closed — ${typeLabel} #${ticketNum}`)
      .setDescription(`Closed by <@${closedById}>`)
      .addFields({ name: 'Opened By', value: `<@${meta.userId}>` })
      .setFooter(footer())
      .setTimestamp();
    await logCh.send({ embeds: [embed], files: [file] });
  } catch (err) {
    console.warn('Log send failed:', err.message);
  }

  try {
    const user = await client.users.fetch(meta.userId);
    await user.send({
      content: `Your ${typeLabel} Ticket (#${ticketNum}) has been closed. Here’s your transcript.`,
      files: [file]
    });
  } catch {}

  await ch.send({ content: `✅ Ticket closed. This channel will be deleted in 10 seconds.` });
  setTimeout(() => ch.delete().catch(() => {}), 10000);

  client.tickets.delete(`${typeLabel}_${meta.userId}`);
}
