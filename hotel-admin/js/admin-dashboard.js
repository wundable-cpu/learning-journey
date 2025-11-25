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
        // Load existing room data
        await loadRoomStats();
        
        // Load F&B data
        await loadFBStats();
        await loadCategoryBreakdown();
        await loadTopItems();
        await loadRevenueChart();
        
        console.log('✅ Dashboard data loaded');
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
    }
}

// Your existing room stats function (keep as is)
async function loadRoomStats() {
    // Keep your existing code for occupancy, check-ins, etc.
    console.log('📊 Loading room stats...');
}

// NEW: Load F&B Statistics
async function loadFBStats() {
    console.log('💰 Loading F&B stats...');
    
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();
        
        // Get start of week (Monday)
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1);
        const weekStartStr = weekStart.toISOString();
        
        // Get start of month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString();
        
        // Today's F&B revenue
        const { data: todayCharges, error: todayError } = await supabase
            .from('guest_charges')
            .select('total_amount')
            .gte('charge_date', todayStr);
        
        if (todayError) throw todayError;
        
        const todayRevenue = todayCharges ? 
            todayCharges.reduce((sum, c) => sum + parseFloat(c.total_amount), 0) : 0;
        
        // Week's F&B revenue
        const { data: weekCharges, error: weekError } = await supabase
            .from('guest_charges')
            .select('total_amount')
            .gte('charge_date', weekStartStr);
        
        const weekRevenue = weekCharges ? 
            weekCharges.reduce((sum, c) => sum + parseFloat(c.total_amount), 0) : 0;
        
        // Month's F&B revenue
        const { data: monthCharges, error: monthError } = await supabase
            .from('guest_charges')
            .select('total_amount')
            .gte('charge_date', monthStartStr);
        
        const monthRevenue = monthCharges ? 
            monthCharges.reduce((sum, c) => sum + parseFloat(c.total_amount), 0) : 0;
        
        // Today's order count
        const todayOrders = todayCharges ? todayCharges.length : 0;
        
        // Update UI
        document.getElementById('todayFBRevenue').textContent = `₵${todayRevenue.toFixed(2)}`;
        document.getElementById('weekFBRevenue').textContent = `₵${weekRevenue.toFixed(2)}`;
        document.getElementById('monthFBRevenue').textContent = `₵${monthRevenue.toFixed(2)}`;
        document.getElementById('todayOrders').textContent = todayOrders;
        
        console.log('✅ F&B stats loaded:', { todayRevenue, weekRevenue, monthRevenue, todayOrders });
        
    } catch (error) {
        console.error('❌ Error loading F&B stats:', error);
    }
}

// NEW: Load Category Breakdown
async function loadCategoryBreakdown() {
    console.log('📊 Loading category breakdown...');
    
    try {
        const { data: charges, error } = await supabase
            .from('guest_charges')
            .select('category, total_amount');
        
        if (error) throw error;
        
        // Group by category
        const categoryTotals = {};
        charges.forEach(charge => {
            const category = charge.category || 'other';
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += parseFloat(charge.total_amount);
        });
        
        // Display
        const container = document.getElementById('categoryBreakdown');
        container.innerHTML = '';
        
        Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]).forEach(category => {
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
            const amount = categoryTotals[category];
            
            container.innerHTML += `
                <div class="category-item">
                    <span class="category-name">${categoryName}</span>
                    <span class="category-amount">₵${amount.toFixed(2)}</span>
                </div>
            `;
        });
        
        console.log('✅ Category breakdown loaded');
        
    } catch (error) {
        console.error('❌ Error loading categories:', error);
    }
}

// NEW: Load Top Selling Items
async function loadTopItems() {
    console.log('🏆 Loading top items...');
    
    try {
        const { data: charges, error } = await supabase
            .from('guest_charges')
            .select('item_description, quantity, total_amount');
        
        if (error) throw error;
        
        // Group by item
        const itemTotals = {};
        charges.forEach(charge => {
            const item = charge.item_description;
            if (!itemTotals[item]) {
                itemTotals[item] = { quantity: 0, revenue: 0 };
            }
            itemTotals[item].quantity += charge.quantity;
            itemTotals[item].revenue += parseFloat(charge.total_amount);
        });
        
        // Sort by revenue and get top 5
        const topItems = Object.keys(itemTotals)
            .sort((a, b) => itemTotals[b].revenue - itemTotals[a].revenue)
            .slice(0, 5);
        
        // Display
        const container = document.getElementById('topItems');
        container.innerHTML = '';
        
        topItems.forEach((item, index) => {
            const data = itemTotals[item];
            container.innerHTML += `
                <div class="top-item">
                    <div class="item-rank">${index + 1}</div>
                    <div class="item-info">
                        <div class="item-name">${item}</div>
                        <div class="item-quantity">Sold: ${data.quantity} times</div>
                    </div>
                    <div class="item-revenue">₵${data.revenue.toFixed(2)}</div>
                </div>
            `;
        });
        
        console.log('✅ Top items loaded');
        
    } catch (error) {
        console.error('❌ Error loading top items:', error);
    }
}

// NEW: Load Revenue Comparison Chart
async function loadRevenueChart() {
    console.log('📈 Loading revenue chart...');
    
    try {
        // Get last 7 days
        const days = [];
        const roomRevenue = [];
        const fbRevenue = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toISOString().split('T')[0];
            
            days.push(date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }));
            
            // Get room revenue (bookings with check-in on this date)
            const { data: bookings } = await supabase
                .from('bookings')
                .select('total_price')
                .eq('check_in', dateStr);
            
            const roomTotal = bookings ? 
                bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0) : 0;
            roomRevenue.push(roomTotal);
            
            // Get F&B revenue
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDayStr = nextDay.toISOString().split('T')[0];
            
            const { data: charges } = await supabase
                .from('guest_charges')
                .select('total_amount')
                .gte('charge_date', dateStr)
                .lt('charge_date', nextDayStr);
            
            const fbTotal = charges ? 
                charges.reduce((sum, c) => sum + parseFloat(c.total_amount), 0) : 0;
            fbRevenue.push(fbTotal);
        }
        
        // Create chart
        const ctx = document.getElementById('revenueComparisonChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Room Revenue',
                        data: roomRevenue,
                        borderColor: '#1a365d',
                        backgroundColor: 'rgba(26, 54, 93, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'F&B Revenue',
                        data: fbRevenue,
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₵' + value;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Revenue chart loaded');
        
    } catch (error) {
        console.error('❌ Error loading chart:', error);
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



