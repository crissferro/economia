const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../config/auth'); // Middleware de autenticación

const conceptosAgregar = require('../controllers/conceptos/conceptos_agregar');
const conceptosModificar = require('../controllers/conceptos/conceptos_modificar');
const conceptosEliminar = require('../controllers/conceptos/conceptos_eliminar');
const conceptosListar = require('../controllers/conceptos/conceptos_listar');
const conceptosDetalle = require('../controllers/conceptos/conceptos_detalle'); // ✅ Nuevo controlador

// Carga de Conceptos
router.post('/', auth, conceptosAgregar.crearConcepto);
router.put('/:id', conceptosModificar.actualizarConcepto);
router.delete('/:id', auth, conceptosEliminar.eliminarConcepto);
router.get('/', auth, conceptosListar.getConceptos);
router.get('/modificar/:id', conceptosModificar.getModificar);

// Nueva ruta: verificar si requiere detalle
router.get('/:id/requiere-detalle', auth, conceptosDetalle.verificarRequiereDetalle); // ✅ Nueva ruta

module.exports = router;
