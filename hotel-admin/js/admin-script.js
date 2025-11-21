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
// ROLE-BASED ACCESS CONTROL
// ============================================
function setupRoleBasedAccess() {
    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');
    const role = user.role || null;
    
    if (!role) {
        // No user logged in - redirect to login
        if (!window.location.pathname.includes('admin-login.html')) {
            window.location.href = 'admin-login.html';
        }
        return;
    }
    
    console.log('👤 User:', user.name, '| Role:', role);
    
    // Update welcome message if element exists
    const userInfo = document.querySelector('.user-info span');
    if (userInfo) {
        userInfo.textContent = `👤 ${user.name} (${role})`;
    }
    
    // Define access control
    const accessControl = {
        'admin': ['all'], // Admins see everything
        'manager': ['dashboard', 'reservations', 'guests', 'rooms', 'analytics', 'invoices', 'reports', 'communications'],
        'front_desk': ['dashboard', 'reservations', 'guests', 'rooms', 'housekeeping', 'invoices'],
        'restaurant': ['pos'],
        'housekeeping': ['housekeeping', 'rooms'],
        'marketing': ['dashboard', 'guests', 'communications', 'analytics']
    };
    
    const allowedPages = accessControl[role] || [];
    
    // Menu item selectors
    const menuItems = {
        'dashboard': 'a[href="admin-dashboard.html"]',
        'reservations': 'a[href="admin-reservations.html"]',
        'guests': 'a[href="admin-guests.html"]',
        'rooms': 'a[href="admin-rooms.html"]',
        'housekeeping': 'a[href="admin-housekeeping.html"]',
        'pos': 'a[href="admin-pos.html"]',
        'analytics': 'a[href="admin-analytics.html"]',
        'invoices': 'a[href="admin-invoices.html"]',
        'communications': 'a[href="admin-bulk-email.html"]',
        'reports': 'a[href="admin-reports.html"]',
        'settings': 'a[href="admin-settings.html"]'
    };
    
    // Hide unauthorized menu items
    Object.keys(menuItems).forEach(page => {
        if (!allowedPages.includes('all') && !allowedPages.includes(page)) {
            const menuItem = document.querySelector(menuItems[page]);
            if (menuItem && menuItem.parentElement) {
                menuItem.parentElement.style.display = 'none';
            }
        }
    });
    
    // Check if current page is allowed
    const currentPage = window.location.pathname.split('/').pop();
    
    // Skip check for login page
    if (currentPage === 'admin-login.html') return;
    
    const pageKey = Object.keys(menuItems).find(key => 
        menuItems[key].includes(currentPage)
    );
    
    if (pageKey && !allowedPages.includes('all') && !allowedPages.includes(pageKey)) {
        alert('⛔ Access Denied: You do not have permission to view this page.');
        
        // Redirect to their home page
        const redirects = {
            'manager': 'admin-dashboard.html',
            'front_desk': 'admin-reservations.html',
            'restaurant': 'admin-pos.html',
            'housekeeping': 'admin-housekeeping.html'
        };
        
        window.location.href = redirects[role] || 'admin-login.html';
    }
}

// ============================================
// CHECK LOGIN STATUS
// ============================================
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('hms_user') || '{}');
    
    // Skip check for login page
    if (window.location.pathname.includes('admin-login.html')) {
        return;
    }
    
    if (!user.email) {
        console.log('⚠️ No user logged in, redirecting to login...');
        window.location.href = 'admin-login.html';
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupRoleBasedAccess();
});

console.log('✅ Admin script loaded with role-based access control');