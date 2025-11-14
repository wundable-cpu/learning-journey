// currency.js - Currency conversion with country flags

// Currency data with flags and symbols
const currencies = {
    GHS: { name: 'Ghana Cedi', symbol: '₵', flag: '🇬🇭', rate: 1 },
    USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 0 },
    EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0 },
    GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0 },
    NGN: { name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', rate: 0 },
    ZAR: { name: 'South African Rand', symbol: 'R', flag: '🇿🇦', rate: 0 }
};

// Current selected currency (default GHS)
let currentCurrency = localStorage.getItem('selectedCurrency') || 'GHS';

// Base prices in GHS
const roomPrices = {
    'Standard Room': 550,
    'Executive Room': 800,
    'Deluxe Room': 1500,
    'Royal Suite': 2500
};

// Fetch exchange rates from API
async function fetchExchangeRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/GHS');
        const data = await response.json();
        
        if (data.rates) {
            currencies.USD.rate = data.rates.USD;
            currencies.EUR.rate = data.rates.EUR;
            currencies.GBP.rate = data.rates.GBP;
            currencies.NGN.rate = data.rates.NGN;
            currencies.ZAR.rate = data.rates.ZAR;
            
            console.log('✅ Exchange rates loaded');
            return true;
        }
    } catch (error) {
        console.error('Currency API error:', error);
        // Fallback rates if API fails
        currencies.USD.rate = 0.063;
        currencies.EUR.rate = 0.058;
        currencies.GBP.rate = 0.050;
        currencies.NGN.rate = 105.0;
        currencies.ZAR.rate = 1.15;
        return false;
    }
}

// Convert price from GHS to selected currency
function convertPrice(priceInGHS) {
    if (currentCurrency === 'GHS') {
        return priceInGHS;
    }
    const rate = currencies[currentCurrency].rate;
    return Math.round(priceInGHS * rate);
}

// Format price with currency symbol
function formatPrice(price, currency = currentCurrency) {
    const currencyData = currencies[currency];
    return `${currencyData.symbol}${price.toLocaleString()}`;
}

// Create currency selector dropdown
function createCurrencySelector() {
    const selectorHTML = `
        <div class="currency-selector">
            <button class="currency-btn" id="currencyButton">
                <span class="currency-flag">${currencies[currentCurrency].flag}</span>
                <span class="currency-code">${currentCurrency}</span>
                <span class="currency-arrow">▼</span>
            </button>
            <div class="currency-dropdown" id="currencyDropdown" style="display: none;">
                ${Object.keys(currencies).map(code => `
                    <div class="currency-option" data-currency="${code}">
                        <span class="currency-flag">${currencies[code].flag}</span>
                        <span class="currency-name">${code} - ${currencies[code].name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    return selectorHTML;
}

// Update all prices on the page
function updateAllPrices() {
    // Update room card prices
    document.querySelectorAll('.room-price').forEach(priceEl => {
        const roomType = priceEl.dataset.roomType;
        if (roomType && roomPrices[roomType]) {
            const priceInGHS = roomPrices[roomType];
            const convertedPrice = convertPrice(priceInGHS);
            priceEl.textContent = formatPrice(convertedPrice);
        }
    });
    
    // Update booking summary prices
    const summaryPrice = document.getElementById('summaryPrice');
    if (summaryPrice && summaryPrice.dataset.basePrice) {
        const basePrice = parseFloat(summaryPrice.dataset.basePrice);
        const convertedPrice = convertPrice(basePrice);
        summaryPrice.textContent = formatPrice(convertedPrice);
    }
    
    const summaryTotal = document.getElementById('summaryTotal');
    if (summaryTotal && summaryTotal.dataset.baseTotal) {
        const baseTotal = parseFloat(summaryTotal.dataset.baseTotal);
        const convertedTotal = convertPrice(baseTotal);
        summaryTotal.textContent = formatPrice(convertedTotal);
    }
    
    console.log(`💱 Prices updated to ${currentCurrency}`);
}

// Initialize currency system
async function initCurrency() {
    // Fetch exchange rates
    await fetchExchangeRates();
    
    // Add currency selector to navigation
    const nav = document.querySelector('.main-nav .nav-container');
    if (nav) {
        const selectorDiv = document.createElement('div');
        selectorDiv.innerHTML = createCurrencySelector();
        nav.appendChild(selectorDiv.firstElementChild);
        
        // Setup event listeners
        const currencyBtn = document.getElementById('currencyButton');
        const currencyDropdown = document.getElementById('currencyDropdown');
        
        // Toggle dropdown
        currencyBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = currencyDropdown.style.display === 'block';
            currencyDropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        // Select currency
        document.querySelectorAll('.currency-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const newCurrency = e.currentTarget.dataset.currency;
                currentCurrency = newCurrency;
                localStorage.setItem('selectedCurrency', newCurrency);
                
                // Update button
                currencyBtn.querySelector('.currency-flag').textContent = currencies[newCurrency].flag;
                currencyBtn.querySelector('.currency-code').textContent = newCurrency;
                
                // Hide dropdown
                currencyDropdown.style.display = 'none';
                
                // Update all prices
                updateAllPrices();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            currencyDropdown.style.display = 'none';
        });
    }
    
    // Update initial prices
    updateAllPrices();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCurrency);

console.log('💱 Currency converter loaded');