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
        
        // Calculate stats
        const todayCheckIns = allBookings.filter(b => b.check_in === today).length;
        const todayCheckOuts = allBookings.filter(b => b.check_out === today).length;
        
        const currentlyOccupied = allBookings.filter(b => 
            b.check_in <= today && b.check_out >= today && 
            (b.status === 'confirmed' || b.status === 'checked-in')
        ).length;
        
        const occupancyRate = (currentlyOccupied / 28 * 100).toFixed(1);
        const availableRooms = 28 - currentlyOccupied;
        
        // Update quick stats
        document.getElementById('todayCheckIns').textContent = todayCheckIns;
        document.getElementById('todayCheckOuts').textContent = todayCheckOuts;
        document.getElementById('occupancyRate').textContent = occupancyRate + '%';
        document.getElementById('availableRooms').textContent = availableRooms;
        
        // Update room status counts
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
        
        document.getElementById('availableCount').textContent = statusCounts.clean;
        document.getElementById('occupiedCount').textContent = statusCounts.occupied;
        document.getElementById('cleaningCount').textContent = statusCounts.dirty;
        document.getElementById('maintenanceCount').textContent = statusCounts.maintenance;
        document.getElementById('reservedCount').textContent = statusCounts.reserved;
        
        console.log('✅ Stats updated');
        
        // Load occupancy chart
        await loadOccupancyChart(allBookings);
        
        // Load recent bookings
        await loadRecentBookings(allBookings);
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        alert('Error loading dashboard: ' + error.message);
    }
}

// Load 7-day occupancy bar chart
async function loadOccupancyChart(allBookings) {
    console.log('📊 Loading occupancy chart...');
    
    try {
        const days = [];
        const occupancyData = [];
        const colors = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const occupied = allBookings.filter(b => 
                b.check_in <= dateStr && b.check_out >= dateStr && 
                (b.status === 'confirmed' || b.status === 'checked-in')
            ).length;
            
            const rate = (occupied / 28 * 100).toFixed(1);
            
            days.push(date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
            occupancyData.push(parseFloat(rate));
            
            // Color based on occupancy level
            if (rate >= 80) {
                colors.push('rgba(76, 175, 80, 0.8)'); // Green - high occupancy
            } else if (rate >= 50) {
                colors.push('rgba(255, 152, 0, 0.8)'); // Orange - medium
            } else {
                colors.push('rgba(33, 150, 243, 0.8)'); // Blue - low
            }
        }
        
        const ctx = document.getElementById('occupancyChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Occupancy Rate (%)',
                    data: occupancyData,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.8', '1')),
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: false 
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Occupancy: ' + context.parsed.y.toFixed(1) + '%';
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
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Occupancy chart created');
        
    } catch (error) {
        console.error('❌ Error loading occupancy chart:', error);
    }
}

// Load recent bookings
async function loadRecentBookings(allBookings) {
    console.log('📡 Loading recent bookings...');
    
    try {
        const recentBookings = allBookings
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
        
        const container = document.getElementById('recentBookings');
        
        if (!recentBookings || recentBookings.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light);">
                    <p>No recent bookings</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentBookings.map(booking => `
            <div style="padding: 15px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 700; color: var(--primary-blue); margin-bottom: 5px;">
                        ${booking.guest_name}
                    </div>
                    <div style="font-size: 12px; color: var(--text-light);">
                        ${booking.room_type} - Room ${booking.room_number} • 
                        ${new Date(booking.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - 
                        ${new Date(booking.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 5px;">
                        ₵${parseFloat(booking.total_price).toFixed(2)}
                    </div>
                    <div style="font-size: 11px; color: var(--text-light);">
                        ${new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Recent bookings loaded');
        
    } catch (error) {
        console.error('❌ Error loading recent bookings:', error);
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