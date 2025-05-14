const { conn } = require('../db/dbconnection');

module.exports = {
    obtenerEstadisticas: async (req, res) => {
        const { concepto, mes, anio } = req.query;

        if (!concepto || !mes || !anio) {
            return res.status(400).json({ error: 'Faltan parámetros' });
        }

        try {
            const [[{ total }]] = await conn.query(`
                SELECT SUM(monto) AS total
                FROM gastos g
                WHERE g.concepto_id = ? AND g.mes = ? AND g.anio = ?
            `, [concepto, mes, anio]);

            const [[{ promedio }]] = await conn.query(`
                SELECT AVG(monto) AS promedio
                FROM gastos g
                WHERE g.concepto_id = ? AND (g.anio * 12 + g.mes) BETWEEN ((? * 12 + ?) - 4) AND (? * 12 + ?)
            `, [concepto, anio, mes, anio, mes]);

            res.json({ total: total || 0, promedio: promedio || 0 });
        } catch (err) {
            console.error('❌ Error al obtener estadísticas:', err);
            res.status(500).send('Error al obtener estadísticas');
        }
    }
};
