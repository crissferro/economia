const { conn } = require('../db/dbconnection');

module.exports = {
    obtenerEstadisticas: async (req, res) => {
        const { concepto, mes, anio } = req.query;

        console.log('📥 Parámetros recibidos:', { concepto, mes, anio });

        if (!concepto || !mes || !anio) {
            console.warn('⚠️ Faltan parámetros en la consulta');
            return res.status(400).json({ error: 'Faltan parámetros' });
        }

        try {
            const [[{ total }]] = await conn.query(`
                SELECT SUM(monto) AS total
                FROM gastos
                WHERE concepto_id = ? AND mes = ? AND anio = ?
            `, [concepto, mes, anio]);

            console.log('✅ Total calculado:', total);

            const [[{ promedio }]] = await conn.query(`
                SELECT AVG(monto) AS promedio
                FROM gastos
                WHERE concepto_id = ? AND (anio * 12 + mes) BETWEEN ((? * 12 + ?) - 4) AND (? * 12 + ?)
            `, [concepto, anio, mes, anio, mes]);

            console.log('📊 Promedio calculado:', promedio);

            res.json({ total: total || 0, promedio: promedio || 0 });

        } catch (err) {
            console.error('❌ Error al obtener estadísticas:', err);
            res.status(500).send('Error al obtener estadísticas');
        }
    },

    obtenerEvolucionMensual: async (req, res) => {
        const { concepto, mes, anio } = req.query;

        console.log('📥 Parámetros recibidos para evolución mensual:', { concepto, mes, anio });

        if (!concepto || !mes || !anio) {
            console.warn('⚠️ Faltan parámetros para evolución mensual');
            return res.status(400).json({ error: 'Faltan parámetros' });
        }

        try {
            const mesActual = parseInt(mes);
            const anioActual = parseInt(anio);
            const conceptoId = parseInt(concepto);

            // Calcular los últimos 12 meses desde la fecha seleccionada
            const desde = (anioActual * 12 + mesActual) - 11;
            const hasta = (anioActual * 12 + mesActual);

            const [resultados] = await conn.query(`
                SELECT 
                    anio,
                    mes,
                    SUM(monto) AS total
                FROM gastos
                WHERE concepto_id = ?
                  AND (anio * 12 + mes) BETWEEN ? AND ?
                GROUP BY anio, mes
                ORDER BY anio, mes
            `, [conceptoId, desde, hasta]);

            console.log('📈 Datos de evolución mensual:', resultados);

            res.json(resultados);



        } catch (err) {
            console.error('❌ Error al obtener evolución mensual:', err);
            res.status(500).send('Error al obtener evolución mensual');
        }
    }


};
