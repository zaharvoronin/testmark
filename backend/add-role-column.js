// Запуск: node add-role-column.js
// Скрипт добавит колонку role в таблицу users, если её нет.
const db = require('./db');

(async function() {
  try {
    const cols = await db.all("PRAGMA table_info('users')");
    const hasRole = cols && cols.some(c => c.name === 'role');
    if (hasRole) {
      console.log('Колонка role уже присутствует в users — ничего не делаем.');
      process.exit(0);
    }

    console.log('Колонка role не найдена — выполняем ALTER TABLE ...');
    await db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'buyer'");
    console.log("Готово — колонка role добавлена (DEFAULT 'buyer').");
    process.exit(0);
  } catch (err) {
    console.error('Ошибка при попытке добавить колонку role:', err);
    process.exit(1);
  }
})();