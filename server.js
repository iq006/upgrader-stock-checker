const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ⬇️ BYTT UT MED DIN FAKTISKE API NØKKEL FRA UPGRADER.CC
const API_KEY = 'ak_YqaT5il5o1ktm7qrD989zZVWz7WlW1JLPPYYfpci';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint for å hente stock
app.get('/api/stock', async (req, res) => {
  try {
    const response = await fetch('https://upgrader.cc/api/stock', {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      message: error.message 
    });
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
