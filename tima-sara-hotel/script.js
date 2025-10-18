// Get the button element
const bookBtn = document.getElementById ('bookBtn');

// Add a click event listener
bookBtn.addEventListener ('click', function() {
    alert('Thank you for your interest! Please call us at 233 54 039 4553 to complete your bookong');
});

// Photo Gallery Toggle
const galleryBtn = document.getElementById('galleryBtn');
const photoGallery = document.getElementById('photoGallery');

galleryBtn.addEventListener('click', function() {
// Check if gallery is hidden
if (photoGallery.style.display === 'none') {
    // Show it
    photoGallery.style.display = 'block';
    galleryBtn.textContent = 'Hide Photos';
} else {
    // Hide it
    photoGallery.style.display = 'none';
    galleryBtn.textContent = 'View Hotel Photos';
}
});

// Smooth scrolling for navigation links
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault (); //Stop the default jump

        // Get the target section
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        // Smooth scroll to it
        targetSection.scrollIntoView ({
            behavior: 'smooth',
            block: 'start'
        })
    })
})

// Check Availability Button - with safety check
const checkAvailBtn = document.getElementById('checkAvailBtn');
const availResult = document.getElementById('availResult');

if (checkAvailBtn && availResult) {
    checkAvailBtn.addEventListener('click', function() {
        const checkIn = document.getElementById('checkIn').value;
        const checkOut = document.getElementById('checkOut').value;
        const roomType = document.getElementById('roomType').value;
        
        // Validate dates are selected
        if (!checkIn || !checkOut) {
            availResult.textContent = 'Please select both check-in and check-out dates.';
            availResult.className = 'unavailable';
            return;
        }
        
        // Check if check-out is after check-in
        if (new Date(checkOut) <= new Date(checkIn)) {
            availResult.textContent = 'Check-out date must be after check-in date.';
            availResult.className = 'unavailable';
            return;
        }
        
        // Calculate number of nights
        const oneDay = 24 * 60 * 60 * 1000;
        const nights = Math.round((new Date(checkOut) - new Date(checkIn)) / oneDay);
        
        // Show availability (for now, always available - you can enhance this later!)
        availResult.textContent = `Great! ${roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room is available for ${nights} night(s). Call us to confirm your booking!`;
        availResult.className = 'available';
    });
}

// Display current date
const currentDate = document.getElementById('currentDate');
if (currentDate) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = 'Today is ' + today.toLocaleDateString('en-US', options);
}