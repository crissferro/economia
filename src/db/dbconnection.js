require('dotenv').config();
const mysql = require('mysql2');

// Detectar si estamos en producción o desarrollo
const isProduction = process.env.NODE_ENV === 'production';

// Configurar la conexión dependiendo del entorno
const dbConfig = {
    host: isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV,
    user: isProduction ? process.env.DB_USER_PROD : process.env.DB_USER_DEV,
    password: isProduction ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD_DEV,
    database: isProduction ? process.env.DB_DATABASE_PROD : process.env.DB_DATABASE_DEV,
    port: isProduction ? process.env.DB_PORT_PROD : process.env.DB_PORT_DEV,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

console.log(`🔹 Entorno: ${isProduction ? 'Producción' : 'Desarrollo'}`);
console.log(`🔗 Intentando conectar a MySQL en: ${dbConfig.host}:${dbConfig.port}`);

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Verificar la conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('🚨 Asegúrate de que el servidor MySQL esté en ejecución y accesible');
        }
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('🔐 Error de autenticación: Verifica usuario y contraseña');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('📁 La base de datos no existe: Verifica el nombre');
        }
        return;
    }
    console.log(`✅ Conectado exitosamente a MySQL (${isProduction ? 'Producción' : 'Desarrollo'})`);
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    connection.release();
});

// Manejador de errores de conexión para el pool
pool.on('error', (err) => {
    console.error('❌ Error en el pool de conexiones MySQL:', err.message);
});

module.exports = {
    conn: pool.promise(),
    isProduction
};