document.addEventListener('DOMContentLoaded', () => {
    const calendarBody = document.getElementById('calendarBody');
    const monthYearDisplay = document.querySelector('.month-year');
    const rooms = [
        { id: '101', number: '101' },
        { id: '102', number: '102' },
        { id: '103', number: '103' },
        { id: '104', number: '104' },
        { id: '105', number: '105' },
        { id: '106', number: '106' },
        { id: '107', number: '107' },
        { id: '108', number: '108' },
        { id: '109', number: '109' },
        { id: '110', number: '110' },
        { id: '111', number: '111' },
        { id: '112', number: '112' },
        { id: '113', number: '113' },
        { id: '114', number: '114' },
        { id: '115', number: '115' },
        { id: '116', number: '116' },
        { id: '117', number: '117' },
        { id: '118', number: '118' },
        { id: '119', number: '119' },
        { id: '120', number: '120' },
        { id: '121', number: '121' },
        { id: '122', number: '122' },
        { id: '123', number: '123' },
        { id: '124', number: '124' },
        { id: '125', number: '125' },
        { id: '126', number: '126' },
        { id: '127', number: '127' },
        { id: '128', number: '128' }
    ]; // Assuming 28 rooms

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // Dummy booking data (in a real app, this comes from your backend)
    const bookings = [
        { id: 'b001', roomId: '101', guest: 'John Doe', checkIn: new Date(2024, 9, 6), checkOut: new Date(2024, 9, 10), status: 'confirmed' },
        { id: 'b002', roomId: '101', guest: 'Aisha Rahman', checkIn: new Date(2024, 9, 12), checkOut: new Date(2024, 9, 15), status: 'confirmed' },
        { id: 'b003', roomId: '107', guest: 'Jane Smith', checkIn: new Date(2024, 9, 14), checkOut: new Date(2024, 9, 19), status: 'confirmed' },
        { id: 'b004', roomId: '122', guest: 'Kwame Adjei', checkIn: new Date(2024, 9, 21), checkOut: new Date(2024, 9, 23), status: 'pending' },
        { id: 'b005', roomId: '102', guest: 'Adwoa Mensah', checkIn: new Date(2024, 9, 1), checkOut: new Date(2024, 9, 3), status: 'checked-out' },
        { id: 'b006', roomId: '103', guest: 'David Lee', checkIn: new Date(2024, 9, 25), checkOut: new Date(2024, 9, 27), status: 'confirmed' },
        { id: 'b007', roomId: '104', guest: 'Sarah Green', checkIn: new Date(2024, 9, 8), checkOut: new Date(2024, 9, 11), status: 'pending' },
        { id: 'b008', roomId: '105', guest: 'Emmanuel Obi', checkIn: new Date(2024, 9, 17), checkOut: new Date(2024, 9, 19), status: 'confirmed' },
        { id: 'b009', roomId: '106', guest: 'Grace Kwakye', checkIn: new Date(2024, 9, 2), checkOut: new Date(2024, 9, 5), status: 'confirmed' },
        { id: 'b010', roomId: '109', guest: 'Fatima Conteh', checkIn: new Date(2024, 9, 20), checkOut: new Date(2024, 9, 22), status: 'pending' }
    ];

    function getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(month, year) {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6 for Monday-start week
    }

    function renderCalendar() {
        calendarBody.innerHTML = ''; // Clear previous calendar
        monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear); // 0-6, Mon-Sun

        const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);

        rooms.forEach(room => {
            const roomRow = document.createElement('div');
            roomRow.classList.add('calendar-room-row');
            roomRow.dataset.roomId = room.id;

            const roomNumberCell = document.createElement('div');
            roomNumberCell.classList.add('grid-cell', 'room-number-cell');
            roomNumberCell.textContent = `ROOM ${room.number}`;
            roomRow.appendChild(roomNumberCell);

            // Add placeholder cells for days before the 1st of the month
            for (let i = 0; i < firstDayIndex; i++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('grid-cell', 'date-cell', 'day-off-month');
                dayCell.innerHTML = `<span class="date-num">${prevMonthDays - firstDayIndex + i + 1}</span>`;
                roomRow.appendChild(dayCell);
            }

            // Add cells for days of the current month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dayCell = document.createElement('div');
                dayCell.classList.add('grid-cell', 'date-cell');
                dayCell.innerHTML = `<span class="date-num">${day}</span>`;
                dayCell.dataset.date = date.toISOString().split('T')[0]; // YYYY-MM-DD

                // Check for bookings for this room on this date
                const roomBookings = bookings.filter(booking => booking.roomId === room.id);

                roomBookings.forEach(booking => {
                    const checkInDate = new Date(booking.checkIn);
                    const checkOutDate = new Date(booking.checkOut);

                    // Normalize dates to start of day for comparison
                    const dateStartOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    const checkInStartOfDay = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
                    const checkOutStartOfDay = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate());


                    if (dateStartOfDay >= checkInStartOfDay && dateStartOfDay < checkOutStartOfDay) {
                        // This day is part of the booking
                        const bookingSegment = document.createElement('div');
                        bookingSegment.classList.add('booking-strip', booking.status);

                        // Only show guest name on the first day of the booking
                        if (dateStartOfDay.getTime() === checkInStartOfDay.getTime()) {
                            bookingSegment.classList.add('start-booking');
                            bookingSegment.textContent = `${booking.guest} / ${room.number}`;
                        } else {
                            // For multi-day bookings spanning over, apply a consistent background
                            // and ensure it fills the cell without text
                            bookingSegment.style.width = 'calc(100% - 10px)'; // Adjusted for padding
                            bookingSegment.style.left = '5px';
                            bookingSegment.style.right = '5px';
                        }

                        // Add end-booking class if it's the last day
                        if (dateStartOfDay.getTime() === new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate() - 1).getTime()) {
                             bookingSegment.classList.add('end-booking');
                        }

                        dayCell.appendChild(bookingSegment);
                    }
                });

                roomRow.appendChild(dayCell);
            }

            // Add placeholder cells for days after the month ends
            const totalCells = firstDayIndex + daysInMonth;
            const remainingCells = 7 - (totalCells % 7);
            if (remainingCells < 7) { // Only if not a full last week
                for (let i = 1; i <= remainingCells; i++) {
                    const dayCell = document.createElement('div');
                    dayCell.classList.add('grid-cell', 'date-cell', 'day-off-month');
                    dayCell.innerHTML = `<span class="date-num">${i}</span>`;
                    roomRow.appendChild(dayCell);
                }
            }


            calendarBody.appendChild(roomRow);
        });
    }

    // Navigation for calendar
    document.querySelector('.calendar-nav .nav-arrow:first-child').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.querySelector('.calendar-nav .nav-arrow:last-child').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    renderCalendar(); // Initial render
});