// currency.js - Currency conversion with country flags

// Make roomPrices globally accessible
window.roomPrices = {
    'Standard Room': 550,
    'Executive Room': 800,
    'Deluxe Room': 1500,
    'Royal Suite': 2500
};

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
window.convertPrice = function(priceInGHS) {
    if (currentCurrency === 'GHS') {
        return priceInGHS;
    }
    const rate = currencies[currentCurrency].rate;
    return Math.round(priceInGHS * rate);
};

// Format price with currency symbol
window.formatPrice = function(price, currency = currentCurrency) {
    const currencyData = currencies[currency];
    return `${currencyData.symbol}${price.toLocaleString()}`;
};

// Create inline currency selector (compact version)
function createInlineCurrencySelector(containerId) {
    const selectorHTML = `
        <div class="inline-currency-selector">
            <select class="currency-select" id="${containerId}">
                ${Object.keys(currencies).map(code => `
                    <option value="${code}" ${code === currentCurrency ? 'selected' : ''}>
                        ${currencies[code].flag} ${code}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
    return selectorHTML;
}

// Update all prices on the page
function updateAllPrices() {
    console.log('Updating prices to', currentCurrency);
    
    // Update room card prices
    document.querySelectorAll('.room-price').forEach(priceEl => {
        const roomType = priceEl.dataset.roomType;
        if (roomType && roomPrices[roomType]) {
            const priceInGHS = roomPrices[roomType];
            const convertedPrice = convertPrice(priceInGHS);
            
            // Find the price amount span
            const priceAmount = priceEl.querySelector('.price-amount');
            if (priceAmount) {
                priceAmount.textContent = formatPrice(convertedPrice);
            }
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
    
    // Add currency selectors to room cards
    document.querySelectorAll('.room-price').forEach((priceEl, index) => {
        if (!priceEl.querySelector('.inline-currency-selector')) {
            const selectorDiv = document.createElement('div');
            selectorDiv.innerHTML = createInlineCurrencySelector(`roomCurrency${index}`);
            priceEl.appendChild(selectorDiv.firstElementChild);
        }
    });
    
    // Add currency selector to booking summary
    const bookingSummary = document.querySelector('.booking-summary');
    if (bookingSummary && !bookingSummary.querySelector('.summary-currency-selector')) {
        const summaryHeader = bookingSummary.querySelector('h3');
        if (summaryHeader) {
            const selectorDiv = document.createElement('div');
            selectorDiv.className = 'summary-currency-selector';
            selectorDiv.innerHTML = createInlineCurrencySelector('summaryCurrency');
            summaryHeader.after(selectorDiv.firstElementChild);
        }
    }
    
    // Setup event listeners for all currency selectors
    document.querySelectorAll('.currency-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const newCurrency = e.target.value;
            currentCurrency = newCurrency;
            localStorage.setItem('selectedCurrency', newCurrency);
            
            // Update all selectors to match
            document.querySelectorAll('.currency-select').forEach(s => {
                s.value = newCurrency;
            });
            
            // Update all prices
            updateAllPrices();
        });
    });
    
    // Update initial prices
    updateAllPrices();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCurrency);

console.log('💱 Currency converter loaded');