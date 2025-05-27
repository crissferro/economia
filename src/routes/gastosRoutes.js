// File: src/routes/gastosRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../config/auth'); // Middleware de autenticación

const gastosAgregar = require('../controllers/gastos/gastos_agregar');
const gastosModificar = require('../controllers/gastos/gastos_modificar');
const gastosEliminar = require('../controllers/gastos/gastos_eliminar');
const gastosListar = require('../controllers/gastos/gastos_listar');
const detallesAgregar = require('../controllers/gastos/detalles_agregar'); // ✅ nuevo controlador
// Agregar esta línea junto con las demás importaciones
const detallesListar = require('../controllers/gastos/detalles_listar');
const detallesModificar = require('../controllers/gastos/detalles_modificar');
const gastosObtener = require('../controllers/gastos/gastos_obtener');



// Carga de Gastos
router.get('/', gastosListar.getGastos); // Ver listado de gastos
router.post('/', auth, gastosAgregar.crearGasto); // Crear nuevo gasto
router.put('/:id', gastosModificar.actualizarGasto); // Modificar gasto
router.delete('/:id', gastosEliminar.eliminarGasto); // Eliminar gasto

router.get('/modificar/:id', gastosModificar.getModificar);

// ✅ Nueva ruta para agregar detalles a un gasto
router.post('/:id/detalles', auth, detallesAgregar.agregarDetalles);
router.get('/:id/detalles', detallesListar.getDetalles);
router.put('/:id/detalles', detallesModificar.actualizarDetalles);
router.get('/:id', gastosObtener.getGasto); // Obtener un gasto específico







module.exports = router;
