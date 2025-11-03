// admin.js - Admin Dashboard Functionality

let allBookings = [];

// Load all bookings from Supabase
async function loadBookings() {
    console.log('📥 Loading bookings from Supabase...');
    
    const loadingMessage = document.getElementById('loadingMessage');
    const noBookingsMessage = document.getElementById('noBookingsMessage');
    const bookingsTable = document.getElementById('bookingsTable');
    
    // Show loading
    loadingMessage.style.display = 'block';
    noBookingsMessage.style.display = 'none';
    bookingsTable.style.display = 'none';
    
    try {
        // Fetch all bookings, ordered by creation date (newest first)
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error loading bookings:', error);
            alert('Error loading bookings: ' + error.message);
            loadingMessage.style.display = 'none';
            return;
        }
        
        console.log('✅ Loaded bookings:', data);
        allBookings = data || [];
        
        // Hide loading
        loadingMessage.style.display = 'none';
        
        if (allBookings.length === 0) {
            noBookingsMessage.style.display = 'block';
        } else {
            bookingsTable.style.display = 'table';
            displayBookings(allBookings);
        }
        
        updateStatistics(allBookings);
        
    } catch (err) {
        console.error('Error:', err);
        loadingMessage.style.display = 'none';
        alert('Error loading bookings. Please refresh the page.');
    }
}

// Display bookings in table
function displayBookings(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';
    
    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Format dates
        const checkIn = new Date(booking.check_in).toLocaleDateString();
        const checkOut = new Date(booking.check_out).toLocaleDateString();
        const createdAt = new Date(booking.created_at).toLocaleDateString();
        
        // Status badge
        const statusClass = 'status-' + booking.status;
        
        row.innerHTML = `
            <td><strong>${booking.booking_reference}</strong></td>
            <td>${booking.guest_name}</td>
            <td>${booking.guest_email}</td>
            <td>${booking.guest_phone || 'N/A'}</td>
            <td>${checkIn}</td>
            <td>${checkOut}</td>
            <td>${booking.room_type.toUpperCase()}</td>
            <td>${booking.num_adults} adults, ${booking.num_children} children</td>
            <td><strong>₵${booking.total_price}</strong></td>
            <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
            <td>${createdAt}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Update statistics
function updateStatistics(bookings) {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    
    // Today's bookings
    const today = new Date().toDateString();
    const todayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at).toDateString();
        return bookingDate === today;
    }).length;
    
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('pendingBookings').textContent = pendingBookings;
    document.getElementById('totalRevenue').textContent = '₵' + totalRevenue.toFixed(2);
    document.getElementById('todayBookings').textContent = todayBookings;
}

// Filter bookings based on search
function filterBookings() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredBookings = allBookings.filter(booking => {
        return booking.guest_name.toLowerCase().includes(searchTerm) ||
               booking.guest_email.toLowerCase().includes(searchTerm) ||
               booking.booking_reference.toLowerCase().includes(searchTerm);
    });
    
    displayBookings(filteredBookings);
}

// Load bookings when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin dashboard loaded');
    loadBookings();
    
    // Auto-refresh every 30 seconds
    setInterval(loadBookings, 30000);
});

console.log('✅ Admin script loaded!');