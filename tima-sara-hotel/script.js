// ================================
// AVAILABILITY CHECKER (Functional!)
// ================================

function checkAvailability() {
    const checkIn = document.getElementById('checkInDate').value;
    const checkOut = document.getElementById('checkOutDate').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;
    const roomType = document.getElementById('roomType').value;
    const resultDiv = document.getElementById('availabilityResult');
    
    // Validation
    if (!checkIn || !checkOut) {
        resultDiv.textContent = 'Please select both check-in and check-out dates.';
        resultDiv.className = 'availability-result unavailable';
        return;
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if check-in is in the past
    if (checkInDate < today) {
        resultDiv.textContent = 'Check-in date cannot be in the past.';
        resultDiv.className = 'availability-result unavailable';
        return;
    }
    
    // Check if check-out is after check-in
    if (checkOutDate <= checkInDate) {
        resultDiv.textContent = 'Check-out date must be after check-in date.';
        resultDiv.className = 'availability-result unavailable';
        return;
    }
    
    // Calculate nights
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.round((checkOutDate - checkInDate) / oneDay);
    
    // Get room name
    const roomPrices = {
    'standard': 550,
    'executive': 800,
    'deluxe': 1500,
    'royal': 2500
   };

const roomNames = {
    'standard': 'Standard Room',
    'executive': 'Executive Room',
    'deluxe': 'Deluxe Room',
    'royal': 'Royal Suite'

};
    
    const roomName = roomNames[roomType];
    const pricePerNight = roomPrices[roomType];
    const totalPrice = pricePerNight * nights;
    
    // Display success message
    resultDiv.innerHTML = `
        <strong>✅ Available!</strong><br>
        ${roomName} for ${adults} adult(s) ${children > 0 ? `and ${children} child(ren)` : ''}<br>
        ${nights} night(s): ₵${totalPrice.toLocaleString()}<br>
        <small>Call +233 XX XXX XXXX to confirm your booking</small>
    `;
    resultDiv.className = 'availability-result available';
}

// ================================
// TAB SWITCHING
// ================================

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

// ================================
// SMOOTH SCROLLING
// ================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ================================
// MOBILE MENU
// ================================

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

// ================================
// SET MINIMUM DATE FOR BOOKING
// ================================

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkInDate').setAttribute('min', today);
    document.getElementById('checkOutDate').setAttribute('min', today);
});

console.log('✅ Tima Sara Hotel - Luxury Homepage Loaded!');


// Scroll to booking and pre-select room
function scrollToBooking(roomType) {
    // Set the room type
    document.getElementById('roomType').value = roomType;
    
    // Scroll to hero section
    document.querySelector('.hero').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Optional: Add a subtle highlight effect
    const bookingWidget = document.querySelector('.booking-widget');
    bookingWidget.style.animation = 'pulse 0.5s';
    setTimeout(() => {
        bookingWidget.style.animation = '';
    }, 500);
}

// Add pulse animation to CSS