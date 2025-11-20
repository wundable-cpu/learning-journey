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
let allBookings = [];
let filteredBookings = [];
let currentPage = 1;
const itemsPerPage = 20;

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Reservations page loaded');
    
    if (!supabase) {
        showError('Database connection not available. Please refresh the page.');
        return;
    }
    
    loadBookings();
    setupEventListeners();
});

// ... rest of your code stays the same


// ============================================
// LOAD BOOKINGS FROM DATABASE
// ============================================
async function loadBookings() {
    console.log('📡 Loading bookings from Supabase...');
    
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('check_in', { ascending: false });
        
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        allBookings = data || [];
        filteredBookings = [...allBookings];
        
        console.log(`✅ Loaded ${allBookings.length} bookings`);
        
        if (allBookings.length > 0) {
            console.log('📋 Sample booking:', allBookings[0]);
        }
        
        displayBookings();
        
    } catch (error) {
        console.error('❌ Error loading bookings:', error);
        showError(error.message);
    }
}

// ============================================
// DISPLAY BOOKINGS IN TABLE
// ============================================
function displayBookings() {
    const tbody = document.querySelector('.bookings-table tbody');
    
    if (!tbody) {
        console.error('❌ Table body not found');
        return;
    }
    
    if (filteredBookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <div style="color: var(--text-light);">
                        <p style="font-size: 18px; margin-bottom: 10px;">📭 No bookings found</p>
                        <p>Bookings from your website will appear here automatically.</p>
                    </div>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageBookings = filteredBookings.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageBookings.map(booking => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalGuests = booking.num_adults + (booking.num_children || 0);
        
        return `
            <tr onclick="viewBooking('${booking.id}')">
                <td><strong>${booking.booking_reference}</strong></td>
                <td>${booking.guest_name}</td>
                <td>${checkIn.toLocaleDateString('en-GB')}</td>
                <td>${checkOut.toLocaleDateString('en-GB')}</td>
                <td>${booking.room_type}</td>
                <td>${booking.room_number || '—'}</td>
                <td>${totalGuests}</td>
                <td>GH₵ ${parseFloat(booking.total_price).toLocaleString()}</td>
                <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            </tr>
        `;
    }).join('');
    
    updatePagination();
}

// ============================================
// VIEW BOOKING DETAILS
// ============================================
function viewBooking(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('❌ Booking not found');
        return;
    }
    
    const modal = document.getElementById('bookingModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalGuests = booking.num_adults + (booking.num_children || 0);
    
    modalTitle.textContent = `Booking: ${booking.booking_reference}`;
    
    modalBody.innerHTML = `
        <div class="booking-detail-grid">
            <div class="detail-group">
                <h3>Reference</h3>
                <p>${booking.booking_reference}</p>
            </div>
            <div class="detail-group">
                <h3>Status</h3>
                <p><span class="status-badge status-${booking.status}">${booking.status}</span></p>
            </div>
            <div class="detail-group">
                <h3>Guest Name</h3>
                <p>${booking.guest_name}</p>
            </div>
            <div class="detail-group">
                <h3>Email</h3>
                <p>${booking.guest_email}</p>
            </div>
            <div class="detail-group">
                <h3>Phone</h3>
                <p>${booking.guest_phone}</p>
            </div>
            <div class="detail-group">
                <h3>Room Type</h3>
                <p>${booking.room_type}</p>
            </div>
            <div class="detail-group">
                <h3>Room Number</h3>
                <p>${booking.room_number || 'Not assigned'}</p>
            </div>
            <div class="detail-group">
                <h3>Check-in</h3>
                <p>${checkIn.toLocaleDateString('en-GB')}</p>
            </div>
            <div class="detail-group">
                <h3>Check-out</h3>
                <p>${checkOut.toLocaleDateString('en-GB')}</p>
            </div>
            <div class="detail-group">
                <h3>Nights</h3>
                <p>${nights}</p>
            </div>
            <div class="detail-group">
                <h3>Adults</h3>
                <p>${booking.num_adults}</p>
            </div>
            <div class="detail-group">
                <h3>Children</h3>
                <p>${booking.num_children || 0}</p>
            </div>
            <div class="detail-group">
                <h3>Total Guests</h3>
                <p>${totalGuests}</p>
            </div>
            <div class="detail-group">
                <h3>Total Price</h3>
                <p style="color: var(--accent-gold); font-weight: 700; font-size: 18px;">GH₵ ${parseFloat(booking.total_price).toLocaleString()}</p>
            </div>
            <div class="detail-group">
                <h3>Booked On</h3>
                <p>${new Date(booking.created_at).toLocaleString('en-GB')}</p>
            </div>
        </div>
        ${booking.special_requests ? `
        <div class="detail-group" style="margin-top: 20px;">
            <h3>Special Requests</h3>
            <p style="background: var(--bg-light); padding: 15px; border-radius: 8px;">${booking.special_requests}</p>
        </div>
        ` : ''}
        
        <div class="modal-footer" style="margin-top: 30px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="assignRoom('${booking.id}')" class="btn-primary">
                🏠 Assign Room
            </button>
            <button onclick="updateStatus('${booking.id}')" class="btn-secondary">
                ✏️ Update Status
            </button>
            <button onclick="closeModal()" class="btn-secondary">
                ✖️ Close
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// ============================================
// ASSIGN ROOM TO BOOKING
// ============================================
async function assignRoom(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    
    if (!booking) return;
    
    const roomNumber = prompt(`Assign room number for ${booking.guest_name}:`, booking.room_number || '');
    
    if (!roomNumber) return;
    
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ room_number: roomNumber })
            .eq('id', bookingId);
        
        if (error) throw error;
        
        alert(`✅ Room ${roomNumber} assigned successfully!`);
        closeModal();
        loadBookings();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Failed to assign room: ' + error.message);
    }
}

// ============================================
// UPDATE BOOKING STATUS
// ============================================
async function updateStatus(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    
    if (!booking) return;
    
    const newStatus = prompt(
        `Update status for ${booking.guest_name}:\n\n` +
        `Options: pending, confirmed, checked-in, checked-out, cancelled`,
        booking.status
    );
    
    if (!newStatus) return;
    
    const validStatuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];
    
    if (!validStatuses.includes(newStatus.toLowerCase())) {
        alert('❌ Invalid status. Use: pending, confirmed, checked-in, checked-out, or cancelled');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus.toLowerCase() })
            .eq('id', bookingId);
        
        if (error) throw error;
        
        alert(`✅ Status updated to: ${newStatus}`);
        closeModal();
        loadBookings();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Failed to update status: ' + error.message);
    }
}

// ============================================
// SEARCH FUNCTIONALITY
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
    
    filteredBookings = allBookings.filter(booking => {
        const matchesSearch = 
            booking.guest_name.toLowerCase().includes(searchTerm) ||
            booking.guest_email.toLowerCase().includes(searchTerm) ||
            booking.booking_reference.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    currentPage = 1;
    displayBookings();
    
    console.log(`🔍 Search: "${searchTerm}" | Status: ${statusFilter} | Found: ${filteredBookings.length}`);
}

// ============================================
// PAGINATION
// ============================================
function updatePagination() {
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayBookings();
            }
        };
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayBookings();
            }
        };
    }
}

// ============================================
// EXPORT TO CSV
// ============================================
function exportToCSV() {
    if (filteredBookings.length === 0) {
        alert('❌ No bookings to export');
        return;
    }
    
    const headers = ['Reference', 'Guest Name', 'Email', 'Phone', 'Room Type', 'Room Number', 
                     'Check-in', 'Check-out', 'Adults', 'Children', 'Total Price', 'Status'];
    
    const rows = filteredBookings.map(b => [
        b.booking_reference,
        b.guest_name,
        b.guest_email,
        b.guest_phone,
        b.room_type,
        b.room_number || '',
        new Date(b.check_in).toLocaleDateString('en-GB'),
        new Date(b.check_out).toLocaleDateString('en-GB'),
        b.num_adults,
        b.num_children || 0,
        b.total_price,
        b.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    console.log('📥 Exported', filteredBookings.length, 'bookings to CSV');
}

// ============================================
// MODAL CONTROLS
// ============================================
function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
document.getElementById('bookingModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ============================================
// ERROR DISPLAY
// ============================================
function showError(message) {
    const tbody = document.querySelector('.bookings-table tbody');
    
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <div style="color: var(--danger-red);">
                        <p style="font-size: 18px; margin-bottom: 10px;">❌ Error Loading Bookings</p>
                        <p style="color: var(--text-light);">${message}</p>
                        <button onclick="loadBookings()" class="btn-primary" style="margin-top: 20px;">
                            🔄 Retry
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// ============================================
// LOGOUT
// ============================================
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        window.location.href = 'admin-login.html';
    }
});

console.log('✅ Reservations module loaded');