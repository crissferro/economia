const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../config/auth'); // Middleware de autenticación

const conceptosAgregar = require('../controllers/conceptos/conceptos_agregar');
const conceptosModificar = require('../controllers/conceptos/conceptos_modificar');
const conceptosEliminar = require('../controllers/conceptos/conceptos_eliminar');
const conceptosListar = require('../controllers/conceptos/conceptos_listar');


// Carga de Conceptos

router.post('/', auth, conceptosAgregar.crearConcepto);
router.put('/:id', auth, conceptosModificar.actualizarConcepto);
router.delete('/:id', auth, conceptosEliminar.eliminarConcepto);
router.get('/', auth, conceptosListar.getConceptos);
router.get('/modificar/:id', conceptosModificar.getModificar)



module.exports = router;