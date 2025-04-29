const { conn } = require('../../db/dbconnection');

console.log("Conexión a la base de datos:", conn);

module.exports = {
    getGastos: async (req, res) => {
        try {
            if (!conn) {
                throw new Error("La conexión a la base de datos no está definida.");
            }

            // Obtener parámetros de la URL
            const { mes, anio, concepto_id, rubro_id, pagado } = req.query;

            //console.log("Ejecutando consulta...");
            // Construir la consulta con filtros dinámicos
            let query = `
                SELECT g.id, g.concepto_id, 
                       CASE WHEN g.tipo = 'egreso' THEN g.monto * -1 ELSE g.monto END AS monto,
                       g.fecha_vencimiento, g.pagado, g.fecha_pago, g.mes, g.anio, 
                       c.nombre as concepto, c.rubro_id
                FROM gastos g
                JOIN conceptos c ON g.concepto_id = c.id
                WHERE 1 = 1
            `;

            // Array de valores para evitar SQL Injection
            let params = [];

            // Agregar condiciones según los filtros recibidos
            if (mes) {
                query += " AND g.mes = ?";
                params.push(mes);
            }
            if (anio) {
                query += " AND g.anio = ?";
                params.push(anio);
            }
            if (concepto_id) {
                query += " AND g.concepto_id = ?";
                params.push(concepto_id);
            }
            if (rubro_id) {
                query += " AND c.rubro_id = ?";
                params.push(rubro_id);
            }
            if (pagado) {
                query += " AND g.pagado = ?";
                params.push(pagado);
            }

            //console.log("Consulta generada:", query, params); // Debugging

            // Ejecutar la consulta
            const [gastos] = await conn.execute(query, params);

            res.json(gastos);
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            res.status(500).json({ error: 'Error al obtener gastos' });
        }
    }
};