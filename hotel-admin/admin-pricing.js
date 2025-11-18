// admin-pricing.js - Centralized Price Management

let currentPrices = [];

// Load current prices
async function loadPrices() {
    try {
        const { data, error } = await supabase
            .from('room_pricing')
            .select('*')
            .order('base_price', { ascending: true });
        
        if (error) throw error;
        
        currentPrices = data;
        displayPrices();
        
        console.log('💰 Loaded prices:', data);
        
    } catch (error) {
        console.error('Error loading prices:', error);
        alert('Failed to load prices: ' + error.message);
    }
}

// Display prices
function displayPrices() {
    const grid = document.getElementById('pricingGrid');
    
    grid.innerHTML = currentPrices.map(price => `
        <div class="price-card">
            <div class="price-header">
                <h3>${price.room_type}</h3>
                <span class="last-updated">Last updated: ${new Date(price.last_updated).toLocaleDateString()}</span>
            </div>
            <div class="price-input-group">
                <label>Base Price per Night</label>
                <div class="input-with-currency">
                    <span class="currency-symbol">${price.currency}</span>
                    <input 
                        type="number" 
                        id="price-${price.id}" 
                        value="${price.base_price}" 
                        min="0" 
                        step="50"
                        class="price-input"
                    >
                </div>
            </div>
            <div class="price-preview">
                <strong>Weekly Rate:</strong> ${price.currency} ${(price.base_price * 7 * 0.9).toFixed(2)} (10% off)<br>
                <strong>Monthly Rate:</strong> ${price.currency} ${(price.base_price * 30 * 0.85).toFixed(2)} (15% off)
            </div>
        </div>
    `).join('');
}

// Save all price changes
async function savePrices() {
    if (!confirm('⚠️ This will update prices across the entire system. Continue?')) {
        return;
    }
    
    try {
        const updates = currentPrices.map(async (price) => {
            const input = document.getElementById(`price-${price.id}`);
            const newPrice = parseFloat(input.value);
            
            if (newPrice !== price.base_price) {
                const { error } = await supabase
                    .from('room_pricing')
                    .update({ 
                        base_price: newPrice,
                        last_updated: new Date().toISOString(),
                        updated_by: 'Manager' // In production, use actual user
                    })
                    .eq('id', price.id);
                
                if (error) throw error;
                
                console.log(`Updated ${price.room_type}: ${price.base_price} → ${newPrice}`);
            }
        });
        
        await Promise.all(updates);
        
        alert('✅ Prices updated successfully!\n\nChanges are now live on the website.');
        loadPrices();
        
    } catch (error) {
        console.error('Error saving prices:', error);
        alert('Failed to save prices: ' + error.message);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('pricing')) {
        loadPrices();
    }
});

console.log('💰 Pricing module loaded');