/*
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
                IFNULL(SUM(CASE WHEN tipo = 'ingreso' THEN monto END), 0) AS total_ingresos,
                IFNULL(SUM(CASE WHEN tipo = 'egreso' THEN monto END), 0) AS total_egresos
            FROM gastos 
            WHERE mes = ? AND anio = ?;`,
            [mesActual, anioActual]
        );

        // Asegurar que el resultado es un objeto válido
        const ingresos = Number(result[0]?.total_ingresos || 0);
        const egresos = Number(result[0]?.total_egresos || 0);

        res.json({
            mes: mesActual,
            anio: anioActual,
            ingresos: ingresos.toFixed(2),
            egresos: egresos.toFixed(2)
        });

    } catch (error) {
        console.error("Error al obtener el resumen de ingresos y egresos:", error);
        res.status(500).json({ error: 'Error al obtener el resumen de ingresos y egresos' });
    }
};
*/

const { conn } = require('../../db/dbconnection');
module.exports.getResumen = async (req, res) => {
    try {
        const { mes, anio } = req.query;
        // Si no se envían mes y año, se usa el mes y año actual
        const fechaActual = new Date();
        const mesActual = mes || fechaActual.getMonth() + 1; // Enero es 0 en JS
        const anioActual = anio || fechaActual.getFullYear();

        // Consulta SQL para depuración
        const [debugResult] = await conn.query(`
            SELECT 
                tipo, 
                COUNT(*) as cantidad,
                SUM(monto) as total_monto
            FROM gastos 
            WHERE mes = ? AND anio = ?
            GROUP BY tipo;`,
            [mesActual, anioActual]
        );

        // Consulta original
        const [result] = await conn.query(`
            SELECT 
                IFNULL(SUM(CASE WHEN tipo = 'ingreso' THEN monto END), 0) AS total_ingresos,
                IFNULL(SUM(CASE WHEN tipo = 'egreso' THEN monto END), 0) AS total_egresos
            FROM gastos 
            WHERE mes = ? AND anio = ?;`,
            [mesActual, anioActual]
        );

        // Log de depuración
        //console.log('Resultado de depuración:', debugResult);
        //console.log('Resultado final:', result);

        // Asegurar que el resultado es un objeto válido
        const ingresos = Number(result[0]?.total_ingresos || 0);
        const egresos = Number(result[0]?.total_egresos || 0);

        const totalResumen = ingresos - egresos;


        res.json({
            mes: mesActual,
            anio: anioActual,
            totalResumen: totalResumen.toFixed(2),
            ingresos: ingresos.toFixed(2),
            egresos: egresos.toFixed(2),
            debug: debugResult
        });
    } catch (error) {
        console.error("Error al obtener el resumen de ingresos y egresos:", error);
        res.status(500).json({ error: 'Error al obtener el resumen de ingresos y egresos' });
    }
};