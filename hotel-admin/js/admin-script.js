// ============================================
// SUPABASE INITIALIZATION
// ============================================
const SUPABASE_URL = 'https://yglehirjsxaxvrpfbvse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbGVoaXJqc3hheHZycGZidnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODA1NDAsImV4cCI6MjA3NzY1NjU0MH0.o631vL64ZMuQNDZQBs9Lx4ANILQgkq_5DrPhz36fpu8';

let supabase_client;

if (window.supabase) {
    supabase_client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabase_client = supabase_client;
    console.log('✅ Supabase initialized globally');
} else {
    console.error('❌ Supabase library not loaded');
}

// ============================================
// AUTHENTICATION CHECK
// ============================================
function checkLoginStatus() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Skip check for login page
    if (currentPage === 'admin-login.html') {
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');
    
    if (!user.email) {
        console.log('⚠️ No user logged in, redirecting to login...');
        window.location.href = 'admin-login.html';
        return;
    }
    
    console.log('👤 User:', user.name || user.email, '| Role:', user.role || 'N/A');
    
    // Update user info display if element exists
    const userInfo = document.querySelector('.user-info span');
    if (userInfo) {
        userInfo.textContent = `👤 ${user.name || user.email}`;
    }
}

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================
function setupRoleBasedAccess() {
    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');
    const role = user.role;
    
    // If no role, don't hide anything (backward compatibility)
    if (!role) {
        return;
    }
    
    // Define access control
    const accessControl = {
        'admin': ['all'],
        'manager': ['dashboard', 'reservations', 'guests', 'rooms', 'analytics', 'invoices', 'reports', 'communications', 'menu'],
        'front_desk': ['dashboard', 'reservations', 'guests', 'rooms', 'housekeeping', 'invoices'],
        'restaurant': ['pos', 'menu'],
        'housekeeping': ['housekeeping', 'rooms']
    };
    
    const allowedPages = accessControl[role] || [];
    
    // Menu items to check
    const menuItems = {
        'dashboard': 'a[href="admin-dashboard.html"]',
        'reservations': 'a[href="admin-reservations.html"]',
        'calendar': 'a[href="admin-reservations-calendar.html"]',
        'guests': 'a[href="admin-guests.html"]',
        'rooms': 'a[href="admin-rooms.html"]',
        'housekeeping': 'a[href="admin-housekeeping.html"]',
        'pos': 'a[href="admin-pos.html"]',
        'menu': 'a[href="admin-menu.html"]',
        'analytics': 'a[href="admin-analytics.html"]',
        'invoices': 'a[href="admin-invoices.html"]',
        'communications': 'a[href="admin-bulk-email.html"]',
        'reports': 'a[href="admin-reports.html"]'
    };
    
    // Hide unauthorized menu items
    if (!allowedPages.includes('all')) {
        Object.keys(menuItems).forEach(page => {
            if (!allowedPages.includes(page)) {
                const menuItem = document.querySelector(menuItems[page]);
                if (menuItem && menuItem.parentElement) {
                    menuItem.parentElement.style.display = 'none';
                }
            }
        });
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupRoleBasedAccess();
});

// ============================================
// LOGOUT FUNCTIONALITY
// ============================================
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hms_user');
        window.location.href = 'admin-login.html';
    }
});

console.log('✅ Admin script loaded');
