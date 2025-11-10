import fs from 'fs';
import path from 'path';
import { escapeHtml } from '../utils/escapeHtml.js';

export async function saveTranscriptToFile(channel, ticketNum) {
  // fetch messages in batches
  const fetched = [];
  let lastId;
  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const messages = await channel.messages.fetch(options);
    if (!messages.size) break;
    messages.forEach(m => fetched.push(m));
    lastId = messages.last().id;
    if (messages.size < 100) break;
  }

  fetched.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const rows = fetched.map(m => {
    const time = new Date(m.createdTimestamp).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
    const author = `${m.author.tag} (${m.author.id})`;
    const content = m.content ? escapeHtml(m.content) : '';
    const attachments = m.attachments.map(a => `<a href="${a.url}">${escapeHtml(a.name)}</a>`).join(' ');
    return `<div class="message"><div class="meta"><strong>${escapeHtml(author)}</strong> <span class="time">${escapeHtml(time)}</span></div><div class="content">${content}</div><div class="attachments">${attachments}</div></div>`;
  }).join('\n');

  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>ticket-${ticketNum}</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;background:#f8f8f8;color:#111}
.container{max-width:900px;margin:20px auto;background:#fff;padding:16px;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,0.06)}
.message{padding:8px;border-bottom:1px solid #eee}
.meta{font-size:13px;color:#444}
.time{color:#888;margin-left:8px;font-size:12px}
.content{margin-top:6px;white-space:pre-wrap}
.attachments{margin-top:6px}
</style>
</head>
<body><div class="container"><h2>Ticket ${ticketNum}</h2>${rows}</div></body></html>`;

  const filename = `ticket-${ticketNum}.html`;
  const filepath = path.join(process.cwd(), 'data');
  if (!fs.existsSync(filepath)) fs.mkdirSync(filepath, { recursive: true });
  const full = path.join(filepath, filename);
  fs.writeFileSync(full, html, 'utf8');
  return full;
}
