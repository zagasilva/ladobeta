// === Lado Beta Podcast - Main JS ===

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initNotifyForm();
    initSmoothScroll();
});

// --- Navbar scroll effect ---
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        navbar.classList.toggle('scrolled', currentScroll > 50);
        lastScroll = currentScroll;
    }, { passive: true });
}

// --- Mobile menu toggle ---
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu on link click
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// --- Scroll-triggered fade-in animations ---
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.section-header, .section-text, .section-visual, ' +
        '.host-card, .topic-card, .platform-card, .notify-wrapper, ' +
        '.duality-item, .about-card'
    );

    elements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// --- Notification form ---
function initNotifyForm() {
    const form = document.getElementById('notifyForm');
    const success = document.getElementById('notifySuccess');
    console.debug('initNotifyForm: form=', form, 'success=', success);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('emailInput');
        const email = input.value.trim();
        console.debug('notifyForm submit handler fired, email=', email);
        if (!email) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'A enviar...';

        try {
            console.debug('sending POST to /api/subscribe', { email });
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data.ok) {
                form.hidden = true;
                success.hidden = false;
            } else {
                const message = data && data.message ? data.message : 'Erro ao subscrever. Tente novamente.';
                alert(message);
            }
        } catch (err) {
            console.error('Subscribe error', err);
            alert('Erro de rede. Tente novamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Avisar-me';
        }
    });
}

// --- Smooth scroll for anchor links ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}
