import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { config } from "../config/config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("staffstats")
    .setDescription("📊 View staff ticket statistics for Tenjiku Core (Swargarajyam)."),

  async execute(interaction) {
    try {
      // ⚡ Always defer the interaction immediately to prevent timeout
      await interaction.deferReply({ ephemeral: true });

      // Validate data exists
      const tickets = interaction.client.tickets;
      if (!tickets || tickets.size === 0) {
        return await interaction.editReply({
          content: "⚠️ No active or closed tickets found.",
        });
      }

      // Count tickets claimed by each staff
      const staffMap = new Map();
      for (const ticket of tickets.values()) {
        if (ticket.claimedBy) {
          staffMap.set(ticket.claimedBy, (staffMap.get(ticket.claimedBy) || 0) + 1);
        }
      }

      if (staffMap.size === 0) {
        return await interaction.editReply({
          content: "📭 No tickets have been claimed yet.",
        });
      }

      // Sort leaderboard
      const sorted = [...staffMap.entries()].sort((a, b) => b[1] - a[1]);
      const leaderboard = sorted
        .map(([id, count], i) => `${i + 1}. <@${id}> — **${count}** handled`)
        .join("\n");

      // Build embed
      const embed = new EmbedBuilder()
        .setTitle("📊 Staff Statistics — Swargarajyam")
        .setDescription("Overview of current ticket handling activity.")
        .addFields(
          {
            name: "🎟️ Total Active Tickets",
            value: `${tickets.size}`,
            inline: true,
          },
          {
            name: "👥 Active Staff",
            value: `${staffMap.size}`,
            inline: true,
          },
          {
            name: "🏆 Leaderboard",
            value: leaderboard || "No data available.",
          }
        )
        .setColor(config.brandColor)
        .setTimestamp()
        .setFooter({
          text: config.footerText,
          iconURL: config.footerIcon,
        });

      // 🟢 Always respond here
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("❌ Error in /staffstats:", err);

      // if something breaks after deferring, still send reply
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: "⚠️ Something went wrong while fetching staff stats.",
        });
      } else {
        await interaction.reply({
          content: "⚠️ Something went wrong while fetching staff stats.",
          ephemeral: true,
        });
      }
    }
  },
};
