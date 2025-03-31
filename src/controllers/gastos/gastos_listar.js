const { conn } = require('../../db/dbconnection');

console.log("Conexión a la base de datos:", conn);

module.exports = {
    getGastos: async (req, res) => {
        try {
            if (!conn) {
                throw new Error("La conexión a la base de datos no está definida.");
            }

            console.log("Ejecutando consulta...");
            const [gastos] = await conn.execute(`
                SELECT g.id, g.concepto_id, 
                       CASE WHEN g.tipo = 'egreso' THEN g.monto * -1 ELSE g.monto END AS monto,
                       g.fecha_vencimiento, g.pagado, g.mes, g.anio, 
                       c.nombre as concepto
                FROM gastos g
                JOIN conceptos c ON g.concepto_id = c.id
            `);

            res.json(gastos);
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            res.status(500).json({ error: 'Error al obtener gastos' });
        }
    }
}