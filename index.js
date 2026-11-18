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
      <head><title>Cloud Pro Crypto Scanner Active</title></head>
      <body style="background:#0b0e14; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
        <h1>🚀 24/7 PRO MULTI-COIN TRADING BOT (${BOT_USERNAME})</h1>
        <p>Status: Monitoring Pump & Dump for BTC, SOL, XRP, DOGE, SUI on Cloud!</p>
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
// MARKET MONITORING & SIGNAL GENERATION LOGIC (PUMP / DUMP)
// =================================================================
function fetchMarketData() {
  // গ্লোবাল ফ্রি এপিআই ব্যবহার করে BTC, SOL, XRP, DOGE, SUI এর লাইভ প্রাইস ও ২৪ ঘণ্টা চেঞ্জ আনা হচ্ছে
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana,ripple,dogecoin,sui&vs_currencies=usd&include_24hr_change=true';

  https.get(url, { headers: { 'User-Agent': 'Node.js Bot' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        
        const coins = [
          { name: 'BTC/USDT', data: json.bitcoin },
          { name: 'SOL/USDT', data: json.solana },
          { name: 'XRP/USDT', data: json.ripple },
          { name: 'DOGE/USDT', data: json.dogecoin },
          { name: 'SUI/USDT', data: json.sui }
        ];

        coins.forEach(coin => {
          if (coin.data) {
            const livePrice = coin.data.usd;
            const priceChangePercent = coin.data.usd_24h_change;

            console.log(`📊 [SCANNING] ${coin.name} | Price: $${livePrice} | 24h Change: ${priceChangePercent?.toFixed(2)}%`);

            if (priceChangePercent !== undefined && priceChangePercent !== null) {
              
              // ১. বুলিশ মোমেন্টাম বা পাম্প (Pump) সিগন্যাল: ২৪ ঘণ্টা পরিবর্তন যদি ১.৫% এর বেশি হয়
              if (priceChangePercent > 1.5) {
                const analysis = {
                  type: '🚀 *BULLISH PUMP DETECTED*',
                  symbol: coin.name,
                  price: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
                  change: priceChangePercent.toFixed(2),
                  entry: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
                  sl: (livePrice * 0.98).toFixed(livePrice > 10 ? 2 : 4), // ২% নিচে স্টপ লস
                  tp: (livePrice * 1.04).toFixed(livePrice > 10 ? 2 : 4)  // ৪% উপরে টেক প্রফিট
                };
                sendProfessionalSignal(analysis);
              }

              // ২. বিয়ারিশ মোমেন্টাম বা ডাম্প (Dump) সতর্কতা: ২৪ ঘণ্টা পরিবর্তন যদি -১.৫% এর নিচে নামে
              else if (priceChangePercent < -1.5) {
                const analysis = {
                  type: '⚠️ *BEARISH DUMP WARNING*',
                  symbol: coin.name,
                  price: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
                  change: priceChangePercent.toFixed(2),
                  entry: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
                  sl: (livePrice * 1.02).toFixed(livePrice > 10 ? 2 : 4), // শর্ট পজিশনের জন্য স্টপ লস
                  tp: (livePrice * 0.96).toFixed(livePrice > 10 ? 2 : 4)  // টেক প্রফিট
                };
                sendProfessionalSignal(analysis);
              }

            }
          }
        });

      } catch (err) {
        console.error('JSON Parse Error:', err.message);
      }
    });
  }).on('error', err => {
    console.error('API Error:', err.message);
  });
}

function sendProfessionalSignal(analysis) {
  if (!TELEGRAM_CHAT_ID) return;

  const message = `${analysis.type} 📊\n\n` +
                  `🪙 *Asset:* ${analysis.symbol}\n` +
                  `📈 *Current Live Price:* \`$${analysis.price}\`\n` +
                  `🚀 *24h Change:* \`${analysis.change}%\`\n\n` +
                  `📌 *Execution Plan (Trade Setup):*\n` +
                  `• Entry Zone: \`$${analysis.entry}\`\n` +
                  `• Stop Loss (SL): \`$${analysis.sl}\`\n` +
                  `• Take Profit (TP): \`$${analysis.tp}\`\n\n` +
                  `⚠️ *Status:* Running 24/7 on Cloud Background.`;

  sendSimpleMessage(message);
  console.log(`🎯 Signal sent to Telegram for ${analysis.symbol}!`);
}

// প্রতি ৩০ সেকেন্ড পর পর মার্কেট স্ক্যান করবে
setInterval(fetchMarketData, 30000);

app.listen(PORT, () => {
  console.log(`\n🚀 PRO TRADING BOT RUNNING ON PORT ${PORT}\n`);
  sendSimpleMessage(`🤖 *${BOT_USERNAME} Pro Cloud Bot Activated!*\n\nBTC, SOL, XRP, DOGE, SUI - পাম্প ও ডাম্প ট্র্যাকিং এবং এন্ট্রি/SL/TP সিস্টেম সহ স্ক্যানিং শুরু হয়েছে।`);
});