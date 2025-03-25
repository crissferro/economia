const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../config/auth'); // Middleware de autenticación

const dashboardController = require('../controllers/gastos/dashboard');

router.get('/resumen', auth, dashboardController.getResumen);

module.exports = router;