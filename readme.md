# 🧠 TICKETS BOT V1 
### Advanced Discord Ticket Bot for the Swargarajyam Server

> **TICKETS BOT V1** is a fully modular, advanced, embed-based **Discord ticket management bot** designed for the **Swargarajyam** server.  
> It automates ticket creation, staff workflows, transcripts, inactivity closure, and user feedback — all while maintaining clean branding and structured support.

---

## ✨ Features

### 🏗️ Core System
- **Dynamic Ticket Creation** — Category-based channels for Support, FRP, and HoodFRP.
- **Embed-based Interface** — All user interactions use rich, branded embeds.
- **Modular Structure** — Commands, handlers, and utils separated for clean maintenance.

### 🎟️ Ticket Management
- **Interactive Ticket Panel**
  - 🛡️ Support  
  - 🎮 FRP Inquiry *(uses modal form)*  
  - 🏘️ HoodFRP Inquiry *(uses modal form)*  
- **Modal Forms** collect user data upfront (In-Game Name, Issue Type, Details).
- **Automatic Channel Creation** in correct categories (private to staff + user).

### 🧰 Staff Controls
Inside each ticket, staff get a control panel with:
- 🙋 **Claim Ticket** — Marks ownership by staff member.
- 👤 **Add User** — Add extra user IDs to ticket visibility.
- 🔒 **Close Ticket** — Closes the ticket, sends transcript to staff log, DMs user a copy, and deletes channel after delay.

### 🕒 Automation
- **Auto Inactivity Closure**
  - Warns after 48 hours of no activity.
  - Closes automatically after 49 hours total.
- **Auto Logging & Transcript Archiving** in a designated log channel.

### ⭐ Rating & Feedback
- After closure, users receive a DM asking to rate their experience (1–5 stars).
- Ratings are logged to the staff log channel and tracked internally.

### 📊 Staff Dashboard
Command `/staffstats` displays:
- Total open tickets
- Average wait time
- Staff leaderboard by closed tickets

### 🛡️ Branding
All embeds include a **consistent footer**:

```
Swargarajyam | Powered by Tenjiku Core (TJK)
```

Configurable logo & color via `.env`.

---

## ⚙️ Installation

### Prerequisites
- Node.js **v18+**
- A Discord Bot with these permissions:
  - `Manage Channels`, `View Channel`, `Send Messages`,  
  - `Read Message History`, `Embed Links`, `Attach Files`

### Clone & Install
```bash
git clone https://github.com/<yourname>/tenjiku-core.git
cd tenjiku-core
npm install
```

### Configure Environment
Copy `.env.example` → `.env` and fill with your bot credentials and IDs.

---

## 🚀 Running the Bot

### Development Mode
```bash
node index.js
```

### Persistent Deployment Options

#### 🐳 Run with Docker
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --omit=dev
CMD ["node", "index.js"]
```

Then build and run:

```bash
docker build -t tenjiku-core .
docker run -d --name tenjiku-core --restart always --env-file .env tenjiku-core
```

#### ⚙️ Run with PM2 (Recommended for VPS)
Install PM2 globally:
```bash
npm install -g pm2
```

Create `ecosystem.config.js`:
```js
module.exports = {
  apps: [{
    name: "Tenjiku-Core",
    script: "index.js",
    watch: false,
    env: {
      NODE_ENV: "production"
    }
  }]
};
```

Start the bot:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🧩 Folder Structure

```
tenjiku-core/
├── index.js
├── .env
├── package.json
├── config/
├── commands/
├── events/
├── handlers/
├── utils/
└── data/
```

---

## 🧾 Transcripts

Each closed ticket is archived as an `.html` file (with readable message logs).  
Transcripts are uploaded to staff logs and DM’d to the ticket creator.

---

## 🌟 Rating System

After closure, users receive a DM prompt to rate their support experience (1–5 stars).  
Ratings are logged to the staff log channel and tracked for staff statistics.

---

## 🕓 Inactivity Flow

| Time Since Last Message | Action |
|--------------------------|--------|
| 48 hours | Sends warning in ticket |
| 49 hours | Auto-closes ticket & logs transcript |

---

## 🧮 Staff Command Reference

| Command | Description |
|----------|--------------|
| `/staffstats` | View total open tickets, avg wait time, and leaderboard. |

---

## 🧰 Developer Notes

- **Persistence:** Current version uses in-memory storage. For production, integrate MongoDB or SQLite.
- **Customization:** Adjust brand colors, embed messages, and text via `.env` and handler files.
- **Scalability:** Modular handlers allow easy feature addition.

---

## 🛠️ Future Enhancements
- Database persistence (SQLite or MongoDB)
- Web dashboard for staff analytics
- Slash commands for ticket search & stats
- Error reporting & uptime monitoring

---

## 👨‍💻 Contributors

| Role | Contributor |
|------|--------------|
| Core Developer | Tenjiku Systems |
| Framework | Discord.js v14 |
| Maintainer | [SPIDEY](https://github.com/karthixn) |
| TENJIKU CORE | [DISCORD](https://discord.gg/kNaSDXNDZw)|
---

## 📜 License

**MIT License © 2025 Tenjiku Systems**

You are free to modify and distribute this bot with credit to the original authors.

---

### 🧠 Credits

Developed by: Tenjiku Development
Commissioned for: Swargarajyam RP
Core Version: Tenjiku Core (TJK) v2.0
Maintainers: Tenjiku Dev Team

### 💬 Support

For assistance or bug reports:

📩 Discord: Tenjiku Development

🛠️ Email: support@tenjiku.dev

🌐 Docs: Coming soon

### IMAGE PREVIEWS
https://ibb.co/jP3Yz8rY
https://ibb.co/tpNG8qjK
https://ibb.co/fVL5h0WF
https://ibb.co/wFmkhBVB
https://ibb.co/8n3wpQnv
https://ibb.co/Nnp0FDNV

### 💡 “TICKETS BOT V1 | Powered by Tenjiku Core (TJK)”
> *Building seamless support experiences — one ticket at a time.*
