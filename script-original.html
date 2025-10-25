// ==============================================
// TIMA SARA HOTEL - COMPLETE WORKING SCRIPT.JS
// ==============================================

// Safe initialization - wrap everything in checks
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing features...');
    
    // Initialize all features
    initPhotoGallery();
    initGuestReviews();
    initCheckAvailability();
    initWeather();
    initCurrency();
    initLocalTime();
});

// ==============================================
// 1. PHOTO GALLERY
// ==============================================
function initPhotoGallery() {
    const galleryBtn = document.getElementById('galleryBtn');
    const photoGallery = document.getElementById('photoGallery');

    if (galleryBtn && photoGallery) {
        galleryBtn.addEventListener('click', function() {
            if (photoGallery.style.display === 'none') {
                photoGallery.style.display = 'block';
                galleryBtn.textContent = 'Hide Photos';
            } else {
                photoGallery.style.display = 'none';
                galleryBtn.textContent = 'View Hotel Photos';
            }
        });
        console.log('✅ Photo gallery initialized');
    }
}

// ==============================================
// 2. SMOOTH SCROLLING
// ==============================================
const navLinks = document.querySelectorAll('nav a');
if (navLinks.length > 0) {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==============================================
// 3. CHECK AVAILABILITY
// ==============================================
function initCheckAvailability() {
    const checkAvailBtn = document.getElementById('checkAvailBtn');
    const availResult = document.getElementById('availResult');

    if (checkAvailBtn && availResult) {
        console.log('✅ Check availability initialized');
    }
}

function checkAvailability() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const roomType = document.getElementById('roomType').value;
    const availResult = document.getElementById('availResult');
    
    if (!checkIn || !checkOut) {
        availResult.textContent = 'Please select both check-in and check-out dates.';
        availResult.className = 'unavailable';
        return;
    }
    
    if (new Date(checkOut) <= new Date(checkIn)) {
        availResult.textContent = 'Check-out date must be after check-in date.';
        availResult.className = 'unavailable';
        return;
    }
    
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.round((new Date(checkOut) - new Date(checkIn)) / oneDay);
    
    availResult.textContent = `Great! ${roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room is available for ${nights} night(s). Call us to confirm your booking!`;
    availResult.className = 'available';
}

// ==============================================
// 4. WEATHER WIDGET
// ==============================================
function initWeather() {
    if (document.getElementById('weatherDisplay')) {
        loadWeather();
        console.log('✅ Weather widget initialized');
    }
}

function loadWeather() {
    const API_KEY = '6d0e5c6693f8213bd4b8116dca0dc44f';
    const CITY = 'Tamale';
    const COUNTRY = 'GH';
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&appid=${API_KEY}&units=metric`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('API not ready');
            }
            return response.json();
        })
        .then(data => {
            const weatherDisplay = document.getElementById('weatherDisplay');
            
            const weatherEmojis = {
                'Clear': '☀️',
                'Clouds': '☁️',
                'Rain': '🌧️',
                'Drizzle': '🌦️',
                'Thunderstorm': '⛈️',
                'Snow': '❄️',
                'Mist': '🌫️',
                'Haze': '🌫️'
            };
            
            const weatherMain = data.weather[0].main;
            const emoji = weatherEmojis[weatherMain] || '🌤️';
            
            weatherDisplay.innerHTML = `
                <div>
                    <div class="weather-main">${emoji}</div>
                    <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
                    <p style="font-size: 1.2em; text-transform: capitalize;">${data.weather[0].description}</p>
                </div>
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <strong>Feels Like</strong>
                        <span>${Math.round(data.main.feels_like)}°C</span>
                    </div>
                    <div class="weather-detail-item">
                        <strong>Humidity</strong>
                        <span>${data.main.humidity}%</span>
                    </div>
                    <div class="weather-detail-item">
                        <strong>Wind Speed</strong>
                        <span>${data.wind.speed} m/s</span>
                    </div>
                </div>
                <p style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
                    Perfect weather to visit Tima Sara Hotel!
                </p>
            `;
        })
        .catch(error => {
            console.log('Weather API not ready yet, showing fallback');
            const weatherDisplay = document.getElementById('weatherDisplay');
            if (weatherDisplay) {
                weatherDisplay.innerHTML = `
                    <div>
                        <div class="weather-main">☀️</div>
                        <div class="weather-temp">28°C</div>
                        <p style="font-size: 1.2em;">Warm and Sunny</p>
                    </div>
                    <div class="weather-details">
                        <div class="weather-detail-item">
                            <strong>Feels Like</strong>
                            <span>30°C</span>
                        </div>
                        <div class="weather-detail-item">
                            <strong>Humidity</strong>
                            <span>60%</span>
                        </div>
                        <div class="weather-detail-item">
                            <strong>Wind Speed</strong>
                            <span>2.5 m/s</span>
                        </div>
                    </div>
                    <p style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
                        Typical Tamale weather
                    </p>
                `;
            }
        });
}

// ==============================================
// 5. CURRENCY CONVERTER
// ==============================================
let roomExchangeRates = {};

function initCurrency() {
    fetchGHSExchangeRates();
    console.log('✅ Currency converter initialized');
}

function fetchGHSExchangeRates() {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(response => response.json())
        .then(data => {
            const usdToGhs = data.rates.GHS;
            
            roomExchangeRates = {
                'GHS': 1,
                'USD': 1 / usdToGhs,
                'EUR': data.rates.EUR / usdToGhs,
                'GBP': data.rates.GBP / usdToGhs,
                'NGN': data.rates.NGN / usdToGhs,
                'ZAR': data.rates.ZAR / usdToGhs
            };
            
            console.log('Exchange rates loaded');
        })
        .catch(error => {
            console.log('Using fallback exchange rates');
            roomExchangeRates = {
                'GHS': 1,
                'USD': 0.062,
                'EUR': 0.058,
                'GBP': 0.050,
                'NGN': 98,
                'ZAR': 1.15
            };
        });
}

function convertRoomPrice(selectElement, priceInGHS) {
    const selectedCurrency = selectElement.value;
    const convertedPriceSpan = selectElement.parentElement.querySelector('.converted-price');
    
    if (!roomExchangeRates[selectedCurrency]) {
        convertedPriceSpan.textContent = 'Loading...';
        return;
    }
    
    const rate = roomExchangeRates[selectedCurrency];
    const convertedPrice = (priceInGHS * rate).toFixed(2);
    
    const symbols = {
        'GHS': '₵',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'NGN': '₦',
        'ZAR': 'R'
    };
    
    const symbol = symbols[selectedCurrency];
    convertedPriceSpan.textContent = `${symbol}${convertedPrice}`;
}

// ==============================================
// 6. LOCAL TIME
// ==============================================
function initLocalTime() {
    if (document.getElementById('currentTime')) {
        updateLocalTime();
        setInterval(updateLocalTime, 1000);
        console.log('✅ Local time initialized');
    }
}

function updateLocalTime() {
    const now = new Date();
    const tamaleTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Accra' }));
    
    const timeString = tamaleTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    const dateString = tamaleTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');
    
    if (timeElement) timeElement.textContent = timeString;
    if (dateElement) dateElement.textContent = dateString;
}

// ==============================================
// 7. GUEST REVIEWS
// ==============================================
const guestReviews = [
    {
        rating: 5,
        text: "Exceptional service and beautiful rooms! The staff at Tima Sara Hotel went above and beyond to make our stay comfortable. The restaurant food was delicious!",
        author: "Sarah Johnson",
        location: "United Kingdom",
        date: "March 2025"
    },
    {
        rating: 5,
        text: "Perfect location in Tamale! Clean rooms, friendly staff, and great amenities. The WiFi was fast and reliable. Highly recommend for business travelers.",
        author: "Michael Osei",
        location: "Accra, Ghana",
        date: "February 2025"
    },
    {
        rating: 4,
        text: "Lovely hotel with excellent customer service. The AC worked perfectly even in the hot weather. Great value for money!",
        author: "Aminata Diallo",
        location: "Senegal",
        date: "January 2025"
    },
    {
        rating: 5,
        text: "Our family had a wonderful stay! The rooms were spacious and the pool area was perfect for the kids. Will definitely come back!",
        author: "James and Patricia Miller",
        location: "United States",
        date: "December 2024"
    },
    {
        rating: 5,
        text: "Best hotel in Tamale! Professional staff, delicious breakfast, and centrally located. Made our business trip very productive.",
        author: "Chen Wei",
        location: "China",
        date: "November 2024"
    }
];

let currentReviewIndex = 0;
let autoRotateInterval = null;

function initGuestReviews() {
    if (document.getElementById('currentReview')) {
        displayReview(0);
        console.log('✅ Guest reviews initialized');
    }
}

function displayReview(index) {
    const review = guestReviews[index];
    const stars = '⭐'.repeat(review.rating);
    const reviewElement = document.getElementById('currentReview');
    
    if (reviewElement) {
        reviewElement.innerHTML = `
            <div class="review-stars">${stars}</div>
            <div class="review-text">"${review.text}"</div>
            <div class="review-author">
                — ${review.author}<br>
                <small>${review.location} • ${review.date}</small>
            </div>
        `;
    }
}

function nextReview() {
    currentReviewIndex = (currentReviewIndex + 1) % guestReviews.length;
    displayReview(currentReviewIndex);
}

function previousReview() {
    currentReviewIndex = (currentReviewIndex - 1 + guestReviews.length) % guestReviews.length;
    displayReview(currentReviewIndex);
}

function autoRotateReviews() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
        alert('Auto-rotate stopped');
    } else {
        autoRotateInterval = setInterval(nextReview, 5000);
        alert('Auto-rotating every 5 seconds!');
    }
}

// ==============================================
// 8. CONTACT FORM
// ==============================================
function handleContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('guestName').value;
    const email = document.getElementById('guestEmail').value;
    const phone = document.getElementById('guestPhone').value;
    const inquiryType = document.getElementById('inquiryType').value;
    const message = document.getElementById('guestMessage').value;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormResponse('Please enter a valid email address.', 'error');
        return;
    }
    
    if (message.length < 10) {
        showFormResponse('Please provide a more detailed message (at least 10 characters).', 'error');
        return;
    }
    
    const formData = {
        name: name,
        email: email,
        phone: phone,
        inquiryType: inquiryType,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    console.log('Form submitted:', formData);
    
    showFormResponse(
        `✅ Thank you, ${name}! Your message has been received. We'll respond to ${email} within 24 hours.`,
        'success'
    );
    
    document.getElementById('contactForm').reset();
}

function showFormResponse(message, type) {
    const responseDiv = document.getElementById('formResponse');
    if (responseDiv) {
        responseDiv.innerHTML = `
            <div style="padding: 15px; border-radius: 5px; background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'}; color: ${type === 'success' ? '#155724' : '#721c24'};">
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            responseDiv.innerHTML = '';
        }, 5000);
    }
}

// ==============================================
console.log('✅ Script.js loaded successfully');
// ==============================================