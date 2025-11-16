// admin-script.js - Hotel Management System

// Initialize Supabase
const SUPABASE_URL = 'https://yglehirjsxaxvrpfbvse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbGVoaXJqc3hheHZycGZidnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA4MDU0MCwiZXhwIjoyMDc3NjU2NTQwfQ.Gkvs5_Upf0WVnuC7BM9rOyGI2GyaR1Ar4tYMXoIa_g8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase initialized for admin');

// ================================
// LOGIN FUNCTIONALITY
// ================================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        const submitBtn = loginForm.querySelector('.login-btn');
        
        // Show loading state
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline';
        submitBtn.disabled = true;
        errorDiv.style.display = 'none';
        
        try {
            // Sign in with Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            
            if (error) throw error;
            
            console.log('✅ Login successful:', data);
            
            // Store session
            localStorage.setItem('isAdminLoggedIn', 'true');
            localStorage.setItem('adminEmail', email);
            
            // Redirect to dashboard
            window.location.href = 'admin-dashboard.html';
            
        } catch (error) {
            console.error('❌ Login error:', error);
            errorDiv.textContent = 'Invalid email or password. Please try again.';
            errorDiv.style.display = 'block';
            
            // Reset button
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// ================================
// DASHBOARD FUNCTIONALITY
// ================================

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const currentPage = window.location.pathname;
    
    if (!isLoggedIn && currentPage.includes('dashboard')) {
        window.location.href = 'admin-login.html';
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Get all bookings
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('📊 Bookings loaded:', bookings);
        
        // Calculate stats
        updateDashboardStats(bookings);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(bookings) {
    const today = new Date().toISOString().split('T')[0];
    
    // Filter today's bookings
    const todayBookings = bookings.filter(b => {
        const bookingDate = b.created_at?.split('T')[0];
        return bookingDate === today;
    });
    
    // Calculate occupancy
    const totalRooms = 28;
    const occupiedRooms = bookings.filter(b => {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        const now = new Date();
        return checkIn <= now && checkOut >= now;
    }).length;
    
    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    
    // Update UI
    document.getElementById('availableRooms').textContent = availableRooms;
    document.getElementById('occupiedRooms').textContent = occupiedRooms;
    document.getElementById('occupiedCount').textContent = occupiedRooms;
    document.getElementById('progressText').textContent = `${occupancyRate}%`;
    
    // Update progress circle
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (occupancyRate / 100) * circumference;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    
    // Calculate revenue
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    document.getElementById('todayRevenue').textContent = todayRevenue.toLocaleString('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Update check-ins/check-outs
    const checkInsToday = bookings.filter(b => b.check_in === today).length;
    const checkOutsToday = bookings.filter(b => b.check_out === today).length;
    
    document.getElementById('checkInsToday').textContent = checkInsToday;
    document.getElementById('checkOutsToday').textContent = checkOutsToday;
    
    // Load upcoming arrivals
    loadUpcomingArrivals(bookings);
    loadTodayDepartures(bookings);
}

// Load upcoming arrivals
function loadUpcomingArrivals(bookings) {
    const today = new Date();
    const upcoming = bookings
        .filter(b => new Date(b.check_in) >= today)
        .slice(0, 5)
        .sort((a, b) => new Date(a.check_in) - new Date(b.check_in));
    
    const arrivalsList = document.getElementById('arrivalsList');
    arrivalsList.innerHTML = upcoming.map(booking => `
        <div class="arrival-item">
            <div class="arrival-info">
                <span class="guest-name">Guest: ${booking.full_name}</span>
                <span class="room-number">Room: ${booking.room_type}</span>
            </div>
            <div class="arrival-time">${booking.check_in}</div>
        </div>
    `).join('');
}

// Load today's departures
function loadTodayDepartures(bookings) {
    const today = new Date().toISOString().split('T')[0];
    const departures = bookings
        .filter(b => b.check_out === today)
        .slice(0, 5);
    
    const departuresList = document.getElementById('departuresList');
    departuresList.innerHTML = departures.map(booking => `
        <div class="departure-item">
            <div class="departure-info">
                <span class="guest-name">Guest: ${booking.full_name}</span>
                <span class="room-number">Room: ${booking.room_type}</span>
            </div>
            <div class="departure-time">${booking.check_out}</div>
        </div>
    `).join('');
}

// Update current time
function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');
    
    if (timeElement) {
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        timeElement.textContent = `${displayHours}:${minutes} ${ampm}`;
    }
    
    if (dateElement) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
    }
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
        await supabase.auth.signOut();
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminEmail');
        window.location.href = 'admin-login.html';
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Update user name
    const userName = document.getElementById('userName');
    if (userName) {
        const email = localStorage.getItem('adminEmail');
        if (email) {
            userName.textContent = `Welcome, ${email.split('@')[0]}`;
        }
    }
    
    // Load dashboard data if on dashboard page
    if (window.location.pathname.includes('dashboard')) {
        loadDashboardData();
        updateTime();
        setInterval(updateTime, 60000); // Update every minute
    }
});

console.log('🎯 Admin system initialized');