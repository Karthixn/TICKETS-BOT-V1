import {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import {
  createTicketChannel,
  handleClaim,
  handleAddUser,
  handleClose,
} from "../handlers/ticketManager.js";
import { config } from "../config/config.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      // ──────────────── SLASH COMMAND HANDLER ────────────────
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        try {
          await command.execute(interaction);
        } catch (err) {
          console.error(`❌ Error executing /${interaction.commandName}:`, err);
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
              content: "⚠️ An error occurred while running this command.",
            });
          } else {
            await interaction.reply({
              content: "⚠️ An error occurred while running this command.",
              ephemeral: true,
            });
          }
        }
        return; // prevent ticket code below from double handling
      }

      // ──────────────── DEBUG LOG ────────────────
      if (interaction.isButton()) {
        console.log("🟡 Button clicked:", interaction.customId);
      }
      if (interaction.isModalSubmit()) {
        console.log("🟢 Modal submitted:", interaction.customId);
      }

      // ──────────────── PANEL BUTTONS ────────────────
      if (interaction.isButton()) {
        const id = interaction.customId;

        // 🛡️ SUPPORT
        if (id === "ticket_support") {
          return createTicketChannel(
            interaction,
            config.categorySupport,
            "Support"
          );
        }

        // 🎮 FRP INQUIRY (no issue type)
        if (id === "ticket_frp") {
          const modal = new ModalBuilder()
            .setCustomId("frp_modal")
            .setTitle("FRP Report");

          const field1 = new TextInputBuilder()
            .setCustomId("frp_name")
            .setLabel("Your In-Game Name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const field2 = new TextInputBuilder()
            .setCustomId("frp_details")
            .setLabel("Describe your issue (details, IDs, etc.)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          const rows = [field1, field2].map((f) =>
            new ActionRowBuilder().addComponents(f)
          );

          modal.addComponents(...rows);
          return interaction.showModal(modal);
        }

        // 🏘️ HOODFRP INQUIRY (no issue type)
        if (id === "ticket_hoodfrp") {
          const modal = new ModalBuilder()
            .setCustomId("hoodfrp_modal")
            .setTitle("HoodFRP Report");

          const field1 = new TextInputBuilder()
            .setCustomId("hood_name")
            .setLabel("Your In-Game Name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const field2 = new TextInputBuilder()
            .setCustomId("hood_details")
            .setLabel("Describe your issue (details, IDs, etc.)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          const rows = [field1, field2].map((f) =>
            new ActionRowBuilder().addComponents(f)
          );

          modal.addComponents(...rows);
          return interaction.showModal(modal);
        }

        // ──────────────── STAFF BUTTONS ────────────────
        if (id.startsWith("claim_")) {
          const [, type, num] = id.split("_");
          return handleClaim(interaction, type, num);
        }

        if (id.startsWith("adduser_")) {
          const [, type, num] = id.split("_");
          return handleAddUser(interaction, type, num);
        }

        if (id.startsWith("close_")) {
          const [, type, num] = id.split("_");
          return handleClose(interaction, type, num);
        }

        // ──────────────── RATING BUTTONS ────────────────
        if (id.startsWith("rate_")) {
          const [, ticketId, rating] = id.split("_");
          try {
            const logCh = await interaction.client.channels.fetch(
              config.logChannel
            );
            await logCh.send({
              content: `⭐ User <@${interaction.user.id}> rated **${rating}/5** for ticket #${ticketId}.`,
            });
          } catch (e) {
            console.warn("Rating log failed:", e.message);
          }
          return interaction.reply({
            content: `Thank you for rating us ${rating}/5 ⭐`,
            ephemeral: true,
          });
        }
      }

      // ──────────────── MODAL SUBMISSIONS ────────────────
      if (interaction.isModalSubmit()) {
        // 🎮 FRP MODAL SUBMIT
        if (interaction.customId === "frp_modal") {
          const modalData = {
            "In-Game Name": interaction.fields.getTextInputValue("frp_name"),
            Details:
              interaction.fields.getTextInputValue("frp_details") || "N/A",
          };
          return createTicketChannel(
            interaction,
            config.categoryFRP,
            "FRP Inquiry",
            modalData
          );
        }

        // 🏘️ HOODFRP MODAL SUBMIT
        if (interaction.customId === "hoodfrp_modal") {
          const modalData = {
            "In-Game Name": interaction.fields.getTextInputValue("hood_name"),
            Details:
              interaction.fields.getTextInputValue("hood_details") || "N/A",
          };
          return createTicketChannel(
            interaction,
            config.categoryHoodFRP,
            "HoodFRP Inquiry",
            modalData
          );
        }
      }
    } catch (err) {
      console.error("❌ InteractionCreate error:", err);
      if (interaction.isRepliable()) {
        try {
          await interaction.reply({
            content: "⚠️ Something went wrong while processing this interaction.",
            ephemeral: true,
          });
        } catch {
          // ignore late replies
        }
      }
    }
  },
};
