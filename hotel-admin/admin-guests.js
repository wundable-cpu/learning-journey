// ============================================
// USE GLOBAL SUPABASE CLIENT
// ============================================
const supabase = window.supabase_client || (() => {
    console.error('❌ Supabase not initialized!');
    return null;
})();

// ============================================
// STATE MANAGEMENT
// ============================================
let allGuests = [];
let currentGuest = null;

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('👥 Guest Management page loaded');
    
    if (!supabase) {
        showError('Database connection not available. Please refresh the page.');
        return;
    }
    
    loadGuests();
    setupEventListeners();
});

// ============================================
// LOAD GUESTS FROM DATABASE
// ============================================
async function loadGuests() {
    console.log('📡 Loading guests from Supabase...');
    
    try {
        // Get all bookings
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        console.log(`✅ Loaded ${bookings ? bookings.length : 0} bookings`);
        
        if (!bookings || bookings.length === 0) {
            showEmptyState();
            updateStats(0, 0, 0, 0);
            return;
        }
        
        // Group bookings by guest email to create unique guest list
        const guestMap = new Map();
        
        bookings.forEach(booking => {
            const email = booking.guest_email.toLowerCase();
            
            if (guestMap.has(email)) {
                // Add booking to existing guest
                guestMap.get(email).bookings.push(booking);
            } else {
                // Create new guest entry
                guestMap.set(email, {
                    guest_name: booking.guest_name,
                    guest_email: booking.guest_email,
                    guest_phone: booking.guest_phone,
                    bookings: [booking]
                });
            }
        });
        
        // Convert map to array
        allGuests = Array.from(guestMap.values());
        
        // Sort by number of bookings (VIP guests first)
        allGuests.sort((a, b) => b.bookings.length - a.bookings.length);
        
        console.log(`👥 Processed ${allGuests.length} unique guests`);
        
        displayGuests();
        updateStats(allGuests.length, bookings.length, guestMap);
        
    } catch (error) {
        console.error('❌ Error loading guests:', error);
        showError(error.message);
    }
}

// ============================================
// DISPLAY GUESTS IN TABLE
// ============================================
// ============================================
// DISPLAY GUESTS IN TABLE
// ============================================
function displayGuests() {
    const tbody = document.querySelector('.guests-table tbody');
    
    if (!tbody) {
        console.error('❌ Table body not found');
        return;
    }
    
    if (allGuests.length === 0) {
        showEmptyState();
        return;
    }
    
    tbody.innerHTML = allGuests.map(guest => {
        const bookingCount = guest.bookings.length;
        const isVIP = bookingCount >= 3;
        
        // Calculate total spent
        const totalSpent = guest.bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
        
        // Get most recent booking
        const latestBooking = guest.bookings[0];
        const status = latestBooking.status;
        
        // Check if currently checked in
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkIn = new Date(latestBooking.check_in);
        const checkOut = new Date(latestBooking.check_out);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        
        const isCurrentGuest = today >= checkIn && today < checkOut && 
                               (status === 'checked-in' || status === 'confirmed');
        
        return `
            <tr onclick='viewGuestDetails(${JSON.stringify(guest).replace(/'/g, "&apos;")})' style="cursor: pointer;">
                <td>
                    <strong>${guest.guest_name}</strong>
                    ${isVIP ? '<span class="guest-vip-badge">⭐ VIP</span>' : ''}
                </td>
                <td>${guest.guest_email}</td>
                <td>${guest.guest_phone}</td>
                <td><strong>${bookingCount}</strong> booking(s)</td>
                <td style="color: var(--accent-gold); font-weight: 700;">
                    GH₵ ${totalSpent.toLocaleString()}
                </td>
                <td>${new Date(latestBooking.created_at).toLocaleDateString('en-GB')}</td>
                <td>
                    <span class="guest-status-${isCurrentGuest ? 'current' : 'past'}">
                        ${isCurrentGuest ? '🏨 Current Guest' : 'Past Guest'}
                    </span>
                </td>
                <td>
                    <button onclick="event.stopPropagation(); viewGuestDetails(${JSON.stringify(guest).replace(/'/g, "&apos;")})" 
                            class="btn-small btn-primary" style="padding: 6px 12px; font-size: 12px;">
                        👁️ View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// UPDATE STATISTICS
// ============================================
function updateStats(totalGuests, totalBookings, guestMap) {
    // Current guests (checked in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentGuests = 0;
    let vipGuests = 0;
    let returningGuests = 0;
    
    allGuests.forEach(guest => {
        // Check if VIP (3+ bookings)
        if (guest.bookings.length >= 3) vipGuests++;
        
        // Check if returning guest (2+ bookings)
        if (guest.bookings.length >= 2) returningGuests++;
        
        // Check if current guest
        guest.bookings.forEach(booking => {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            
            if (today >= checkIn && today < checkOut && 
                (booking.status === 'checked-in' || booking.status === 'confirmed')) {
                currentGuests++;
            }
        });
    });
    
    // Update stat cards
    document.getElementById('totalGuestsCount').textContent = totalGuests;
    document.getElementById('currentGuestsCount').textContent = currentGuests;
    document.getElementById('vipGuestsCount').textContent = vipGuests;
    document.getElementById('returningGuestsCount').textContent = returningGuests;
    
    console.log('📊 Stats updated:', { totalGuests, currentGuests, vipGuests, returningGuests });
}

// ============================================
// VIEW GUEST DETAILS
// ============================================
function viewGuestDetails(guest) {
    currentGuest = guest;
    
    const modal = document.getElementById('guestModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const bookingCount = guest.bookings.length;
    const isVIP = bookingCount >= 3;
    
    // Calculate total spent
    const totalSpent = guest.bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    
    modalTitle.textContent = `${guest.guest_name} ${isVIP ? '⭐' : ''}`;
    
    modalBody.innerHTML = `
        <div class="guest-profile-grid">
            <div class="detail-group">
                <h3>Full Name</h3>
                <p>${guest.guest_name}</p>
            </div>
            <div class="detail-group">
                <h3>Email</h3>
                <p>${guest.guest_email}</p>
            </div>
            <div class="detail-group">
                <h3>Phone</h3>
                <p>${guest.guest_phone}</p>
            </div>
            <div class="detail-group">
                <h3>Total Bookings</h3>
                <p><strong>${bookingCount}</strong></p>
            </div>
            <div class="detail-group">
                <h3>Guest Type</h3>
                <p>${isVIP ? '⭐ VIP Guest' : bookingCount >= 2 ? '🔄 Returning Guest' : '🆕 New Guest'}</p>
            </div>
            <div class="detail-group">
                <h3>Total Spent</h3>
                <p style="color: var(--accent-gold); font-weight: 700;">GH₵ ${totalSpent.toLocaleString()}</p>
            </div>
        </div>
        
        <div class="booking-history-section">
            <h3>Booking History (${bookingCount})</h3>
            ${guest.bookings.map(booking => {
                const checkIn = new Date(booking.check_in);
                const checkOut = new Date(booking.check_out);
                const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="booking-history-item">
                        <div>
                            <strong>${booking.booking_reference}</strong><br>
                            <span style="color: var(--text-light); font-size: 12px;">
                                ${checkIn.toLocaleDateString('en-GB')} → ${checkOut.toLocaleDateString('en-GB')} 
                                (${nights} night${nights > 1 ? 's' : ''})
                            </span><br>
                            <span style="font-size: 13px;">
                                ${booking.room_type} ${booking.room_number ? `• Room ${booking.room_number}` : ''}
                            </span>
                        </div>
                        <div style="text-align: right;">
                            <span class="status-badge status-${booking.status}">${booking.status}</span><br>
                            <strong style="color: var(--accent-gold); font-size: 16px;">
                                GH₵ ${parseFloat(booking.total_price).toLocaleString()}
                            </strong>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="modal-footer" style="margin-top: 30px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="sendEmailToGuest()" class="btn-primary">
                📧 Send Email
            </button>
            <button onclick="closeModal()" class="btn-secondary">
                ✖️ Close
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// ============================================
// SEND EMAIL TO GUEST
// ============================================
function sendEmailToGuest() {
    if (!currentGuest) return;
    
    const subject = encodeURIComponent('Message from Tima Sara Hotel');
    const body = encodeURIComponent(`Dear ${currentGuest.guest_name},\n\n`);
    
    window.location.href = `mailto:${currentGuest.guest_email}?subject=${subject}&body=${body}`;
}


// ============================================
// SEARCH AND FILTER FUNCTIONALITY
// ============================================
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', performSearch);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    
    console.log(`🔍 Filtering - Search: "${searchTerm}" | Status: ${statusFilter}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredGuests = allGuests.filter(guest => {
        // Text search filter
        const matchesSearch = 
            guest.guest_name.toLowerCase().includes(searchTerm) ||
            guest.guest_email.toLowerCase().includes(searchTerm) ||
            guest.guest_phone.includes(searchTerm);
        
        if (!matchesSearch) return false;
        
        // Status filter
        const bookingCount = guest.bookings.length;
        
        switch(statusFilter) {
            case 'all':
                return true;
                
            case 'current':
                // Check if guest is currently checked in
                return guest.bookings.some(booking => {
                    const checkIn = new Date(booking.check_in);
                    const checkOut = new Date(booking.check_out);
                    checkIn.setHours(0, 0, 0, 0);
                    checkOut.setHours(0, 0, 0, 0);
                    
                    return today >= checkIn && today < checkOut && 
                           (booking.status === 'checked-in' || booking.status === 'confirmed');
                });
                
            case 'past':
                // No current bookings
                return !guest.bookings.some(booking => {
                    const checkIn = new Date(booking.check_in);
                    const checkOut = new Date(booking.check_out);
                    checkIn.setHours(0, 0, 0, 0);
                    checkOut.setHours(0, 0, 0, 0);
                    
                    return today >= checkIn && today < checkOut && 
                           (booking.status === 'checked-in' || booking.status === 'confirmed');
                });
                
            case 'vip':
                return bookingCount >= 3;
                
            case 'returning':
                return bookingCount >= 2;
                
            case 'new':
                return bookingCount === 1;
                
            default:
                return true;
        }
    });
    
    console.log(`✅ Found ${filteredGuests.length} guests matching criteria`);
    
    // Temporarily replace allGuests for display
    const originalGuests = allGuests;
    allGuests = filteredGuests;
    displayGuests();
    allGuests = originalGuests;
}

// ============================================
// EXPORT TO CSV
// ============================================
function exportToCSV() {
    if (allGuests.length === 0) {
        alert('❌ No guests to export');
        return;
    }
    
    const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'Total Spent', 'Last Booking Date'];
    
    const rows = allGuests.map(g => {
        const totalSpent = g.bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
        const lastBooking = new Date(g.bookings[0].created_at);
        
        return [
            g.guest_name,
            g.guest_email,
            g.guest_phone,
            g.bookings.length,
            totalSpent.toFixed(2),
            lastBooking.toLocaleDateString('en-GB')
        ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guests_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    console.log('📥 Exported', allGuests.length, 'guests to CSV');
}

// ============================================
// UI HELPERS
// ============================================
function showEmptyState() {
    const tbody = document.querySelector('.guests-table tbody');
    
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <div style="color: var(--text-light);">
                        <p style="font-size: 18px; margin-bottom: 10px;">👥 No guests yet</p>
                        <p>Guests will appear here automatically when bookings are made.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

function showError(message) {
    const tbody = document.querySelector('.guests-table tbody');
    
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <div style="color: var(--danger-red);">
                        <p style="font-size: 18px; margin-bottom: 10px;">❌ Error Loading Guests</p>
                        <p style="color: var(--text-light);">${message}</p>
                        <button onclick="loadGuests()" class="btn-primary" style="margin-top: 20px;">
                            🔄 Retry
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function closeModal() {
    const modal = document.getElementById('guestModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentGuest = null;
}

// Close modal when clicking outside
document.getElementById('guestModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ============================================
// LOGOUT
// ============================================
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        window.location.href = 'admin-login.html';
    }
});

console.log('✅ Guest Management module loaded');