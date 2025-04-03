const { conn } = require('../../db/dbconnection');

module.exports.getResumen = async (req, res) => {
    try {
        const { mes, anio } = req.query;
        const fechaActual = new Date();
        const mesActual = mes || fechaActual.getMonth() + 1;
        const anioActual = anio || fechaActual.getFullYear();

        // Obtener totales de ingresos y egresos
        const [result] = await conn.query(`
            SELECT 
                IFNULL(SUM(CASE WHEN tipo = 'ingreso' THEN monto END), 0) AS total_ingresos,
                IFNULL(SUM(CASE WHEN tipo = 'egreso' THEN monto END), 0) AS total_egresos
            FROM gastos 
            WHERE mes = ? AND anio = ?;`,
            [mesActual, anioActual]
        );

        // Obtener resumen por rubro
        const [rubros] = await conn.query(`
            SELECT c.rubro_id, r.nombre AS rubro, SUM(g.monto) AS total
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN rubros r ON c.rubro_id = r.id
            WHERE g.mes = ? AND g.anio = ?
            GROUP BY c.rubro_id, r.nombre
            HAVING total > 0;`,
            [mesActual, anioActual]
        );

        const ingresos = Number(result[0]?.total_ingresos || 0);
        const egresos = Number(result[0]?.total_egresos || 0);
        const totalResumen = ingresos - egresos;

        res.json({
            mes: mesActual,
            anio: anioActual,
            totalResumen: totalResumen.toFixed(2),
            ingresos: ingresos.toFixed(2),
            egresos: egresos.toFixed(2),
            rubros
        });
    } catch (error) {
        console.error("Error al obtener el resumen de ingresos y egresos:", error);
        res.status(500).json({ error: 'Error al obtener el resumen de ingresos y egresos' });
    }
};
