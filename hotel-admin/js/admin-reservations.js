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
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <div style="color: var(--text-light);">
                        <p style="font-size: 18px; margin-bottom: 10px;">📭 No bookings found</p>
                        <p>Try adjusting your search or filters.</p>
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
            <tr onclick="viewBooking('${booking.id}')" style="cursor: pointer;">
                <td><strong>${booking.booking_reference}</strong></td>
                <td>${booking.guest_name}</td>
                <td>${checkIn.toLocaleDateString('en-GB')}</td>
                <td>${checkOut.toLocaleDateString('en-GB')}</td>
                <td>${booking.room_type}</td>
                <td>${booking.room_number || '—'}</td>
                <td>${totalGuests}</td>
                <td>₵${parseFloat(booking.total_price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</td>
                <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            </tr>
        `;
    }).join('');
    
    updatePagination();
}

// ============================================
// SEARCH AND FILTER FUNCTIONALITY
// ============================================
function setupEventListeners() {
    // Search input - real-time search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    // Export button
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    console.log('✅ Event listeners setup complete');
}

// Apply all filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('dateFilter')?.value || 'all';
    
    console.log('🔍 Applying filters:', { searchTerm, statusFilter, dateFilter });
    
    filteredBookings = allBookings.filter(booking => {
        // Search filter
        const matchesSearch = !searchTerm || 
            booking.guest_name.toLowerCase().includes(searchTerm) ||
            booking.guest_email.toLowerCase().includes(searchTerm) ||
            booking.guest_phone.toLowerCase().includes(searchTerm) ||
            booking.booking_reference.toLowerCase().includes(searchTerm) ||
            (booking.room_number && booking.room_number.toString().toLowerCase().includes(searchTerm));
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        
        // Date filter
        const matchesDate = filterByDate(booking, dateFilter);
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    currentPage = 1;
    displayBookings();
    
    console.log(`✅ Filtered: ${filteredBookings.length} of ${allBookings.length} bookings`);
}

// Filter bookings by date
function filterByDate(booking, filter) {
    if (filter === 'all') return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    const monthFromNow = new Date(today);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
    
    const checkIn = new Date(booking.check_in);
    checkIn.setHours(0, 0, 0, 0);
    
    switch(filter) {
        case 'today':
            return checkIn.getTime() === today.getTime();
        
        case 'tomorrow':
            return checkIn.getTime() === tomorrow.getTime();
        
        case 'week':
            return checkIn >= today && checkIn <= weekFromNow;
        
        case 'month':
            return checkIn >= today && checkIn <= monthFromNow;
        
        default:
            return true;
    }
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
    const modalBody = document.getElementById('modalBody');
    
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalGuests = booking.num_adults + (booking.num_children || 0);
    
    modalBody.innerHTML = `
        <div class="booking-detail-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">REFERENCE</h3>
                <p style="font-weight: 600;">${booking.booking_reference}</p>
            </div>
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">STATUS</h3>
                <p><span class="status-badge status-${booking.status}">${booking.status}</span></p>
            </div>
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">BOOKED ON</h3>
                <p>${new Date(booking.created_at).toLocaleString('en-GB')}</p>
            </div>
            
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">GUEST NAME</h3>
                <p style="font-weight: 600;">${booking.guest_name}</p>
            </div>
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">EMAIL</h3>
                <p>${booking.guest_email}</p>
            </div>
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">PHONE</h3>
                <p>${booking.guest_phone}</p>
            </div>
            
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">CHECK-IN</h3>
                <p style="font-weight: 600;">${checkIn.toLocaleDateString('en-GB')}</p>
            </div>
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">CHECK-OUT</h3>
                <p style="font-weight: 600;">${checkOut.toLocaleDateString('en-GB')}</p>
            </div>
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">NIGHTS</h3>
                <p>${nights}</p>
            </div>
            
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">ROOM TYPE</h3>
                <p>${booking.room_type}</p>
            </div>
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">ROOM NUMBER</h3>
                <p style="font-weight: 600; color: var(--primary-blue);">${booking.room_number || 'Not assigned'}</p>
            </div>
            <div class="detail-group">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">GUESTS</h3>
                <p>${booking.num_adults} Adults${booking.num_children ? ', ' + booking.num_children + ' Children' : ''}</p>
            </div>
            
            <div class="detail-group" style="grid-column: span 3;">
                <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 5px;">TOTAL PRICE</h3>
                <p style="color: var(--accent-gold); font-weight: 700; font-size: 24px;">₵${parseFloat(booking.total_price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
            </div>
        </div>
        
        ${booking.special_requests ? `
        <div style="margin-top: 20px; padding: 15px; background: var(--bg-light); border-radius: 8px;">
            <h3 style="color: var(--text-light); font-size: 12px; margin-bottom: 10px;">SPECIAL REQUESTS</h3>
            <p>${booking.special_requests}</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="assignRoom('${booking.id}')" class="btn-primary" style="padding: 10px 20px;">
                🏠 Assign Room
            </button>
            <button onclick="updateStatus('${booking.id}')" class="btn-secondary" style="padding: 10px 20px;">
                ✏️ Update Status
            </button>
            <button onclick="closeModal()" class="btn-secondary" style="padding: 10px 20px;">
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
// PAGINATION
// ============================================
function updatePagination() {
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1} (${filteredBookings.length} bookings)`;
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
    console.log('📥 Exporting bookings to CSV...');
    
    if (filteredBookings.length === 0) {
        alert('❌ No bookings to export');
        return;
    }
    
    // CSV headers
    const headers = ['Reference', 'Guest Name', 'Email', 'Phone', 'Check-in', 'Check-out', 'Room Type', 'Room Number', 'Adults', 'Children', 'Total Price', 'Status'];
    
    // CSV rows
    const rows = filteredBookings.map(booking => [
        booking.booking_reference,
        booking.guest_name,
        booking.guest_email,
        booking.guest_phone,
        booking.check_in,
        booking.check_out,
        booking.room_type,
        booking.room_number || '',
        booking.num_adults,
        booking.num_children || 0,
        booking.total_price,
        booking.status
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Exported ${filteredBookings.length} bookings to CSV`);
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
                <td colspan="9" style="text-align: center; padding: 40px;">
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