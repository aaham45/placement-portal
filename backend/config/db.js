const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Aaham@8990',
  database: process.env.DB_NAME || 'placement_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ Connection test using async/await (Pakka chalega)
const testConnection = async () => {
  try {
    const connection = await pool.promise().getConnection();
    console.log('✅ MySQL Database Connected Successfully!');
    connection.release();
  } catch (err) {
    console.error('❌ Database Connection Failed:', err.message);
  }
};

// Call the test function
testConnection();

module.exports = pool.promise();