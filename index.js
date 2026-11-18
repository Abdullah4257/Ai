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
      <head><title>Cloud 90-Sec Pro Crypto Scanner Active</title></head>
      <body style="background:#0b0e14; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
        <h1>🚀 24/7 PRO 90-SEC TRADING BOT (${BOT_USERNAME})</h1>
        <p>Status: Scanning Long & Short Every 90 Seconds for BTC, SOL, XRP, DOGE, SUI!</p>
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
// 90-SECOND MARKET MONITORING & SIGNAL GENERATION LOGIC
// =================================================================
function fetchMarketData() {
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

            console.log(`📊 [90-SEC SCAN] ${coin.name} | Price: $${livePrice} | 24h Change: ${priceChangePercent?.toFixed(2)}%`);

            if (priceChangePercent !== undefined && priceChangePercent !== null) {
              
              // ১. আপ বা লং এন্ট্রি সিগন্যাল (যখন ২৪h পরিবর্তন > +১.৫%)
              if (priceChangePercent > 1.5) {
                const analysis = {
                  type: '🟢 *LONG ENTRY SIGNAL (UP TREND PUMP)*',
                  position: 'LONG (BUY / UP)',
                  symbol: coin.name,
                  price: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
                  change: priceChangePercent.toFixed(2),
                  entry: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
                  sl: (livePrice * 0.98).toFixed(livePrice > 10 ? 2 : 4), // ২% নিচে স্টপ লস
                  tp: (livePrice * 1.04).toFixed(livePrice > 10 ? 2 : 4)  // ৪% উপরে টেক প্রফিট
                };
                sendProfessionalSignal(analysis);
              }

              // ২. ডাউন বা শর্ট এন্ট্রি সিগন্যাল (যখন ২৪h পরিবর্তন < -১.৫%)
              else if (priceChangePercent < -1.5) {
                const analysis = {
                  type: '🔴 *SHORT ENTRY SIGNAL (DOWN TREND DUMP)*',
                  position: 'SHORT (SELL / DOWN)',
                  symbol: coin.name,
                  price: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
                  change: priceChangePercent.toFixed(2),
                  entry: livePrice > 10 ? livePrice.toFixed(2) : livePrice.toFixed(4),
                  sl: (livePrice * 1.02).toFixed(livePrice > 10 ? 2 : 4), // ২% উপরে স্টপ লস
                  tp: (livePrice * 0.96).toFixed(livePrice > 10 ? 2 : 4)  // ৪% নিচে টেক প্রফিট
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
                  `📌 *Futures Market Direction:*\n` +
                  `• Best Entry Decision: \`${analysis.position}\`\n` +
                  `• Entry Zone: \`$${analysis.entry}\`\n` +
                  `• Stop Loss (SL): \`$${analysis.sl}\`\n` +
                  `• Take Profit (TP): \`$${analysis.tp}\`\n\n` +
                  `⚠️ *Status:* 24/7 Cloud Bot (90-Sec Interval Scan).`;

  sendSimpleMessage(message);
  console.log(`🎯 ${analysis.position} Signal sent to Telegram for ${analysis.symbol}!`);
}

// প্রতি ৯০ সেকেন্ড (90000 milliseconds) পর পর মার্কেট স্ক্যান করবে
setInterval(fetchMarketData, 90000);

app.listen(PORT, () => {
  console.log(`\n🚀 90-SEC PRO TRADING BOT RUNNING ON PORT ${PORT}\n`);
  sendSimpleMessage(`🤖 *${BOT_USERNAME} 90-Sec Bot Activated!*\n\nBTC, SOL, XRP, DOGE, SUI - প্রতি ৯০ সেকেন্ড পর পর আপ ও ডাউন সিগন্যাল স্ক্যানিং শুরু হয়েছে।`);
});