const jwt = require('jsonwebtoken');
const jwtconfig = require('./jwtconfig');

module.exports = (req, res, next) => {
	const authHeader = req.headers['authorization'];  // Obtenemos el encabezado de Authorization
	console.log('Authorization header:', authHeader);  // Verifica que el token se está enviando

	if (!authHeader) {
		return res.status(403).send({ auth: false, message: 'No se proveyó un token' });
	}

	const token = authHeader.split(' ')[1];  // El token debe ir después de "Bearer "

	if (!token) {
		return res.status(403).send({ auth: false, message: 'Token errado' });
	}

	// Verificar el token usando la clave secreta
	jwt.verify(token, jwtconfig.secretKey, (err, coded) => {
		if (err) {
			console.log('Token invalid:', err);  // Log para ver el error
			return res.status(403).send({ auth: false, message: 'Token no autorizado' });
		}
		// Si el token es válido, pasa al siguiente middleware
		req.userId = coded.id;  // Opcional: si necesitas guardar el id del usuario
		next();
	});
};

