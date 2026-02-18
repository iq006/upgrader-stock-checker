const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ⬇️ BYTT UT MED DIN FAKTISKE API NØKKEL FRA UPGRADER.CC
const API_KEY = 'ak_0GXgv83zGTl3BIvYdg4mvhEqCwOk05kTPWAqfCVo';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint for å hente stock
app.get('/api/stock', async (req, res) => {
  try {
    const response = await fetch('https://upgrader.cc/api/stock', {
      method: 'GET',
      headers: { 'X-API-Key': API_KEY }
    });

    const text = await response.text(); // les body uansett
    console.log('Upgrader status:', response.status);
    console.log('Upgrader body:', text);

    // send samme status + body videre (som JSON hvis mulig)
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


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
});
