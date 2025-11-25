console.log('📅 Calendar module loading...');

const supabase = window.supabase_client;

// Calendar state
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let allRooms = [];
let allBookings = [];

// Initialize calendar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Calendar page loaded');
    
    if (!supabase) {
        alert('Database connection failed. Please refresh.');
        return;
    }
    
    await loadRoomsAndBookings();
    renderCalendar();
    setupNavigation();
});

// Load rooms and bookings from Supabase
async function loadRoomsAndBookings() {
    console.log('📡 Loading rooms and bookings...');
    
    try {
        // Load all bookings first
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('room_number');
        
        if (error) throw error;
        
        allBookings = bookings || [];
        console.log(`✅ Loaded ${allBookings.length} bookings`);
        
        // Extract unique room numbers from bookings
        const roomNumbers = [...new Set(allBookings.map(b => b.room_number))].filter(r => r);
        
        // Create room objects
        allRooms = roomNumbers.sort().map(roomNum => ({
            id: roomNum,
            room_number: roomNum
        }));
        
        // If no rooms found in bookings, create default room list
        if (allRooms.length === 0) {
            allRooms = [
                { id: 'G01', room_number: 'G01' },
                { id: 'F03', room_number: 'F03' },
                { id: 'S05', room_number: 'S05' },
                { id: 'T02', room_number: 'T02' },
                { id: 'E01', room_number: 'E01' },
                { id: 'D01', room_number: 'D01' },
                { id: 'R01', room_number: 'R01' }
            ];
        }
        
        console.log(`✅ Found ${allRooms.length} unique rooms`);
        
        // Load bookings for current month
        await loadBookingsForMonth();
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Failed to load calendar data: ' + error.message);
    }
}

// Load bookings for the current displayed month
async function loadBookingsForMonth() {
    try {
        // Get first and last day of current month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Extend range to catch overlapping bookings
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - 7);
        
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + 7);
        
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .or(`check_in.lte.${endStr},check_out.gte.${startStr}`);
        
        if (error) throw error;
        
        allBookings = bookings || [];
        console.log(`✅ Loaded ${allBookings.length} bookings for ${firstDay.toLocaleDateString()}`);
        
    } catch (error) {
        console.error('❌ Error loading bookings:', error);
    }
}

// In admin-reservations-calendar.js, fix the generateCalendar function:

function generateCalendar() {
    const table = document.getElementById('calendarTable');
    const monthYear = document.getElementById('currentMonthYear');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Update month display
    monthYear.textContent = currentDate.toLocaleDateString('en-GB', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Generate header with dates
    let headerHTML = '<thead><tr><th class="room-cell" style="position: sticky; left: 0; z-index: 25;">Room</th>';
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        headerHTML += `
            <th class="date-cell ${isWeekend ? 'weekend' : ''}" style="position: sticky; top: 0; z-index: 15;">
                <div style="font-size: 14px; font-weight: 700;">${day}</div>
                <div style="font-size: 11px; opacity: 0.9;">${dayName}</div>
            </th>
        `;
    }
    headerHTML += '</tr></thead>';
    
    // Generate room rows
    let bodyHTML = '<tbody>';
    
    allRooms.forEach(room => {
        bodyHTML += `<tr><td class="room-cell">${room}</td>`;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const booking = bookingsByDate[`${room}_${dateStr}`];
            
            bodyHTML += `<td class="calendar-day ${booking ? 'booked' : ''}" data-date="${dateStr}" data-room="${room}">`;
            
            if (booking) {
                bodyHTML += `
                    <div class="booking-strip" style="background: ${getBookingColor(booking.status)};" 
                         title="${booking.guest_name} - ${booking.booking_reference}">
                        ${booking.guest_name.split(' ')[0]}
                    </div>
                `;
            }
            
            bodyHTML += '</td>';
        }
        
        bodyHTML += '</tr>';
    });
    
    bodyHTML += '</tbody>';
    
    table.innerHTML = headerHTML + bodyHTML;

    console.log('✅ Calendar rendered');
}

// Create a day cell with booking information
function createDayCell(date, room) {
    const dayCell = document.createElement('div');
    dayCell.classList.add('grid-cell', 'date-cell');
    dayCell.innerHTML = `<span class="date-num">${date.getDate()}</span>`;
    dayCell.dataset.date = date.toISOString().split('T')[0];
    dayCell.dataset.roomId = room.id;
    
    // Find bookings for this room
    const roomBookings = allBookings.filter(booking => 
        booking.room_number === room.room_number
    );
    
    // Check each booking
    roomBookings.forEach(booking => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        
        // Normalize to start of day
        const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const checkInDay = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
        const checkOutDay = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
        
        // Check if this date falls within the booking
        if (dateDay >= checkInDay && dateDay < checkOutDay) {
            const bookingStrip = document.createElement('div');
            bookingStrip.classList.add('booking-strip', booking.status);
            bookingStrip.title = `${booking.guest_name} - ${booking.booking_reference}`;
            
            // Show guest name only on first day
            if (dateDay.getTime() === checkInDay.getTime()) {
                bookingStrip.textContent = booking.guest_name;
            }
            
            // Click handler
            bookingStrip.addEventListener('click', (e) => {
                e.stopPropagation();
                showBookingDetails(booking);
            });
            
            dayCell.appendChild(bookingStrip);
        }
    });
    
    return dayCell;
}

// Show booking details
function showBookingDetails(booking) {
    const checkIn = new Date(booking.check_in).toLocaleDateString('en-GB');
    const checkOut = new Date(booking.check_out).toLocaleDateString('en-GB');
    
    alert(`
📋 Booking Details

Guest: ${booking.guest_name}
Reference: ${booking.booking_reference}
Room: ${booking.room_number} (${booking.room_type})
Check-in: ${checkIn}
Check-out: ${checkOut}
Status: ${booking.status.toUpperCase()}
Total: ₵${parseFloat(booking.total_price).toFixed(2)}
    `);
}

// Helper functions
function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0, Sunday = 6
}

// Setup navigation
function setupNavigation() {
    document.getElementById('prevMonth').addEventListener('click', async () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        await loadBookingsForMonth();
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', async () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        await loadBookingsForMonth();
        renderCalendar();
    });
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        window.location.href = 'admin-login.html';
    }
});

console.log('✅ Calendar module loaded');