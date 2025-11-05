import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔑 Tokens
const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
const RAPIDAPI_KEY = "d60efad8a3msh002a3df78c9b203p168e00jsnea56d7aefaf3";
const RAPIDAPI_HOST = "terabox-downloader-direct-download-link-generator2.p.rapidapi.com";

const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.post("/", async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (!text.includes("terabox") && !text.includes("terafileshare")) {
    await sendMessage(chatId, "📎 Send a valid Terabox link!");
    return res.sendStatus(200);
  }

  await sendMessage(chatId, "⏳ Please wait... generating link...");

  const apiUrl = `https://${RAPIDAPI_HOST}/url?url=${encodeURIComponent(text)}`;
  const resp = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": RAPIDAPI_KEY,
    },
  });

  const data = await resp.json();

  if (data?.download_link) {
    const reply = `
🎬 *Direct Download Link Generated!*
📁 *File:* ${data.filename || "N/A"}
📦 *Size:* ${data.size || "Unknown"}
    `;
    await sendButtonMessage(chatId, reply, data.download_link);
  } else {
    await sendMessage(chatId, "❌ Failed to generate link. Try another one.");
  }

  res.sendStatus(200);
});

async function sendMessage(chatId, text) {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function sendButtonMessage(chatId, text, url) {
  const playerUrl = `https://YOUR-VERCEL-URL.vercel.app/player.html?url=${encodeURIComponent(url)}`;
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "▶️ Watch Online", url: playerUrl },
            { text: "⬇️ Download", url },
          ],
        ],
      },
    }),
  });
}

export default app;
