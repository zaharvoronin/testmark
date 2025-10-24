const bcrypt = require('bcrypt');
const db = require('./db');
(async function seedAdmin(){
  try{
    const adminEmail = 'voroninzaharfox11@gmail.com';
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
    if(existing){ console.log('Admin exists'); return; }
    const pass = bcrypt.hashSync('painhub2007', 10);
    await db.run('INSERT INTO users (name,email,password,is_seller,is_admin,verified) VALUES (?,?,?,?,?,?)', ['Admin','voroninzaharfox11@gmail.com',pass,1,1,1]);
    console.log('✅ Admin user created');
  }catch(e){ console.error('Seed admin error', e); }
})();