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

// Render the calendar
function renderCalendar() {
    console.log('🎨 Rendering calendar...');
    
    const calendarBody = document.getElementById('calendarBody');
    const monthYearDisplay = document.getElementById('monthYear');
    
    if (!calendarBody || !monthYearDisplay) {
        console.error('❌ Calendar elements not found');
        return;
    }
    
    // Update month/year display
    monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    }).toUpperCase();
    
    // Clear previous calendar
    calendarBody.innerHTML = '';
    
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
    
    // Render each room as a row
    allRooms.forEach(room => {
        const roomRow = document.createElement('div');
        roomRow.classList.add('calendar-room-row');
        roomRow.dataset.roomId = room.id;
        
        // Room number cell
        const roomNumberCell = document.createElement('div');
        roomNumberCell.classList.add('grid-cell', 'room-number-cell');
        roomNumberCell.textContent = room.room_number;
        roomRow.appendChild(roomNumberCell);
        
        // Previous month days (grayed out)
        for (let i = 0; i < firstDayIndex; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('grid-cell', 'date-cell', 'day-off-month');
            dayCell.innerHTML = `<span class="date-num">${prevMonthDays - firstDayIndex + i + 1}</span>`;
            roomRow.appendChild(dayCell);
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayCell = createDayCell(date, room);
            roomRow.appendChild(dayCell);
        }
        
        // Next month days (to fill the week)
        const totalCells = firstDayIndex + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 1; i <= remainingCells; i++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('grid-cell', 'date-cell', 'day-off-month');
                dayCell.innerHTML = `<span class="date-num">${i}</span>`;
                roomRow.appendChild(dayCell);
            }
        }
        
        calendarBody.appendChild(roomRow);
    });
    
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