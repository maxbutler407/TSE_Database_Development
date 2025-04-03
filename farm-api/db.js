console.log("[ENV CHECK]", {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

require("dotenv").config();
const mysql = require("mysql2");

import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

console.log("🔍 Connecting to MySQL with:");
console.log("Host:", process.env.MYSQLHOST);
console.log("Port:", process.env.MYSQLPORT);
console.log("User:", process.env.MYSQLUSER);
console.log("Database:", process.env.MYSQLDATABASE);


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

pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL Connection Failed:", err);
  } else {
    console.log("MySQL Connected Successfully!");
    connection.release();
  }
});

module.exports = pool.promise();
