const API_BASE = window.location.origin;

async function loadData() {
    try {
        const res = await fetch(`${API_BASE}/api/data`);
        if (!res.ok) throw new Error('Network error');
        return await res.json();
    } catch {
        return getDefaultData();
    }
}

function getDefaultData() {
    return {
        services: [
            { id: 1, name: 'Классическое наращивание', description: 'Одна ресничка на одну натуральную — естественный и элегантный образ', price: '1500 сом', duration: '1.5-2 ч', icon: 'fas fa-eye' },
            { id: 2, name: '2D наращивание', description: 'Два волоска на одну ресницу — выразительный взгляд на каждый день', price: '2000 сом', duration: '2-2.5 ч', icon: 'fas fa-star' },
            { id: 3, name: '3D наращивание', description: 'Три волоска для максимально пышных и объёмных ресниц', price: '2500 сом', duration: '2.5-3 ч', icon: 'fas fa-gem' },
            { id: 4, name: 'Голливудский объём', description: 'Роскошный объём для самых смелых — 4-6 волосков на ресницу', price: '3000 сом', duration: '3-3.5 ч', icon: 'fas fa-crown' },
            { id: 5, name: 'Ламинирование ресниц', description: 'Питание, завивка и окрашивание ваших натуральных ресниц', price: '1200 сом', duration: '1-1.5 ч', icon: 'fas fa-magic' },
            { id: 6, name: 'Коррекция', description: 'Восстановление идеальной формы через 2-3 недели после наращивания', price: '1000 сом', duration: '1-1.5 ч', icon: 'fas fa-sync-alt' }
        ],
        works: [
            { id: 1, image: '/works/photo_1_2026-04-16_20-41-30.jpg', title: 'Классика', description: 'Натуральный эффект' },
            { id: 2, image: '/works/photo_2_2026-04-16_20-41-30.jpg', title: '2D объём', description: 'Выразительный взгляд' },
            { id: 3, image: '/works/photo_3_2026-04-16_20-41-30.jpg', title: '3D объём', description: 'Пышные ресницы' },
            { id: 4, image: '/works/photo_4_2026-04-16_20-41-30.jpg', title: 'Hollywood', description: 'Максимальный объём' },
            { id: 5, image: '/works/photo_5_2026-04-16_20-41-30.jpg', title: 'Ламинирование', description: 'Натуральная красота' },
            { id: 6, image: '/works/photo_6_2026-04-16_20-41-30.jpg', title: 'Лисий эффект', description: 'Удлинение к внешнему краю' },
            { id: 7, image: '/works/photo_7_2026-04-16_20-41-30.jpg', title: 'Кукольный эффект', description: 'Максимум по центру' },
            { id: 8, image: '/works/photo_8_2026-04-16_20-41-30.jpg', title: 'Мокрый эффект', description: 'Стильный тренд' }
        ],
        reviews: [
            { id: 1, name: 'Айгуль', rating: 5, text: 'Валерия — настоящий профессионал! Ресницы держатся 3 недели, как новые. Очень довольна результатом!', date: '2026-03-20', approved: true },
            { id: 2, name: 'Динара', rating: 5, text: 'Уже год хожу только к Валерии. Всегда очень аккуратная работа, ни один глаз не щиплет. Рекомендую!', date: '2026-03-15', approved: true },
            { id: 3, name: 'Мария', rating: 5, text: 'Делала 2D объём перед свадьбой. Все подружки были в восторге! Спасибо огромное за волшебный взгляд ✨', date: '2026-02-28', approved: true },
            { id: 4, name: 'Камила', rating: 4, text: 'Очень уютная атмосфера, приятная в общении мастер. Ресницы выглядят потрясающе, буду приходить ещё!', date: '2026-02-10', approved: true }
        ]
    };
}


function renderServices(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = services.map(s => `
        <div class="service-card reveal">
            <div class="service-icon"><i class="${sanitize(s.icon)}"></i></div>
            <h3>${sanitize(s.name)}</h3>
            <p>${sanitize(s.description)}</p>
            <div class="service-details">
                <span class="service-price">${sanitize(s.price)}</span>
                <span class="service-duration"><i class="fas fa-clock"></i> ${sanitize(s.duration)}</span>
            </div>
        </div>
    `).join('');

    const select = document.getElementById('bookingService');
    if (select) {
        select.innerHTML = '<option value="">Выберите услугу</option>' +
            services.map(s => `<option value="${sanitize(s.name)}">${sanitize(s.name)} — ${sanitize(s.price)}</option>`).join('');
    }

    initRevealAnimations();
}

function renderWorks(works) {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    grid.innerHTML = works.map((w, i) => `
        <div class="portfolio-item reveal" data-index="${i}">
            <img src="${sanitize(w.image)}" alt="${sanitize(w.title)}" loading="lazy">
            <div class="portfolio-overlay">
                <div class="zoom-icon"><i class="fas fa-search-plus"></i></div>
                <h4>${sanitize(w.title)}</h4>
                <p>${sanitize(w.description)}</p>
            </div>
        </div>
    `).join('');

    initLightbox(works);
    initRevealAnimations();
}

function renderReviews(reviews) {
    const list = document.getElementById('reviewsList');
    if (!list) return;
    const approved = reviews.filter(r => r.approved);
    if (approved.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;">Пока нет отзывов. Будьте первым!</p>';
        return;
    }
    list.innerHTML = approved.map(r => `
        <div class="review-card reveal">
            <div class="review-header">
                <div class="review-avatar">${sanitize(r.name.charAt(0))}</div>
                <div>
                    <div class="review-name">${sanitize(r.name)}</div>
                    <div class="review-date">${formatDate(r.date)}</div>
                </div>
            </div>
            <div class="review-stars">${renderStars(r.rating)}</div>
            <div class="review-text">${sanitize(r.text)}</div>
        </div>
    `).join('');

    initRevealAnimations();
}

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) =>
        `<i class="fas fa-star${i < rating ? '' : '" style="color:#ddd'}"></i>`
    ).join('');
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function sanitize(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('active');
    });

    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('active');
        });
    });
}

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'hero-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.animationDuration = (4 + Math.random() * 4) + 's';
        p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
        container.appendChild(p);
    }
}


let lightboxIndex = 0;
let lightboxWorks = [];

function initLightbox(works) {
    lightboxWorks = works;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');

    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', () => {
            lightboxIndex = parseInt(item.dataset.index);
            showLightbox();
        });
    });

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

function showLightbox() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    const w = lightboxWorks[lightboxIndex];

    img.src = w.image;
    img.alt = w.title;
    caption.textContent = `${w.title} — ${w.description}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxWorks.length) % lightboxWorks.length;
    showLightbox();
}

function initStarRating() {
    const container = document.getElementById('starRating');
    const input = document.getElementById('reviewRating');
    if (!container || !input) return;

    const stars = container.querySelectorAll('i');

    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => s.classList.toggle('active', i < rating));
        });

        star.addEventListener('click', () => {
            input.value = star.dataset.rating;
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => s.classList.toggle('active', i < rating));
        });
    });

    container.addEventListener('mouseleave', () => {
        const val = parseInt(input.value) || 0;
        stars.forEach((s, i) => s.classList.toggle('active', i < val));
    });
}

function initReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('reviewName').value.trim();
        const rating = parseInt(document.getElementById('reviewRating').value);
        const text = document.getElementById('reviewText').value.trim();

        if (!name || !text) {
            showToast('Заполните все обязательные поля', 'error');
            return;
        }
        if (rating < 1) {
            showToast('Пожалуйста, выберите оценку', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, rating, text })
            });
            if (res.ok) {
                showToast('Спасибо! Ваш отзыв отправлен на модерацию ✨', 'success');
                form.reset();
                document.getElementById('reviewRating').value = '0';
                document.querySelectorAll('#starRating i').forEach(s => s.classList.remove('active'));
            } else {
                throw new Error();
            }
        } catch {
            showToast('Ошибка отправки. Попробуйте позже.', 'error');
        }
    });
}

function initBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('bookingName').value.trim();
        const phone = document.getElementById('bookingPhone').value.trim();
        const service = document.getElementById('bookingService').value;
        const date = document.getElementById('bookingDate').value;
        const message = document.getElementById('bookingMessage').value.trim();

        if (!name || !phone) {
            showToast('Заполните имя и телефон', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, service, date, message })
            });
            if (res.ok) {
                showToast('Заявка отправлена! Я свяжусь с вами в ближайшее время 💕', 'success');
                form.reset();
            } else {
                throw new Error();
            }
        } catch {
            showToast('Ошибка. Позвоните по телефону +996 558 345 484', 'error');
        }
    });
}

function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal:not(.visible)');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => observer.observe(el));
}

function initScrollTop() {
    const btn = document.getElementById('scrollTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 500);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i></span>
        <span class="toast-message">${sanitize(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

document.addEventListener('DOMContentLoaded', async () => {
    initNavbar();
    initParticles();
    initCounters();
    initStarRating();
    initReviewForm();
    initBookingForm();
    initScrollTop();

    const data = await loadData();
    renderServices(data.services);
    renderWorks(data.works);
    renderReviews(data.reviews);
    applyProfilePhoto(data.profilePhoto);
});

function applyProfilePhoto(photo) {
    const img = document.getElementById('aboutPhotoBg');
    if (!img || !photo) return;
    img.src = photo;
    img.style.display = 'block';
}