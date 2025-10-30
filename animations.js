// animations.js - GSAP ScrollTrigger Animations for Tima Sara Hotel

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ============================================
// HOMEPAGE ANIMATIONS
// ============================================

// Hero Title Animation - Fade in from below
gsap.from('.hero-title', {
    y: 100,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.3
});

// Hero Subtitle - Stagger after title
gsap.from('.hero-subtitle', {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.6
});

// Hero CTA Button - Pop in
gsap.from('.hero-cta-btn', {
    scale: 0.8,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.7)',
    delay: 0.9
});

// ============================================
// PARALLAX HERO EFFECT
// ============================================

// Hero image moves slower than scroll (parallax)
gsap.to('.hero-homepage', {
    backgroundPosition: '50% 100%',
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero-homepage',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});

// ============================================
// FEATURE CARDS - Staggered Reveal
// ============================================

// Home feature cards (rooms, dining, experiences)
gsap.from('.home-feature-card', {
    scrollTrigger: {
        trigger: '.home-features',
        start: 'top 80%',
        toggleActions: 'play none none none'
    },
    y: 100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2, // Each card animates 0.2s after previous
    ease: 'power3.out'
});

// ============================================
// ROOMS PAGE ANIMATIONS
// ============================================

// Room detail cards - Fade and slide
gsap.from('.room-detail-card', {
    scrollTrigger: {
        trigger: '.rooms-grid-page',
        start: 'top 75%'
    },
    x: -100,
    opacity: 0,
    duration: 1,
    stagger: 0.3,
    ease: 'power2.out'
});

// Alternate direction for even cards
gsap.utils.toArray('.room-detail-card:nth-child(even)').forEach(card => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%'
        },
        x: 100, // Come from right instead
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });
});

// ============================================
// EXPERIENCE CARDS ANIMATIONS
// ============================================

// Experience cards grid
gsap.from('.experience-card', {
    scrollTrigger: {
        trigger: '.experiences-grid',
        start: 'top 75%'
    },
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: 'back.out(1.5)'
});

// ============================================
// GALLERY ANIMATIONS
// ============================================

// Gallery items pop in
gsap.from('.gallery-item', {
    scrollTrigger: {
        trigger: '.gallery-grid',
        start: 'top 70%'
    },
    scale: 0,
    opacity: 0,
    duration: 0.5,
    stagger: 0.05,
    ease: 'back.out(1.7)'
});

// ============================================
// BOOKING FORM ANIMATIONS
// ============================================

// Form sections slide in
gsap.from('.form-section', {
    scrollTrigger: {
        trigger: '.booking-form-main',
        start: 'top 80%'
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out'
});

// Booking summary sidebar slides in from right
gsap.from('.booking-summary', {
    scrollTrigger: {
        trigger: '.booking-form-section',
        start: 'top 75%'
    },
    x: 100,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

// ============================================
// DINING PAGE ANIMATIONS
// ============================================

// Dining cards alternate slide directions
gsap.utils.toArray('.dining-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%'
        },
        x: index % 2 === 0 ? -100 : 100,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });
});

// ============================================
// CONTACT PAGE ANIMATIONS
// ============================================

// Contact cards float in
gsap.from('.contact-card', {
    scrollTrigger: {
        trigger: '.contact-cards',
        start: 'top 75%'
    },
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out'
});

// Contact form fade in
gsap.from('.contact-form', {
    scrollTrigger: {
        trigger: '.contact-form-section',
        start: 'top 80%'
    },
    opacity: 0,
    duration: 1,
    ease: 'power1.inOut'
});

// ============================================
// SCROLL INDICATORS & REVEALS
// ============================================

// Fade in scroll indicator on homepage
gsap.from('.scroll-indicator', {
    opacity: 0,
    y: -20,
    duration: 1,
    delay: 1.5,
    ease: 'power1.inOut'
});

// Continuous bounce animation for scroll indicator
gsap.to('.scroll-arrow', {
    y: 10,
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
});

// ============================================
// TEXT REVEAL ANIMATIONS
// ============================================

// Section headings slide up with mask effect
gsap.utils.toArray('h2').forEach(heading => {
    gsap.from(heading, {
        scrollTrigger: {
            trigger: heading,
            start: 'top 85%'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });
});

// ============================================
// NAVBAR ANIMATION ON SCROLL
// ============================================

// Shrink navbar on scroll
ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    toggleClass: {
        className: 'scrolled',
        targets: '.main-nav'
    }
});

console.log('✅ GSAP ScrollTrigger animations loaded!');