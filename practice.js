// ================================
// MOBILE MENU TOGGLE
// ================================
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(0, 0, 0, 0.95)';
        navLinks.style.padding = '2rem';
    }
}

// ================================
// BOOKING FORM HANDLER
// ================================
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        // Set minimum dates
        const today = new Date().toISOString().split('T')[0];
        const checkInDate = document.getElementById('checkInDate');
        const checkOutDate = document.getElementById('checkOutDate');
        
        if (checkInDate) checkInDate.setAttribute('min', today);
        if (checkOutDate) checkOutDate.setAttribute('min', today);
        
        // Pre-select room from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        if (roomParam) {
            const roomRadio = document.getElementById(roomParam);
            if (roomRadio) roomRadio.checked = true;
        }
        
        // Update summary on form change
        bookingForm.addEventListener('change', updateBookingSummary);
        bookingForm.addEventListener('input', updateBookingSummary);
        
        // Form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookingSubmission();
        });
    }
    
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactSubmission();
        });
    }
});

function updateBookingSummary() {
    const checkIn = document.getElementById('checkInDate').value;
    const checkOut = document.getElementById('checkOutDate').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;
    const selectedRoom = document.querySelector('input[name="roomType"]:checked');
    
    const summaryContent = document.getElementById('summaryContent');
    const totalPrice = document.getElementById('totalPrice');
    
    if (!checkIn || !checkOut || !selectedRoom) {
        summaryContent.innerHTML = '<p class="summary-placeholder">Select your dates and room type to see pricing</p>';
        totalPrice.innerHTML = '';
        return;
    }
    
    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.round((checkOutDate - checkInDate) / oneDay);
    
    if (nights <= 0) {
        summaryContent.innerHTML = '<p class="summary-placeholder" style="color: #e74c3c;">Check-out must be after check-in</p>';
        totalPrice.innerHTML = '';
        return;
    }
    
    // Room prices
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
    
    const roomType = selectedRoom.value;
    const pricePerNight = roomPrices[roomType];
    const total = pricePerNight * nights;
    
    // Build summary HTML
    summaryContent.innerHTML = `
        <div class="summary-item">
            <span>Room Type:</span>
            <span>${roomNames[roomType]}</span>
        </div>
        <div class="summary-item">
            <span>Check-in:</span>
            <span>${new Date(checkIn).toLocaleDateString()}</span>
        </div>
        <div class="summary-item">
            <span>Check-out:</span>
            <span>${new Date(checkOut).toLocaleDateString()}</span>
        </div>
        <div class="summary-item">
            <span>Nights:</span>
            <span>${nights}</span>
        </div>
        <div class="summary-item">
            <span>Guests:</span>
            <span>${adults} Adult(s)${children > 0 ? `, ${children} Child(ren)` : ''}</span>
        </div>
        <div class="summary-item">
            <span>Price per night:</span>
            <span>₵${pricePerNight.toLocaleString()}</span>
        </div>
    `;
    
    totalPrice.innerHTML = `
        <div class="price-label">TOTAL PRICE</div>
        <div class="price-amount">₵${total.toLocaleString()}</div>
    `;
}

function handleBookingSubmission() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const checkIn = document.getElementById('checkInDate').value;
    const checkOut = document.getElementById('checkOutDate').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;
    const selectedRoom = document.querySelector('input[name="roomType"]:checked');
    const specialRequests = document.getElementById('specialRequests').value;
    
    const resultDiv = document.getElementById('bookingResult');
    
    // Validation
    if (!selectedRoom) {
        resultDiv.innerHTML = '⚠️ Please select a room type';
        resultDiv.className = 'booking-result error';
        return;
    }
    
    // Calculate details
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.round((checkOutDate - checkInDate) / oneDay);
    
    if (nights <= 0) {
        resultDiv.innerHTML = '⚠️ Check-out date must be after check-in date';
        resultDiv.className = 'booking-result error';
        return;
    }
    
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
    
    const total = roomPrices[selectedRoom.value] * nights;
    
    // Success message
    resultDiv.innerHTML = `
        <h3>✅ Availability Confirmed!</h3>
        <p><strong>${roomNames[selectedRoom.value]}</strong> is available for your dates</p>
        <p>${nights} night(s) from ${checkInDate.toLocaleDateString()} to ${checkOutDate.toLocaleDateString()}</p>
        <p><strong>Total: ₵${total.toLocaleString()}</strong></p>
        <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid #155724;">
        <p><strong>Next Steps:</strong></p>
        <p>📞 Call us at <strong>+233 XX XXX XXXX</strong> to confirm your reservation</p>
        <p>✉️ Or email <strong>reservations@timasarahotel.com</strong> with reference code: <strong>TSH-${Date.now().toString().slice(-6)}</strong></p>
        <p style="margin-top: 1rem; font-size: 0.9rem;">We've noted your special requests: ${specialRequests || 'None'}</p>
    `;
    resultDiv.className = 'booking-result success';
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ================================
// CONTACT FORM HANDLER
// ================================
function handleContactSubmission() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    const resultDiv = document.getElementById('contactFormResult');
    
    // Success message
    resultDiv.innerHTML = `
        <strong>✅ Message Sent Successfully!</strong><br>
        Thank you, ${name}! We've received your message and will respond within 24 hours.
    `;
    resultDiv.className = 'form-result success';
    
    // Reset form
    document.getElementById('contactForm').reset();
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ================================
// GALLERY FILTER
// ================================
function filterGallery(category) {
    const items = document.querySelectorAll('.gallery-item');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter items
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.5s';
        } else {
            item.style.display = 'none';
        }
    });
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
// NAVIGATION SCROLL EFFECT
// ================================
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.main-nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        nav.style.background = 'rgba(0, 0, 0, 0.9)';
    }
});

// ================================
// FADE IN ANIMATION
// ================================
const fadeInElements = document.querySelectorAll('.room-detail-card, .experience-card, .dining-card');

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'opacity 0.6s, transform 0.6s';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

fadeInElements.forEach(element => {
    observer.observe(element);
});

console.log('✅ Tima Sara Hotel - Multi-page Website Loaded Successfully!');