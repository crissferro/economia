const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../config/auth'); // Middleware de autenticación

const rubrosAgregar = require('../controllers/rubros/rubros_agregar');
const rubrosModificar = require('../controllers/rubros/rubros_modificar');
const rubrosEliminar = require('../controllers/rubros/rubros_eliminar');
const rubrosListar = require('../controllers/rubros/rubros_listar');

// Rubros

router.post('/', auth, rubrosAgregar.crearRubro);
router.put('/:id', auth, rubrosModificar.actualizarRubro);
router.delete('/:id', auth, rubrosEliminar.eliminarRubro);
router.get('/', auth, rubrosListar.getRubros);


module.exports = router;