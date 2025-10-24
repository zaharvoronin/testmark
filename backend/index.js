const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ✅ Создаём админа, если его нет
(async () => {
  const adminEmail = 'voroninzaharfox11@gmail.com';
  const adminPass = 'painhub2007';
  const existing = await db.get('SELECT * FROM users WHERE email = ?', [adminEmail]);
  if (!existing) {
    const hash = await bcrypt.hash(adminPass, 10);
    await db.run(
        'INSERT INTO users (name, email, password, role, is_seller, verified, created_at) VALUES (?,?,?,?,?,?,?)',
        ['Главный админ', adminEmail, hash, 'admin', 0, 1, Date.now()]
    );
    console.log('✅ Admin user created:', adminEmail);
  }
})();

// --- AUTH MIDDLEWARE ---
function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'No auth header' });
  const token = h.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- MULTER (ЗАГРУЗКА ИЗОБРАЖЕНИЙ) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- РЕГИСТРАЦИЯ ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !role)
      return res.status(400).json({ error: 'email, password and role required' });

    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const is_seller = role === 'seller' ? 1 : 0;
    await db.run(
        'INSERT INTO users (name,email,password,role,is_seller,verified,created_at) VALUES (?,?,?,?,?,?,?)',
        [name || '', email, hash, role, is_seller, 0, Date.now()]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ВХОД ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
    res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ПОЛУЧЕНИЕ СПИСКА ОБЪЯВЛЕНИЙ С ФИЛЬТРАМИ ---
app.get('/api/listings', async (req, res) => {
  try {
    const { category, condition, price_min, price_max, q } = req.query;
    let sql = `
      SELECT l.*, u.name as seller_name, u.email as seller_email, c.name as category_name
      FROM listings l
      LEFT JOIN users u ON u.id = l.user_id
      LEFT JOIN categories c ON c.id = l.category_id
      WHERE l.status = 'active'`;
    const params = [];

    if (category) { sql += ' AND c.name = ?'; params.push(category); }
    if (condition) { sql += ' AND l.condition = ?'; params.push(condition); }
    if (price_min) { sql += ' AND l.price >= ?'; params.push(parseFloat(price_min)); }
    if (price_max) { sql += ' AND l.price <= ?'; params.push(parseFloat(price_max)); }
    if (q) { sql += ' AND (l.title LIKE ? OR l.description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }

    sql += ' ORDER BY l.created_at DESC';
    const rows = await db.all(sql, params);
    const processed = rows.map(r => ({ ...r, images: r.images ? r.images.split(',') : [] }));
    res.json({ ok: true, listings: processed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- СОЗДАНИЕ ОБЪЯВЛЕНИЯ ---
app.post('/api/listings', authMiddleware, upload.array('images', 6), async (req, res) => {
  try {
    if (!['seller', 'admin'].includes(req.user.role))
      return res.status(403).json({ error: 'Only sellers can create listings' });

    const { title, description, price, category, condition } = req.body;
    if (!title || !category || !condition)
      return res.status(400).json({ error: 'title, category, condition required' });

    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ error: 'At least one image required' });

    let catRow = await db.get('SELECT id FROM categories WHERE name = ?', [category]);
    if (!catRow) {
      const r = await db.run('INSERT INTO categories (name) VALUES (?)', [category]);
      catRow = { id: r.lastID };
    }

    const images = files.map(f => `/uploads/${path.basename(f.path)}`).join(',');
    const id = uuidv4();
    await db.run(
        `INSERT INTO listings (id,user_id,title,description,price,condition,category_id,images,created_at,status)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, req.user.id, title, description || '', parseFloat(price) || 0, condition, catRow.id, images, Date.now(), 'active']
    );
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- УДАЛЕНИЕ ОБЪЯВЛЕНИЯ ---
app.delete('/api/listings/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Только владелец или админ
    if (req.user.role !== 'admin' && req.user.id !== listing.user_id)
      return res.status(403).json({ error: 'No permission to delete' });

    await db.run('DELETE FROM listings WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ПРОФИЛЬ ПРОДАВЦА ---
app.get('/api/seller/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await db.get('SELECT id,name,email,role,verified FROM users WHERE id = ?', [id]);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    const listings = await db.all(
        'SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC',
        [id]
    );
    const processed = listings.map(r => ({ ...r, images: r.images ? r.images.split(',') : [] }));
    res.json({ ok: true, seller, listings: processed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
