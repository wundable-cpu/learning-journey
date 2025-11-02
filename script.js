// ============================================
// MOBILE MENU TOGGLE
// ============================================
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
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
}

// ============================================
// GALLERY FILTER
// ============================================
function filterGallery(category) {
    const items = document.querySelectorAll('.gallery-item');
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
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
// SAVE BOOKING TO SUPABASE
// ============================================
async function saveBookingToSupabase(bookingData) {
    try {
        const timestamp = Date.now();
        const reference = 'TSH-' + timestamp;
        
        const supabaseData = {
            guest_name: bookingData.firstName + ' ' + bookingData.lastName,
            guest_email: bookingData.email,
            guest_phone: bookingData.phone,
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
            room_type: bookingData.roomType,
            num_adults: parseInt(bookingData.adults),
            num_children: parseInt(bookingData.children),
            total_price: bookingData.totalPrice,
            special_requests: bookingData.specialRequests,
            status: 'pending',
            booking_reference: reference
        };
        
        const result = await supabase
            .from('bookings')
            .insert([supabaseData])
            .select();
        
        if (result.error) {
            console.error('Supabase error:', result.error);
            return { success: false, error: result.error.message };
        }
        
        console.log('✅ Booking saved:', result.data);
        return { success: true, reference: reference, data: result.data };
        
    } catch (err) {
        console.error('Error saving booking:', err);
        return { success: false, error: err.message };
    }
}

// ============================================
// BOOKING FORM HANDLER
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (!bookingForm) {
        console.log('No booking form found on this page');
        return;
    }
    
    console.log('📝 Booking form found, setting up...');
    
    // Room prices
    const roomPrices = {
        'standard': 250,
        'deluxe': 400,
        'executive': 600,
        'royal': 1000
    };
    
    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById('checkInDate');
    const checkOutInput = document.getElementById('checkOutDate');
    
    if (checkInInput) checkInInput.setAttribute('min', today);
    if (checkOutInput) checkOutInput.setAttribute('min', today);
    
    // Handle form submission
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🚀 Form submitted!');
        
        // Get all form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const checkIn = document.getElementById('checkInDate').value;
        const checkOut = document.getElementById('checkOutDate').value;
        const adults = document.getElementById('adults').value;
        const children = document.getElementById('children').value;
        const selectedRoom = document.querySelector('input[name="roomType"]:checked');
        const specialRequests = document.getElementById('specialRequests') ? document.getElementById('specialRequests').value : '';
        
        console.log('Form data:', { firstName, lastName, email, checkIn, checkOut, selectedRoom });
        
        // Validation
        if (!firstName || !lastName || !email) {
            alert('Please fill in your name and email');
            return;
        }
        
        if (!selectedRoom) {
            alert('Please select a room type');
            return;
        }
        
        if (!checkIn || !checkOut) {
            alert('Please select check-in and check-out dates');
            return;
        }
        
        // Calculate nights and price
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        console.log('Nights:', nights);
        
        if (nights <= 0) {
            alert('Check-out date must be after check-in date');
            return;
        }
        
        const roomPrice = roomPrices[selectedRoom.value];
        const totalPrice = roomPrice * nights;
        
        console.log('Total price:', totalPrice);
        
        // Prepare booking data
        const bookingData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            checkIn: checkIn,
            checkOut: checkOut,
            roomType: selectedRoom.value,
            adults: adults,
            children: children,
            totalPrice: totalPrice,
            specialRequests: specialRequests
        };
        
        // Show loading
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '💾 Saving Booking...';
        submitBtn.disabled = true;
        
        // Save to Supabase
        const result = await saveBookingToSupabase(bookingData);
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            alert('✅ BOOKING CONFIRMED!\n\n' +
                'Booking Reference: ' + result.reference + '\n' +
                'Name: ' + firstName + ' ' + lastName + '\n' +
                'Email: ' + email + '\n' +
                'Check-in: ' + checkIn + '\n' +
                'Check-out: ' + checkOut + '\n' +
                'Room: ' + selectedRoom.value.toUpperCase() + '\n' +
                'Nights: ' + nights + '\n' +
                'Total: ₵' + totalPrice + '\n\n' +
                'Confirmation email will be sent to ' + email);
            
            bookingForm.reset();
        } else {
            alert('❌ BOOKING FAILED\n\n' +
                'Error: ' + result.error + '\n\n' +
                'Please try again or contact us at info@timasarahotel.com');
        }
    });
    
    console.log('✅ Booking form ready!');
});

console.log('✅ Tima Sara Hotel scripts loaded successfully!');