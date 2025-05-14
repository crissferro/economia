const express = require('express');
const router = express.Router();
const { conn } = require('../db/dbconnection');

// Obtener todos los conceptos
router.get('/conceptos', async (req, res) => {
    const [rows] = await conn.query('SELECT nombre FROM conceptos ORDER BY nombre');
    res.json(rows);
});

// Consultar total por concepto y mes/año
router.get('/estadisticas', async (req, res) => {
    const { concepto, mes, anio } = req.query;

    const [[{ total }]] = await conn.query(`
    SELECT SUM(monto) AS total FROM gastos 
    INNER JOIN conceptos ON gastos.concepto_id = conceptos.id
    WHERE conceptos.nombre = ? AND gastos.mes = ? AND gastos.anio = ?
  `, [concepto, mes, anio]);

    res.json({ total: total || 0 });
});

module.exports = router;
