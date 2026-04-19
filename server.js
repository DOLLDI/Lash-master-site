const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const WORKS_DIR = path.join(__dirname, 'works');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lash2026';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

function createToken() {
    const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
    return `${payload}.${sig}`;
}

function verifyToken(token) {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, sig] = parts;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
    if (sig !== expected) return false;
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
        return data.exp > Date.now();
    } catch {
        return false;
    }
}

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    if (!verifyToken(auth.slice(7))) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

const storage = multer.diskStorage({
    destination: WORKS_DIR,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        if (!allowed.includes(ext)) {
            return cb(new Error('Invalid file type'));
        }
        cb(null, `work_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'));
        }
    }
});

function readData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch {
        return getDefaultData();
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
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
        ],
        bookings: []
    };
}

function nextId(arr) {
    return arr.length === 0 ? 1 : Math.max(...arr.map(i => i.id)) + 1;
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const rateLimits = new Map();
function rateLimit(key, maxPerMinute) {
    return (req, res, next) => {
        const ip = req.ip;
        const k = `${key}:${ip}`;
        const now = Date.now();
        const window = 60000;
        const hits = rateLimits.get(k) || [];
        const recent = hits.filter(t => now - t < window);
        if (recent.length >= maxPerMinute) {
            return res.status(429).json({ error: 'Too many requests' });
        }
        recent.push(now);
        rateLimits.set(k, recent);
        next();
    };
}

app.get('/api/data', (req, res) => {
    const data = readData();
    res.json({
        services: data.services,
        works: data.works,
        reviews: data.reviews.filter(r => r.approved),
        profilePhoto: data.profilePhoto || null
    });
});

app.post('/api/reviews', rateLimit('review', 3), (req, res) => {
    const { name, rating, text } = req.body;
    if (!name || !text || !rating) return res.status(400).json({ error: 'Missing fields' });
    if (typeof name !== 'string' || name.length > 50) return res.status(400).json({ error: 'Invalid name' });
    if (typeof text !== 'string' || text.length > 500) return res.status(400).json({ error: 'Invalid text' });
    if (typeof rating !== 'number' || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating' });

    const data = readData();
    const review = {
        id: nextId(data.reviews),
        name: name.trim().substring(0, 50),
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        text: text.trim().substring(0, 500),
        date: new Date().toISOString().split('T')[0],
        approved: false
    };
    data.reviews.push(review);
    writeData(data);
    res.status(201).json({ success: true });
});

app.post('/api/bookings', rateLimit('booking', 5), (req, res) => {
    const { name, phone, service, date, message } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Missing fields' });
    if (typeof name !== 'string' || name.length > 50) return res.status(400).json({ error: 'Invalid name' });
    if (typeof phone !== 'string' || phone.length > 20) return res.status(400).json({ error: 'Invalid phone' });

    const data = readData();
    const booking = {
        id: nextId(data.bookings),
        name: name.trim().substring(0, 50),
        phone: phone.trim().substring(0, 20),
        service: typeof service === 'string' ? service.trim().substring(0, 100) : '',
        date: typeof date === 'string' ? date.substring(0, 10) : '',
        message: typeof message === 'string' ? message.trim().substring(0, 300) : '',
        createdAt: new Date().toLocaleString('ru-RU')
    };
    data.bookings.push(booking);
    writeData(data);
    res.status(201).json({ success: true });
});

app.post('/api/admin/login', rateLimit('login', 10), (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ token: createToken() });
    } else {
        res.status(401).json({ error: 'Wrong password' });
    }
});

app.get('/api/admin/data', authMiddleware, (req, res) => {
    res.json(readData());
});

app.post('/api/admin/services', authMiddleware, (req, res) => {
    const { name, description, price, duration, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const data = readData();
    data.services.push({
        id: nextId(data.services),
        name: String(name).substring(0, 100),
        description: String(description || '').substring(0, 300),
        price: String(price || '').substring(0, 50),
        duration: String(duration || '').substring(0, 50),
        icon: String(icon || 'fas fa-eye').substring(0, 50)
    });
    writeData(data);
    res.status(201).json({ success: true });
});

app.put('/api/admin/services/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const svc = data.services.find(s => s.id === id);
    if (!svc) return res.status(404).json({ error: 'Not found' });

    const { name, description, price, duration, icon } = req.body;
    if (name) svc.name = String(name).substring(0, 100);
    if (description !== undefined) svc.description = String(description).substring(0, 300);
    if (price !== undefined) svc.price = String(price).substring(0, 50);
    if (duration !== undefined) svc.duration = String(duration).substring(0, 50);
    if (icon !== undefined) svc.icon = String(icon).substring(0, 50);

    writeData(data);
    res.json({ success: true });
});

app.delete('/api/admin/services/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    data.services = data.services.filter(s => s.id !== id);
    writeData(data);
    res.json({ success: true });
});

app.post('/api/admin/works', authMiddleware, upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Photo required' });

    const data = readData();
    data.works.push({
        id: nextId(data.works),
        image: `/works/${req.file.filename}`,
        title: String(req.body.title || '').substring(0, 100),
        description: String(req.body.description || '').substring(0, 200)
    });
    writeData(data);
    res.status(201).json({ success: true });
});

app.put('/api/admin/works/:id', authMiddleware, upload.single('photo'), (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const work = data.works.find(w => w.id === id);
    if (!work) return res.status(404).json({ error: 'Not found' });

    if (req.file) {
        work.image = `/works/${req.file.filename}`;
    }
    if (req.body.title !== undefined) work.title = String(req.body.title).substring(0, 100);
    if (req.body.description !== undefined) work.description = String(req.body.description).substring(0, 200);

    writeData(data);
    res.json({ success: true });
});

app.delete('/api/admin/works/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    data.works = data.works.filter(w => w.id !== id);
    writeData(data);
    res.json({ success: true });
});

app.put('/api/admin/reviews/:id/approve', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const review = data.reviews.find(r => r.id === id);
    if (!review) return res.status(404).json({ error: 'Not found' });
    review.approved = true;
    writeData(data);
    res.json({ success: true });
});

app.delete('/api/admin/reviews/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    data.reviews = data.reviews.filter(r => r.id !== id);
    writeData(data);
    res.json({ success: true });
});

app.post('/api/admin/profile-photo', authMiddleware, upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Photo required' });
    const data = readData();
    data.profilePhoto = `/works/${req.file.filename}`;
    writeData(data);
    res.json({ success: true, image: data.profilePhoto });
});

app.delete('/api/admin/bookings/:id', authMiddleware, (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    data.bookings = data.bookings.filter(b => b.id !== id);
    writeData(data);
    res.json({ success: true });
});

if (!fs.existsSync(DATA_FILE)) {
    writeData(getDefaultData());
    console.log('✅ data.json создан с начальными данными');
}

if (!fs.existsSync(WORKS_DIR)) {
    fs.mkdirSync(WORKS_DIR, { recursive: true });
}

app.listen(PORT, () => {
    console.log(`\n🌸 Сайт запущен: http://localhost:${PORT}`);
    console.log(`🔧 Админ-панель: http://localhost:${PORT}/admin.html`);
    console.log(`🔑 Пароль админа: ${ADMIN_PASSWORD}\n`);
});
