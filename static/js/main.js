/* ==========================================
   Tutorial.ai — Main JavaScript
   ========================================== */

'use strict';

// ===== NAVBAR SCROLL EFFECT =====
(function () {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    function handleScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run on load
})();

// ===== SCROLL-DRIVEN FADE-IN ANIMATIONS =====
(function () {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
        observer.observe(el);
    });
})();

// ===== SMOOTH ACTIVE NAV LINK HIGHLIGHT on SCROLL =====
(function () {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    navLinks.forEach(function (link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + entry.target.id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        },
        { threshold: 0.5 }
    );

    sections.forEach(function (s) { observer.observe(s); });
})();

// ===== HERO SEARCH FOCUS EFFECT =====
(function () {
    const form = document.querySelector('.hero-search-form input');
    if (!form) return;

    form.addEventListener('focus', function () {
        document.querySelector('.hero-search-wrap') &&
            document.querySelector('.hero-search-wrap').classList.add('focused');
    });

    form.addEventListener('blur', function () {
        document.querySelector('.hero-search-wrap') &&
            document.querySelector('.hero-search-wrap').classList.remove('focused');
    });
})();

// ===== COUNTER ANIMATION FOR HERO STATS =====
(function () {
    const stats = document.querySelectorAll('.stat-value');
    if (!stats.length) return;

    function animateCounter(el) {
        const raw = el.textContent.trim();
        const isPlus = raw.endsWith('+');
        const isFree = isNaN(parseInt(raw));
        if (isFree) return;

        const target = parseInt(raw.replace(/[^0-9]/g, ''));
        const suffix = isPlus ? '+' : '';
        const abbr = raw.replace(/[0-9+]/g, '');
        let current = 0;
        const duration = 1500;
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            current = Math.round(eased * target);
            el.textContent = current + abbr + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(function (stat) { observer.observe(stat); });
})();

// ===== SCROLL-REVEAL HERO TITLE =====
(function () {
    const title = document.querySelector('.scroll-reveal-text');
    if (!title) return;

    let scrollTarget = 0;
    let scrollCurrent = 0;

    window.addEventListener('scroll', function () {
        scrollTarget = window.scrollY;
    }, { passive: true });

    function lerp(a, b, t) { return a + (b - a) * t; }

    function updateTitle() {
        // Even smoother lerp for a "calm" feel (0.05 instead of 0.08)
        scrollCurrent = lerp(scrollCurrent, scrollTarget, 0.05);

        // Map scroll distance (e.g., 0 to 450px) to animation progress (0 to 1)
        const revealRange = 450;
        const progress = Math.min(scrollCurrent / revealRange, 1);

        // Smooth cubic-out easing for premium feel
        const eased = 1 - Math.pow(1 - progress, 3);

        // 1. Opacity: 0.1 -> 1.0
        title.style.opacity = 0.1 + (0.9 * eased);

        // 2. Transform: translateY(20px) -> 0
        const translateY = 20 * (1 - eased);
        title.style.transform = `translateY(${translateY}px)`;

        // 3. Left-to-Right Mask Sweep
        // We sweep from 0% to 115% to ensure the 15% gradient tail clears the text
        const maskProgress = eased * 115;
        title.style.setProperty('--reveal-progress', `${maskProgress}%`);

        requestAnimationFrame(updateTitle);
    }

    updateTitle();
})();

// ===== CARD TILT MICRO-INTERACTION =====
(function () {
    const cards = document.querySelectorAll('.card');

    cards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const intensity = 6;
            card.style.transform = 'translateY(-6px) rotateX(' + (-y * intensity) + 'deg) rotateY(' + (x * intensity) + 'deg)';
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });
})();

// ===== YOUTUBE VIDEO MODAL =====
(function () {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoModalIframe');
    const titleEl = document.getElementById('videoModalLabel');
    const chanEl = document.getElementById('videoModalChannel');
    const ytLink = document.getElementById('videoModalYTLink');

    if (!modal || !iframe) return;

    // When a video card is clicked — populate the modal
    document.addEventListener('click', function (e) {
        const card = e.target.closest('.video-card');
        if (!card) return;

        const videoId = card.dataset.videoId;
        const title = card.dataset.title;
        const channel = card.dataset.channel;
        const url = card.dataset.url;

        titleEl.textContent = title;
        chanEl.textContent = channel;
        ytLink.href = url;

        // Autoplay via YouTube embed URL
        iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
    });

    // Stop video playback when modal closes
    modal.addEventListener('hidden.bs.modal', function () {
        iframe.src = '';
    });
})();

