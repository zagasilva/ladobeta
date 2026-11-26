// === Lado Beta Podcast - Main JS ===

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initReveal();
    initNotifyForm();
});

// --- Navbar background once the page scrolls ---
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const update = () => navbar.classList.toggle('is-scrolled', window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });
}

// --- Mobile menu ---
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    const setOpen = (open) => {
        links.classList.toggle('is-open', open);
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setOpen(!links.classList.contains('is-open')));
    links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && links.classList.contains('is-open')) setOpen(false);
    });
}

// --- Scroll reveal with sibling stagger ---
function initReveal() {
    const items = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
    }

    // Stagger siblings that share a parent (lists, grids)
    items.forEach(el => {
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        const index = siblings.indexOf(el);
        if (index > 0) el.style.setProperty('--stagger', `${Math.min(index, 6) * 80}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => observer.observe(el));
}

// --- Season 2 notification form ---
function initNotifyForm() {
    const form = document.getElementById('notifyForm');
    const success = document.getElementById('notifySuccess');
    const error = document.getElementById('notifyError');
    const input = document.getElementById('emailInput');
    const submitBtn = form.querySelector('button[type="submit"]');

    const showError = (msg) => {
        error.textContent = msg;
        error.hidden = false;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        error.hidden = true;

        const email = input.value.trim();
        if (!email || !input.checkValidity()) {
            showError('Escreve um endereço de e-mail válido.');
            input.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'A enviar…';

        try {
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
                showError(data.message === 'invalid email'
                    ? 'Escreve um endereço de e-mail válido.'
                    : 'Não foi possível subscrever. Tenta novamente.');
            }
        } catch (err) {
            console.error('Subscribe error', err);
            showError('Erro de rede. Tenta novamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Avisar-me';
        }
    });
}
