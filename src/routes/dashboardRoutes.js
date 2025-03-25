const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/gastos/dashboard');

router.get('/resumen', dashboardController.getResumen);

module.exports = router;