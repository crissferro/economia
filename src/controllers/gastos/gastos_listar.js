
const { conn } = require('../../db/dbconnection');
/*
module.exports = {
    getGastos: async (req, res) => {
        try {
            const [gastos] = await conn.query(`
                SELECT g.id, g.concepto_id, g.monto, g.fecha_vencimiento, g.pagado, g.mes, g.anio, c.nombre as concepto
        FROM gastos g
        JOIN conceptos c ON g.concepto_id = c.id`);
            res.json(gastos);
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            res.status(500).json({ error: 'Error al obtener gastos' });
        }
    }
}
*/
module.exports = {
    getGastos: async (req, res) => {
        try {
            const [gastos] = await conn.query(`
                SELECT g.id, g.concepto_id, 
                   CASE WHEN g.tipo = 'egreso' THEN g.monto * -1 ELSE g.monto END AS monto,
                   g.fecha_vencimiento, g.pagado, g.mes, g.anio, 
                   c.nombre as concepto
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id`);
            res.json(gastos);
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            res.status(500).json({ error: 'Error al obtener gastos' });
        }
    }
}