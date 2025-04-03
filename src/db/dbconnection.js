/* conexion local

require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = {
    conn: pool.promise()
};
*/

/*
configuracion anterior
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'gastos',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log("Intentando conectar a la base de datos en:", process.env.DB_HOST);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
    connection.release(); // Libera la conexión después de probarla
});

module.exports = {
    conn: pool.promise()
};

*/

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