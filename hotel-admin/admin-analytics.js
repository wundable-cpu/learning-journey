// admin-analytics.js - Analytics Dashboard

let analyticsData = [];
let revenueChart, occupancyChart, roomTypeChart;

// Load analytics data
async function loadAnalytics() {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        analyticsData = bookings;
        
        calculateMetrics();
        createCharts();
        loadTopRooms();
        
        console.log('📊 Analytics loaded');
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Calculate key metrics
function calculateMetrics() {
    const totalRevenue = analyticsData.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const totalBookings = analyticsData.length;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    // Calculate occupancy (simplified)
    const totalRooms = 28;
    const today = new Date();
    const occupiedToday = analyticsData.filter(b => {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        return checkIn <= today && checkOut >= today;
    }).length;
    const occupancyRate = (occupiedToday / totalRooms) * 100;
    
    document.getElementById('totalRevenue').textContent = `GHS ${totalRevenue.toLocaleString()}`;
    document.getElementById('avgOccupancy').textContent = `${Math.round(occupancyRate)}%`;
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('avgBookingValue').textContent = `GHS ${Math.round(avgBookingValue).toLocaleString()}`;
    
    // Guest insights
    const uniqueGuests = new Set(analyticsData.map(b => b.email)).size;
    const returningGuests = analyticsData.length - uniqueGuests;
    const avgStay = analyticsData.reduce((sum, b) => {
        const nights = Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / (1000 * 60 * 60 * 24));
        return sum + nights;
    }, 0) / totalBookings;
    
    document.getElementById('newGuestsCount').textContent = uniqueGuests;
    document.getElementById('returningGuestsCount').textContent = returningGuests;
    document.getElementById('avgStayDuration').textContent = `${Math.round(avgStay)} nights`;
}

// Create charts
function createCharts() {
    createRevenueChart();
    createOccupancyChart();
    createRoomTypeChart();
}

// Revenue trend chart
function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Group by month
    const monthlyRevenue = {};
    analyticsData.forEach(booking => {
        const month = new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (booking.total_price || 0);
    });
    
    const labels = Object.keys(monthlyRevenue).slice(-6);
    const data = labels.map(month => monthlyRevenue[month]);
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (GHS)',
                data: data,
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'GHS ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Occupancy chart
function createOccupancyChart() {
    const ctx = document.getElementById('occupancyChart');
    if (!ctx) return;
    
    // Calculate weekly occupancy
    const weeklyOccupancy = [65, 72, 68, 75, 80, 78, 82]; // Sample data
    
    occupancyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Occupancy %',
                data: weeklyOccupancy,
                backgroundColor: '#3498db',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
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

// Room type distribution chart
function createRoomTypeChart() {
    const ctx = document.getElementById('roomTypeChart');
    if (!ctx) return;
    
    // Count bookings by room type
    const roomTypes = {};
    analyticsData.forEach(booking => {
        const type = booking.room_type;
        roomTypes[type] = (roomTypes[type] || 0) + 1;
    });
    
    roomTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(roomTypes),
            datasets: [{
                data: Object.values(roomTypes),
                backgroundColor: [
                    '#27ae60',
                    '#3498db',
                    '#9b59b6',
                    '#d4af37'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load top performing rooms
function loadTopRooms() {
    const roomRevenue = {};
    
    analyticsData.forEach(booking => {
        const type = booking.room_type;
        roomRevenue[type] = (roomRevenue[type] || 0) + (booking.total_price || 0);
    });
    
    const sorted = Object.entries(roomRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const html = sorted.map((item, index) => `
        <div class="top-list-item">
            <span class="top-list-rank">${index + 1}</span>
            <span class="top-list-name">${item[0]}</span>
            <span class="top-list-value">₵${item[1].toLocaleString()}</span>
        </div>
    `).join('');
    
    document.getElementById('topRoomsList').innerHTML = html;
}

// Generate reports
function generateReport(type) {
    alert(`Generating ${type} report... This feature will export detailed ${type} data.`);
    // In production, this would generate and download actual reports
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('analytics')) {
        loadAnalytics();
    }
});

console.log('📊 Analytics module loaded');