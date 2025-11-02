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
// BOOKING FORM HANDLER WITH CALCULATOR
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
        
        // Room prices
        const roomPrices = {
            'standard': 250,
            'deluxe': 400,
            'executive': 600,
            'royal': 1000
        };
        
        // Calculate price function
        function calculatePrice() {
            const checkIn = document.getElementById('checkInDate').value;
            const checkOut = document.getElementById('checkOutDate').value;
            const selectedRoom = document.querySelector('input[name="roomType"]:checked');
            
            if (!checkIn || !checkOut || !selectedRoom) {
                document.getElementById('totalPrice').textContent = '₵0';
                document.getElementById('nightsCount').textContent = '0';
                return;
            }
            
            const checkInDateObj = new Date(checkIn);
            const checkOutDateObj = new Date(checkOut);
            const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));
            
            if (nights <= 0) {
                document.getElementById('totalPrice').textContent = '₵0';
                document.getElementById('nightsCount').textContent = '0';
                return;
            }
            
            const roomPrice = roomPrices[selectedRoom.value];
            const totalPrice = roomPrice * nights;
            
            document.getElementById('totalPrice').textContent = '₵' + totalPrice;
            document.getElementById('nightsCount').textContent = nights;
        }
        
        // Add event listeners for price calculation
        document.getElementById('checkInDate').addEventListener('change', calculatePrice);
        document.getElementById('checkOutDate').addEventListener('change', calculatePrice);
        document.querySelectorAll('input[name="roomType"]').forEach(radio => {
            radio.addEventListener('change', calculatePrice);
        });
        
        // Pre-select room from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        if (roomParam) {
            const roomRadio = document.getElementById(roomParam);
            if (roomRadio) {
                roomRadio.checked = true;
                calculatePrice();
            }
        }
        
        // Handle form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const checkIn = document.getElementById('checkInDate').value;
            const checkOut = document.getElementById('checkOutDate').value;
            const selectedRoom = document.querySelector('input[name="roomType"]:checked');
            
            if (!selectedRoom) {
                alert('Please select a room type');
                return;
            }
            
            const nights = document.getElementById('nightsCount').textContent;
            const totalPrice = document.getElementById('totalPrice').textContent;
            
            if (nights === '0') {
                alert('Check-out date must be after check-in date');
                return;
            }
            
            const confirmationMessage = `
Booking Confirmed! 

Name: ${firstName} ${lastName}
Email: ${email}
Check-in: ${checkIn}
Check-out: ${checkOut}
Nights: ${nights}
Room: ${selectedRoom.value.toUpperCase()}
Total: ${totalPrice}

Thank you! We'll send confirmation to ${email}
            `;
            
            alert(confirmationMessage);
            bookingForm.reset();
            calculatePrice();
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

console.log('✅ Tima Sara Hotel scripts loaded successfully!');