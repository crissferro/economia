// File: src/routes/gastosRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../config/auth'); // Middleware de autenticación

const gastosAgregar = require('../controllers/gastos/gastos_agregar');
const gastosModificar = require('../controllers/gastos/gastos_modificar');
const gastosEliminar = require('../controllers/gastos/gastos_eliminar');
const gastosListar = require('../controllers/gastos/gastos_listar');


// Carga de Gastos
router.get('/', gastosListar.getGastos); // Ver listado de gastos
router.post('/', auth, gastosAgregar.crearGasto); // Crear nuevo gasto
router.put('/:id', auth, gastosModificar.actualizarGasto); // Modificar gasto
router.delete('/:id', gastosEliminar.eliminarGasto); // Eliminar gasto



module.exports = router;
