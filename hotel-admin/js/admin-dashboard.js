console.log('📊 Dashboard module loading...');

const supabase = window.supabase_client;

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Dashboard page loaded');
    
    if (!supabase) {
        alert('Database connection failed. Please refresh.');
        return;
    }
    
    await loadDashboardData();
});

// Load all dashboard data
async function loadDashboardData() {
    console.log('📡 Loading dashboard data...');
    
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get all bookings
        const { data: allBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('*');
        
        if (bookingsError) throw bookingsError;
        
        // Get room status
        const { data: roomStatus, error: roomError } = await supabase
            .from('room_status')
            .select('*');
        
        if (roomError) throw roomError;
        
        // Calculate room status counts
        const statusCounts = {
            clean: 0,
            occupied: 0,
            dirty: 0,
            maintenance: 0,
            reserved: 0
        };
        
        roomStatus.forEach(room => {
            if (statusCounts.hasOwnProperty(room.status)) {
                statusCounts[room.status]++;
            }
        });
        
        // Update room status display
        document.getElementById('availableRooms').textContent = statusCounts.clean;
        document.getElementById('occupiedRooms').textContent = statusCounts.occupied;
        document.getElementById('cleaningRooms').textContent = statusCounts.dirty;
        document.getElementById('maintenanceRooms').textContent = statusCounts.maintenance;
        document.getElementById('reservedRooms').textContent = statusCounts.reserved;
        
        // Calculate occupancy
        const currentlyOccupied = allBookings.filter(b => 
            b.check_in <= today && b.check_out >= today && 
            (b.status === 'confirmed' || b.status === 'checked-in')
        ).length;
        
        const occupancyRate = (currentlyOccupied / 28 * 100).toFixed(0);
        
        // Update circular occupancy display
        document.getElementById('occupiedCount').textContent = currentlyOccupied;
        document.getElementById('totalRooms').textContent = '28';
        document.getElementById('occupancyPercent').textContent = occupancyRate + '%';
        document.getElementById('roomsOccupiedStat').textContent = currentlyOccupied;
        
        // Animate circle
        const circumference = 2 * Math.PI * 50; // 314
        const offset = circumference - (occupancyRate / 100 * circumference);
        document.getElementById('occupancyCircle').style.strokeDashoffset = offset;
        
        // Check-outs today
        const checkoutsToday = allBookings.filter(b => b.check_out === today).length;
        document.getElementById('checkoutsToday').textContent = checkoutsToday;
        
        console.log('✅ Dashboard stats updated');
        
        // Load upcoming arrivals
        await loadUpcomingArrivals(allBookings, today);
        
        // Load departures today
        await loadDeparturesToday(allBookings, today);
        
        // Load weekly occupancy chart
        await loadWeeklyOccupancyChart(allBookings);
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        alert('Error loading dashboard: ' + error.message);
    }
}

// Load upcoming arrivals (today and tomorrow)
async function loadUpcomingArrivals(allBookings, today) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const arrivals = allBookings
        .filter(b => (b.check_in === today || b.check_in === tomorrowStr) && b.status !== 'cancelled')
        .sort((a, b) => new Date(a.check_in) - new Date(b.check_in))
        .slice(0, 2);
    
    const container = document.getElementById('upcomingArrivals');
    
    if (arrivals.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 15px; color: var(--text-light); font-size: 13px;">No upcoming arrivals</div>';
        return;
    }
    
    container.innerHTML = arrivals.map(booking => `
        <div class="guest-card">
            <div class="guest-info">
                <div class="guest-name">Guest: ${booking.guest_name.split(' ')[0]} ${booking.guest_name.split(' ')[1] || ''}</div>
                <div class="guest-room">Room: ${booking.room_number}</div>
            </div>
            <div class="guest-time">${booking.check_in === today ? '2:00 PM' : 'Tomorrow'}</div>
        </div>
    `).join('');
}

// Load departures today
async function loadDeparturesToday(allBookings, today) {
    const departures = allBookings
        .filter(b => b.check_out === today && b.status !== 'cancelled')
        .slice(0, 2);
    
    const container = document.getElementById('departuresToday');
    
    if (departures.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 15px; color: var(--text-light); font-size: 13px;">No departures today</div>';
        return;
    }
    
    container.innerHTML = departures.map(booking => `
        <div class="guest-card">
            <div class="guest-info">
                <div class="guest-name">Guest: ${booking.guest_name.split(' ')[0]} ${booking.guest_name.split(' ')[1] || ''}</div>
                <div class="guest-room">Room: ${booking.room_number}</div>
            </div>
            <div class="guest-time">12:00 PM</div>
        </div>
    `).join('');
}

// Load weekly occupancy chart
async function loadWeeklyOccupancyChart(allBookings) {
    console.log('📊 Loading weekly occupancy chart...');
    
    const weeks = [];
    const occupancyData = [];
    
    // Get last 4 weeks
    for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        weeks.push(`Week ${4-i}`);
        
        // Calculate average occupancy for the week
        let totalOccupancy = 0;
        let days = 0;
        
        for (let d = 0; d < 7; d++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + d);
            const dateStr = date.toISOString().split('T')[0];
            
            const occupied = allBookings.filter(b => 
                b.check_in <= dateStr && b.check_out >= dateStr && 
                (b.status === 'confirmed' || b.status === 'checked-in')
            ).length;
            
            totalOccupancy += (occupied / 28 * 100);
            days++;
        }
        
        occupancyData.push((totalOccupancy / days).toFixed(1));
    }
    
    // Calculate this week and month averages
    document.getElementById('weekAvgOccupancy').textContent = occupancyData[3] + '%';
    
    const monthAvg = (occupancyData.reduce((sum, val) => sum + parseFloat(val), 0) / occupancyData.length).toFixed(1);
    document.getElementById('monthAvgOccupancy').textContent = monthAvg + '%';
    
    // Create chart
    const ctx = document.getElementById('weeklyOccupancyChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [{
                label: 'Occupancy %',
                data: occupancyData,
                backgroundColor: [
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(156, 39, 176, 0.8)'
                ],
                borderRadius: 6,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%',
                        font: { size: 10 }
                    }
                },
                x: {
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
    
    console.log('✅ Weekly occupancy chart created');
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        window.location.href = 'admin-login.html';
    }
});

console.log('✅ Dashboard module loaded');