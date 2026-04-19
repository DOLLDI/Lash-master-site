const API = window.location.origin;
let authToken = '';
let appData = null;

function checkAuth() {
    authToken = sessionStorage.getItem('admin_token') || '';
    if (authToken) {
        showAdmin();
        loadAllData();
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
            const data = await res.json();
            authToken = data.token;
            sessionStorage.setItem('admin_token', authToken);
            showAdmin();
            loadAllData();
        } else {
            showToast('Неверный пароль', 'error');
        }
    } catch {
        showToast('Ошибка подключения к серверу', 'error');
    }
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('admin_token');
    authToken = '';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginScreen').style.display = '';
    document.getElementById('loginPassword').value = '';
});

function showAdmin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        if (!tab) return;

        document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        document.getElementById('pageTitle').textContent = item.textContent.trim();

        document.getElementById('sidebar').classList.remove('open');
    });
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

async function loadAllData() {
    try {
        const res = await fetch(`${API}/api/admin/data`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.status === 401) {
            sessionStorage.removeItem('admin_token');
            location.reload();
            return;
        }
        appData = await res.json();
        renderDashboard();
        renderAdminServices();
        renderAdminWorks();
        renderAdminReviews();
        renderAdminBookings();
    } catch {
        showToast('Ошибка загрузки данных', 'error');
    }
}

function renderDashboard() {
    document.getElementById('statServices').textContent = appData.services.length;
    document.getElementById('statWorks').textContent = appData.works.length;
    document.getElementById('statReviews').textContent = appData.reviews.length;
    document.getElementById('statBookings').textContent = (appData.bookings || []).length;

    const preview = document.getElementById('profilePhotoPreview');
    if (appData.profilePhoto) {
        preview.innerHTML = `<img src="${esc(appData.profilePhoto)}" alt="Профиль">`;
    }

    const recentBookings = document.getElementById('recentBookings');
    const bookings = (appData.bookings || []).slice(-5).reverse();
    if (bookings.length === 0) {
        recentBookings.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Нет заявок</p></div>';
    } else {
        recentBookings.innerHTML = bookings.map(b => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <strong>${esc(b.name)}</strong>
                    <span style="color:#999">${esc(b.phone)}</span>
                </div>
                <span class="badge badge-new">${esc(b.service || 'Не указана')}</span>
            </div>
        `).join('');
    }

    const pendingReviews = document.getElementById('pendingReviews');
    const pending = appData.reviews.filter(r => !r.approved);
    if (pending.length === 0) {
        pendingReviews.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>Все отзывы обработаны</p></div>';
    } else {
        pendingReviews.innerHTML = pending.map(r => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <strong>${esc(r.name)}</strong>
                    <span style="color:#ffc107">${'★'.repeat(r.rating)}</span>
                    <span style="color:#999;font-size:0.8rem">${esc(r.text).substring(0, 50)}...</span>
                </div>
                <span class="badge badge-pending">На модерации</span>
            </div>
        `).join('');
    }
}

function renderAdminServices() {
    const list = document.getElementById('servicesList');
    if (appData.services.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-concierge-bell"></i><p>Нет услуг</p></div>';
        return;
    }
    list.innerHTML = appData.services.map(s => `
        <div class="item-card">
            <div class="item-info">
                <h4><i class="${esc(s.icon)}" style="color:var(--primary);margin-right:8px"></i>${esc(s.name)}</h4>
                <p>${esc(s.description)}</p>
                <div class="item-meta">
                    <span><i class="fas fa-tag"></i> ${esc(s.price)}</span>
                    <span><i class="fas fa-clock"></i> ${esc(s.duration)}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-outline btn-sm" onclick="editService(${s.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteService(${s.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

document.getElementById('addServiceBtn').addEventListener('click', () => {
    openServiceModal();
});

function openServiceModal(service = null) {
    const title = service ? 'Редактировать услугу' : 'Добавить услугу';
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = `
        <form id="serviceForm">
            <div class="form-group">
                <label>Название</label>
                <input type="text" id="svcName" value="${esc(service?.name || '')}" required maxlength="100">
            </div>
            <div class="form-group">
                <label>Описание</label>
                <textarea id="svcDesc" rows="3" maxlength="300">${esc(service?.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label>Цена</label>
                <input type="text" id="svcPrice" value="${esc(service?.price || '')}" required placeholder="1500 сом">
            </div>
            <div class="form-group">
                <label>Длительность</label>
                <input type="text" id="svcDuration" value="${esc(service?.duration || '')}" placeholder="1.5-2 ч">
            </div>
            <div class="form-group">
                <label>Иконка (Font Awesome класс)</label>
                <input type="text" id="svcIcon" value="${esc(service?.icon || 'fas fa-eye')}" placeholder="fas fa-eye">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">${service ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </form>
    `;
    openModal();

    document.getElementById('serviceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            name: document.getElementById('svcName').value.trim(),
            description: document.getElementById('svcDesc').value.trim(),
            price: document.getElementById('svcPrice').value.trim(),
            duration: document.getElementById('svcDuration').value.trim(),
            icon: document.getElementById('svcIcon').value.trim()
        };

        try {
            const url = service ? `${API}/api/admin/services/${service.id}` : `${API}/api/admin/services`;
            const method = service ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
            if (res.ok) {
                showToast(service ? 'Услуга обновлена' : 'Услуга добавлена', 'success');
                closeModal();
                loadAllData();
            } else {
                throw new Error();
            }
        } catch {
            showToast('Ошибка сохранения', 'error');
        }
    });
}

function editService(id) {
    const service = appData.services.find(s => s.id === id);
    if (service) openServiceModal(service);
}

async function deleteService(id) {
    if (!confirm('Удалить эту услугу?')) return;
    try {
        await fetch(`${API}/api/admin/services/${id}`, { method: 'DELETE', headers: authHeaders() });
        showToast('Услуга удалена', 'success');
        loadAllData();
    } catch {
        showToast('Ошибка удаления', 'error');
    }
}

function renderAdminWorks() {
    const list = document.getElementById('worksList');
    if (appData.works.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><p>Нет работ</p></div>';
        return;
    }
    list.innerHTML = appData.works.map(w => `
        <div class="work-card">
            <div class="work-card-img">
                <img src="${esc(w.image)}" alt="${esc(w.title)}" loading="lazy">
            </div>
            <div class="work-card-body">
                <h4>${esc(w.title)}</h4>
                <p>${esc(w.description)}</p>
                <div class="work-card-actions">
                    <button class="btn btn-outline btn-sm" onclick="editWork(${w.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWork(${w.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

document.getElementById('addWorkBtn').addEventListener('click', () => {
    openWorkModal();
});

function openWorkModal(work = null) {
    const title = work ? 'Редактировать работу' : 'Добавить работу';
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = `
        <form id="workForm" enctype="multipart/form-data">
            <div class="form-group">
                <label>Фото</label>
                <div class="file-upload" id="fileUpload">
                    <input type="file" id="workFile" accept="image/*" ${work ? '' : 'required'}>
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Нажмите или перетащите фото</p>
                    <div class="file-preview" id="filePreview">
                        ${work ? `<img src="${esc(work.image)}" alt="">` : ''}
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Название</label>
                <input type="text" id="workTitle" value="${esc(work?.title || '')}" required maxlength="100">
            </div>
            <div class="form-group">
                <label>Описание</label>
                <input type="text" id="workDesc" value="${esc(work?.description || '')}" maxlength="200">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">${work ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </form>
    `;
    openModal();

    document.getElementById('workFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('filePreview').innerHTML = `<img src="${ev.target.result}" alt="">`;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('workForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const file = document.getElementById('workFile').files[0];
        if (file) formData.append('photo', file);
        formData.append('title', document.getElementById('workTitle').value.trim());
        formData.append('description', document.getElementById('workDesc').value.trim());

        try {
            const url = work ? `${API}/api/admin/works/${work.id}` : `${API}/api/admin/works`;
            const method = work ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });
            if (res.ok) {
                showToast(work ? 'Работа обновлена' : 'Работа добавлена', 'success');
                closeModal();
                loadAllData();
            } else {
                throw new Error();
            }
        } catch {
            showToast('Ошибка сохранения', 'error');
        }
    });
}

function editWork(id) {
    const work = appData.works.find(w => w.id === id);
    if (work) openWorkModal(work);
}

async function deleteWork(id) {
    if (!confirm('Удалить эту работу?')) return;
    try {
        await fetch(`${API}/api/admin/works/${id}`, { method: 'DELETE', headers: authHeaders() });
        showToast('Работа удалена', 'success');
        loadAllData();
    } catch {
        showToast('Ошибка удаления', 'error');
    }
}

let reviewFilter = 'all';

function renderAdminReviews() {
    const list = document.getElementById('reviewsAdminList');
    let reviews = appData.reviews;

    if (reviewFilter === 'pending') reviews = reviews.filter(r => !r.approved);
    if (reviewFilter === 'approved') reviews = reviews.filter(r => r.approved);

    if (reviews.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>Нет отзывов</p></div>';
        return;
    }

    list.innerHTML = reviews.map(r => `
        <div class="review-admin-card">
            <div class="review-body">
                <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px">
                    <span class="review-name">${esc(r.name)}</span>
                    <span class="badge ${r.approved ? 'badge-approved' : 'badge-pending'}">${r.approved ? 'Одобрен' : 'На модерации'}</span>
                </div>
                <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                <div class="review-text">${esc(r.text)}</div>
                <div class="review-date">${r.date}</div>
            </div>
            <div class="item-actions" style="flex-direction:column">
                ${!r.approved ? `<button class="btn btn-success btn-sm" onclick="approveReview(${r.id})"><i class="fas fa-check"></i></button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteReview(${r.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        reviewFilter = btn.dataset.filter;
        renderAdminReviews();
    });
});

async function approveReview(id) {
    try {
        await fetch(`${API}/api/admin/reviews/${id}/approve`, {
            method: 'PUT',
            headers: authHeaders()
        });
        showToast('Отзыв одобрен', 'success');
        loadAllData();
    } catch {
        showToast('Ошибка', 'error');
    }
}

async function deleteReview(id) {
    if (!confirm('Удалить этот отзыв?')) return;
    try {
        await fetch(`${API}/api/admin/reviews/${id}`, { method: 'DELETE', headers: authHeaders() });
        showToast('Отзыв удалён', 'success');
        loadAllData();
    } catch {
        showToast('Ошибка', 'error');
    }
}

function renderAdminBookings() {
    const list = document.getElementById('bookingsList');
    const bookings = (appData.bookings || []).slice().reverse();

    if (bookings.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>Нет заявок</p></div>';
        return;
    }

    list.innerHTML = bookings.map(b => `
        <div class="booking-admin-card">
            <h4><i class="fas fa-user" style="color:var(--primary);margin-right:6px"></i>${esc(b.name)}</h4>
            <div class="booking-details">
                <span><i class="fas fa-phone"></i> ${esc(b.phone)}</span>
                ${b.service ? `<span><i class="fas fa-concierge-bell"></i> ${esc(b.service)}</span>` : ''}
                ${b.date ? `<span><i class="fas fa-calendar"></i> ${esc(b.date)}</span>` : ''}
                <span><i class="fas fa-clock"></i> ${esc(b.createdAt || '')}</span>
            </div>
            ${b.message ? `<div class="booking-msg">"${esc(b.message)}"</div>` : ''}
            <button class="btn btn-danger btn-sm" onclick="deleteBooking(${b.id})"><i class="fas fa-trash"></i> Удалить</button>
        </div>
    `).join('');
}

async function deleteBooking(id) {
    if (!confirm('Удалить эту заявку?')) return;
    try {
        await fetch(`${API}/api/admin/bookings/${id}`, { method: 'DELETE', headers: authHeaders() });
        showToast('Заявка удалена', 'success');
        loadAllData();
    } catch {
        showToast('Ошибка', 'error');
    }
}

function openModal() {
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
});

function esc(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${esc(message)}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.getElementById('profilePhotoInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await fetch(`${API}/api/admin/profile-photo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        if (res.ok) {
            showToast('Фото профиля обновлено', 'success');
            loadAllData();
        } else {
            throw new Error();
        }
    } catch {
        showToast('Ошибка загрузки фото', 'error');
    }
});

checkAuth();
