// admin-guests.js - Guest Management

let allGuests = [];
let guestBookings = new Map();

// Load all guests
async function loadGuests() {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Process bookings to create unique guest list
        const guestsMap = new Map();
        
        bookings.forEach(booking => {
            const key = booking.email.toLowerCase();
            
            if (!guestsMap.has(key)) {
                guestsMap.set(key, {
                    name: booking.guest_name,
                    email: booking.guest_email,
                    phone: booking.guest_phone,
                    bookings: [],
                    totalSpent: 0,
                    isVIP: false
                });
            }
            
            const guest = guestsMap.get(key);
            guest.bookings.push(booking);
            guest.totalSpent += booking.total_price || 0;
        });
        
        allGuests = Array.from(guestsMap.values());
        
        // Store bookings by guest for quick access
        allGuests.forEach(guest => {
            guestBookings.set(guest.guest_email, guest.bookings);
        });
        
        console.log('👥 Loaded guests:', allGuests.length);
        
        updateGuestStats();
        displayGuests();
        
    } catch (error) {
        console.error('Error loading guests:', error);
    }
}

// Update guest statistics
function updateGuestStats() {
    const today = new Date();
    
    const stats = {
        total: allGuests.length,
        vip: allGuests.filter(g => g.isVIP || g.totalSpent > 10000).length,
        returning: allGuests.filter(g => g.bookings.length > 1).length,
        current: allGuests.filter(g => {
            return g.bookings.some(b => {
                const checkIn = new Date(b.check_in);
                const checkOut = new Date(b.check_out);
                return checkIn <= today && checkOut >= today;
            });
        }).length
    };
    
    document.getElementById('totalGuests').textContent = stats.total;
    document.getElementById('vipGuests').textContent = stats.vip;
    document.getElementById('returningGuests').textContent = stats.returning;
    document.getElementById('currentGuests').textContent = stats.current;
}

// Display guests
function displayGuests(filtered = allGuests) {
    const tbody = document.getElementById('guestsTableBody');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-row">No guests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(guest => {
        const lastBooking = guest.bookings[0];
        const isVIP = guest.isVIP || guest.totalSpent > 10000;
        const isCurrentlyStaying = isGuestCurrentlyStaying(guest);
        
        return `
            <tr onclick="viewGuestProfile('${guest.guest_email}')">
                <td>
                    <strong>${guest.guest_name}</strong>
                    ${isVIP ? '<span class="guest-vip-badge">⭐ VIP</span>' : ''}
                </td>
                <td>${guest.guest_email}</td>
                <td>${guest.guest_phone}</td>
                <td><strong>${guest.bookings.length}</strong></td>
                <td><strong>₵${guest.totalSpent.toLocaleString()}</strong></td>
                <td>${formatDate(lastBooking.check_in)}</td>
                <td>
                    <span class="guest-status-${isCurrentlyStaying ? 'current' : 'past'}">
                        ${isCurrentlyStaying ? '🟢 Checked In' : 'Past Guest'}
                    </span>
                </td>
                <td>
                    <button class="action-btn btn-view" onclick="event.stopPropagation(); viewGuestProfile('${guest.email}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Check if guest is currently staying
function isGuestCurrentlyStaying(guest) {
    const today = new Date();
    return guest.bookings.some(b => {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        return checkIn <= today && checkOut >= today;
    });
}

// Enhanced view guest profile with preferences
function viewGuestProfile(email) {
    const guest = allGuests.find(g => g.guest_email === email);
    if (!guest) return;
    
    const modal = document.getElementById('guestModal');
    const modalBody = document.getElementById('guestModalBody');
    
    document.getElementById('guestModalName').textContent = guest.guest_name;
    
    const isVIP = guest.isVIP || guest.totalSpent > 10000;
    const returningGuest = guest.bookings.length > 1;
    
    // Calculate guest insights
    const avgStay = guest.bookings.reduce((sum, b) => {
        const nights = Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / (1000 * 60 * 60 * 24));
        return sum + nights;
    }, 0) / guest.bookings.length;
    
    const favoriteRoom = guest.bookings.reduce((acc, b) => {
        acc[b.room_type] = (acc[b.room_type] || 0) + 1;
        return acc;
    }, {});
    const mostBookedRoom = Object.keys(favoriteRoom).reduce((a, b) => 
        favoriteRoom[a] > favoriteRoom[b] ? a : b
    );
    
    modalBody.innerHTML = `
        <!-- Guest Status Banner -->
        <div style="background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue)); padding: 20px; border-radius: 10px; color: white; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: white;">${guest.guest_name}</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">
                        ${isVIP ? '⭐ VIP Guest' : returningGuest ? '🔄 Returning Guest' : '🆕 New Guest'}
                    </p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--accent-gold);">
                        ₵${guest.totalSpent.toLocaleString()}
                    </div>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;">Total Lifetime Value</p>
                </div>
            </div>
        </div>
        
        <!-- Contact & Preferences -->
        <div class="guest-profile-grid">
            <div class="detail-group">
                <h4>Email Address</h4>
                <p>${guest.guest_email}</p>
            </div>
            <div class="detail-group">
                <h4>Phone Number</h4>
                <p>${guest.guest_phone}</p>
            </div>
            <div class="detail-group">
                <h4>Loyalty Status</h4>
                <p>${isVIP ? '<span class="guest-vip-badge">⭐ VIP Member</span>' : 
                    returningGuest ? '<span style="color: var(--success-green); font-weight: 600;">✓ Loyal Guest</span>' : 
                    'Standard'}</p>
            </div>
            <div class="detail-group">
                <h4>Total Stays</h4>
                <p><strong>${guest.bookings.length}</strong> visits</p>
            </div>
            <div class="detail-group">
                <h4>Average Stay</h4>
                <p><strong>${Math.round(avgStay)}</strong> nights</p>
            </div>
            <div class="detail-group">
                <h4>Preferred Room</h4>
                <p>${mostBookedRoom}</p>
            </div>
        </div>
        
        <!-- Guest Preferences Section -->
        <div style="margin-top: 30px; padding: 20px; background: var(--bg-light); border-radius: 10px;">
            <h4 style="margin-bottom: 15px; color: var(--primary-blue);">📝 Guest Preferences & Notes</h4>
            <div style="display: grid; gap: 15px;">
                <div>
                    <label style="font-size: 13px; color: var(--text-light); display: block; margin-bottom: 5px;">Room Preferences</label>
                    <textarea id="guestRoomPrefs" placeholder="e.g., High floor, away from elevator, extra pillows..." 
                        style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; min-height: 60px;">${guest.preferences?.room || ''}</textarea>
                </div>
                <div>
                    <label style="font-size: 13px; color: var(--text-light); display: block; margin-bottom: 5px;">Dietary Requirements</label>
                    <textarea id="guestDietPrefs" placeholder="e.g., Vegetarian, allergies, special requests..." 
                        style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; min-height: 60px;">${guest.preferences?.dietary || ''}</textarea>
                </div>
                <div>
                    <label style="font-size: 13px; color: var(--text-light); display: block; margin-bottom: 5px;">Special Notes</label>
                    <textarea id="guestSpecialNotes" placeholder="e.g., Anniversary, birthday, business traveler, language preferences..." 
                        style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; min-height: 80px;">${guest.preferences?.notes || ''}</textarea>
                </div>
                <button onclick="saveGuestPreferences('${guest.guest_email}')" class="btn-primary" style="width: 100%; padding: 12px;">
                    💾 Save Preferences
                </button>
            </div>
        </div>
        
        <!-- Booking History -->
        <div class="booking-history-section">
            <h3>Booking History (${guest.bookings.length})</h3>
            ${guest.bookings.map(booking => `
                <div class="booking-history-item">
                    <div>
                        <strong>${booking.room_type}</strong><br>
                        <small>${formatDateFull(booking.check_in)} - ${formatDateFull(booking.check_out)}</small>
                    </div>
                    <div style="text-align: right;">
                        <strong>₵${booking.total_price?.toLocaleString()}</strong><br>
                        <small>${booking.booking_reference || 'N/A'}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.dataset.guestEmail = email;
    modal.style.display = 'flex';
}

// Save guest preferences
function saveGuestPreferences(email) {
    const guest = allGuests.find(g => g.guest_email === email);
    if (!guest) return;
    
    if (!guest.preferences) guest.preferences = {};
    
    guest.preferences.room = document.getElementById('guestRoomPrefs').value;
    guest.preferences.dietary = document.getElementById('guestDietPrefs').value;
    guest.preferences.notes = document.getElementById('guestSpecialNotes').value;
    
    alert('✅ Guest preferences saved successfully!');
    console.log('Saved preferences for:', email, guest.preferences);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
    });
}

function formatDateFull(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric'
    });
}

// Search guests
document.getElementById('guestSearch')?.addEventListener('input', function(e) {
    const search = e.target.value.toLowerCase();
    
    const filtered = allGuests.filter(guest => {
        return guest.guest_name.toLowerCase().includes(search) ||
               guest.guest_email.toLowerCase().includes(search) ||
               guest.guest_phone.includes(search);
    });
    
    displayGuests(filtered);
});

// Filter guests
document.getElementById('guestTypeFilter')?.addEventListener('change', function(e) {
    const filter = e.target.value;
    let filtered = allGuests;
    
    if (filter === 'vip') {
        filtered = allGuests.filter(g => g.isVIP || g.totalSpent > 10000);
    } else if (filter === 'returning') {
        filtered = allGuests.filter(g => g.bookings.length > 1);
    } else if (filter === 'new') {
        filtered = allGuests.filter(g => g.bookings.length === 1);
    }
    
    displayGuests(filtered);
});

// Export guests
function exportGuests() {
    const csv = [
        ['Name', 'Email', 'Phone', 'Total Bookings', 'Total Spent', 'Last Visit', 'Status'],
        ...allGuests.map(g => [
            g.guest_name,
            g.guest_email,
            g.guest_phone,
            g.bookings.length,
            g.totalSpent,
            formatDate(g.bookings[0].check_in),
            (g.isVIP || g.totalSpent > 10000) ? 'VIP' : 'Regular'
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Close modal
document.getElementById('closeGuestModal')?.addEventListener('click', () => {
    document.getElementById('guestModal').style.display = 'none';
});

document.getElementById('closeGuestModalBtn')?.addEventListener('click', () => {
    document.getElementById('guestModal').style.display = 'none';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('guests')) {
        loadGuests();
    }
});

console.log('👥 Guests module loaded');