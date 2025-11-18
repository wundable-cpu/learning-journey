// admin-pos.js - Restaurant & Bar Point of Sale

// ========================================
// VARIABLES
// ========================================

let supabase;
let posMenuItems = [];
let posCurrentOrder = [];
let posCurrentGuests = [];

// ========================================
// SUPABASE INIT
// ========================================

function initSupabase() {
    try {
        if (window.supabase_client) {
            supabase = window.supabase_client;
            console.log('✅ Supabase connected');
            return true;
        }
        
        if (window.supabase) {
            const SUPABASE_URL = 'https://yglehirjsxaxvrpfbvse.supabase.co';
            const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbGVoaXJqc3hheHZycGZidnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA4MDU0MCwiZXhwIjoyMDc3NjU2NTQwfQ.Gkvs5_Upf0WVnuC7BM9rOyGI2GyaR1Ar4tYMXoIa_g8';
            
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✅ Supabase initialized');
            return true;
        }
        
        console.error('❌ Supabase not available');
        return false;
    } catch (error) {
        console.error('❌ Supabase init error:', error);
        return false;
    }
}

// ========================================
// INITIALIZATION
// ========================================

async function initializePOS() {
    console.log('🍽️ Initializing POS...');
    
    if (!initSupabase()) {
        alert('Database connection failed');
        return;
    }
    
    await loadMenuItems();
    await loadCurrentGuests();
    
    console.log('✅ POS ready');
}

// ========================================
// MENU FUNCTIONS
// ========================================

async function loadMenuItems() {
    try {
        console.log('Loading menu...');
        
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('available', true)
            .order('item_name');
        
        if (error) {
            console.error('DB Error:', error);
            throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
            throw new Error('No menu items in database');
        }
        
        posMenuItems = data;
        console.log('✅ Loaded', data.length, 'items');
        
        filterMenu('food');
        
    } catch (error) {
        console.error('Load error:', error);
        document.getElementById('menuItemsGrid').innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: var(--danger-red);">Failed to Load Menu</h3>
                <p style="color: var(--text-light);">${error.message}</p>
                <button onclick="loadMenuItems()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

function filterMenu(category) {
    document.querySelectorAll('.pos-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    const filtered = posMenuItems.filter(item => item.category === category);
    displayMenuItems(filtered);
}

function displayMenuItems(items) {
    const grid = document.getElementById('menuItemsGrid');
    
    if (items.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px;">No items</p>';
        return;
    }
    
    grid.innerHTML = items.map(item => `
        <div class="menu-item-card" onclick='addToOrder(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
            <div class="menu-item-name">${item.item_name}</div>
            <div class="menu-item-desc">${item.description || ''}</div>
            <div class="menu-item-price">₵${Number(item.price).toFixed(2)}</div>
        </div>
    `).join('');
}

// ========================================
// GUEST FUNCTIONS
// ========================================

async function loadCurrentGuests() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .lte('check_in', today)
            .gte('check_out', today);
        
        if (error) throw error;
        
        posCurrentGuests = data || [];
        populateGuestSelect();
        
        console.log('👥 Loaded', posCurrentGuests.length, 'guests');
        
    } catch (error) {
        console.error('Guest load error:', error);
        posCurrentGuests = [];
        populateGuestSelect();
    }
}

function populateGuestSelect() {
    const select = document.getElementById('guestSelect');
    
    if (posCurrentGuests.length === 0) {
        select.innerHTML = '<option>No guests checked in</option>';
        return;
    }
    
    select.innerHTML = '<option value="">-- Select Guest --</option>' + 
        posCurrentGuests.map(g => 
            `<option value="${g.id}" data-name="${g.full_name}" data-room="${g.room_type}">
                ${g.full_name} - ${g.room_type}
            </option>`
        ).join('');
}

// ========================================
// ORDER FUNCTIONS
// ========================================

function addToOrder(item) {
    const index = posCurrentOrder.findIndex(o => o.id === item.id);
    
    if (index >= 0) {
        posCurrentOrder[index].quantity++;
    } else {
        posCurrentOrder.push({
            id: item.id,
            name: item.item_name,
            price: Number(item.price),
            quantity: 1,
            category: item.category
        });
    }
    
    displayOrder();
}

function displayOrder() {
    const container = document.getElementById('orderItems');
    
    if (posCurrentOrder.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-light);">No items<br><small>Click menu items to add</small></p>';
        updateOrderTotal();
        return;
    }
    
    container.innerHTML = posCurrentOrder.map((item, i) => `
        <div class="order-item">
            <div class="order-item-info">
                <strong>${item.name}</strong><br>
                <small>₵${item.price.toFixed(2)} each</small>
            </div>
            <div class="order-item-controls">
                <button class="qty-btn" onclick="changeQuantity(${i}, -1)">−</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="changeQuantity(${i}, 1)">+</button>
            </div>
            <div class="order-item-total">₵${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-item-btn" onclick="removeFromOrder(${i})">×</button>
        </div>
    `).join('');
    
    updateOrderTotal();
}

function changeQuantity(index, change) {
    posCurrentOrder[index].quantity += change;
    if (posCurrentOrder[index].quantity <= 0) {
        posCurrentOrder.splice(index, 1);
    }
    displayOrder();
}

function removeFromOrder(index) {
    posCurrentOrder.splice(index, 1);
    displayOrder();
}

function clearOrder() {
    if (posCurrentOrder.length === 0) return;
    if (confirm('Clear all?')) {
        posCurrentOrder = [];
        displayOrder();
    }
}

function updateOrderTotal() {
    const subtotal = posCurrentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const service = subtotal * 0.10;
    const total = subtotal + service;
    
    document.getElementById('orderSubtotal').textContent = `₵${subtotal.toFixed(2)}`;
    document.getElementById('orderService').textContent = `₵${service.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `₵${total.toFixed(2)}`;
}

// ========================================
// PAYMENT FUNCTIONS
// ========================================

function toggleGuestSelect() {
    const type = document.querySelector('input[name="paymentType"]:checked').value;
    document.getElementById('roomSelectContainer').style.display = type === 'room' ? 'block' : 'none';
}

async function processOrder() {
    if (posCurrentOrder.length === 0) {
        alert('⚠️ Add items first');
        return;
    }
    
    const type = document.querySelector('input[name="paymentType"]:checked').value;
    
    if (type === 'room') {
        await chargeToRoom();
    } else {
        await processCashPayment();
    }
}

async function chargeToRoom() {
    const select = document.getElementById('guestSelect');
    const option = select.options[select.selectedIndex];
    
    if (!select.value) {
        alert('⚠️ Select guest');
        return;
    }
    
    try {
        const subtotal = posCurrentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const service = subtotal * 0.10;
        const total = subtotal + service;
        
        const charges = posCurrentOrder.map(item => ({
            guest_name: option.dataset.name,
            room_number: option.dataset.room,
            category: item.category === 'food' ? 'restaurant' : item.category,
            item_description: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_amount: item.price * item.quantity,
            charged_by: 'Restaurant Staff',
            paid: false
        }));
        
        charges.push({
            guest_name: option.dataset.name,
            room_number: option.dataset.room,
            category: 'restaurant',
            item_description: 'Service Charge (10%)',
            quantity: 1,
            unit_price: service,
            total_amount: service,
            charged_by: 'Restaurant Staff',
            paid: false
        });
        
        // LOG THE DATA BEFORE SENDING
        console.log('📤 Attempting to insert charges:', charges);
        console.log('📤 First charge object:', charges[0]);
        console.log('📤 Object keys:', Object.keys(charges[0]));
        
        const { data, error } = await supabase
            .from('guest_charges')
            .insert(charges);
        
        // LOG THE RESPONSE
        console.log('📥 Insert response:', { data, error });
        
        if (error) {
            console.error('❌ Supabase error details:', error);
            throw error;
        }
        
        showSuccess(`Order charged!\n\nGuest: ${option.dataset.name}\nTotal: ₵${total.toFixed(2)}`);
        resetOrder();
        
    } catch (error) {
        console.error('💥 Charge error:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error);
        alert('❌ Failed: ' + error.message);
    }
}
async function processCashPayment() {
    const subtotal = posCurrentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const service = subtotal * 0.10;
    const total = subtotal + service;
    
    if (confirm(`Cash payment: ₵${total.toFixed(2)}?`)) {
        showSuccess(`Cash received!\nTotal: ₵${total.toFixed(2)}`);
        resetOrder();
    }
}

// ========================================
// UI HELPERS
// ========================================

function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').style.display = 'flex';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

function resetOrder() {
    posCurrentOrder = [];
    displayOrder();
    document.getElementById('guestSelect').value = '';
    document.querySelector('input[name="paymentType"][value="room"]').checked = true;
    toggleGuestSelect();
}

// ========================================
// INIT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('pos')) {
        setTimeout(initializePOS, 200);
    }
});

console.log('🍽️ POS module loaded');