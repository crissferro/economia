const { conn } = require('../db/dbconnection');
const jtoken = require('jsonwebtoken');
const crypt = require('bcryptjs');
const jwtconfig = require('./../config/jwtconfig.js');

module.exports = {
    registro: async (req, res) => {
        const { username, password } = req.body;
        const encriptado = await crypt.hash(password, 5);
        const [creado] = await conn.query(`INSERT INTO users (username, password) VALUES (?, ?);`, [username, encriptado]);
        res.redirect('/login.html');
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        const [[valido]] = await conn.query(`SELECT * FROM users WHERE username = ?`, username)

        if (valido === undefined) {
            res.status(404).send('Usuario no encontrado')
        }

        else if (!(await crypt.compare(password, valido.password))) {
            res.status(401).send({ auth: false, token: null })
        }

        else {
            token = jtoken.sign({ id: valido.id }, jwtconfig.secretKey, { expiresIn: jwtconfig.tokenExpiresIn })
            console.log("token de usuario: ", token);
            res.status(201).send({ auth: true, token });
        }

    },

    cambiarPassword: async (req, res) => {
        const { username, passwordActual, passwordNueva } = req.body;

        try {
            const [[usuario]] = await conn.query(`SELECT * FROM users WHERE username = ?`, [username]);
            if (!usuario) return res.status(404).send('Usuario no encontrado');

            const esValido = await crypt.compare(passwordActual, usuario.password);
            if (!esValido) return res.status(401).send('La contraseña actual es incorrecta');

            const nuevaHash = await crypt.hash(passwordNueva, 5);
            await conn.query(`UPDATE users SET password = ? WHERE id = ?`, [nuevaHash, usuario.id]);

            return res.status(200).send('Contraseña actualizada correctamente');
        } catch (err) {
            console.error('Error al cambiar contraseña:', err);
            return res.status(500).send('Error del servidor');
        }
    },

    logout: (req, res) => {
        res.clearCookie('token');
        res.redirect('/login');
    },
};