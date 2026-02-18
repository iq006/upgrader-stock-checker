const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 API KEY i koden (som du ønsker)
const API_KEY = 'ak_0GXgv83zGTl3BIvYdg4mvhEqCwOk05kTPWAqfCVo';

// Middleware
app.use(cors());
app.use(express.json());

// 📁 Server static files fra /public
app.use(express.static(path.join(__dirname, 'public')));

// 🏠 Root: send index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 📦 API endpoint – henter stock fra upgrader.cc
app.get('/api/stock', async (req, res) => {
  try {
    const response = await fetch('https://upgrader.cc/api/stock', {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json',
        // Mange APIer forventer en UA fra "ekte klient"
        'User-Agent': 'Mozilla/5.0 (Render Node.js)',
      }
    });

    const text = await response.text(); // les body uansett
    console.log('Upgrader status:', response.status);
    console.log('Upgrader body:', text);

    // Returner som JSON hvis mulig, ellers raw text
    try {
      const json = JSON.parse(text);
      return res.status(response.status).json(json);
    } catch {
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('❌ Error fetching stock:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// ❤️ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 🚀 Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
});
