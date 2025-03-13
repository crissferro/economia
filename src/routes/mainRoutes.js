// mainRoutes.js

const express = require('express');
const router = express.Router();
const controladores = require('../controllers/mainController');
// const multer = require('multer');
const path = require('path');
const auth = require('../config/auth'); // Middleware de autenticación


// Rubros

router.get('/rubros', auth, controladores.getRubros);
router.post('/rubros', auth, controladores.crearRubro);
router.put('/rubros/:id', auth, controladores.actualizarRubro);
router.delete('/rubros/:id', auth, controladores.eliminarRubro);




// Carga de Gastos
router.get('/cargaGastos', auth, controladores.getCargaGastos); // Ver formulario de carga de gastos
router.post('/cargaGastos', auth, controladores.crearGasto); // Crear nuevo gasto
router.put('/cargaGastos/:id', auth, controladores.actualizarGasto); // Modificar gasto
router.delete('/cargaGastos/:id', auth, controladores.eliminarGasto); // Eliminar gasto

// Listado de Gastos
router.get('/listado', auth, controladores.getListado); // Ver listado general de gastos
router.get('/listado/:id', auth, controladores.getDetalleGasto); // Ver detalle de gasto específico

// Ruta para el Dashboard
// Si tu API es REST, probablemente devolverás JSON o una vista específica
//router.get('/dashboard', controladores.getDashboard);





//codigo viejo ralizando modificaciones

/*

// Verificar si controladores está bien importado
if (!controladores) {
	console.error("Error: No se pudieron cargar los controladores.");
}

// Configuración de almacenamiento para archivos (si se requiere)
/*
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/uploads/'); // Cambiado a "uploads" para futuros comprobantes
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "_" + file.originalname);
	}
});
const uploadFile = multer({ storage });


// Rutas protegidas con autenticación (requieren token válido)

// Helper function to send JSON error responses
function sendErrorResponse(res, status, message) {
	return res.status(status).json({ error: message });
}

// Rubros
router.get('/rubros', auth, (req, res) => {
	if (typeof controladores.getRubros !== 'function') {
		return sendErrorResponse(res, 500, "Función getRubros no definida");
	}
	controladores.getRubros(req, res);
});

router.post('/rubros', auth, async (req, res) => {
	if (typeof controladores.crearRubro !== 'function') {
		return sendErrorResponse(res, 500, "Función crearRubro no definida");
	}
	try {
		await controladores.crearRubro(req, res);
	} catch (error) {
		console.error("Error en la ruta /rubros:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});


router.put('/rubros/:id', auth, (req, res) => {
	if (typeof controladores.actualizarRubro !== 'function') {
		return sendErrorResponse(res, 500, "Función actualizarRubro no definida");
	}
	controladores.actualizarRubro(req, res);
});

router.delete('/rubros/:id', auth, (req, res) => {
	if (typeof controladores.eliminarRubro !== 'function') {
		return sendErrorResponse(res, 500, "Función eliminarRubro no definida");
	}
	controladores.eliminarRubro(req, res);
});



// Conceptos
router.get('/conceptos', auth, (req, res) => {
	if (typeof controladores.getConceptos !== 'function') {
		return sendErrorResponse(res, 500, "Función getConceptos no definida");
	}
	controladores.getConceptos(req, res);
});

router.post('/conceptos', auth, async (req, res) => {
	if (typeof controladores.crearConcepto !== 'function') {
		return sendErrorResponse(res, 500, "Función creaConceptos no definida");
	}
	try {
		await controladores.crearConcepto(req, res);
	} catch (error) {
		console.error("Error en la ruta /conceptos:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});


router.put('/conceptos/:id', auth, (req, res) => {
	if (typeof controladores.actualizarConceptos !== 'function') {
		return sendErrorResponse(res, 500, "Función actualizarConceptos no definida");
	}
	controladores.actualizarConceptos(req, res);
});

router.delete('/conceptos/:id', auth, (req, res) => {
	if (typeof controladores.eliminarConcepto !== 'function') {
		return sendErrorResponse(res, 500, "Función eliminarConcepto no definida");
	}
	controladores.eliminarConcepto(req, res);
});

*/



module.exports = router;
