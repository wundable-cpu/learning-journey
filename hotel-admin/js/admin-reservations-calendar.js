// Initialize Supabase with YOUR credentials
const SUPABASE_URL = 'https://yglehirjsxaxvrpfbvse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbGVoaXJqc3hheHZycGZidnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODA1NDAsImV4cCI6MjA3NzY1NjU0MH0.o631vL64ZMuQNDZQBs9Lx4ANILQgkq_5DrPhz36fpu8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Current date tracking
let currentDate = new Date();

// Room configuration (28 rooms across 4 floors)
const rooms = [
    // Ground Floor
    'G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07',
    // First Floor
    'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07',
    // Second Floor
    'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07',
    // Third Floor
    'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07'
];

// ✅ FIXED: Helper function to create local date from YYYY-MM-DD string
function createLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

// ✅ FIXED: Helper function to format date as YYYY-MM-DD
function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🗓️ Calendar page loaded');
    console.log('📅 Today is:', formatDateString(new Date()));
    loadCalendar();
    updateStats();
});

async function loadCalendar() {
    console.log('📅 Loading calendar for:', currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Build calendar grid
    await buildCalendarGrid(year, month, daysInMonth);
}

async function buildCalendarGrid(year, month, daysInMonth) {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    console.log('🏗️ Building calendar grid...');

    // Create header row
    const headerRoom = document.createElement('div');
    headerRoom.className = 'calendar-cell header-cell';
    headerRoom.textContent = 'ROOM';
    grid.appendChild(headerRoom);

    // ✅ FIXED: Get today's date properly
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    console.log('📅 Today:', formatDateString(today), '(', todayTime, ')');

    // Day headers
    for (let day = 1; day <= daysInMonth; day++) {
        const headerDay = document.createElement('div');
        headerDay.className = 'calendar-cell header-cell';
        const date = new Date(year, month, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        headerDay.innerHTML = `${day}<br><small style="font-size: 9px;">${dayName}</small>`;
        grid.appendChild(headerDay);
    }

    // Fetch bookings for the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = formatDateString(firstDay);
    const endDate = formatDateString(lastDay);

    console.log('📡 Fetching bookings from', startDate, 'to', endDate);

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`and(check_in.lte.${endDate},check_out.gte.${startDate})`)
        .in('status', ['confirmed', 'checked-in', 'pending']);

    if (error) {
        console.error('❌ Supabase error:', error);
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center;">
                <p style="color: var(--danger-red); font-size: 18px;">❌ Error Loading Calendar</p>
                <p style="color: var(--text-light); margin-top: 10px;">${error.message}</p>
                <button onclick="loadCalendar()" class="btn-primary" style="margin-top: 20px;">🔄 Retry</button>
            </div>
        `;
        return;
    }

    console.log(`✅ Loaded ${bookings ? bookings.length : 0} bookings`);

    if (bookings && bookings.length > 0) {
        console.log('📋 Sample booking:', bookings[0]);
        bookings.forEach(b => {
            console.log(`  - ${b.booking_reference}: ${b.check_in} to ${b.check_out} (Room ${b.room_number})`);
        });
    }

    // Create room rows
    for (const roomNumber of rooms) {
        // Room cell
        const roomCell = document.createElement('div');
        roomCell.className = 'calendar-cell room-cell';
        roomCell.textContent = roomNumber;
        grid.appendChild(roomCell);

        // Date cells
        for (let day = 1; day <= daysInMonth; day++) {
            // ✅ FIXED: Create date properly without timezone issues
            const cellDate = new Date(year, month, day);
            cellDate.setHours(0, 0, 0, 0);
            const cellTime = cellDate.getTime();
            const dateStr = formatDateString(cellDate);

            const dateCell = document.createElement('div');
            dateCell.className = 'calendar-cell date-cell';
            
            // ✅ FIXED: Use time comparison instead of date objects
            if (cellTime < todayTime) {
                dateCell.classList.add('past-date');
                dateCell.textContent = '—';
            } else {
                // Find booking for this room and date
                const booking = bookings ? bookings.find(b => {
                    // ✅ FIXED: Create dates from strings properly
                    const checkIn = createLocalDate(b.check_in);
                    const checkOut = createLocalDate(b.check_out);
                    const checkInTime = checkIn.getTime();
                    const checkOutTime = checkOut.getTime();
                    
                    return b.room_number === roomNumber && 
                           cellTime >= checkInTime && 
                           cellTime < checkOutTime;
                }) : null;

                if (booking) {
                    const checkIn = createLocalDate(booking.check_in);
                    const checkOut = createLocalDate(booking.check_out);
                    const checkInTime = checkIn.getTime();
                    const checkOutTime = checkOut.getTime();

                    console.log(`  📌 ${roomNumber} on ${dateStr}: Check-in=${formatDateString(checkIn)}, Check-out=${formatDateString(checkOut)}`);

                    // ✅ FIXED: Compare times properly
                    if (cellTime === checkInTime) {
                        dateCell.classList.add('checking-in');
                        dateCell.innerHTML = '<strong>IN</strong>';
                        console.log(`    ✓ This is check-in day`);
                    } else if (cellTime === checkOutTime - 86400000) {
                        dateCell.classList.add('checking-out');
                        dateCell.innerHTML = '<strong>OUT</strong>';
                        console.log(`    ✓ This is check-out day`);
                    } else {
                        dateCell.classList.add('booked');
                        dateCell.innerHTML = '●';
                        console.log(`    ✓ This is middle of stay`);
                    }

                    dateCell.onclick = () => showBookingDetails(booking);
                } else {
                    dateCell.classList.add('available');
                    dateCell.innerHTML = '○';
                    dateCell.onclick = () => createBooking(roomNumber, dateStr);
                }

                // ✅ FIXED: Mark today correctly
                if (cellTime === todayTime) {
                    dateCell.classList.add('today-marker');
                    console.log(`🎯 TODAY MARKER on ${dateStr}`);
                }
            }

            grid.appendChild(dateCell);
        }
    }

    console.log('✅ Calendar grid built successfully');
}

async function updateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateString(today);

    console.log('📊 Updating stats for:', todayStr);

    const { data: todayBookings, error } = await supabase
        .from('bookings')
        .select('*')
        .lte('check_in', todayStr)
        .gt('check_out', todayStr)
        .in('status', ['confirmed', 'checked-in', 'pending']);

    if (error) {
        console.error('❌ Error fetching stats:', error);
        return;
    }

    console.log('📈 Today\'s bookings:', todayBookings ? todayBookings.length : 0);
    if (todayBookings && todayBookings.length > 0) {
        todayBookings.forEach(b => {
            console.log(`  - ${b.guest_name} in room ${b.room_number}`);
        });
    }

    const occupiedRooms = todayBookings ? new Set(todayBookings.map(b => b.room_number)).size : 0;
    const availableRooms = 28 - occupiedRooms;
    const occupancyRate = Math.round((occupiedRooms / 28) * 100);

    document.getElementById('availableToday').textContent = availableRooms;
    document.getElementById('occupiedToday').textContent = occupiedRooms;
    document.getElementById('occupancyRate').textContent = `${occupancyRate}%`;

    console.log('✅ Stats updated:', { availableRooms, occupiedRooms, occupancyRate });
}

function showBookingDetails(booking) {
    const modal = document.getElementById('bookingModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    // Calculate nights
    const checkIn = createLocalDate(booking.check_in);
    const checkOut = createLocalDate(booking.check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const totalGuests = booking.num_adults + booking.num_children;

    modalTitle.textContent = `Room ${booking.room_number || booking.room_type} - ${booking.guest_name}`;
    
    modalBody.innerHTML = `
        <div class="booking-detail-grid">
            <div class="detail-group">
                <h3>Reference</h3>
                <p>${booking.booking_reference}</p>
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
                <h3>Guests</h3>
                <p>${totalGuests} (${booking.num_adults} adults, ${booking.num_children} children)</p>
            </div>
            <div class="detail-group">
                <h3>Room Type</h3>
                <p>${booking.room_type}</p>
            </div>
            <div class="detail-group">
                <h3>Total Amount</h3>
                <p style="color: var(--accent-gold); font-weight: 700;">GH₵ ${parseFloat(booking.total_price).toLocaleString()}</p>
            </div>
            <div class="detail-group">
                <h3>Status</h3>
                <p style="text-transform: capitalize; font-weight: 600;">${booking.status}</p>
            </div>
        </div>
        ${booking.special_requests ? `
        <div class="detail-group" style="margin-top: 20px;">
            <h3>Special Requests</h3>
            <p>${booking.special_requests}</p>
        </div>
        ` : ''}
    `;

    modal.style.display = 'flex';
}

function createBooking(roomNumber, date) {
    window.location.href = `admin-reservations.html?room=${roomNumber}&date=${date}`;
}

function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    loadCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    loadCalendar();
}

function today() {
    currentDate = new Date();
    loadCalendar();
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        window.location.href = 'admin-login.html';
    }
});

// Close modal when clicking outside
document.getElementById('bookingModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

console.log('✅ Calendar module loaded');