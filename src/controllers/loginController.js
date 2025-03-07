const { conn } = require('../db/dbconnection')
const jtoken = require('jsonwebtoken')
const crypt = require('bcryptjs')
const jwtconfig = require('./../config/jwtconfig.js')

module.exports = {
	registro: async (req, res) => {
		const { user, password } = req.body
		const encriptado = await crypt.hash(password, 5)
		const [creado] = await conn.query(`INSERT INTO users (username, password) VALUES (?, ?);`, [user, encriptado])
		res.redirect('/login.html')
	},

	login: async (req, res) => {
		const { user, password } = req.body
		const [[valido]] = await conn.query(`SELECT * FROM users WHERE username = ?`, user)
		console.log("usuario: ", valido)
		if (valido === undefined) {
			res.status(404).send('Usuario no encontrado')
		} else if (!(await crypt.compare(password, valido.password))) {
			res.status(401).send({ auth: false, token: null })
		} else { // Error en clase: escribí "expriresIn" en lugar de "expiresIn" y no se genera bien el token
			token = jtoken.sign({ id: valido.id }, jwtconfig.secretKey, { expiresIn: jwtconfig.tokenExpiresIn })
			console.log("token de usuario: ", token);
			res.status(201).send({ auth: true, token })
		}
	},

	logout: async (req, res) => {
		res.redirect('/login.html')
	}
}