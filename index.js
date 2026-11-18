const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const https = require('https');

// ==========================================
// TELEGRAM BOT CONFIGURATION
// ==========================================
const TELEGRAM_BOT_TOKEN = "9155058614:AAHbhc31l1q64HmsLOXYSfiwOe5fvnemJPc"; 
let TELEGRAM_CHAT_ID = ""; 

const BOT_USERNAME = "@Aigentbot1_bot";
const PORT = 3000;

const app = express();
const server = http.createServer(app);
const dashboardWss = new WebSocket.Server({ server });

// টেলিগ্রাম চ্যাট আইডি অটো-ডিটেক্ট করার ফাংশন
function checkTelegramUpdates() {
  if (TELEGRAM_CHAT_ID) return;
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.ok && parsed.result.length > 0) {
          const lastMsg = parsed.result[parsed.result.length - 1];
          const chatId = lastMsg.message?.chat?.id;
          if (chatId && TELEGRAM_CHAT_ID !== String(chatId)) {
            TELEGRAM_CHAT_ID = String(chatId);
            console.log(`✅ [TELEGRAM CONNECTED] Chat ID: ${TELEGRAM_CHAT_ID}`);
            sendSimpleMessage(`🤖 *${BOT_USERNAME} Connected!*\n\nবাইনান্স লাইভ এপিআই (Binance Live API) স্ক্যানার সফলভাবে সচল হয়েছে!`);
          }
        }
      } catch (e) {}
    });
  }).on('error', () => {});
}

setInterval(() => {
  if (!TELEGRAM_CHAT_ID) checkTelegramUpdates();
}, 3000);

function sendSimpleMessage(text) {
  if (!TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
  https.get(url).on('error', err => console.error('Telegram Error:', err.message));
}

// ড্যাশবোর্ড ইউআই
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Binance Live API Scanner</title></head>
      <body style="background:#0b0e14; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
        <h1>📈 BINANCE LIVE REST API BOT (${BOT_USERNAME})</h1>
        <p>Fetching Real-Time Market Data from Binance...</p>
      </body>
    </html>
  `);
});

// =================================================================
// BINANCE LIVE REST API FETCHING & ANALYSIS LOGIC
// =================================================================
function fetchBinanceMarketData() {
  // বাইনান্স পাবলিক এপিআই থেকে SOLUSDT এর ২৪ ঘণ্টার লাইভ টেটার ফেচ করা
  const url = 'https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT';

  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const ticker = JSON.parse(data);
        const livePrice = parseFloat(ticker.lastPrice);
        const priceChangePercent = parseFloat(ticker.priceChangePercent);
        const volume = parseFloat(ticker.volume);

        console.log(`📊 [BINANCE LIVE] SOL Price: $${livePrice} | 24h Change: ${priceChangePercent}%`);

        // যদি ২৪ ঘণ্টায় প্রাইস পরিবর্তনের হার নির্দিষ্ট শর্ত পূরণ করে (যেমন পজিটিভ মোমেন্টাম বা ব্রেকআউট)
        if (priceChangePercent > 1.5) { // উদাহরণস্বরূপ ১.৫% এর বেশি আপ থাকলে
          const analysis = {
            symbol: "SOL/USDT",
            price: livePrice.toFixed(2),
            change: priceChangePercent.toFixed(2),
            sl: (livePrice * 0.98).toFixed(2), // ২% নিচে স্টপ লস
            tp: (livePrice * 1.04).toFixed(2)  // ৪% উপরে টেক প্রফিট
          };
          
          sendProfessionalSignal(analysis);
        }
      } catch (err) {
        console.error('JSON Parse Error:', err.message);
      }
    });
  }).on('error', err => {
    console.error('Binance API Error:', err.message);
  });
}

function sendProfessionalSignal(analysis) {
  if (!TELEGRAM_CHAT_ID) return;

  const message = `📊 *BINANCE LIVE MARKET SIGNAL* 📊\n\n` +
                  `🪙 *Asset:* ${analysis.symbol}\n` +
                  `⚡ *Setup:* Live Bullish Momentum Breakout\n` +
                  `📈 *Current Live Price:* \`$${analysis.price}\`\n` +
                  `🚀 *24h Change:* \`+${analysis.change}%\`\n\n` +
                  `📌 *Execution Plan:*\n` +
                  `• Entry: \`$${analysis.price}\`\n` +
                  `• Stop Loss (SL): \`$${analysis.sl}\`\n` +
                  `• Take Profit (TP): \`$${analysis.tp}\`\n\n` +
                  `⚠️ *Note:* Managed via Binance Live REST API. Use strict risk management.`;

  sendSimpleMessage(message);
  console.log(`🎯 Live Signal sent to Telegram for ${analysis.symbol}!`);
}

// প্রতি ১ মিনিটে বাইনান্স লাইভ এপিআই কল করে মার্কেট চেক করবে
setInterval(fetchBinanceMarketData, 60000);

server.listen(PORT, () => {
  console.log(`\n📈 BINANCE LIVE API BOT FOR ${BOT_USERNAME} RUNNING!`);
  console.log(`👉 Dashboard: http://localhost:${PORT}\n`);
});