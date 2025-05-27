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

        // Obtener resumen por rubro (solo egresos)
        const [rubros] = await conn.query(`
    SELECT c.rubro_id, r.nombre AS rubro, SUM(g.monto) AS total
    FROM gastos g
    JOIN conceptos c ON g.concepto_id = c.id
    JOIN rubros r ON c.rubro_id = r.id
    WHERE g.mes = ? AND g.anio = ? AND c.tipo = 'egreso'
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

// Agregar esta función al controlador existente
exports.getResumenConDetalles = async (req, res) => {
    const { mes, anio } = req.query;

    try {
        // Obtener gastos normales (sin detalles)
        const [gastosNormales] = await conn.query(`
            SELECT g.id, g.concepto_id, g.monto, c.nombre as concepto, c.requiere_detalles, r.nombre as rubro
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN rubros r ON c.rubro_id = r.id
            WHERE g.mes = ? AND g.anio = ? AND c.requiere_detalles = 0 
            AND g.tipo = 'egreso'  -- Filtrar solo egresos
        `, [mes, anio]);

        // Obtener gastos con detalles
        const [gastosConDetalles] = await conn.query(`
            SELECT g.id, g.concepto_id, c.nombre as concepto_principal,
                   gd.concepto_id as detalle_concepto_id, gd.monto as detalle_monto,
                   cd.nombre as detalle_concepto, r.nombre as rubro
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN gastos_detalle gd ON g.id = gd.gasto_id
            JOIN conceptos cd ON gd.concepto_id = cd.id
            JOIN rubros r ON cd.rubro_id = r.id
            WHERE g.mes = ? AND g.anio = ? AND c.requiere_detalles = 1
            AND g.tipo = 'egreso'  -- Filtrar solo egresos
        `, [mes, anio]);

        // Procesar los datos para el gráfico
        const conceptosAgrupados = {};

        // Agregar gastos normales
        gastosNormales.forEach(gasto => {
            if (!conceptosAgrupados[gasto.concepto]) {
                conceptosAgrupados[gasto.concepto] = {
                    concepto: gasto.concepto,
                    rubro: gasto.rubro,
                    total: 0
                };
            }
            conceptosAgrupados[gasto.concepto].total += parseFloat(gasto.monto);
        });

        // Agregar gastos con detalles (usando el concepto del detalle)
        gastosConDetalles.forEach(detalle => {
            if (!conceptosAgrupados[detalle.detalle_concepto]) {
                conceptosAgrupados[detalle.detalle_concepto] = {
                    concepto: detalle.detalle_concepto,
                    rubro: detalle.rubro,
                    total: 0
                };
            }
            conceptosAgrupados[detalle.detalle_concepto].total += parseFloat(detalle.detalle_monto);
        });

        // Convertir a array
        const conceptos = Object.values(conceptosAgrupados);

        res.json({
            conceptos: conceptos
        });
    } catch (error) {
        console.error('Error al obtener resumen con detalles:', error);
        res.status(500).json({ error: 'Error al obtener el resumen con detalles' });
    }
};
