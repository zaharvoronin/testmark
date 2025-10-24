const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);
function run(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function get(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}
function all(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}
(async function init(){
// --- начало нового блока ---
  await run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'buyer',
  is_seller INTEGER DEFAULT 0,
  verified INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s','now'))
)`);

  await run(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE
)`);

  await run(`CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  title TEXT,
  description TEXT,
  price REAL,
  brand TEXT,
  size TEXT,
  color TEXT,
  condition TEXT,
  category_id INTEGER,
  images TEXT,
  created_at INTEGER,
  status TEXT DEFAULT 'active'
)`);

  await run(`CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  from_user_id INTEGER,
  to_user_id INTEGER,
  listing_id TEXT,
  message TEXT,
  created_at INTEGER
)`);

  await run(`CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  listing_id TEXT,
  buyer_id INTEGER,
  seller_id INTEGER,
  amount REAL,
  status TEXT,
  created_at INTEGER
)`);

  const row = await get('SELECT COUNT(*) as c FROM users');
  if (row && row.c === 0) {
    const adminPassHash = bcrypt.hashSync('painhub2007', 10); // можно заменить позже
    await run(
        'INSERT INTO users (name,email,password,role,is_seller,verified) VALUES (?,?,?,?,?,?)',
        ['Главный Админ', 'voroninzaharfox11@gmail.com', adminPassHash, 'admin', 0, 1]
    );
    console.log('✅ Admin user created: voroninzaharfox11@gmail.com');
  }
// --- конец нового блока ---

})().catch(err=>console.error('DB init error', err));
module.exports = { run, get, all, db };