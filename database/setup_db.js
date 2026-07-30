const fs = require('fs');
const path = require('path');

// Try requiring packages from server/node_modules
let mysql;
try {
  require(path.join(__dirname, '..', 'server', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', 'server', '.env') });
  mysql = require(path.join(__dirname, '..', 'server', 'node_modules', 'mysql2', 'promise'));
} catch (e) {
  try {
    require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
    mysql = require('mysql2/promise');
  } catch (err) {
    console.error('❌ Error loading dependencies:', err.message);
    process.exit(1);
  }
}

async function setupDatabase() {
  console.log('🔄 Connecting to MySQL server...');
  
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });
    console.log(`✅ Connected to MySQL on ${host}:${port} as user '${user}'.`);
  } catch (err) {
    console.error('❌ Failed to connect to MySQL server:', err.message);
    console.error('\n📌 Checklist to resolve:');
    console.error(' 1. Ensure MySQL server (XAMPP / WampServer / MySQL Windows Service) is started.');
    console.error(' 2. Verify DB_USER, DB_PASSWORD, DB_PORT in server/.env.');
    process.exit(1);
  }

  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Executing database initialization script (init.sql)...');
    await connection.query(sqlContent);

    console.log('🎉 Database "boardgame_shop" created and initialized successfully with tables and sample games!');
  } catch (err) {
    console.error('❌ Error executing init.sql:', err.message);
  } finally {
    await connection.end();
  }
}

setupDatabase();
