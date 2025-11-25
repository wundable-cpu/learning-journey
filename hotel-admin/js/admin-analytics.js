console.log('📈 Analytics module loading...');

const supabase = window.supabase_client;

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Analytics page loaded');
    
    if (!supabase) {
        alert('Database connection failed. Please refresh.');
        return;
    }
    
    await loadAnalyticsData();
});

// Load analytics data
async function loadAnalyticsData() {
    console.log('📡 Loading analytics data...');
    
    try {
        // Get all bookings
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('*');
        
        if (bookingsError) throw bookingsError;
        
        // Get all F&B charges
        const { data: charges, error: chargesError } = await supabase
            .from('guest_charges')
            .select('*');
        
        if (chargesError) throw chargesError;
        
        console.log('📊 Data loaded:', { bookings: bookings.length, charges: charges.length });
        
        // Calculate room revenue
        const roomRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
        
        // Calculate F&B revenue
        const fbRevenue = charges.reduce((sum, c) => sum + parseFloat(c.total_amount || 0), 0);
        
        // Total revenue
        const totalRevenue = roomRevenue + fbRevenue;
        
        // Total bookings
        const totalBookings = bookings.length;
        
        // Average booking value
        const avgBookingValue = totalBookings > 0 ? roomRevenue / totalBookings : 0;
        
        // Update display
        document.getElementById('totalRevenue').textContent = `₵${totalRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('roomRevenue').textContent = `₵${roomRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('fbRevenue').textContent = `₵${fbRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('avgBookingValue').textContent = `₵${avgBookingValue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        console.log('✅ Analytics updated:', {
            totalRevenue,
            roomRevenue,
            fbRevenue,
            totalBookings,
            avgBookingValue
        });
        
        // Load charts
        await loadRevenueChart(bookings, charges);
        await loadOccupancyChart(bookings);
        
    } catch (error) {
        console.error('❌ Error loading analytics:', error);
        alert('Error loading analytics: ' + error.message);
    }
}

// Load revenue chart
async function loadRevenueChart(bookings, charges) {
    // Get last 12 months
    const months = [];
    const roomData = [];
    const fbData = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        
        months.push(date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }));
        
        // Room revenue for this month
        const monthRoom = bookings
            .filter(b => b.check_in.startsWith(monthKey))
            .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
        
        // F&B revenue for this month
        const monthFB = charges
            .filter(c => c.charge_date && c.charge_date.startsWith(monthKey))
            .reduce((sum, c) => sum + parseFloat(c.total_amount || 0), 0);
        
        roomData.push(monthRoom);
        fbData.push(monthFB);
    }
    
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Room Revenue',
                    data: roomData,
                    backgroundColor: 'rgba(33, 150, 243, 0.8)',
                    borderColor: 'rgb(33, 150, 243)',
                    borderWidth: 2
                },
                {
                    label: 'F&B Revenue',
                    data: fbData,
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgb(76, 175, 80)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₵' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₵' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Load occupancy chart
async function loadOccupancyChart(bookings) {
    const months = [];
    const occupancyData = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        
        months.push(date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }));
        
        // Get days in month
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        
        // Total room-nights available
        const availableRoomNights = 28 * daysInMonth;
        
        // Occupied room-nights
        const occupiedRoomNights = bookings.filter(b => 
            b.check_in.startsWith(monthKey) || b.check_out.startsWith(monthKey)
        ).reduce((sum, b) => {
            const checkIn = new Date(b.check_in);
            const checkOut = new Date(b.check_out);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            return sum + nights;
        }, 0);
        
        const occupancyRate = (occupiedRoomNights / availableRoomNights * 100).toFixed(1);
        occupancyData.push(parseFloat(occupancyRate));
    }
    
    const ctx = document.getElementById('occupancyChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Occupancy Rate (%)',
                data: occupancyData,
                borderColor: 'rgb(156, 39, 176)',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        window.location.href = 'admin-login.html';
    }
});

console.log('✅ Analytics module loaded');