// Use global Supabase client
const supabase = window.supabase_client || (() => {
    console.error('❌ Supabase not initialized!');
    return null;
})();

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard loading...');
    
    if (!supabase) {
        alert('Database connection failed. Please refresh.');
        return;
    }
    
    loadDashboardData();
});

async function loadDashboardData() {
    console.log('📡 Loading dashboard data...');
    
    try {
        // Load room stats
        await loadRoomStats();
        
        // Load monthly occupancy trend
        await loadMonthlyOccupancyTrend();
        
        console.log('✅ Dashboard data loaded');
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
    }
}

// Load room statistics
async function loadRoomStats() {
    console.log('📊 Loading room stats...');
    
    try {
        // Get all bookings
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*');
        
        if (error) throw error;
        
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate stats
        const occupiedRooms = bookings.filter(b => 
            b.check_in <= today && b.check_out >= today && 
            (b.status === 'confirmed' || b.status === 'checked-in')
        ).length;
        
        const totalRooms = 28;
        const availableRooms = totalRooms - occupiedRooms;
        const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(0);
        
        // Update UI
        document.getElementById('availableRooms').textContent = availableRooms;
        document.getElementById('occupiedRooms').textContent = occupiedRooms;
        document.getElementById('occupiedCount').textContent = occupiedRooms;
        document.getElementById('progressText').textContent = occupancyRate + '%';
        
        // Update circular progress
        const circle = document.getElementById('progressCircle');
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (occupancyRate / 100) * circumference;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
        
        console.log('✅ Room stats loaded:', { occupiedRooms, availableRooms, occupancyRate });
        
    } catch (error) {
        console.error('❌ Error loading room stats:', error);
    }
}

// NEW: Load Monthly Occupancy Trend Chart (Last 12 Months)
async function loadMonthlyOccupancyTrend() {
    console.log('📊 Loading monthly occupancy trend...');
    
    try {
        const months = [];
        const occupancyData = [];
        const totalRooms = 28;
        
        // Get last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            
            // Get days in this month
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Get all bookings that overlap with this month
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('*')
                .or(`and(check_in.lte.${monthKey}-${daysInMonth},check_out.gte.${monthKey}-01)`)
                .in('status', ['confirmed', 'checked-in']);
            
            if (error) throw error;
            
            // Calculate total occupied room-nights for this month
            let occupiedRoomNights = 0;
            
            bookings.forEach(booking => {
                const checkIn = new Date(booking.check_in);
                const checkOut = new Date(booking.check_out);
                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);
                
                // Find overlap between booking and this month
                const overlapStart = checkIn > monthStart ? checkIn : monthStart;
                const overlapEnd = checkOut < monthEnd ? checkOut : monthEnd;
                
                // Calculate nights in this month
                const nights = Math.max(0, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)));
                occupiedRoomNights += nights;
            });
            
            // Total available room-nights = total rooms × days in month
            const availableRoomNights = totalRooms * daysInMonth;
            
            // Calculate occupancy rate
            const occupancyRate = (occupiedRoomNights / availableRoomNights) * 100;
            
            months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
            occupancyData.push(occupancyRate.toFixed(1));
        }
        
        // Create chart
        const ctx = document.getElementById('monthlyOccupancyChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Occupancy Rate (%)',
                    data: occupancyData,
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#d4af37',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Occupancy: ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        console.log('✅ Monthly occupancy trend loaded');
        
    } catch (error) {
        console.error('❌ Error loading monthly occupancy trend:', error);
    }
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        window.location.href = 'admin-login.html';
    }
});

console.log('✅ Dashboard module loaded');