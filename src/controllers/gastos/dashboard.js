const { conn } = require('../../db/dbconnection');

module.exports.getResumen = async (req, res) => {
    try {
        const { mes, anio } = req.query;

        // Si no se envían mes y año, se usa el mes y año actual
        const fechaActual = new Date();
        const mesActual = mes || fechaActual.getMonth() + 1; // Enero es 0 en JS
        const anioActual = anio || fechaActual.getFullYear();

        // Consulta SQL para calcular ingresos y egresos del mes y año indicados
        const [result] = await conn.query(`
            SELECT 
                SUM(CASE WHEN c.tipo = 'ingreso' THEN g.monto ELSE 0 END) AS total_ingresos,
                SUM(CASE WHEN c.tipo = 'egreso' THEN g.monto ELSE 0 END) AS total_egresos
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            WHERE MONTH(g.fecha) = ? AND YEAR(g.fecha) = ?`,
            [mesActual, anioActual]
        );

        res.json({
            mes: mesActual,
            anio: anioActual,
            ingresos: result[0].total_ingresos || 0,
            egresos: result[0].total_egresos || 0
        });

    } catch (error) {
        console.error("Error al obtener el resumen de ingresos y egresos:", error);
        res.status(500).json({ error: 'Error al obtener el resumen de ingresos y egresos' });
    }
};