// ============================================
// MOBILE MENU TOGGLE
// ============================================

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

// ============================================
// BOOKING FORM HANDLER
// ============================================

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
            if (roomRadio) {
                roomRadio.checked = true;
            }
        }
        
        // Handle form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
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
            
            if (!selectedRoom) {
                alert('Please select a room type');
                return;
            }
            
            // Calculate nights
            const checkInDateObj = new Date(checkIn);
            const checkOutDateObj = new Date(checkOut);
            const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));
            
            if (nights <= 0) {
                alert('Check-out date must be after check-in date');
                return;
            }
            
            // Calculate total price
            const roomPrices = {
                'standard': 250,
                'deluxe': 400,
                'executive': 600,
                'royal': 1000
            };
            
            const roomPrice = roomPrices[selectedRoom.value];
            const totalPrice = roomPrice * nights;
            
            // Display confirmation
            const confirmationMessage = `
                Booking Summary:
                Name: ${firstName} ${lastName}
                Email: ${email}
                Phone: ${phone}
                Check-in: ${checkIn}
                Check-out: ${checkOut}
                Nights: ${nights}
                Room: ${selectedRoom.value.toUpperCase()}
                Guests: ${adults} adults, ${children} children
                Total: ₵${totalPrice}
                
                Special Requests: ${specialRequests || 'None'}
                
                Thank you for your booking! We'll send confirmation to ${email}
            `;
            
            alert(confirmationMessage);
            bookingForm.reset();
        });
    }
});

// ============================================
// GALLERY FILTER
// ============================================

function filterGallery(category) {
    const items = document.querySelectorAll('.gallery-item');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter items
    items.forEach(item => {
        if (category === 'all') {
            item.style.display = 'block';
        } else {
            if (item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// ============================================
// CONTACT FORM HANDLER
// ============================================

function handleContactSubmission(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    const resultDiv = document.getElementById('contactFormResult');
    
    // Show loading state
    resultDiv.innerHTML = 'Sending message...';
    resultDiv.className = 'form-result';
    resultDiv.style.display = 'block';
    
    // Simulate sending (replace with actual Formspree or API call)
    setTimeout(() => {
        resultDiv.innerHTML = `
            <strong>✅ Message Sent Successfully!</strong><br>
            Thank you, ${name}! We've received your message and will respond within 24 hours to ${email}.
        `;
        resultDiv.className = 'form-result success';
        document.getElementById('contactForm').reset();
    }, 1500);
}

// ============================================
// NAVIGATION SCROLL EFFECT
// ============================================

window.addEventListener('scroll', function() {
    const nav = document.querySelector('.main-nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            nav.style.background = 'rgba(0, 0, 0, 0.9)';
        }
    }
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

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

console.log('✅ Tima Sara Hotel - Multi-page Website Loaded Successfully!');