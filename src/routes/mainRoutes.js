// mainRoutes.js

const express = require('express');
const router = express.Router();
const controladores = require('../controllers/mainController');
const multer = require('multer');
const auth = require('../config/auth'); // Middleware de autenticación

// Configuración de almacenamiento para archivos (si se requiere)
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

// Rubros
router.get('/rubros', auth, controladores.getRubros); // Ver listado de rubros
router.post('/rubros', auth, controladores.crearRubro); // Crear nuevo rubro
router.put('/rubros/:id', auth, controladores.actualizarRubro); // Modificar rubro
router.delete('/rubros/:id', auth, controladores.eliminarRubro); // Eliminar rubro

// Conceptos
router.get('/conceptos', auth, controladores.getConceptos); // Ver listado de conceptos
router.post('/conceptos', auth, controladores.crearConcepto); // Crear nuevo concepto
router.put('/conceptos/:id', auth, controladores.actualizarConcepto); // Modificar concepto
router.delete('/conceptos/:id', auth, controladores.eliminarConcepto); // Eliminar concepto

// Carga de Gastos
router.get('/cargaGastos', auth, controladores.getCargaGastos); // Ver formulario de carga de gastos
router.post('/cargaGastos', auth, uploadFile.single('archivo'), controladores.crearGasto); // Crear nuevo gasto
router.put('/cargaGastos/:id', auth, controladores.actualizarGasto); // Modificar gasto
router.delete('/cargaGastos/:id', auth, controladores.eliminarGasto); // Eliminar gasto

// Listado de Gastos
router.get('/listado', auth, controladores.getListado); // Ver listado general de gastos
router.get('/listado/:id', auth, controladores.getDetalleGasto); // Ver detalle de gasto específico

// Ruta para el Dashboard
// Si tu API es REST, probablemente devolverás JSON o una vista específica
router.get('/dashboard', auth, (req, res) => {
	// Si estás usando templating engine como 'ejs', puedes renderizar la vista
	// res.render('dashboard', { user: req.user }); 

	// Si estás devolviendo datos en formato JSON (API RESTful)
	res.json({ message: 'Bienvenido al Dashboard', user: req.user });
});

module.exports = router;
