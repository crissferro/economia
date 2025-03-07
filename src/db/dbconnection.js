const mysql = require('mysql2')

const pool = mysql.createPool({
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'gastos',
	port: 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
})

module.exports = {
	conn: pool.promise()
}


/*

const pool = mysql.createPool({
	host: 'mysql-solocaps.alwaysdata.net',
	user: 'solocaps',
	password: 'Qwerty1234Admin',
	database: 'solocaps_db',
	port: 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
})
	*/