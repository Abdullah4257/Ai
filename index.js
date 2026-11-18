const express = require('express');
const https = require('https');

// ==========================================
// TELEGRAM BOT CONFIGURATION
// ==========================================
const TELEGRAM_BOT_TOKEN = "9155058614:AAHbhc31l1q64HmsLOXYSfiwOe5fvnemJPc"; 
let TELEGRAM_CHAT_ID = "6031352957";

const BOT_USERNAME = "@Aigentbot1_bot";
const PORT = process.env.PORT || 3000;

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Cloud Multi-Coin Binance Scanner Active</title></head>
      <body style="background:#0b0e14; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
        <h1>🚀 24/7 MULTI-COIN BINANCE TRADING BOT (${BOT_USERNAME})</h1>
        <p>Status: Scanning BTC, SOL, XRP, DOGE, SUI on Cloud Background!</p>
      </body>
    </html>
  `);
});

function sendSimpleMessage(text) {
  if (!TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
  https.get(url).on('error', err => console.error('Telegram Error:', err.message));
}

// =================================================================
// MULTI-COIN BINANCE LIVE REST API FETCHING & ANALYSIS LOGIC
// =================================================================
// BTC সহ মোট ৫টি কয়েন ট্র্যাকিং লিস্টে যুক্ত করা হলো
const TRACKED_SYMBOLS = ['BTCUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'SUIUSDT'];

function fetchBinanceMarketData() {
  TRACKED_SYMBOLS.forEach(symbol => {
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const ticker = JSON.parse(data);
          const livePrice = parseFloat(ticker.lastPrice);
          const priceChangePercent = parseFloat(ticker.priceChangePercent);
          const formattedSymbol = symbol.replace('USDT', '/USDT');

          console.log(`📊 [CLOUD BINANCE] ${formattedSymbol} Price: $${livePrice} | 24h Change: ${priceChangePercent}%`);

          // শর্ত পূরণ হলে টেলিগ্রামে সিগন্যাল পাঠাবে (যেমন ২৪h চেঞ্জ > ১.৫%)
          if (priceChangePercent > 1.5) {
            const analysis = {
              symbol: formattedSymbol,
              price: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
              change: priceChangePercent.toFixed(2),
              sl: (livePrice * 0.98).toFixed(livePrice > 10 ? 2 : 4),
              tp: (livePrice * 1.04).toFixed(livePrice > 10 ? 2 : 4)
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
  });
}

function sendProfessionalSignal(analysis) {
  if (!TELEGRAM_CHAT_ID) return;

  const message = `📊 *24/7 MULTI-COIN BINANCE SIGNAL* 📊\n\n` +
                  `🪙 *Asset:* ${analysis.symbol}\n` +
                  `⚡ *Setup:* Live Bullish Momentum Breakout\n` +
                  `📈 *Current Live Price:* \`$${analysis.price}\`\n` +
                  `🚀 *24h Change:* \`+${analysis.change}%\`\n\n` +
                  `📌 *Execution Plan:*\n` +
                  `• Entry: \`$${analysis.price}\`\n` +
                  `• Stop Loss (SL): \`$${analysis.sl}\`\n` +
                  `• Take Profit (TP): \`$${analysis.tp}\`\n\n` +
                  `⚠️ *Note:* Running 24/7 on Cloud Server.`;

  sendSimpleMessage(message);
  console.log(`🎯 Cloud Signal sent to Telegram for ${analysis.symbol}!`);
}

// প্রতি ৩০ সেকেন্ড পর পর সব কয়েন একসাথে স্ক্যান করবে
setInterval(fetchBinanceMarketData, 30000);

app.listen(PORT, () => {
  console.log(`\n🚀 MULTI-COIN TRADING BOT RUNNING ON PORT ${PORT}\n`);
  sendSimpleMessage(`🤖 *${BOT_USERNAME} Multi-Coin Cloud Bot Activated!*\n\nBTC, SOL, XRP, DOGE, SUI - এই কয়েনগুলোর ২৪ ঘণ্টা লাইভ স্ক্যানিং শুরু হয়েছে।`);
});