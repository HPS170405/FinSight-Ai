const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Auto-initialize schema on startup
const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
pool.query(initSql).catch(() => {});

module.exports = pool;
