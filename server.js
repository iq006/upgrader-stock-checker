const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// SETT DIN API NØKKEL HER ⬇️
const API_KEY = 'ak_85PKKecWUUdiZ6DsAfaEgOasVpW0ygkegkkNpG2s';

app.use(cors());
app.use(express.static('.'));

app.get('/api/stock', async (req, res) => {
  try {
    const response = await fetch('https://upgrader.cc/api/stock', {
      headers: { 'X-API-Key': API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
