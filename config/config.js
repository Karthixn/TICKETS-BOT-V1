import 'dotenv/config';

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  categorySupport: process.env.CATEGORY_SUPPORT_ID,
  categoryFRP: process.env.CATEGORY_FRP_ID,
  categoryHoodFRP: process.env.CATEGORY_HOODFRP_ID,
  staffRole: process.env.STAFF_ROLE_ID,
  logChannel: process.env.TICKET_LOG_CHANNEL_ID,
  supportChannel: process.env.SUPPORT_CHANNEL_ID,
  brandColor: process.env.BRAND_COLOR ? Number(process.env.BRAND_COLOR) : 0xA52A2A,
  footerText: process.env.FOOTER_TEXT || 'Swargarajyam | Powered by Tenjiku Core (TJK)',
  footerIcon: process.env.FOOTER_ICON_URL || null
};
