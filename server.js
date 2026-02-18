const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 API KEY i koden (som du ønsker)
const API_KEY = 'ak_0GXgv83zGTl3BIvYdg4mvhEqCwOk05kTPWAqfCVo';

// Upgrader base
const UPGRADER_STOCK_URL = 'https://upgrader.cc/api/stock';

// Middleware
app.use(cors());
app.use(express.json());

// Static site
app.use(express.static(path.join(__dirname, 'public')));

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Enkel cache (5 sek) for å unngå rate limit / støy ---
let cache = { ts: 0, status: 200, bodyText: '[]' };
const CACHE_MS = 5000;

app.get('/api/stock', async (req, res) => {
  try {
    const now = Date.now();
    if (now - cache.ts < CACHE_MS) {
      res.status(cache.status);
      // prøv json først
      try {
        return res.json(JSON.parse(cache.bodyText));
      } catch {
        return res.send(cache.bodyText);
      }
    }

    const response = await fetch(UPGRADER_STOCK_URL, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Render; Node.js)'
      }
    });

    const text = await response.text();

    // Logg ekte svar fra Upgrader (supernyttig)
    console.log('Upgrader status:', response.status);
    console.log('Upgrader body:', text);

    // Oppdater cache
    cache = { ts: now, status: response.status, bodyText: text };

    // Returner videre (json hvis mulig)
    res.status(response.status);
    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
});
