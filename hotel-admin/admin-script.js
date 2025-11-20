// admin-pos.js - Restaurant & Bar Point of Sale System

// ========================================
// SUPABASE INITIALIZATION
// ========================================

// At the top of admin-script.js
const SUPABASE_URL = 'https://yglehirjsxaxvrpfbvse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbGVoaXJqc3hheHZycGZidnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODA1NDAsImV4cCI6MjA3NzY1NjU0MH0.o631vL64ZMuQNDZQBs9Lx4ANILQgkq_5DrPhz36fpu8';

// Initialize Supabase and make it globally available
window.supabase_client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase initialized globally');


        
    

// ========================================
// INITIALIZATION
// ========================================

async function initializePOS() {
    console.log('🍽️ Initializing POS system...');
    
    // Initialize Supabase
    if (!initSupabase()) {
        alert('Database connection failed. Please refresh the page.');
        return;
    }
    
    try {
        await loadMenuItems();
        await loadCurrentGuests();
        console.log('✅ POS system ready');
    } catch (error) {
        console.error('Error initializing POS:', error);
        alert('Failed to initialize POS: ' + error.message);
    }
}

// ========================================
// MENU MANAGEMENT
// ========================================

async function loadMenuItems() {
    try {
        console.log('📋 Loading menu items...');
        
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('available', true)
            .order('item_name', { ascending: true });
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        if (!data || data.length === 0) {
            throw new Error('No menu items found in database');
        }
        
        menuItems = data;
        console.log('✅ Loaded', data.length, 'menu items');
        
        // Show food by default
        filterMenu('food');
        
    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('menuItemsGrid').innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: var(--danger-red);">Failed to Load Menu</h3>
                <p style="color: var(--text-light); margin: 15px 0;">${error.message}</p>
                <button onclick="loadMenuItems()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

function filterMenu(category) {
    console.log('Filtering menu:', category);
    
    // Update tabs
    document.querySelectorAll('.pos-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    // Filter items
    const filtered = menuItems.filter(item => item.category === category);
    displayMenuItems(filtered);
}

function displayMenuItems(items) {
    const grid = document.getElementById('menuItemsGrid');
    
    if (items.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-light);">No items in this category</p>';
        return;
    }
    
    grid.innerHTML = items.map(item => `
        <div class="menu-item-card" onclick='addToOrder(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
            <div class="menu-item-name">${item.item_name}</div>
            <div class="menu-item-desc">${item.description || ''}</div>
            <div class="menu-item-price">₵${parseFloat(item.price).toFixed(2)}</div>
        </div>
    `).join('');
}

// ========================================
// GUEST MANAGEMENT
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
        
        currentGuests = data || [];
        populateGuestSelect();
        
        console.log('👥 Loaded', currentGuests.length, 'current guests');
        
    } catch (error) {
        console.error('Error loading guests:', error);
        currentGuests = [];
        populateGuestSelect();
    }
}

function populateGuestSelect() {
    const select = document.getElementById('guestSelect');
    
    if (currentGuests.length === 0) {
        select.innerHTML = '<option value="">No guests currently checked in</option>';
        return;
    }
    
    select.innerHTML = '<option value="">-- Select Guest --</option>' + 
        currentGuests.map(guest => 
            `<option value="${guest.id}" data-name="${guest.full_name}" data-room="${guest.room_number}">
                ${guest.full_name} - ${guest.room_number}
            </option>`
        ).join('');
}

// ========================================
// ORDER MANAGEMENT
// ========================================

function addToOrder(item) {
    console.log('Adding to order:', item.item_name);
    
    const existingIndex = currentOrder.findIndex(o => o.id === item.id);
    
    if (existingIndex >= 0) {
        currentOrder[existingIndex].quantity++;
    } else {
        currentOrder.push({
            id: item.id,
            name: item.item_name,
            price: parseFloat(item.price),
            quantity: 1,
            category: item.category
        });
    }
    
    displayOrder();
}

function displayOrder() {
    const container = document.getElementById('orderItems');
    
    if (currentOrder.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: var(--text-light); padding: 40px;">
                No items added yet<br>
                <small>Click menu items to add</small>
            </p>
        `;
        updateOrderTotal();
        return;
    }
    
    container.innerHTML = currentOrder.map((item, index) => `
        <div class="order-item">
            <div class="order-item-info">
                <strong>${item.name}</strong><br>
                <small>₵${item.price.toFixed(2)} each</small>
            </div>
            <div class="order-item-controls">
                <button class="qty-btn" onclick="changeQuantity(${index}, -1)">−</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
            </div>
            <div class="order-item-total">
                ₵${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="remove-item-btn" onclick="removeFromOrder(${index})">×</button>
        </div>
    `).join('');
    
    updateOrderTotal();
}

function changeQuantity(index, change) {
    currentOrder[index].quantity += change;
    
    if (currentOrder[index].quantity <= 0) {
        currentOrder.splice(index, 1);
    }
    
    displayOrder();
}

function removeFromOrder(index) {
    currentOrder.splice(index, 1);
    displayOrder();
}

function clearOrder() {
    if (currentOrder.length === 0) return;
    
    if (confirm('Clear all items?')) {
        currentOrder = [];
        displayOrder();
    }
}

function updateOrderTotal() {
    const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const service = subtotal * 0.10;
    const total = subtotal + service;
    
    document.getElementById('orderSubtotal').textContent = `₵${subtotal.toFixed(2)}`;
    document.getElementById('orderService').textContent = `₵${service.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `₵${total.toFixed(2)}`;
}

// ========================================
// PAYMENT PROCESSING
// ========================================

function toggleGuestSelect() {
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    document.getElementById('roomSelectContainer').style.display = paymentType === 'room' ? 'block' : 'none';
}

async function processOrder() {
    if (currentOrder.length === 0) {
        alert('⚠️ Please add items to order');
        return;
    }
    
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    
    if (paymentType === 'room') {
        await chargeToRoom();
    } else {
        await processCashPayment();
    }
}

async function chargeToRoom() {
    const guestSelect = document.getElementById('guestSelect');
    
    // 1. Get the selected value
    const selectedValue = guestSelect.value; 
    
    // 2. CHECK FOR EMPTY STRING (The Fix)
    if (!selectedValue || selectedValue === "") {
        alert('⚠️ Please select a valid guest/booking ID to charge the room.');
        return; // Stop the function here
    }
    
    // ... rest of the logic uses selectedValue for booking_id
    
    try {
        // ...
        const charges = currentOrder.map(item => ({
            booking_id: guestSelect.value, // Use the validated value
            guest_name: guestName,
            room_number: roomNumber, // FIX APPLIED
            category: item.category === 'food' ? 'restaurant' : item.category,
            item_description: item.name,
            quantity: item.quantity,
            unit_price: parseFloat(item.price.toFixed(2)), // Added precision control
            total_amount: parseFloat((item.price * item.quantity).toFixed(2)), // Added precision control
            charged_by: 'Restaurant Staff',
            transaction_date: transactionTimestamp, // Added audit field
            
            paid: false
        }));
        
        // Service charge insertion
        charges.push({
            booking_id: guestSelect.value,
            guest_name: guestName,
            room_number: roomNumber, // FIX APPLIED
            category: 'restaurant',
            item_description: 'Service Charge (10%)',
            quantity: 1,
            unit_price: parseFloat(service.toFixed(2)),
            total_amount: parseFloat(service.toFixed(2)),
            charged_by: 'Restaurant Staff',
            transaction_date: transactionTimestamp,
            
            paid: false
        });
        
        // ... Supabase insert logic remains the same
        
        const { error } = await supabase
            .from('guest_charges')
            .insert(charges);
        
        if (error) throw error;
        
        showSuccess(
            `Order charged successfully!\n\n` +
            `Guest: ${guestName}\n` +
            `Total: ₵${total.toFixed(2)}\n\n` +
            `Charges added to room bill.`
        );
        
        resetOrder();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Failed to process: ' + error.message);
    }
}

async function processCashPayment() {
    const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const service = subtotal * 0.10;
    const total = subtotal + service;
    
    if (confirm(`Process cash payment of ₵${total.toFixed(2)}?`)) {
        showSuccess(`Cash payment received!\n\nTotal: ₵${total.toFixed(2)}`);
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
    currentOrder = [];
    displayOrder();
    document.getElementById('guestSelect').value = '';
    document.querySelector('input[name="paymentType"][value="room"]').checked = true;
    toggleGuestSelect();
}

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('pos')) {
        // Small delay to ensure Supabase is loaded
        setTimeout(initializePOS, 100);
    }
});

console.log('🍽️ POS module loaded');