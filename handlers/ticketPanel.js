import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { footer } from "../utils/footer.js";
import { config } from "../config/config.js";

export async function createTicketPanel(channel) {
  const embed = new EmbedBuilder()
    .setTitle("🎟️ Swargarajyam Support Center")
    .setDescription(
      [
        " **Welcome to Swargarajyam!**",
        "Our support team is here to assist you with any inquiries or issues.",
        "",
        "Please select the appropriate category below to open a private ticket:",
        "• 🎧  **Support** — For account help, donations, or technical issues",
        "• 🎫 **FRP Report** — Report failed FRP situations or rule violations",
        "• 🎟️ **HoodFRP Report** — Report issues or incidents specific to HoodRP gameplay",
        "",
        "⚠️ *Please avoid opening multiple tickets for the same issue.*",
      ].join("\n")
    )
    .setColor(0xfbbf24) // 🌟 Elegant gold tone
    .setThumbnail("https://cdn.discordapp.com/attachments/1427549640626012183/1427617587310624839/swmain.png?ex=69131c7c&is=6911cafc&hm=9cc98eb8287969819f32bf59aaa17aedc181a1edf7d396832b9fb93c23b8ac87&") // small logo in corner
    .setImage("https://cdn.discordapp.com/attachments/1427549640626012183/1427617545959243827/bg.png?ex=69131c72&is=6911caf2&hm=a949389ad24307b5e549dfb13751a493ed7d8df59e293b7baaa73e8bf15cc916&") // optional full-width banner
    .setFooter(footer());

  // 🎛️ Category Buttons (refined text + layout)
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_support")
      .setLabel("🎧 Support")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("ticket_frp")
      .setLabel("🎫 FRP Report")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("ticket_hoodfrp")
      .setLabel("🎟️ HoodFRP Report")
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({ embeds: [embed], components: [row] });
}
