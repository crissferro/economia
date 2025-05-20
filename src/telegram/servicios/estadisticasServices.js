const { conn } = require('../../db/dbconnection');

async function obtenerVariacionPorRango(concepto, desde, hasta) {
    const [anioInicio, mesInicio] = desde.split('-');
    const [anioFin, mesFin] = hasta.split('-');

    const [resultado] = await conn.query(`
        SELECT 
            SUM(CASE WHEN anio = ? AND mes = ? THEN monto ELSE 0 END) AS valorInicial,
            SUM(CASE WHEN anio = ? AND mes = ? THEN monto ELSE 0 END) AS valorFinal
        FROM gastos
        WHERE concepto = ?
    `, [anioInicio, mesInicio, anioFin, mesFin, concepto]);

    const { valorInicial, valorFinal } = resultado[0];
    if (valorInicial === 0) return null;

    const porcentaje = ((valorFinal - valorInicial) / valorInicial) * 100;

    return { valorInicial, valorFinal, porcentaje };
}

module.exports = { obtenerVariacionPorRango };
