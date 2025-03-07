const { conn } = require('../db/dbconnection');
const jtoken = require('jsonwebtoken');
const crypt = require('bcryptjs');
const jwtconfig = require('./../config/jwtconfig.js');

module.exports = {
	registro: async (req, res) => {
		const { user, password } = req.body;
		const encriptado = await crypt.hash(password, 5);
		const [creado] = await conn.query(`INSERT INTO users (username, password) VALUES (?, ?);`, [user, encriptado]);
		res.redirect('/login.html');
	},

	login: async (req, res) => {
		const { user, password } = req.body;
		const [[valido]] = await conn.query(`SELECT * FROM users WHERE username = ?`, user);

		if (valido === undefined) {
			return res.status(404).send({ auth: false, message: 'Usuario no encontrado' });
		}

		if (!(await crypt.compare(password, valido.password))) {
			return res.status(401).send({ auth: false, message: 'Password incorrecto' });
		}

		// Generar el token
		const token = jtoken.sign({ id: valido.id }, jwtconfig.secretKey, { expiresIn: jwtconfig.tokenExpiresIn });

		// Devolver el token como parte de la respuesta JSON
		res.json({ auth: true, token: token });
	},

	logout: (req, res) => {
		res.clearCookie('token'); // Eliminar token de las cookies
		res.redirect('/login');   // Redirigir al login
	},
};
