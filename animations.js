// animations.js - Smooth scroll animations for Tima Sara Hotel

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ==================================
// FADE IN ON SCROLL - Room Cards, Dining Cards, Experience Cards
// ==================================
gsap.utils.toArray('.room-detail-card, .experience-card, .dining-card').forEach(card => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',      // Start animation when card is 85% down viewport
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 60,                     // Slide up from 60px below
        duration: 0.8,
        ease: 'power2.out'
    });
});

// ==================================
// STAGGERED GALLERY ANIMATIONS
// ==================================
if (document.querySelector('.gallery-grid')) {
    gsap.from('.gallery-item', {
        scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 75%'
        },
        opacity: 0,
        y: 40,
        stagger: 0.08,              // 0.08 second delay between each item
        duration: 0.6,
        ease: 'power2.out'
    });
}

// ==================================
// FADE IN FEATURE CARDS (Homepage)
// ==================================
gsap.utils.toArray('.home-feature-card').forEach(card => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out'
    });
});

// ==================================
// HERO PARALLAX EFFECT (Subtle background movement)
// ==================================
if (document.querySelector('.hero-homepage')) {
    gsap.to('.hero-homepage', {
        scrollTrigger: {
            trigger: '.hero-homepage',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5               // Smooth scrubbing effect
        },
        backgroundPositionY: '30%',
        ease: 'none'
    });
}

// ==================================
// PAGE HERO PARALLAX (Internal pages)
// ==================================
if (document.querySelector('.page-hero')) {
    gsap.to('.page-hero', {
        scrollTrigger: {
            trigger: '.page-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        backgroundPositionY: '50%',
        ease: 'none'
    });
}

// ==================================
// CONTACT CARDS ANIMATION
// ==================================
gsap.utils.toArray('.contact-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%'
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        delay: index * 0.15,        // Cascade effect
        ease: 'power2.out'
    });
});

// ==================================
// SECTION HEADINGS FADE IN
// ==================================
gsap.utils.toArray('.rooms-intro, .dining-intro, .experiences-intro, .gallery-intro').forEach(intro => {
    gsap.from(intro, {
        scrollTrigger: {
            trigger: intro,
            start: 'top 80%'
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power2.out'
    });
});

// ==================================
// BOOKING SUMMARY STICKY ANIMATION
// ==================================
if (document.querySelector('.booking-summary')) {
    gsap.from('.booking-summary', {
        scrollTrigger: {
            trigger: '.booking-summary',
            start: 'top 80%'
        },
        opacity: 0,
        x: 50,                      // Slide in from right
        duration: 0.9,
        ease: 'power3.out'
    });
}

// ==================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ==================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            gsap.to(window, {
                duration: 1,
                scrollTo: {
                    y: target,
                    offsetY: 80        // Offset for fixed nav
                },
                ease: 'power2.inOut'
            });
        }
    });
});

console.log('🎨 GSAP Animations loaded successfully!');