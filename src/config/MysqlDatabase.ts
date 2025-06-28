import mysql from 'mysql2/promise';

const {
  DB_HOST    = process.env.MYSQL_DATABASE_HOST || 'localhost',
  DB_PORT    = process.env.MYSQL_DATABASE_PORT || '3306',
  DB_USER    = process.env.MYSQL_USER,
  DB_PASSWORD= process.env.MYSQL_PASSWORD,
  DB_NAME    = process.env.MYSQL_DATABASE || 'logistics',
} = process.env;

export const pool = mysql.createPool({
  host:     DB_HOST,
  port:     Number(DB_PORT),
  user:     DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});