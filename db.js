import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

await db.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
await db.changeUser({ database: process.env.DB_NAME });

await db.query(`
CREATE TABLE IF NOT EXISTS countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  capital VARCHAR(255),
  region VARCHAR(255),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate FLOAT,
  estimated_gdp DOUBLE,
  flag_url TEXT,
  last_refreshed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

await db.query(`
CREATE TABLE IF NOT EXISTS meta (
  id INT PRIMARY KEY AUTO_INCREMENT,
  last_refreshed_at DATETIME
);
`);
