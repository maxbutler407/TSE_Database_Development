import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,  
  user: process.env.MYSQL_USER,  
  password: process.env.MYSQL_PASSWORD,  
  database: process.env.MYSQL_DATABASE,  
  port: process.env.MYSQL_PORT,  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test MySQL connection to ensure the values are correct
// Use the promise-based pool to check connection
pool.promise()
  .query("SELECT 1")
  .then(([rows, fields]) => {
    console.log("✅ MySQL connected");
  })
  .catch(err => {
    console.error("❌ MySQL connection error:", err.message);
  });

export const db = pool.promise();
