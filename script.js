const API_BASE = 'https://upgrader.cc/api';
let apiKey = localStorage.getItem('upgrader_api_key') || '';
let refreshInterval = null;

// Country flags mapping
const countryFlags = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
    'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'SE': '🇸🇪',
    'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'PL': '🇵🇱',
    'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷', 'MX': '🇲🇽',
    'AR': '🇦🇷', 'CL': '🇨🇱', 'JP': '🇯🇵', 'KR': '🇰🇷',
    'IN': '🇮🇳', 'SG': '🇸🇬', 'MY': '🇲🇾', 'TH': '🇹🇭',
    'PH': '🇵🇭', 'ID': '🇮🇩', 'VN': '🇻🇳', 'TR': '🇹🇷',
    'ZA': '🇿🇦', 'EG': '🇪🇬', 'NZ': '🇳🇿', 'IE': '🇮🇪',
    'AT': '🇦🇹', 'BE': '🇧🇪', 'CH': '🇨🇭', 'PT': '🇵🇹',
    'GR': '🇬🇷', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴'
};

// Load API key on page load
window.onload = function() {
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
        fetchStock();
        startAutoRefresh();
    }
};

function saveApiKey() {
    const input = document.getElementById('apiKey').value.trim();
    const statusEl = document.getElementById('apiStatus');
    
    if (!input) {
        statusEl.textContent = '❌ Vennligst skriv inn en API nøkkel';
        statusEl.className = 'api-status error';
        return;
    }
    
    apiKey = input;
    localStorage.setItem('upgrader_api_key', apiKey);
    
    statusEl.textContent = '✅ API nøkkel lagret! Henter data...';
    statusEl.className = 'api-status success';
    
    fetchStock();
    startAutoRefresh();
}

async function fetchStock() {
    if (!apiKey) return;
    
    const stockGrid = document.getElementById('stockGrid');
    
    try {
        const response = await fetch(`${API_BASE}/stock`, {
            headers: {
                'X-API-Key': apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        // Update stats
        updateStats(data);
        
        // Display stock cards
        displayStock(data);
        
        // Update status
        const statusEl = document.getElementById('apiStatus');
        statusEl.textContent = '✅ Live data hentet!';
        statusEl.className = 'api-status success';
        
    } catch (error) {
        console.error('Error:', error);
        const statusEl = document.getElementById('apiStatus');
        statusEl.textContent = '❌ Feil ved henting av data. Sjekk API nøkkelen din.';
        statusEl.className = 'api-status error';
        
        stockGrid.innerHTML = '<p class="loading">Kunne ikke hente data. Sjekk API nøkkelen.</p>';
    }
}

function updateStats(data) {
    const totalStock = data.reduce((sum, country) => sum + country.slots, 0);
    const countriesAvailable = data.filter(c => c.slots > 0).length;
    const now = new Date().toLocaleTimeString('no-NO');
    
    document.getElementById('totalStock').textContent = totalStock;
    document.getElementById('countriesAvailable').textContent = countriesAvailable;
    document.getElementById('lastUpdate').textContent = now;
}

function displayStock(data) {
    const stockGrid = document.getElementById('stockGrid');
    
    // Sort by slots (highest first)
    data.sort((a, b) => b.slots - a.slots);
    
    stockGrid.innerHTML = data.map(country => {
        const flag = countryFlags[country.country_code] || '🌍';
        const slotsClass = country.slots === 0 ? 'out' : (country.slots < 10 ? 'low' : '');
        
        return `
            <div class="stock-card">
                <div class="flag">${flag}</div>
                <div class="country">${country.country}</div>
                <div class="code">${country.country_code}</div>
                <div class="slots ${slotsClass}">${country.slots}</div>
                <div class="label">slots tilgjengelig</div>
            </div>
        `;
    }).join('');
}

function startAutoRefresh() {
    const checkbox = document.getElementById('autoRefresh');
    
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    if (checkbox.checked && apiKey) {
        refreshInterval = setInterval(fetchStock, 10000); // 10 seconds
    }
}

// Auto refresh toggle
document.getElementById('autoRefresh').addEventListener('change', startAutoRefresh);
