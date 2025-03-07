const { conn } = require('./dbconnection');

async function testConnection() {
    try {
        const [rows, fields] = await conn.query('SELECT 1');
        console.log('Connection successful:', rows);
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

testConnection();