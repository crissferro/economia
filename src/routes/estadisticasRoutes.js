const express = require('express');
const router = express.Router();
const { conn } = require('../db/dbconnection');
const estadisticasController = require('../controllers/estadisticasController');

// Obtener todos los conceptos
router.get('/conceptos', async (req, res) => {
    try {
        const [rows] = await conn.query('SELECT id, nombre, requiere_vencimiento FROM conceptos ORDER BY nombre');
        res.json(rows);
    } catch (err) {
        console.error('❌ Error al obtener conceptos:', err);
        res.status(500).send('Error al obtener conceptos');
    }
});

// Consultar estadísticas (usando el controller)
router.get('/', estadisticasController.obtenerEstadisticas);
router.get('/evolucion', estadisticasController.obtenerEvolucionMensual);

module.exports = router;
