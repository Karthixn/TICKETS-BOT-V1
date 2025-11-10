import { config } from '../config/config.js';
export function footer() {
  const f = { text: config.footerText };
  if (config.footerIcon) f.iconURL = config.footerIcon;
  return f;
}
