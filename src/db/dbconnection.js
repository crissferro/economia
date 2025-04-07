
require('dotenv').config();
const mysql = require('mysql2');

// Detectar si estamos en producción o desarrollo
const isProduction = process.env.NODE_ENV === 'production';

// Configurar la conexión dependiendo del entorno
const pool = mysql.createPool({
    host: isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV,
    user: isProduction ? process.env.DB_USER_PROD : process.env.DB_USER_DEV,
    password: isProduction ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD_DEV,
    database: isProduction ? process.env.DB_DATABASE_PROD : process.env.DB_DATABASE_DEV,
    port: isProduction ? process.env.DB_PORT_PROD : process.env.DB_PORT_DEV,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log(`🔗 Conectando a MySQL en: ${isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV}`);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        return;
    }
    console.log(`✅ Conectado a MySQL (${isProduction ? 'Producción' : 'Desarrollo'})`);
    connection.release();
});

module.exports = {
    conn: pool.promise(),
};