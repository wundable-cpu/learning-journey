// admin-reservations.js - Booking Management

let allBookings = [];
let filteredBookings = [];
let currentPage = 1;
const itemsPerPage = 10;

// Load all bookings
async function loadBookings() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allBookings = data;
        filteredBookings = data;
        
        console.log('📅 Loaded bookings:', data.length);
        
        displayBookings();
        updatePagination();
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('Failed to load bookings');
    }
}

// Display bookings in table
function displayBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageBookings = filteredBookings.slice(start, end);
    
    if (pageBookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="loading-row">No bookings found</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageBookings.map(booking => `
        <tr onclick="viewBookingDetails('${booking.id}')">
            <td><strong>${booking.booking_reference || 'N/A'}</strong></td>
            <td>${booking.full_name}</td>
            <td>${formatDate(booking.check_in)}</td>
            <td>${formatDate(booking.check_out)}</td>
            <td>${booking.room_type}</td>
            <td>${booking.adults + booking.children}</td>
            <td>₵${booking.total_price?.toLocaleString() || '0'}</td>
            <td><span class="status-badge status-${getStatus(booking)}">${getStatus(booking)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn btn-view" onclick="event.stopPropagation(); viewBookingDetails('${booking.id}')">View</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get booking status
function getStatus(booking) {
    const today = new Date();
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    
    if (booking.status === 'cancelled') return 'cancelled';
    if (today < checkIn) return 'confirmed';
    if (today >= checkIn && today <= checkOut) return 'checked-in';
    if (today > checkOut) return 'checked-out';
    return 'pending';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// View booking details
function viewBookingDetails(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const modal = document.getElementById('bookingModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="booking-detail-grid">
            <div class="detail-group">
                <h3>Booking Reference</h3>
                <p>${booking.booking_reference || 'N/A'}</p>
            </div>
            <div class="detail-group">
                <h3>Status</h3>
                <p><span class="status-badge status-${getStatus(booking)}">${getStatus(booking)}</span></p>
            </div>
            <div class="detail-group">
                <h3>Guest Name</h3>
                <p>${booking.full_name}</p>
            </div>
            <div class="detail-group">
                <h3>Email</h3>
                <p>${booking.email}</p>
            </div>
            <div class="detail-group">
                <h3>Phone</h3>
                <p>${booking.phone}</p>
            </div>
            <div class="detail-group">
                <h3>Room Type</h3>
                <p>${booking.room_type}</p>
            </div>
            <div class="detail-group">
                <h3>Check-In</h3>
                <p>${formatDate(booking.check_in)}</p>
            </div>
            <div class="detail-group">
                <h3>Check-Out</h3>
                <p>${formatDate(booking.check_out)}</p>
            </div>
            <div class="detail-group">
                <h3>Adults</h3>
                <p>${booking.adults}</p>
            </div>
            <div class="detail-group">
                <h3>Children</h3>
                <p>${booking.children}</p>
            </div>
            <div class="detail-group">
                <h3>Total Price</h3>
                <p>₵${booking.total_price?.toLocaleString() || '0'}</p>
            </div>
            <div class="detail-group">
                <h3>Booked On</h3>
                <p>${formatDate(booking.created_at)}</p>
            </div>
        </div>
        ${booking.special_requests ? `
            <div class="detail-group" style="grid-column: 1 / -1;">
                <h3>Special Requests</h3>
                <p>${booking.special_requests}</p>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'flex';
}

// Search bookings
document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const search = e.target.value.toLowerCase();
    
    filteredBookings = allBookings.filter(booking => {
        return booking.full_name?.toLowerCase().includes(search) ||
               booking.email?.toLowerCase().includes(search) ||
               booking.booking_reference?.toLowerCase().includes(search);
    });
    
    currentPage = 1;
    displayBookings();
    updatePagination();
});

// Filter by status
document.getElementById('statusFilter')?.addEventListener('change', function(e) {
    const status = e.target.value;
    
    if (status === 'all') {
        filteredBookings = allBookings;
    } else {
        filteredBookings = allBookings.filter(b => getStatus(b) === status);
    }
    
    currentPage = 1;
    displayBookings();
    updatePagination();
});

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    document.getElementById('paginationInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Pagination controls
document.getElementById('prevPage')?.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayBookings();
        updatePagination();
    }
});

document.getElementById('nextPage')?.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayBookings();
        updatePagination();
    }
});

// Close modal
document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('bookingModal').style.display = 'none';
});

document.getElementById('closeModalBtn')?.addEventListener('click', () => {
    document.getElementById('bookingModal').style.display = 'none';
});

// Export bookings
document.querySelector('.export-btn')?.addEventListener('click', () => {
    // Simple CSV export
    const csv = [
        ['Reference', 'Name', 'Email', 'Phone', 'Room', 'Check-In', 'Check-Out', 'Guests', 'Total', 'Status'],
        ...filteredBookings.map(b => [
            b.booking_reference,
            b.full_name,
            b.email,
            b.phone,
            b.room_type,
            b.check_in,
            b.check_out,
            b.adults + b.children,
            b.total_price,
            getStatus(b)
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('reservations')) {
        loadBookings();
    }
});

console.log('📅 Reservations module loaded');